import numpy as np
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
