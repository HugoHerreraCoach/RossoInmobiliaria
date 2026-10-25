import json, numpy as np, math, collections
S=4
d=json.load(open('plano/texts.json',encoding='utf-8')); H=d['H']
R=json.load(open('plano/regions.json'))
regs=[r for r in R['regions'] if 'px' in r]
def mask_of(r):
    rows={int(k):v for k,v in r['rows'].items()}
    y0,y1=min(rows),max(rows); x0=min(a for v in rows.values() for a,b in v); x1=max(b for v in rows.values() for a,b in v)
    m=np.zeros((y1-y0+3,x1-x0+3),bool)
    for y,v in rows.items():
        for a,b in v: m[y-y0+1,a-x0+1:b-x0+2]=True
    return m,x0-1,y0-1
def trace(m):
    ys,xs=np.nonzero(m); i=np.lexsort((xs,ys))[0]; s0=(int(xs[i]),int(ys[i]))
    offs=[(-1,0),(-1,-1),(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1)]
    fg=lambda x,y: 0<=y<m.shape[0] and 0<=x<m.shape[1] and m[y,x]
    b=(s0[0]-1,s0[1]); c=s0; pts=[s0]
    for _ in range(400000):
        k=offs.index((b[0]-c[0],b[1]-c[1]))
        for i in range(1,9):
            j=(k+i)%8; nx,ny=c[0]+offs[j][0],c[1]+offs[j][1]
            if fg(nx,ny):
                pb=offs[(j-1)%8]; b=(c[0]+pb[0],c[1]+pb[1]); c=(nx,ny); break
        else: break
        if c==s0: break
        pts.append(c)
    return pts
def rdp(pts,eps):
    if len(pts)<3: return pts
    a=np.array(pts[0],float); b=np.array(pts[-1],float); ab=b-a; L=np.hypot(*ab)
    dmax,idx=0,0
    for i in range(1,len(pts)-1):
        p=np.array(pts[i],float)
        dd=abs(ab[0]*(a[1]-p[1])-ab[1]*(a[0]-p[0]))/L if L else np.hypot(*(p-a))
        if dd>dmax: dmax,idx=dd,i
    if dmax>eps: return rdp(pts[:idx+1],eps)[:-1]+rdp(pts[idx:],eps)
    return [pts[0],pts[-1]]
def simplify_closed(pts,eps):
    # split at farthest point from start to treat as two open polylines
    p0=np.array(pts[0]); far=max(range(len(pts)),key=lambda i:np.hypot(*(np.array(pts[i])-p0)))
    a=rdp(pts[:far+1],eps); b=rdp(pts[far:]+[pts[0]],eps)
    return a[:-1]+b[:-1]
def area(poly): return 0.5*abs(sum(x1*y2-x2*y1 for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1])))
def inside(pt,poly):
    x,y=pt; c=False
    for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1]):
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
digits=[t for t in d['texts'] if t['t'].strip().isdigit() and (t['bb'][3]-t['bb'][1])>4.1]
out=[]
for r in regs:
    m,ox,oy=mask_of(r); pts=trace(m)
    poly=simplify_closed(pts,1.6)
    poly_pt=[((x+ox)/S,(y+oy)/S) for x,y in poly]   # pt, origen arriba
    num=[t['t'].strip() for t in digits if inside((( t['bb'][0]+t['bb'][2])/2, H-(t['bb'][1]+t['bb'][3])/2),poly_pt)]
    out.append({'val':r['val'],'poly':poly_pt,'nums':num,'px':r['px']})
print('lotes',len(out)); print('vertices por lote',collections.Counter(len(o['poly']) for o in out).most_common())
print('numeros por lote',collections.Counter(len(o['nums']) for o in out))
k=R['k']/S/S  # px(S) por m2 -> pt^2 por m2
errs=[abs(area(o['poly'])/k-o['val'])/o['val'] for o in out]; print('error de area del poligono: max %.3f mediana %.4f'%(max(errs),sorted(errs)[len(errs)//2]))
json.dump({'pt2_per_m2':k,'lots':out},open('plano/polys.json','w'))
