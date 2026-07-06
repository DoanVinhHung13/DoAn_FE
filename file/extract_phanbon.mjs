import fs from 'fs';
import path from 'path';

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const PDF_PATH   = 'c:/Đồ án/DoAn_FE/file/phanbon.pdf';
const OUTPUT_JSON= 'c:/Đồ án/DoAn_FE/src/pages/FARM_MANAGER/Reference/FertilizerList/fertilizer_data.json';

const SECTION_MARKERS = [
  { text: 'I. PHÂN HỮU CƠ',                                          cat: 'Phân hữu cơ' },
  { text: 'II. PHÂN HỮU CƠ KHOÁNG',                                  cat: 'Phân hữu cơ khoáng' },
  { text: 'III. PHÂN HỮU CƠ SINH HỌC',                               cat: 'Phân hữu cơ sinh học' },
  { text: 'IV. PHÂN HỮU CƠ VI SINH',                                 cat: 'Phân hữu cơ vi sinh' },
  { text: 'V. PHÂN VI SINH VẬT',                                     cat: 'Phân vi sinh vật' },
  { text: 'VI. PHÂN BÓN LÁ',                                        cat: 'Phân bón lá' },
  { text: 'VII. CHẤT GIỮ ẨM',                                       cat: 'Chất giữ ẩm, cải tạo đất' },
  { text: 'VIII. PHÂN BÓN CÓ CHỨA CHẤT TĂNG HIỆU SUẤT',            cat: 'Phân bón tăng hiệu suất' },
];

const COL = { tt:[0,58], name:[58,278], ing:[328,515], org:[515,900] };
const extractCol = (items, col) =>
  items.filter(it => it.x >= col[0] && it.x < col[1])
       .sort((a,b)=>a.x-b.x).map(it=>it.str).join(' ').trim();

const dataBuffer = fs.readFileSync(PDF_PATH);
const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) }).promise;
console.log(`Total pages: ${pdfDoc.numPages}`);

// ── Collect all items globally, grouped by row ───────────────────────────────
// Key insight: sort by pageNum ASC, then by Y DESC (top of page = large Y in PDF coords)
const allRows = [];

for (let p = 1; p <= pdfDoc.numPages; p++) {
  if (p % 20 === 0) console.log(`  page ${p}/${pdfDoc.numPages}`);
  const page    = await pdfDoc.getPage(p);
  const content = await page.getTextContent();

  const rowMap = new Map();
  for (const item of content.items) {
    const s = item.str.trim();
    if (!s) continue;
    const ry = Math.round(item.transform[5]);
    const key = ry;
    if (!rowMap.has(key)) rowMap.set(key, { pageNum: p, y: item.transform[5], items: [] });
    rowMap.get(key).items.push({ x: item.transform[4], str: s });
  }

  // Sort rows top-to-bottom (descending Y within a page)
  const pageRows = [...rowMap.values()].sort((a, b) => b.y - a.y);
  allRows.push(...pageRows);
}

console.log(`Total rows: ${allRows.length}`);

// ── Build category timeline: at which row index does each category start? ────
// section markers can be ANYWHERE in a row (even mixed with other text since x=27)
// We match full item strings exactly (single item = the full header text)
const categoryTimeline = []; // { rowIndex, category }

for (let ri = 0; ri < allRows.length; ri++) {
  const rowItems = allRows[ri].items;
  for (const item of rowItems) {
    for (const m of SECTION_MARKERS) {
      if (item.str === m.text || item.str.startsWith(m.text)) {
        categoryTimeline.push({ rowIndex: ri, category: m.cat });
        console.log(`Category "${m.cat}" starts at row ${ri} (page ${allRows[ri].pageNum}, y=${Math.round(allRows[ri].y)})`);
      }
    }
  }
}

function getCategoryAt(rowIndex) {
  let cat = 'Phân hữu cơ khoáng'; // default
  for (const t of categoryTimeline) {
    if (rowIndex >= t.rowIndex) cat = t.category;
    else break;
  }
  return cat;
}

// ── Parse rows into fertilizer entries ──────────────────────────────────────
const SKIP = (txt) =>
  /Tên phân bón|Thành phần|Đơn vị|PHỤ LỤC|Ban hành kèm|Tổ chức, cá|nhân đăng ký|ĐƯỢC PHÉP SẢN/.test(txt) ||
  SECTION_MARKERS.some(m => txt.includes(m.text));

const results = [];
let pending   = null;
let idCounter = 1;

for (let ri = 0; ri < allRows.length; ri++) {
  const row     = allRows[ri];
  const rowText = row.items.map(i => i.str).join(' ');
  if (SKIP(rowText)) continue;

  const category = getCategoryAt(ri);
  const ttText   = extractCol(row.items, COL.tt);
  const nameTxt  = extractCol(row.items, COL.name);
  const ingTxt   = extractCol(row.items, COL.ing);
  const orgTxt   = extractCol(row.items, COL.org);

  const sttNum    = parseInt(ttText);
  const hasStt    = !isNaN(sttNum) && sttNum > 0 && sttNum <= 9999 && String(sttNum) === ttText.trim();
  const nameOK    = nameTxt.length > 3 && !nameTxt.startsWith('%') && !nameTxt.startsWith('ppm') && !nameTxt.startsWith('pH');

  if (hasStt && nameOK) {
    if (pending) results.push(pending);
    pending = { id: String(idCounter++), stt: sttNum, name: nameTxt, ingredients: ingTxt, company: orgTxt, category };
  } else if (pending) {
    if (nameOK && nameTxt) pending.name += ' ' + nameTxt;
    if (ingTxt?.length > 2) pending.ingredients += (pending.ingredients ? '; ' : '') + ingTxt;
    if (orgTxt?.length > 2) pending.company     += ' ' + orgTxt;
  }
}
if (pending) results.push(pending);

// ── Clean & deduplicate ──────────────────────────────────────────────────────
const cleaned = results
  .map(e => {
    // Strip any ingredient fragments that leaked into the name
    // Pattern: name is clean up until we see "HC:" or "N-P" or "Cfu" or "ppm" etc.
    let name = e.name
      // "HC:" followed by space+digit = ingredient data, strip it
      // But "HC MK" or "HC " followed by letter = part of product name, keep it
      .replace(/\s+HC:\s*\d[^$]*/i, '')
      .replace(/\s+(N-P2O5|N-P|Cfu\/|Cfu|ppm\s|pH\s|%\s*\d|Axit Humic|Axit Fulvic|MPN\/)[^$]*/i, '')
      .replace(/\s*;\s*$/, '')
      .trim();

    // Also clean names that have numbers-only fragments like " 8 " or " 35 "
    name = name.replace(/\s+\d{1,3}\s*$/, '').trim();

    return {
      ...e,
      name,
      company:     e.company.replace(/Tổ chức.*$/i,'').replace(/\s+/g,' ').trim(),
      ingredients: e.ingredients.trim(),
    };
  })
  .filter(e => {
    const n = e.name.trim();
    return n.length > 3 && !n.startsWith('%') && !n.startsWith('ppm') && !/^\d+$/.test(n);
  });

const seen = new Set();
const final = [];
for (const e of cleaned) {
  const key = `${e.category}||${e.name}`;
  if (!seen.has(key)) { seen.add(key); final.push(e); }
}
final.forEach((e, i) => { e.id = String(i + 1); });

console.log(`\nTotal: ${final.length} entries`);
const breakdown = {};
for (const f of final) breakdown[f.category] = (breakdown[f.category] || 0) + 1;
console.log('\nCategory breakdown:');
for (const [cat, count] of Object.entries(breakdown)) console.log(`  ${cat}: ${count}`);

console.log('\nSample (3 of each):');
for (const cat of Object.keys(breakdown)) {
  const samples = final.filter(f => f.category === cat).slice(0, 3);
  samples.forEach(f => console.log(`  [${f.stt}][${f.category.substring(0,20)}] "${f.name.substring(0,45)}"`));
}

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(final, null, 2), 'utf8');
console.log(`\nSaved ${final.length} entries → ${OUTPUT_JSON}`);
