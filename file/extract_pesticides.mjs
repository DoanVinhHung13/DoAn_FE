import fs from 'fs';
import path from 'path';

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const PDF_PATH = 'c:/Đồ án/DoAn_FE/file/thuocbaovethucvat.pdf';
const OUTPUT_JSON = 'c:/Đồ án/DoAn_FE/src/pages/FARM_MANAGER/Reference/PesticideList/pesticide_data.json';

// Known category headers in the PDF
const CATEGORY_MAP = {
  'Thuốc trừ sâu': 'thuoc-tru-sau',
  'Thuốc trừ bệnh': 'thuoc-tru-benh',
  'Thuốc trừ cỏ': 'thuoc-tru-co',
  'Thuốc trừ chuột': 'thuoc-tru-chuot',
  'Thuốc điều hòa sinh trưởng': 'thuoc-dieu-hoa-sinh-truong',
  'Thuốc trừ ốc': 'thuoc-tru-oc',
  'Chất dẫn dụ côn trùng': 'chat-dan-du-con-trung',
  'THUỐC SỬ DỤNG TRONG LÂM NGHIỆP': 'lam-nghiep',
  'THUỐC SỬ DỤNG CHO MỤC ĐÍCH KHÁC': 'muc-dich-khac',
};

async function extractAllPages() {
  const dataBuffer = fs.readFileSync(PDF_PATH);
  const data = new Uint8Array(dataBuffer);

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  console.log(`Total pages: ${totalPages}`);

  // Extract raw text from ALL pages
  let fullText = '';
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (pageNum % 50 === 0) console.log(`Processing page ${pageNum}/${totalPages}...`);
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    // Join items, preserving newlines where there are large y-gaps
    let lastY = null;
    let pageText = '';
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str;
      lastY = item.transform[5];
    }
    fullText += '\n' + pageText;
  }

  // Save raw text for debugging
  fs.writeFileSync('c:/Đồ án/DoAn_FE/file/raw_full.txt', fullText, 'utf8');
  console.log('Saved raw text. Now parsing...');

  // --- PARSE ---
  const pesticides = [];
  let currentCategory = 'Thuốc trừ sâu';
  let currentActiveIngredient = '';
  let id = 1;

  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pattern: number at the start of the line indicates a new active ingredient row
  // But the format is messy - we'll do a best-effort parse

  // The PDF format seems to be:
  // [TT] [ACTIVE_INGREDIENT] [TRADE_NAME] [TARGET] [APPLICANT]
  // With multiple trade names per active ingredient grouped together

  // Strategy: find lines that look like category headers, and lines that start with a number (TT)
  // then collect trade name + target + applicant blocks

  // Let's build entries by scanning for trade name patterns
  // Trade names look like: "SomeName 1.8EC" or "SomeName 75WP" etc.
  // We know active ingredient when the line starts with a number followed by text

  const tradeNamePattern = /^([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9\s\-\.]+\s+[\d]+[\.\d]*(?:EC|WP|WG|SC|SL|SP|GR|ME|DP|WDG|FS|EW|TB|RB|L|G)[0-9]*(?:,\s*[\d]+[\.\d]*(?:EC|WP|WG|SC|SL|SP|GR|ME|DP|WDG|FS|EW|TB|RB|L|G)[0-9]*)*)/;

  let currentEntry = null;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Detect category changes
    for (const [catName, catKey] of Object.entries(CATEGORY_MAP)) {
      if (line.includes(catName) && line.length < 200) {
        currentCategory = catName;
        break;
      }
    }

    // Detect new active ingredient (line starts with number + space + text with "(" or long word)
    const activeIngMatch = line.match(/^(\d+)\s+((?:[A-Za-z][a-zA-Z\s\-,\(\)%]+){3,}(?:\(min\s+\d+%\))?)$/);
    if (activeIngMatch) {
      currentActiveIngredient = activeIngMatch[2].trim();
      i++;
      continue;
    }

    // Match trade name lines (contain format identifier like EC, WP, WG, SC, SL etc.)
    const tradeMatch = line.match(/^([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9\s\-\.]+?\s+[\d]+[\.\d]*(?:EC|WP|WG|SC|SL|SP|GR|ME|DP|WDG|FS|EW|TB|RB|L|G)[0-9A-Z]*(?:,\s*[\d\.]+(?:EC|WP|WG|SC|SL|SP|GR|ME|DP|WDG|FS|EW|TB|RB|L|G)[0-9A-Z]*)*)\s+(.*)/);
    if (tradeMatch) {
      const tradeName = tradeMatch[1].trim();
      const rest = tradeMatch[2].trim();
      
      // Next line(s) might contain the applicant
      // Target tends to contain "/" and applicant is company name
      // Try to split at known company keywords
      const companyKeywords = ['Công ty', 'Company', 'Co.,', 'Ltd', 'Pte', 'Inc', 'Corp', 'Sinon', 'Eastchem', 'Map ', 'Asiatic', 'Agrovertin', 'Shando', 'Dow ', 'Bayer', 'Syngenta', 'BASF', 'FMC ', 'DuPont'];
      
      let target = rest;
      let applicant = '';
      
      for (const kw of companyKeywords) {
        const idx = rest.indexOf(kw);
        if (idx > 0) {
          target = rest.substring(0, idx).trim();
          applicant = rest.substring(idx).trim();
          break;
        }
      }

      // If no company found in this line, check next line
      if (!applicant && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        for (const kw of companyKeywords) {
          if (nextLine.startsWith(kw) || nextLine.includes(kw)) {
            applicant = nextLine;
            i++; // consume next line
            break;
          }
        }
      }

      pesticides.push({
        id: String(id++),
        activeIngredient: currentActiveIngredient || 'Không rõ',
        tradeName,
        target: target.replace(/\s+/g, ' ').trim(),
        applicant: applicant.replace(/\s+/g, ' ').trim(),
        category: currentCategory,
      });
    }

    i++;
  }

  console.log(`Parsed ${pesticides.length} pesticide entries`);
  
  // Save to JSON
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(pesticides, null, 2), 'utf8');
  console.log(`Saved to ${OUTPUT_JSON}`);
  
  // Show first 10 entries
  console.log('\nFirst 10 entries:');
  pesticides.slice(0, 10).forEach(p => {
    console.log(`  [${p.category}] ${p.tradeName} | ${p.activeIngredient} | ${p.applicant.substring(0, 40)}`);
  });

  return pesticides;
}

extractAllPages().catch(console.error);
