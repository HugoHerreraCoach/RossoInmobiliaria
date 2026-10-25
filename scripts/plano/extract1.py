import os
import pypdfium2 as pdfium, pypdfium2.raw as R, ctypes, json
SRC=os.environ['PLANO_PDF']
pdf=pdfium.PdfDocument(SRC); page=pdf[0]; W,H=page.get_size()
tp=R.FPDFText_LoadPage(page.raw)
def bounds(o):
    l,b,r,t=(ctypes.c_float(),ctypes.c_float(),ctypes.c_float(),ctypes.c_float())
    R.FPDFPageObj_GetBounds(o,ctypes.byref(l),ctypes.byref(b),ctypes.byref(r),ctypes.byref(t)); return [l.value,b.value,r.value,t.value]
def text_of(o):
    n=R.FPDFTextObj_GetText(o,tp,None,0)
    buf=(ctypes.c_ushort*n)(); R.FPDFTextObj_GetText(o,tp,buf,n)
    return bytes(buf).decode('utf-16-le').rstrip('\x00')
texts=[]; remove=[]
n=R.FPDFPage_CountObjects(page.raw)
for i in range(n):
    o=R.FPDFPage_GetObject(page.raw,i); t=R.FPDFPageObj_GetType(o)
    if t==R.FPDF_PAGEOBJ_TEXT:
        m=R.FS_MATRIX(); R.FPDFPageObj_GetMatrix(o,ctypes.byref(m))
        texts.append({'t':text_of(o),'bb':bounds(o),'m':[m.a,m.b,m.c,m.d,m.e,m.f]}); remove.append(o)
    elif t==R.FPDF_PAGEOBJ_IMAGE: remove.append(o)
json.dump({'W':W,'H':H,'texts':texts},open('plano/texts.json','w',encoding='utf-8'),ensure_ascii=False)
for o in remove: R.FPDFPage_RemoveObject(page.raw,o)
R.FPDFPage_GenerateContent(page.raw)
img=page.render(scale=4,grayscale=True).to_pil(); img.save('plano/lines_s4.png'); print('render',img.size,'textos',len(texts))
