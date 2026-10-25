import json
P=json.load(open('plano/polys.json')); B=json.load(open('plano/blocks.json'))
blockmz={0:'G',1:'H',2:'C',3:'D',4:'B',5:'A',6:'F',7:'E'}
p={}
def s(mz,arr): [p.__setitem__(mz+str(i+1),a) for i,a in enumerate(arr)]
s('A',[548,510,532,534,536,539,541,543,545]); s('B',[588,592,578,564,550,537,523,517,510])
s('C',[514,533,516,602,516,1487,1382,597,510,510,510,510,510,510,510,510,510,510,510,534])
s('D',[517,735]+[510]*13+[1647,1600]+[510]*17); s('E',[765,765,758,675,539,601,698,683])
s('F',[510]*10+[1550,1658]+[510]*9); s('G',[511]+[510]*19+[1265]); s('H',[562,545,549,652,646,510,510,510,510,1392])
bad=0
for l,c in zip(P['lots'],B['comp']):
    lid=blockmz[c]+l['nums'][0]; l['id']=lid
    if p[lid]!=l['val']: bad+=1; print('NO coincide',lid,'etiqueta',l['val'],'cuadro',p[lid])
ids=[l['id'] for l in P['lots']]
print('ids unicos',len(set(ids)),'| sin coincidencia de area:',bad)
json.dump(P,open('plano/polys.json','w'))
