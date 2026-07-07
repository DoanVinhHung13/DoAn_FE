import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use pdfjs-dist legacy build for Node.js
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

async function extractPDF() {
  const filePath = path.resolve('c:/Đồ án/DoAn_FE/file/thuocbaovethucvat.pdf');
  const dataBuffer = fs.readFileSync(filePath);
  const data = new Uint8Array(dataBuffer);

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;

  console.log('Total pages:', pdfDoc.numPages);

  let allText = '';
  for (let pageNum = 1; pageNum <= Math.min(5, pdfDoc.numPages); pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    console.log(`\n--- PAGE ${pageNum} ---`);
    console.log(pageText.substring(0, 1200));
    allText += `\n--- PAGE ${pageNum} ---\n${pageText}`;
  }

  fs.writeFileSync('c:/Đồ án/DoAn_FE/file/raw_text.txt', allText, 'utf8');
  console.log('\nDone! Check raw_text.txt');
}

extractPDF().catch(console.error);
