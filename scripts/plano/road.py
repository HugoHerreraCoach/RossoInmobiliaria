# Franja de la Vía a San Nicolás: relleno del blanco entre sus dos líneas, fuera del terreno.
import numpy as np
a=np.load('plano/a_s2.npy'); inside=np.load('plano/inside_s2.npy'); S=2
free=(a>=250)&~inside; h,w=free.shape
def flood(sx,sy):
    seen=np.zeros_like(free); st=[(sx,sy)]
    while st:
        x,y=st.pop()
        if seen[y,x] or not free[y,x]: continue
        r=free[y]; xa=x
        while xa>0 and r[xa-1] and not seen[y,xa-1]: xa-=1
        xb=x
        while xb<w-1 and r[xb+1] and not seen[y,xb+1]: xb+=1
        seen[y,xa:xb+1]=True
        for ny in (y-1,y+1):
            if 0<=ny<h:
                rr=free[ny,xa:xb+1]&~seen[ny,xa:xb+1]; idx=np.flatnonzero(rr&~np.r_[False,rr[:-1]])
                for i in idx: st.append((xa+i,ny))
    return seen
# semilla: el rótulo «VIA SAN NICOLAS» del plano (894, 1394 pt)
for dx in range(0,40,4):
    sx,sy=int((894+dx)*S),int(1394*S)
    if free[sy,sx]:
        m=flood(sx,sy); print('via m2 %.0f'%(m.sum()*0.3704**2/S/S)); np.save('plano/road_s2.npy',m); break
