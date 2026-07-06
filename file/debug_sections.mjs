import fs from 'fs';

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const PDF_PATH = 'c:/Đồ án/DoAn_FE/file/phanbon.pdf';

const dataBuffer = fs.readFileSync(PDF_PATH);
const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) }).promise;

// Find all text items that contain section marker keywords
const KEYWORDS = ['HỮU CƠ KHOÁNG', 'HỮU CƠ SINH HỌC', 'II.', 'III.'];

for (let p = 1; p <= pdfDoc.numPages; p++) {
  const page = await pdfDoc.getPage(p);
  const content = await page.getTextContent();
  
  const items = content.items.map(i => ({ x: Math.round(i.transform[4]), y: Math.round(i.transform[5]), str: i.str.trim() })).filter(i => i.str);
  const pageText = items.map(i => i.str).join(' ');
  
  if (KEYWORDS.some(k => pageText.toUpperCase().includes(k))) {
    console.log(`\n=== PAGE ${p} ===`);
    // Print all items on this page with their coordinates
    for (const it of items) {
      const upper = it.str.toUpperCase();
      if (upper.includes('HỮU CƠ') || upper.includes('SINH H') || upper.includes('KHOÁNG') || upper.includes('II.') || upper.includes('III.') || upper.includes('IV.') || upper.includes('V.') || upper.includes('VI.')) {
        console.log(`  x=${it.x} y=${it.y} str="${it.str}"`);
      }
    }
  }
}
