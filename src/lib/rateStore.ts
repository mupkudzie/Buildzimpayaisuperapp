export interface ExchangeRate {
  currency: string;
  fullName: string;
  flag: string;
  buy: string;
  sell: string;
}

const STORAGE_KEY = "forex_rates";

const DEFAULT_RATES: ExchangeRate[] = [
  { currency: "USD", fullName: "US DOLLAR", flag: "🇺🇸", buy: "6,149", sell: "9,988" },
  { currency: "EUR", fullName: "EURO", flag: "🇪🇺", buy: "8,565", sell: "—" },
  { currency: "AED", fullName: "UAE DIRHAM", flag: "🇦🇪", buy: "7,654", sell: "—" },
  { currency: "GBP", fullName: "POUND STERLING", flag: "🇬🇧", buy: "1,119", sell: "13,195" },
];

export function loadRates(): ExchangeRate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate old data without fullName
        return parsed.map((r: any, i: number) => ({
          ...r,
          fullName: r.fullName || DEFAULT_RATES[i]?.fullName || r.currency,
        }));
      }
    }
  } catch {}
  return [...DEFAULT_RATES];
}

export function saveRates(rates: ExchangeRate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}

export function getDefaultRates(): ExchangeRate[] {
  return [...DEFAULT_RATES];
}
