import { strFromU8, unzipSync } from 'fflate';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type Passage = { reference: string; text: string };
function xml(bytes: Uint8Array) {
  return new DOMParser().parseFromString(strFromU8(bytes), 'text/xml');
}
function textIn(element: Document | Element, tag: string, joiner: string) {
  return Array.from(element.getElementsByTagNameNS('*', tag), node => node.textContent || '').join(joiner);
}
export async function extract(file: File): Promise<Passage[]> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Upload a document under 25 MB or split it into smaller parts.');
  const buffer = new Uint8Array(await file.arrayBuffer());
  const suffix = file.name.toLowerCase().split('.').at(-1);
  if (suffix === 'pdf') {
    const pdf = await import('pdfjs-dist');
    pdf.GlobalWorkerOptions.workerSrc = pdfWorker;
    const document = await pdf.getDocument({ data: buffer }).promise;
    try {
      const pages: Passage[] = [];
      for (let index = 1; index <= Math.min(document.numPages, 300); index++) {
        const page = await document.getPage(index);
        const data = await page.getTextContent();
        const text = data.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('');
        if (text.trim()) pages.push({ reference: 'Page ' + index, text });
      }
      return pages;
    } finally { await document.destroy(); }
  }
  if (suffix !== 'docx' && suffix !== 'pptx') throw new Error('Upload a PPTX, PDF or DOCX.');
  let size = 0;
  const files = unzipSync(buffer, { filter(file) {
    const wanted = file.name === 'word/document.xml' || /^ppt\/slides\/slide\d+\.xml$/.test(file.name);
    if (!wanted) return false;
    size += file.originalSize;
    if (size > 8_000_000) throw new Error('The extracted document text is too large.');
    return true;
  } });
  if (suffix === 'pptx') return Object.entries(files).filter(([name]) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).map(([name, bytes]) => ({
    id: Number(name.match(/slide(\d+)/)?.[1]),
    text: Array.from(xml(bytes).getElementsByTagNameNS('*', 'p'), element => textIn(element, 't', '')).join('\n')
  })).sort((a, b) => a.id - b.id).map(slide => ({ reference: 'Slide ' + slide.id, text: slide.text }));
  if (!files['word/document.xml']) throw new Error('No Word document text was found.');
  const paragraphs = Array.from(xml(files['word/document.xml']).getElementsByTagNameNS('*', 'p'), element => textIn(element, 't', ''));
  const sections = [];
  for (let index = 0; index < paragraphs.length; index += 10) sections.push({
    reference: 'Paragraphs ' + (index + 1) + '–' + Math.min(index + 10, paragraphs.length),
    text: paragraphs.slice(index, index + 10).join('\n')
  });
  return sections;
}
