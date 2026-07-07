import fs from 'fs';
import path from 'path';

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

async function inspectPDF() {
  const dataBuffer = fs.readFileSync('c:/Đồ án/DoAn_FE/file/phanbon.pdf');
  const data = new Uint8Array(dataBuffer);

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  console.log('Total pages:', pdfDoc.numPages);

  let allText = '';
  for (let pageNum = 1; pageNum <= Math.min(6, pdfDoc.numPages); pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    let lastY = null;
    let pageText = '';
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str;
      lastY = item.transform[5];
    }
    allText += `\n--- PAGE ${pageNum} ---\n${pageText}`;
    console.log(`\n--- PAGE ${pageNum} ---`);
    console.log(pageText.substring(0, 1500));
  }

  fs.writeFileSync('c:/Đồ án/DoAn_FE/file/phanbon_raw.txt', allText, 'utf8');
  console.log('\nDone! Saved phanbon_raw.txt');
}

inspectPDF().catch(console.error);
