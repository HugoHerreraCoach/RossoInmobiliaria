import json, math, re, numpy as np
from geom import trace, simplify_closed, area
d=json.load(open('plano/texts.json',encoding='utf-8')); H=d['H']
P=json.load(open('plano/polys.json')); site=json.load(open('plano/site.json')); comps=json.load(open('plano/comps.json'))
lab=np.load('plano/lab_s2.npy'); road=np.load('plano/road_s2.npy'); a=np.load('plano/a_s2.npy'); inside=np.load('plano/inside_s2.npy')
S=2; MPT=site['m_per_pt']
def comp_poly(mask,eps=1.2):
    ys,xs=np.nonzero(mask); x0,y0=xs.min()-1,ys.min()-1
    m=np.zeros((ys.max()-y0+2,xs.max()-x0+2),bool); m[ys-y0,xs-x0]=True
    pts=simplify_closed(trace(m),eps); return [((x+x0)/S,(y+y0)/S) for x,y in pts]
tc=lambda t:((t['bb'][0]+t['bb'][2])/2,H-(t['bb'][1]+t['bb'][3])/2)
def inside_poly(pt,poly):
    x,y=pt; c=False
    for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1]):
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
res_pt=[tc(t) for t in d['texts'] if t['t'].strip()=='RESERVORIO'][0]
parks=[];medians=[];reservoir=None
for c in comps:
    poly=comp_poly(lab==c['id'])
    bw=(c['bb'][2]-c['bb'][0]); bh=(c['bb'][3]-c['bb'][1])
    if inside_poly(res_pt,poly): reservoir=poly
    elif c['m2']>400: parks.append({'poly':poly,'m2':c['m2']})
    else: medians.append(comp_poly(lab==c['id'],eps=1.0))
road_poly=comp_poly(road,eps=1.5)
site_poly=[tuple(site['verts']['P%d'%i]) for i in range(1,15)]
print('parques',len(parks),[round(p['m2']) for p in parks],'medianas',len(medians),'reservorio',reservoir is not None,'via pts',len(road_poly))
# --- rotacion que mejor llena 1160x760
VW,VH,MX,MY=1160,760,26,22
allpts=site_poly+[p for p in road_poly if 0<p[1]<2400]
best=None
for k in range(360):
    th=math.radians(k*0.5); c,s_=math.cos(th),math.sin(th)
    xs=[x*c-y*s_ for x,y in site_poly]; ys=[x*s_+y*c for x,y in site_poly]
    w=max(xs)-min(xs); h=max(ys)-min(ys); sc=min((VW-2*MX)/w,(VH-2*MY-40)/h)
    if not best or sc>best[0]: best=(sc,th)
sc,th=best; c,s_=math.cos(th),math.sin(th)
xs=[x*c-y*s_ for x,y in site_poly]; ys=[x*s_+y*c for x,y in site_poly]
ox=(VW-(max(xs)-min(xs))*sc)/2-min(xs)*sc; oy=MY+(VH-2*MY-40-(max(ys)-min(ys))*sc)/2-min(ys)*sc
T=lambda p:(round((p[0]*c-p[1]*s_)*sc+ox,1),round((p[0]*s_+p[1]*c)*sc+oy,1))
print('rotacion %.1f grados, escala %.4f u/pt = %.3f u/m'%(math.degrees(th),sc,sc/MPT))
path=lambda poly:'M'+' L'.join('%g %g'%T(p) for p in poly)+' Z'
def clip_road(poly):
    return [p for p in poly]
# --- lotes
def min_width(poly):
    best=1e9
    for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1]):
        L=math.hypot(x2-x1,y2-y1)
        if L<1: continue
        ux,uy=(x2-x1)/L,(y2-y1)/L
        proj=[-(x-x1)*uy+(y-y1)*ux for x,y in poly]; best=min(best,max(proj)-min(proj))
    return best
digit_pos={}
for t in d['texts']:
    st=t['t'].strip()
    if st.isdigit() and (t['bb'][3]-t['bb'][1])>4.1: digit_pos.setdefault(st,[]).append(tc(t))
lots=[]
for l in P['lots']:
    num=l['nums'][0]; lp=[p for p in digit_pos[num] if inside_poly(p,l['poly'])][0]
    wpt=min_width(l['poly'])*sc
    fs=max(4.6,min(9.5,wpt*0.36))
    lots.append((l['id'],path(l['poly']),*T(lp),round(fs,1),round(wpt,1)))
lots.sort(key=lambda r:(r[0][0],int(r[0][1:])))
# --- calles
streets=[]
for t in d['texts']:
    st=t['t'].strip(); m=re.fullmatch(r'CALLE (\d+)',st)
    if not m: continue
    ang=-math.degrees(math.atan2(t['m'][1],t['m'][0]))+math.degrees(th)
    while ang>90: ang-=180
    while ang<-90: ang+=180
    streets.append(('Calle '+m.group(1),*T(tc(t)),round(ang,1)))
# --- marcadores de manzana sobre calle libre
lots_m=np.load('plano/lots_s2.npy')
free=~lots_m & ~road
ii=np.pad(free.astype(np.int32).cumsum(0).cumsum(1),((1,0),(1,0)))
r=int(round((10.5/sc)*S))
def fits(x,y): 
    x0,y0,x1,y1=x-r,y-r,x+r+1,y+r+1
    if x0<0 or y0<0 or y1>=ii.shape[0] or x1>=ii.shape[1]: return False
    return ii[y1,x1]-ii[y0,x1]-ii[y1,x0]+ii[y0,x0]==(2*r+1)**2
mz={}
for t in d['texts']:
    st=t['t'].strip()
    if not st.startswith('MZ.'): continue
    px,py=tc(t); cx,cy=int(px*S),int(py*S); bestp=None
    for rad in range(0,700,3):
        for k in range(0,360,10):
            x=int(cx+rad*math.cos(math.radians(k))); y=int(cy+rad*math.sin(math.radians(k)))
            if fits(x,y): bestp=(x/S,y/S); break
        if bestp: break
    mz[st[3]]=T(bestp)
# --- viewbox por manzana
def bbox(ps): xs=[p[0] for p in ps]; ys=[p[1] for p in ps]; return min(xs),min(ys),max(xs),max(ys)
mzvb={'TODAS':[0,0,VW,VH]}
for L in 'ABCDEFGH':
    ps=[T(p) for l in P['lots'] if l['id'][0]==L for p in l['poly']]+[mz[L]]
    x0,y0,x1,y1=bbox(ps); pad=26; x0-=pad;y0-=pad;x1+=pad;y1+=pad
    w,h=x1-x0,y1-y0; R=VW/VH
    if w/h<R: nw=h*R; x0-=(nw-w)/2; w=nw
    else: nh=w/R; y0-=(nh-h)/2; h=nh
    mzvb[L]=[round(x0,1),round(y0,1),round(w,1),round(h,1)]
amen=[]
pairs=[('GIMNASIO','Gimnasio'),('ZONA DE HAMACAS','Hamacas'),('HAMACAS','Hamacas'),('JUEGOS','Juegos'),('MULTIUSO','Campo multiuso'),('FOGATAS','Fogatas'),]
for t in d['texts']:
    st=t['t'].strip(); x,y=tc(t)
    if x<300: continue
    for k,v in pairs:
        if st==k: amen.append((v,*T((x,y))))
portico=T(((848.9+849.0)/2,1420.4)); via=[t for t in d['texts'] if t['t'].strip()=='VIA SAN NICOLAS'][0]
via_ang=-math.degrees(math.atan2(via['m'][1],via['m'][0]))+math.degrees(th)
while via_ang>90: via_ang-=180
while via_ang<-90: via_ang+=180
north=round(math.degrees(th),1)
vx,vy=T(tc(via)); rad=math.radians(via_ang); nx,ny=-math.sin(rad),math.cos(rad)
cxs,cys=sum(p[0] for p in map(T,site_poly))/14,sum(p[1] for p in map(T,site_poly))/14
if (vx-cxs)*nx+(vy-cys)*ny<0: nx,ny=-nx,-ny
via2=[round(vx+nx*16,1),round(vy+ny*16,1),round(via_ang,1)]  # el norte del plano (arriba) gira con el plano
# nombres de calle que chocan con un rótulo de manzana o con el del pórtico: se corren a lo largo de su calle
obst=list(mz.values())+[(portico[0],portico[1]-7),(portico[0]-20,portico[1]-7),(portico[0]+20,portico[1]-7)]
fixed=[]
for n,x,y,ang in streets:
    for _ in range(6):
        if all(math.dist((x,y),o)>17 for o in obst): break
        r=math.radians(ang); x+=14*math.cos(r); y+=14*math.sin(r)
    fixed.append((n,round(x,1),round(y,1),ang))
streets=fixed
out={'vw':VW,'vh':VH,'site':path(site_poly),'road':path(road_poly),'parks':[path(p['poly']) for p in parks],'reservoir':path(reservoir),
 'medians':[path(m) for m in medians],'lots':lots,'streets':streets,'mz':mz,'mzvb':mzvb,'amen':amen,'portico':portico,
 'via':[*T(tc(via)),round(via_ang,1)],'via2':via2,'north':north,'reservoir_label':T(res_pt),'m_per_unit':round(MPT/sc,4)}
json.dump(out,open('plano/plano_svg.json','w'),ensure_ascii=False)
print('marcadores',mz); print('lote mas angosto (u):',min(r[5] for r in lots), "fuente", min(r[4] for r in lots), max(r[4] for r in lots))
