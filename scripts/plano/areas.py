import json, numpy as np, math, collections
from PIL import Image, ImageDraw; Image.MAX_IMAGE_PIXELS=None
site=json.load(open('plano/site.json')); P=json.load(open('plano/polys.json'))
order=['P%d'%i for i in range(1,15)]
sp=[tuple(site['verts'][k]) for k in order]
S=2
big=Image.open('plano/lines_s4.png'); W,H=big.size
im=big.resize((W*S//4,H*S//4),Image.BOX); a=np.array(im).astype(np.int16)
def poly_mask(polys,grow=0):
    m=Image.new('L',(a.shape[1],a.shape[0]),0); dr=ImageDraw.Draw(m)
    for p in polys: dr.polygon([(x*S,y*S) for x,y in p],fill=255,outline=255,width=grow*2+1 if grow else 1)
    return np.array(m)>0
inside=poly_mask([sp]); lots=poly_mask([l['poly'] for l in P['lots']],grow=2)
vals=a[inside & ~lots]
h=np.bincount(vals.ravel(),minlength=256)
top=np.argsort(h)[::-1][:12]; print('valores mas frecuentes dentro del terreno (no lotes):',[(int(v),int(h[v])) for v in top])
np.save('plano/a_s2.npy',a); np.save('plano/inside_s2.npy',inside); np.save('plano/lots_s2.npy',lots)
