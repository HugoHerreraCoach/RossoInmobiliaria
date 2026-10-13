-- La Campiña / Rosso. Run once in the intended Supabase SQL editor; safe to rerun.
-- This does NOT modify CRM tables. Only the server's service_role may call the RPC.
begin;
create table if not exists public.rosso_tracking_records (
  site text not null,
  kind text not null check (kind in ('event','intent','conversion','delivery','rate','revoked','form_operation')),
  id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  primary key (site, kind, id)
);
create index if not exists rosso_records_time_idx on public.rosso_tracking_records(site, kind, created_at desc);
create index if not exists rosso_event_time_idx on public.rosso_tracking_records(site, (data->>'at')) where kind = 'event';
create unique index if not exists rosso_intent_code_unique on public.rosso_tracking_records(site, (data->>'code')) where kind = 'intent';
create unique index if not exists rosso_conversion_contact_unique on public.rosso_tracking_records(site, (data->>'contact_key')) where kind = 'conversion';
alter table public.rosso_tracking_records enable row level security;
revoke all on public.rosso_tracking_records from public, anon, authenticated;
grant select, insert, update, delete on public.rosso_tracking_records to service_role;

create or replace function public.rosso_tracking(p_site text, p_action text, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v jsonb; x jsonb; existing jsonb; by_id jsonb; by_code jsonb; event jsonb;
  result jsonb; accepted jsonb := '[]'::jsonb; items jsonb; n bigint; visitor text;
  stamp text := to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  row_id text; lease text;
begin
  if p_site !~ '^[a-z0-9-]{3,80}$' then raise exception 'Invalid site'; end if;
  if p_action = 'form_claim' then
    perform pg_advisory_xact_lock(hashtextextended(p_site||'form'||(p_data->>'id'),0));
    select data into existing from public.rosso_tracking_records where site=p_site and kind='form_operation' and id=p_data->>'id';
    if existing is not null and existing->>'fingerprint'<>p_data->>'fingerprint' then return jsonb_build_object('state','conflict'); end if;
    if existing->>'status'='ok' then return jsonb_build_object('state','done','result',existing->'result'); end if;
    if existing->>'status'='processing' and (existing->>'locked_at')::timestamptz>now()-interval '60 seconds' then return jsonb_build_object('state','busy'); end if;
    lease=gen_random_uuid()::text;
    v=jsonb_build_object('fingerprint',p_data->>'fingerprint','status','processing','lease',lease,'locked_at',stamp);
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'form_operation',p_data->>'id',v) on conflict(site,kind,id) do update set data=excluded.data;
    return jsonb_build_object('state','acquired','lease',lease);
  elsif p_action = 'form_finish' then
    update public.rosso_tracking_records set data=data||jsonb_build_object('status',case when p_data->>'ok'='true' then 'ok' else 'failed' end,'result',p_data->'result') where site=p_site and kind='form_operation' and id=p_data->>'id' and data->>'lease'=p_data->>'lease';
    if found and p_data->>'ok'='true' and jsonb_typeof(p_data->'event')='object' then
      insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'event',p_data#>>'{event,id}',p_data->'event') on conflict do nothing;
    end if;
    return 'true';
  elsif p_action = 'rate' then
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'rate',p_data->>'key',jsonb_build_object('hits',1,'expires',p_data->>'expires'))
    on conflict(site,kind,id) do update set data = jsonb_set(rosso_tracking_records.data,'{hits}',to_jsonb((rosso_tracking_records.data->>'hits')::int+1)) returning data into v;
    return to_jsonb((v->>'hits')::int <= (p_data->>'max')::int);
  elsif p_action = 'events' then
    for v in select value from jsonb_array_elements(p_data->'events') loop
      if exists(select 1 from public.rosso_tracking_records where site=p_site and kind='revoked' and id=v->>'visitor_id') then continue; end if;
      insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'event',v->>'id',v) on conflict do nothing;
      if found then accepted=accepted || jsonb_build_array(v->>'id'); end if;
    end loop;
    return jsonb_build_object('accepted',accepted);
  elsif p_action = 'intent' then
    v=p_data->'intent';
    if exists(select 1 from public.rosso_tracking_records where site=p_site and kind='revoked' and id=v#>>'{event,visitor_id}') then return 'null'::jsonb; end if;
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'intent',v->>'id',v) on conflict(site,kind,id) do nothing;
    select data into existing from public.rosso_tracking_records where site=p_site and kind='intent' and id=v->>'id';
    if existing#>>'{event,visitor_id}' is distinct from v#>>'{event,visitor_id}' then raise exception 'Intent owner mismatch'; end if;
    return existing;
  elsif p_action = 'lookup' then
    select data into by_id from public.rosso_tracking_records where site=p_site and kind='intent' and id=p_data->>'id';
    select data into by_code from public.rosso_tracking_records where site=p_site and kind='intent' and data->>'code'=p_data->>'code';
    if coalesce(p_data->>'id','')<>'' and coalesce(p_data->>'code','')<>'' and (by_id is null or by_code is null or by_id->>'id' <> by_code->>'id') then raise exception 'References mismatch'; end if;
    return coalesce(by_id,by_code,'null'::jsonb);
  elsif p_action = 'confirm' then
    event=p_data->'event'; visitor=event->>'visitor_id';
    -- Serialize a single visitor against consent withdrawal; no session-wide global lock.
    if visitor is not null then perform pg_advisory_xact_lock(hashtextextended(p_site||visitor,0)); end if;
    if exists(select 1 from public.rosso_tracking_records where site=p_site and kind='revoked' and id=visitor) then event=jsonb_set(event,'{marketing}','false'); end if;
    v=jsonb_build_object('contact_key',p_data->>'contact_key','event_id',event->>'id','attributed',event->>'session_id' is not null);
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'conversion',p_data->>'id',v) on conflict do nothing;
    if not found then
      select data into existing from public.rosso_tracking_records where site=p_site and kind='conversion' and (id=p_data->>'id' or data->>'contact_key'=p_data->>'contact_key') order by created_at limit 1;
      return jsonb_build_object('ok',true,'idempotent',true,'event_id',existing->>'event_id','attributed',existing->'attributed');
    end if;
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'event',event->>'id',event) on conflict do nothing;
    if event->>'marketing'='true' then
      for x in select value from jsonb_array_elements(p_data->'deliveries') loop
        insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'delivery',x->>'id',x) on conflict do nothing;
      end loop;
    end if;
    return jsonb_build_object('ok',true,'idempotent',false,'event_id',event->>'id','attributed',event->>'session_id' is not null);
  elsif p_action = 'snapshot' then
    select count(*) into n from public.rosso_tracking_records where site=p_site and kind='event' and data->>'at'>=p_data->>'from' and data->>'at'<p_data->>'to';
    select coalesce(jsonb_agg(q.data order by q.data->>'at' desc),'[]') into items from (select data from public.rosso_tracking_records where site=p_site and kind='event' and data->>'at'>=p_data->>'from' and data->>'at'<p_data->>'to' order by data->>'at' desc limit 20000) q;
    select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'provider',q.data->>'provider','status',q.data->>'status','attempts',q.data->'attempts','last_error',q.data->>'last_error','sent_at',q.data->>'sent_at') order by q.created_at desc),'[]') into v from (select id,data,created_at from public.rosso_tracking_records where site=p_site and kind='delivery' and created_at >= (p_data->>'from')::timestamptz and created_at < (p_data->>'to')::timestamptz order by created_at desc limit 200) q;
    return jsonb_build_object('events',items,'deliveries',v,'total',n,'truncated',n>20000);
  elsif p_action = 'claim' then
    items='[]';
    for row_id,v in select id,data from public.rosso_tracking_records where site=p_site and kind='delivery' and ((data->>'status'='pending' and data->>'next_at' <= stamp) or (data->>'status'='processing' and (data->>'locked_at')::timestamptz < now()-interval '2 minutes')) order by created_at limit least(coalesce((p_data->>'limit')::int,5),20) for update skip locked loop
      v=v||jsonb_build_object('status','processing','lease',gen_random_uuid()::text,'locked_at',stamp,'attempts',(v->>'attempts')::int+1);
      update public.rosso_tracking_records set data=v where site=p_site and kind='delivery' and id=row_id;
      items=items||jsonb_build_array(v);
    end loop;
    return items;
  elsif p_action = 'delivery_check' then
    return to_jsonb(exists(select 1 from public.rosso_tracking_records r where r.site=p_site and r.kind='delivery' and r.id=p_data->>'id' and r.data->>'lease'=p_data->>'lease' and r.data->>'status'='processing' and not exists(select 1 from public.rosso_tracking_records denied where denied.site=p_site and denied.kind='revoked' and denied.id=r.data#>>'{event,visitor_id}')));
  elsif p_action = 'finish' then
    update public.rosso_tracking_records set data=data||(p_data->'patch') where site=p_site and kind='delivery' and id=p_data->>'id' and data->>'lease'=p_data->>'lease' and data->>'status'='processing'; return 'true';
  elsif p_action = 'retry' then
    update public.rosso_tracking_records set data=data||jsonb_build_object('status','pending','next_at',stamp,'attempts',0) where site=p_site and kind='delivery' and data->>'status' in ('failed','disabled') and coalesce(data->>'last_error','')<>'consent-revoked'; get diagnostics n=row_count; return to_jsonb(n);
  elsif p_action = 'revoke' then
    visitor=p_data->>'visitor_id'; perform pg_advisory_xact_lock(hashtextextended(p_site||visitor,0));
    insert into public.rosso_tracking_records(site,kind,id,data) values(p_site,'revoked',visitor,'{}') on conflict do nothing;
    update public.rosso_tracking_records set data=jsonb_set(jsonb_set(data,'{matching}','{}'),'{event,marketing}','false')||jsonb_build_object('revoked',true) where site=p_site and kind='intent' and data#>>'{event,visitor_id}'=visitor;
    update public.rosso_tracking_records set data=data||jsonb_build_object('status','disabled','last_error','consent-revoked','matching','{}'::jsonb) where site=p_site and kind='delivery' and data#>>'{event,visitor_id}'=visitor and data->>'status'<>'sent'; return 'true';
  elsif p_action = 'prune' then
    delete from public.rosso_tracking_records where site=p_site and ((kind='rate' and (data->>'expires')::timestamptz < now()) or (kind in ('event','intent','delivery','form_operation') and created_at < now()-interval '90 days')); get diagnostics n=row_count; return to_jsonb(n);
  else raise exception 'Unknown operation';
  end if;
end $$;
revoke all on function public.rosso_tracking(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.rosso_tracking(text,text,jsonb) to service_role;
commit;

-- Verification (both results must be false):
-- select has_function_privilege('anon','public.rosso_tracking(text,text,jsonb)','EXECUTE');
-- select has_table_privilege('authenticated','public.rosso_tracking_records','SELECT');
-- Operational retention: events/intents/deliveries 90 days via prune.
-- Minimal conversion HMAC keys remain solely to prevent double counting; no phone/name is stored.
