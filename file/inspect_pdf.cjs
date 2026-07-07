const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractPDF() {
  const filePath = 'c:/Đồ án/DoAn_FE/file/thuocbaovethucvat.pdf';
  
  const parser = new PDFParse({ verbosity: 0 });
  await parser.load({ url: filePath });
  
  const info = parser.getInfo();
  console.log('Info:', JSON.stringify(info));
  
  const numPages = info.pages;
  console.log('Total pages:', numPages);
  
  let allText = '';
  for (let i = 1; i <= Math.min(5, numPages); i++) {
    const pageText = await parser.getPageText(i);
    console.log(`\n--- PAGE ${i} ---`);
    if (typeof pageText === 'string') {
      console.log(pageText.substring(0, 1000));
    } else {
      console.log(JSON.stringify(pageText).substring(0, 1000));
    }
    allText += `\n--- PAGE ${i} ---\n` + (typeof pageText === 'string' ? pageText : JSON.stringify(pageText));
  }
  
  fs.writeFileSync('c:/Đồ án/DoAn_FE/file/raw_text.txt', allText, 'utf8');
  console.log('\nDone writing raw_text.txt');
}

extractPDF().catch(console.error);
