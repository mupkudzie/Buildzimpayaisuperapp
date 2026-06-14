import type { ExchangeRate } from "./rateStore";

const CURRENCY_META: Record<string, { flag: string; fullName: string }> = {
  USD: { flag: "🇺🇸", fullName: "US DOLLAR" },
  EUR: { flag: "🇪🇺", fullName: "EURO" },
  AED: { flag: "🇦🇪", fullName: "UAE DIRHAM" },
  GBP: { flag: "🇬🇧", fullName: "POUND STERLING" },
};

const VALID_CURRENCIES = ["USD", "EUR", "AED", "GBP"];

function normalizeRate(val: unknown): string {
  if (val === null || val === undefined || val === "" || val === "—" || val === "-") return "—";
  return String(val).trim();
}

function mapRow(currency: string, buy: unknown, sell: unknown): ExchangeRate | null {
  const cur = currency?.toString().trim().toUpperCase();
  if (!VALID_CURRENCIES.includes(cur)) return null;
  const meta = CURRENCY_META[cur] || { flag: "", fullName: cur };
  return {
    currency: cur,
    fullName: meta.fullName,
    flag: meta.flag,
    buy: normalizeRate(buy),
    sell: normalizeRate(sell),
  };
}

export function parseCSV(text: string): ExchangeRate[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header and at least one data row");
  const rates: ExchangeRate[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim());
    const r = mapRow(cols[0], cols[1], cols[2]);
    if (r) rates.push(r);
  }
  if (rates.length === 0) throw new Error("No valid currency rows found");
  return rates;
}

export function parseJSON(text: string): ExchangeRate[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : [data];
  const rates: ExchangeRate[] = [];
  for (const item of arr) {
    const cur = item.currency || item.Currency || item.CURRENCY;
    const buy = item.buy || item.Buy || item.BUY || item.we_buy;
    const sell = item.sell || item.Sell || item.SELL || item.we_sell;
    const r = mapRow(cur, buy, sell);
    if (r) rates.push(r);
  }
  if (rates.length === 0) throw new Error("No valid currency data found in JSON");
  return rates;
}

export async function parseFile(file: File): Promise<ExchangeRate[]> {
  const name = file.name.toLowerCase();
  const text = await file.text();

  if (name.endsWith(".csv")) return parseCSV(text);
  if (name.endsWith(".json")) return parseJSON(text);
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    throw new Error("XLSX parsing requires the SheetJS library. Please use CSV or JSON format.");
  }
  throw new Error("Unsupported file format. Please use .csv or .json");
}
