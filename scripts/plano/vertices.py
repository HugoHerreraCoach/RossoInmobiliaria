import os
import pypdfium2 as pdfium, pypdfium2.raw as R, ctypes, json, math, re
pdf=pdfium.PdfDocument(os.environ['PLANO_PDF']); page=pdf[0]
d=json.load(open('plano/texts.json',encoding='utf-8')); H=d['H']
def bounds(o):
    l,b,r,t=(ctypes.c_float(),ctypes.c_float(),ctypes.c_float(),ctypes.c_float())
    R.FPDFPageObj_GetBounds(o,ctypes.byref(l),ctypes.byref(b),ctypes.byref(r),ctypes.byref(t)); return l.value,b.value,r.value,t.value
circles=[]
for i in range(R.FPDFPage_CountObjects(page.raw)):
    o=R.FPDFPage_GetObject(page.raw,i)
    if R.FPDFPageObj_GetType(o)!=R.FPDF_PAGEOBJ_PATH: continue
    l,b,r,t=bounds(o); w,h=r-l,t-b
    if 2<w<12 and abs(w-h)<0.6: circles.append(((l+r)/2,H-(b+t)/2,w))
plab={t['t'].strip():((t['bb'][0]+t['bb'][2])/2,H-(t['bb'][1]+t['bb'][3])/2) for t in d['texts'] if re.fullmatch(r'P\d+',t['t'].strip()) and (t['bb'][0]+t['bb'][2])/2>250}
UTM={'P1':(652100.7081,9242976.5196),'P2':(652077.9052,9243107.8502),'P3':(652065.0908,9243181.7512),'P4':(652045.1613,9243296.6853),'P5':(652021.1580,9243393.6841),'P6':(652013.6710,9243446.9425),'P7':(652139.8144,9243495.6117),'P8':(652098.7096,9243604.5484),'P9':(652422.4989,9243750.2135),'P10':(652381.8838,9243657.7751),'P11':(652320.4624,9243631.6018),'P12':(652325.3700,9243537.1638),'P13':(652222.5166,9243319.7106),'P14':(652125.9208,9243045.9334)}
verts={}
for k,pt in plab.items():
    c=min(circles,key=lambda c:math.dist(pt,c[:2])); verts[k]=(c[0],c[1],round(math.dist(pt,c[:2]),1),round(c[2],1))
print('P labels',len(plab)); [print(k,verts[k]) for k in sorted(verts,key=lambda s:int(s[1:]))]
# ajuste similitud pt(top-origin, y abajo) -> UTM (y arriba): usar y invertida
import numpy as np
ks=sorted(verts,key=lambda s:int(s[1:]))
A=[];bv=[]
for k in ks:
    x,y=verts[k][0],-verts[k][1]; E,N=UTM[k]
    A.append([x,-y,1,0]); bv.append(E); A.append([y,x,0,1]); bv.append(N)
sol,res,_,_=np.linalg.lstsq(np.array(A),np.array(bv),rcond=None); a,bb,tx,ty=sol
scale=math.hypot(a,bb); rot=math.degrees(math.atan2(bb,a))
pred=[(a*verts[k][0]-bb*(-verts[k][1])+tx, bb*verts[k][0]+a*(-verts[k][1])+ty) for k in ks]
err=[math.dist(p,UTM[k]) for p,k in zip(pred,ks)]
print('metros por pt %.4f  rotacion %.2f grados  error max %.2f m'%(scale,rot,max(err)))
json.dump({'verts':{k:verts[k][:2] for k in ks},'m_per_pt':scale,'rot':rot},open('plano/site.json','w'))
