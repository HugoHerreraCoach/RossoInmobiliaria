import json, numpy as np, math
a=np.load('plano/a_s2.npy'); inside=np.load('plano/inside_s2.npy'); lots=np.load('plano/lots_s2.npy')
m=inside & ~lots & (np.abs(a-235)>4) & (a>40)
h,w=m.shape; lab=np.zeros((h,w),np.int32); comps=[]
M2PX=(0.3704**2)/4
cur=0
ys,xs=np.nonzero(m)
for y0,x0 in zip(ys,xs):
    if lab[y0,x0]: continue
    cur+=1; stack=[(x0,y0)]; n=0; bx0,by0,bx1,by1=x0,y0,x0,y0
    while stack:
        x,y=stack.pop()
        if lab[y,x] or not m[y,x]: continue
        r=m[y]; xa=x
        while xa>0 and r[xa-1] and not lab[y,xa-1]: xa-=1
        xb=x
        while xb<w-1 and r[xb+1] and not lab[y,xb+1]: xb+=1
        lab[y,xa:xb+1]=cur; n+=xb-xa+1
        bx0=min(bx0,xa); bx1=max(bx1,xb); by0=min(by0,y); by1=max(by1,y)
        for ny in (y-1,y+1):
            if 0<=ny<h:
                rr=m[ny,xa:xb+1] & (lab[ny,xa:xb+1]==0)
                idx=np.flatnonzero(rr & ~np.r_[False,rr[:-1]])
                for i in idx: stack.append((xa+i,ny))
    comps.append({'id':int(cur),'px':int(n),'m2':float(n*M2PX),'bb':[int(bx0),int(by0),int(bx1),int(by1)]})
big=[c for c in comps if c['m2']>150]
print('componentes',len(comps),'grandes',len(big))
for c in sorted(big,key=lambda c:-c['m2']):
    bw=(c['bb'][2]-c['bb'][0])/2*0.3704; bh=(c['bb'][3]-c['bb'][1])/2*0.3704
    print(c['id'],'%.0f m2'%c['m2'],'caja %.0fx%.0f m'%(bw,bh),'centro pt',((c['bb'][0]+c['bb'][2])/4,(c['bb'][1]+c['bb'][3])/4))
np.save('plano/lab_s2.npy',lab); json.dump(big,open('plano/comps.json','w'))
