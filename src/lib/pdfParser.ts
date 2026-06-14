import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ExtractedRate {
  code: string;    // e.g. "USD"
  against: string; // e.g. "ZWG"
  buy: string;     // Bid Rate
  sell: string;    // Offer Rate
}

export interface ParseResult {
  extracted: ExtractedRate[];
  rawText: string;
  debug: string;
}

// ── Extract all text items from the PDF preserving visual line order ─────────
async function extractLines(file: File): Promise<{ lines: string[]; rawText: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = async (e) => {
      try {
        // Use Object URL to avoid ArrayBuffer cloning issues and correctly load the PDF file
        const fileUrl = URL.createObjectURL(file);
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;

        // Collect items grouped by (page, rounded-y) to reconstruct visual lines
        interface Item { text: string; x: number; y: number }
        const lineMap = new Map<string, Item[]>();

        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          for (const raw of content.items as any[]) {
            const text = (raw.str as string).trim();
            if (!text) continue;
            const x = Math.round(raw.transform[4]);
            const y = Math.round(raw.transform[5]);
            // Round y to nearest 3px to group fragments on the same visual line
            const yBucket = Math.round(y / 3) * 3;
            const key = `${p}-${yBucket}`;
            if (!lineMap.has(key)) lineMap.set(key, []);
            lineMap.get(key)!.push({ text, x, y });
          }
        }

        // Sort line keys: by page asc, then y desc (higher y = higher on page in PDF coords)
        const sortedKeys = [...lineMap.keys()].sort((a, b) => {
          const [pa, ya] = a.split('-').map(Number);
          const [pb, yb] = b.split('-').map(Number);
          return pa !== pb ? pa - pb : yb - ya;
        });

        const lines: string[] = [];
        let rawText = '';
        for (const key of sortedKeys) {
          const items = lineMap.get(key)!.sort((a, b) => a.x - b.x);
          const line = items.map(i => i.text).join(' ');
          lines.push(line);
          rawText += line + '\n';
        }

        resolve({ lines, rawText });
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── Parse one block of lines looking for "AAA / BBB  bid  mid  offer" rows ──
// Bid  → buy,  Offer → sell,  Mid is ignored.
function parseRateLines(lines: string[]): { code: string; against: string; buy: string; sell: string }[] {
  const results: { code: string; against: string; buy: string; sell: string }[] = [];

  // Matches expressions like "USD / ZWG 24.48 25.24 25.99" or "BWP / ZAR 1.24 1.25" anywhere in the line.
  // Group 1 = code, Group 2 = against, Group 3 = all numbers separated by spaces
  const rowRe = /\b([A-Z]{2,4})\s*\/\s*([A-Z]{2,4})\s+((?:[\d.,]+\s*){2,})/;

  for (const line of lines) {
    const m = line.trim().match(rowRe);
    if (!m) continue;
    
    let code    = m[1].toUpperCase();
    let against = m[2].toUpperCase();
    
    // Map common treasury aliases
    if (code === 'PULA') code = 'BWP';
    if (code === 'RAND') code = 'ZAR';
    if (against === 'PULA') against = 'BWP';
    if (against === 'RAND') against = 'ZAR';

    const nums = m[3].trim().split(/\s+/).map(s => s.replace(/,/g, ''));
    
    // Bid is always the first number
    const buy = nums[0];
    
    // Offer is always the last number (works if there's no mid rate, i.e., 2 numbers, or if 3 numbers)
    const sell = nums[nums.length - 1];

    // Extract everything; do not restrict "against" currencies
    // Skip the ZWG/ZWL conversion line (not relevant to display)
    if (against === code) continue;

    results.push({ code, against, buy, sell });
  }

  return results;
}

// ── Main exported function ────────────────────────────────────────────────────
export async function parseTreasuryPdf(file: File): Promise<ParseResult> {
  let lines: string[] = [];
  let rawText = '';

  try {
    const result = await extractLines(file);
    lines = result.lines;
    rawText = result.rawText;
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    return { extracted: [], rawText: '', debug: `Extraction error: ${err}` };
  }

  // ── Locate the two sections by their header text ─────────────────────────
  // We search case-insensitively for keywords that are stable across date formats
  const sec1Re = /Willing\s+Buyer.*Seller\s+Foreign\s+Exchange\s+Rates/i;
  const sec2Re = /Foreign\s+Exchange\s+Cross\s+Rates\s+against\s+the\s+USD/i;

  let sec1Start = -1;
  let sec2Start = -1;

  for (let i = 0; i < lines.length; i++) {
    if (sec1Start < 0 && sec1Re.test(lines[i])) sec1Start = i;
    if (sec2Start < 0 && sec2Re.test(lines[i])) sec2Start = i;
  }

  const extracted: ExtractedRate[] = [];

  // Helper to add rates, avoiding duplicates
  const addRates = (rates: { code: string; against: string; buy: string; sell: string }[]) => {
    for (const r of rates) {
      if (!extracted.find(x => x.code === r.code && x.against === r.against)) {
        extracted.push(r);
      }
    }
  };

  if (sec1Start >= 0 || sec2Start >= 0) {
    // Section 1: "Willing Buyer/Seller" → ends where sec2 begins (or end of doc)
    if (sec1Start >= 0) {
      const sec1End = sec2Start > sec1Start ? sec2Start : lines.length;
      addRates(parseRateLines(lines.slice(sec1Start + 1, sec1End)));
    }
    // Section 2: "Cross Rates against USD" → to end of document
    if (sec2Start >= 0) {
      addRates(parseRateLines(lines.slice(sec2Start + 1)));
    }
  } else {
    // Fallback: try the whole document
    addRates(parseRateLines(lines));
  }

  const debug = [
    `Pages processed: first ${Math.min(lines.length, 999)} lines`,
    `"Willing Buyer/Seller" section found at line: ${sec1Start}`,
    `"Cross Rates against USD" section found at line: ${sec2Start}`,
    `Total extracted rates: ${extracted.length}`,
    ``,
    `--- FIRST 60 LINES OF PDF ---`,
    ...lines.slice(0, 60),
  ].join('\n');

  return { extracted, rawText, debug };
}
