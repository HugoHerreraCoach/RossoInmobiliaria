import json, math, collections
d=json.load(open('plano/texts.json',encoding='utf-8')); H=d['H']
P=json.load(open('plano/polys.json')); lots=P['lots']
def segdist(p,a,b):
    ax,ay=a; bx,by=b; px,py=p; dx,dy=bx-ax,by-ay; L=dx*dx+dy*dy
    t=0 if L==0 else max(0,min(1,((px-ax)*dx+(py-ay)*dy)/L)); return math.hypot(px-(ax+t*dx),py-(ay+t*dy))
def pdist(P1,P2):
    best=1e9
    for p in P1:
        for a,b in zip(P2,P2[1:]+P2[:1]): best=min(best,segdist(p,a,b))
    for p in P2:
        for a,b in zip(P1,P1[1:]+P1[:1]): best=min(best,segdist(p,a,b))
    return best
n=len(lots); adj=collections.defaultdict(set)
bb=[(min(x for x,y in l['poly']),min(y for x,y in l['poly']),max(x for x,y in l['poly']),max(y for x,y in l['poly'])) for l in lots]
for i in range(n):
    for j in range(i+1,n):
        a,b=bb[i],bb[j]
        if a[0]>b[2]+3 or b[0]>a[2]+3 or a[1]>b[3]+3 or b[1]>a[3]+3: continue
        if pdist(lots[i]['poly'],lots[j]['poly'])<1.5: adj[i].add(j); adj[j].add(i)
comp=[-1]*n; c=0
for i in range(n):
    if comp[i]>=0: continue
    st=[i]; comp[i]=c
    while st:
        u=st.pop()
        for v in adj[u]:
            if comp[v]<0: comp[v]=c; st.append(v)
    c+=1
print('bloques:',c,[sum(1 for x in comp if x==k) for k in range(c)])
cent=lambda poly:(sum(x for x,y in poly)/len(poly),sum(y for x,y in poly)/len(poly))
mz=[(t['t'][3],((t['bb'][0]+t['bb'][2])/2,H-(t['bb'][1]+t['bb'][3])/2)) for t in d['texts'] if t['t'].startswith('MZ.')]
for letter,pt in mz:
    near=sorted(range(n),key=lambda i:math.dist(pt,cent(lots[i]['poly'])))[:3]
    print(letter,'cerca de bloques',[comp[i] for i in near],'nums',[lots[i]['nums'][0] for i in near])
for k in range(c):
    idx=[i for i in range(n) if comp[i]==k]
    nums=sorted(int(lots[i]['nums'][0]) for i in idx)
    print('bloque',k,'lotes',len(idx),'numeros',nums[:40])
json.dump({'comp':comp},open('plano/blocks.json','w'))
