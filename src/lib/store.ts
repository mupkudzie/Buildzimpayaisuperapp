import { supabase } from "./supabase";
import { getInitialPlaylist } from "./androidBridge";

export interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  countryCode: string;
  buy: string;
  sell: string;
  against?: string;
}

export interface CompanyInfo {
  values: string[];
  vision: string;
  mission: string;
}

export interface AppState {
  currencies: CurrencyRate[];
  lastUpdated: string;
  adminPassword: string;
  superAdminPassword?: string;
  companyName: string;
  displayMode: "video" | "announcement";
  announcementText: string;
  companyInfo: CompanyInfo;
  tickerSpeed?: number;
  cardFontSize?: number;
  buyColor?: string;
  sellColor?: string;
  headerText?: string;
  headerFontFamily?: string;
  headerFontSize?: number;
  globalFontFamily?: string;
  columnBgColor?: string;
  rowOddBgColor?: string;
  rowEvenBgColor?: string;
  currencyColBg?: string;
  weBuyColBg?: string;
  weSellColBg?: string;
  currencyTextColor?: string;
  adminTheme?: "light" | "dark" | "system";
}

const STATE_KEY = "afc.appState";

export const DEFAULT_STATE: AppState = {
  currencies: [
    { code: "USD", name: "US DOLLAR", flag: "🇺🇸", countryCode: "us", buy: "6149", sell: "9988", against: "ZWG" },
    { code: "EUR", name: "EURO", flag: "🇪🇺", countryCode: "eu", buy: "8565", sell: "", against: "ZWG" },
    { code: "AED", name: "UAE DIRHAM", flag: "🇦🇪", countryCode: "ae", buy: "7654", sell: "", against: "ZWG" },
    { code: "GBP", name: "POUND STERLING", flag: "🇬🇧", countryCode: "gb", buy: "1119", sell: "13195", against: "ZWG" },
  ],
  lastUpdated: new Date().toISOString(),
  adminPassword: "admin123",
  superAdminPassword: "kudzaim52000",
  companyName: "AFC BANK",
  displayMode: "video",
  announcementText: "Welcome to our exchange!",
  companyInfo: {
    values: ["Relationships", "Results", "Reach", "Relevance"],
    vision: "To become a strong valuable bank that builds relationships, transforms lives through productive communities, ecosystems and value chains",
    mission: "To transform how people produce, transact and grow wealth through upright and accessible banking.",
  },
  headerText: "WELLCOME TO AFC BANK : FOREIGN EXCHANGE RATES",
  headerFontFamily: "Montserrat, sans-serif",
  headerFontSize: 1,
  globalFontFamily: "Montserrat, sans-serif",
  columnBgColor: "#F2EFED",
  rowOddBgColor: "#ffffff",
  rowEvenBgColor: "#ffffff",
  currencyColBg: "transparent",
  weBuyColBg: "transparent",
  weSellColBg: "transparent",
  currencyTextColor: "#000000",
  adminTheme: "dark",
};

export async function loadState(): Promise<AppState> {
  try {
    // Try network first
    const { data, error } = await supabase.from("app_state").select("state").eq("id", 1).single();
    if (!error && data?.state) {
      const remoteState = data.state as Partial<AppState>;
      let needsSave = false;
      if (remoteState.adminPassword === "admin") {
        remoteState.adminPassword = "admin123";
        needsSave = true;
      }
      if (!remoteState.superAdminPassword) {
        remoteState.superAdminPassword = "kudzaim52000";
        needsSave = true;
      }
      const merged = { ...DEFAULT_STATE, ...remoteState, currencies: remoteState.currencies || DEFAULT_STATE.currencies };
      localStorage.setItem(STATE_KEY, JSON.stringify(merged));
      if (needsSave) {
        saveState(merged).catch(console.error);
      }
      return merged;
    }
  } catch (err) {
    console.error("Error loading network state:", err);
  }

  // Fallback to local
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.currencies)) {
        if (parsed.adminPassword === "admin") {
          parsed.adminPassword = "admin123";
        }
        if (!parsed.superAdminPassword) {
          parsed.superAdminPassword = "kudzaim52000";
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch (err) {
    console.error("Error loading local state:", err);
  }
  return { ...DEFAULT_STATE, currencies: DEFAULT_STATE.currencies.map(c => ({ ...c })) };
}

export function getLocalState(): AppState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.currencies)) {
        if (parsed.adminPassword === "admin") {
          parsed.adminPassword = "admin123";
        }
        if (!parsed.superAdminPassword) {
          parsed.superAdminPassword = "kudzaim52000";
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch (err) {
    console.error("Error loading local state:", err);
  }
  return { ...DEFAULT_STATE, currencies: DEFAULT_STATE.currencies.map(c => ({ ...c })) };
}

export async function saveState(state: AppState): Promise<void> {
  const updated = { ...state, lastUpdated: new Date().toISOString() };
  try {
    await supabase.from("app_state").upsert({ id: 1, state: updated });
  } catch (err) {
    console.error("Error syncing state to network:", err);
  }
  
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(updated));
    // Notify same-tab listeners of state change
    window.dispatchEvent(new CustomEvent("app-state-updated", { detail: updated }));
  } catch (err) {
    console.error("Error saving state locally:", err);
  }
}

export async function fetchVideoUrls(): Promise<string[]> {
  return getInitialPlaylist();
}

export function formatWithCommas(val: string): string {
  const parts = val.replace(/[^0-9.]/g, "").split(".");
  let intPart = parts[0];
  if (!intPart && parts.length === 1) return "—";
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) return `${intPart}.${parts[1]}`;
  return intPart;
}

export function formatWithSpaces(val: string): string {
  const parts = val.replace(/[^0-9.]/g, "").split(".");
  let intPart = parts[0];
  if (!intPart && parts.length === 1) return "—";
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (parts.length > 1) return `${intPart}.${parts[1]}`;
  return intPart;
}
