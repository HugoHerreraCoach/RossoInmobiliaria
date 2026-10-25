import json, numpy as np, re, statistics
from PIL import Image; Image.MAX_IMAGE_PIXELS=None
S=4
d=json.load(open('plano/texts.json',encoding='utf-8')); H=d['H']
arr=np.array(Image.open('plano/lines_s4.png'))
free=arr>=248
def topx(x,y): return int(round(x*S)), int(round((H-y)*S))
def fill(sx,sy):
    h,w=free.shape; seen=np.zeros_like(free) if False else None
    stack=[(sx,sy)]; spans={}; area=0
    mask=set()
    visited=np.zeros(free.shape,dtype=bool) if False else None
    return None
# scanline fill returning mask in bbox
def flood(sx,sy,maxpx=2_000_000):
    h,w=free.shape
    if not free[sy,sx]: return None
    out={}  # row -> list of (x0,x1)
    stack=[(sx,sy)]; n=0
    while stack:
        x,y=stack.pop()
        if y<0 or y>=h or not free[y,x]: continue
        row=out.setdefault(y,[])
        if any(a<=x<=b for a,b in row): continue
        r=free[y]
        x0=x
        while x0>0 and r[x0-1]: x0-=1
        x1=x
        while x1<w-1 and r[x1+1]: x1+=1
        row.append((x0,x1)); n+=x1-x0+1
        if n>maxpx: return 'leak'
        for ny in (y-1,y+1):
            if 0<=ny<h:
                rr=free[ny,x0:x1+1]
                # seeds at start of each free run
                idx=np.flatnonzero(rr & ~np.r_[False, rr[:-1]])
                for i in idx: stack.append((x0+i,ny))
    return out,n
labels=[t for t in d['texts'] if t['t'].startswith('A:')]
res=[]
for t in labels:
    l,b,r,tt=t['bb']; cx,cy=topx((l+r)/2,(b+tt)/2)
    seed=None
    for dy in range(0,40,2):
        for dx in range(0,60,2):
            for sx,sy in ((cx+dx,cy+dy),(cx-dx,cy-dy),(cx+dx,cy-dy),(cx-dx,cy+dy)):
                if free[sy,sx]: seed=(sx,sy); break
            if seed: break
        if seed: break
    m=re.search(r'A:([\d,\.]+)',t['t']); val=float(m.group(1).replace(',','')) if m else None
    f=flood(*seed) if seed else None
    if f in (None,'leak'): res.append({'label':t['t'],'val':val,'err':str(f)}); continue
    rows,n=f
    res.append({'label':t['t'],'val':val,'px':n,'seed':seed,'rows':{str(k):v for k,v in rows.items()}})
ok=[x for x in res if 'px' in x]
ratios=[x['px']/x['val'] for x in ok if x['val']==510]
k=statistics.median(ratios)
print('regiones',len(ok),'fallas',len(res)-len(ok),'px por m2 (mediana 510):',round(k,1))
bad=[(x['label'],x['val'],round(x['px']/k)) for x in ok if abs(x['px']/k-x['val'])/x['val']>0.03]
print('area fuera de 3%:',len(bad)); [print('  ',b) for b in bad[:30]]
for x in res:
    if 'err' in x: print('  fallo',x)
json.dump({"k":float(k),"regions":[{**x,"px":int(x["px"]),"seed":[int(v) for v in x["seed"]],"rows":{kk:[[int(a),int(b)] for a,b in vv] for kk,vv in x["rows"].items()}} if "px" in x else x for x in res]},open("plano/regions.json","w"))
