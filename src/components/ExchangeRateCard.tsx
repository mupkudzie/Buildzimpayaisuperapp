import { CurrencyRate, formatWithSpaces } from "@/lib/store";
import React, { useState, useEffect, useRef } from "react";

interface Props {
  rates: CurrencyRate[];
  companyName: string;
  fontSizeMultiplier?: number;
  columnBgColor?: string;
  rowOddBgColor?: string;
  rowEvenBgColor?: string;
  currencyColBg?: string;
  weBuyColBg?: string;
  weSellColBg?: string;
  currencyTextColor?: string;
}

const GROUPS = ["ZWG", "USD", "ZAR"] as const;
const GROUP_MAX: Record<string, number> = { ZWG: 5, USD: 5, ZAR: 2 };

const codeMap: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", ZAR: "za", BWP: "bw",
  AED: "ae", JPY: "jp", CHF: "ch", CAD: "ca", AUD: "au",
  CNY: "cn", INR: "in", RAND: "za", PULA: "bw", ZWG: "zw",
  NZD: "nz", SAR: "sa", KES: "ke", NGN: "ng", GHS: "gh",
  TZS: "tz", UGX: "ug", ETB: "et", EGP: "eg", QAR: "qa",
  KWD: "kw", SGD: "sg", MYR: "my", THB: "th",
  TWD: "tw", HKD: "hk", KRW: "kr", SEK: "se", NOK: "no",
  DKK: "dk", PLN: "pl", TRY: "tr", BRL: "br", MXN: "mx",
};

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.split(" ").map(w => {
    if (["US", "UAE", "EU", "UK"].includes(w.toUpperCase())) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(" ");
};

const FlagImage = ({ countryCode, flag, rateCode, size }: {
  countryCode: string; flag: string; rateCode?: string; size: number;
}) => {
  const [error, setError] = useState(false);
  const actualCode = (rateCode ? codeMap[rateCode.toUpperCase()] : null) || countryCode;

  if (error || !actualCode) {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{flag}</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${actualCode.toLowerCase()}.png`}
      alt={actualCode}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setError(true)}
    />
  );
};

const ExchangeRateCard = ({ 
  rates, fontSizeMultiplier = 1, buyColor = "#2ab7a9", sellColor = "#e63946",
  columnBgColor = "#F2EFED", rowOddBgColor = "#ffffff", rowEvenBgColor = "#ffffff",
  currencyColBg = "transparent", weBuyColBg = "transparent", weSellColBg = "transparent",
  currencyTextColor = "#000000"
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const grouped: Record<string, CurrencyRate[]> = { ZWG: [], USD: [], ZAR: [] };
  rates.forEach(r => {
    const against = (r.against || "ZWG").toUpperCase();
    if (grouped[against]) grouped[against].push(r);
  });

  const activeGroups = GROUPS
    .map(g => ({ group: g, rows: grouped[g].slice(0, GROUP_MAX[g]) }))
    .filter(g => g.rows.length > 0);

  const totalRows = activeGroups.reduce((sum, g) => sum + g.rows.length, 0);
  const totalHeaders = activeGroups.length;

  useEffect(() => {
    const recalc = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.clientHeight;
      const contentNeeded = totalRows * 50 + totalHeaders * 70 + 20;
      const availableRatio = h / contentNeeded;
      const s = Math.min(2.2, Math.max(1, availableRatio));
      setScale(s);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [totalRows, totalHeaders]);

  const m = fontSizeMultiplier;
  const flagSize = Math.round(Math.min(52, Math.max(16, 24 * scale * m)));
  const nameFont = Math.min(34, Math.max(11, 14 * scale * m));
  const codeFont = Math.min(34, Math.max(11, 14 * scale * m));
  const rateFont = Math.min(42, Math.max(13, 17 * scale * m));
  const headerFont = Math.min(28, Math.max(10, 12 * scale * m));
  const groupFont = Math.min(24, Math.max(9, 11 * scale * m));
  const rowPadV = Math.min(14, Math.max(2, 5 * scale));
  const headerPadV = Math.min(12, Math.max(3, 6 * scale));

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%", width: "100%",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 8px 30px rgba(0,0,0,0.08)",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {activeGroups.map(({ group, rows }) => (
        <div
          key={group}
          style={{
            display: "flex", flexDirection: "column",
            flex: rows.length + 2,
            minHeight: 0,
          }}
        >
          {/* SUB-HEADER */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "38% 17% 22.5% 22.5%",
            background: columnBgColor,
            padding: `${headerPadV}px 0`,
          }}>
            <span style={{
              textAlign: "left", color: "#000",
              fontSize: `${headerFont}px`,
              fontWeight: 800, paddingLeft: "15%",
              letterSpacing: "0.5px",
              gridColumn: "1 / span 2",
            }}>
              CURRENCY
            </span>
            <span style={{
              textAlign: "right", color: "#000",
              fontSize: `${headerFont}px`,
              fontWeight: 800, letterSpacing: "0.5px", paddingRight: "15%",
            }}>
              WE BUY
            </span>
            <span style={{
              textAlign: "right", color: "#000",
              fontSize: `${headerFont}px`,
              fontWeight: 800, letterSpacing: "0.5px", paddingRight: "15%",
            }}>
              WE SELL
            </span>
          </div>

          {/* GROUP SEPARATOR */}
          <div style={{
            display: "flex", alignItems: "center",
            padding: `${Math.max(3, rowPadV * 0.7)}px 4%`,
          }}>
            <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
              <span style={{
                color: "#2ab7a9", fontWeight: "bold",
                fontSize: `${groupFont}px`,
                lineHeight: 1.1, whiteSpace: "nowrap",
              }}>
                VS {group}
              </span>
            </div>
            <div style={{ flex: 1, height: "1px", background: "rgba(42, 183, 169, 0.4)" }} />
          </div>

          {/* DATA ROWS */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {rows.map((rate, ri) => (
              <div
                key={`${rate.code}-${rate.against}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "38% 17% 22.5% 22.5%",
                  alignItems: "center",
                  flex: "1 1 0", minHeight: 0,
                  background: ri % 2 === 0 ? rowOddBgColor : rowEvenBgColor,
                  borderBottom: ri < rows.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none",
                }}
              >
                {/* Flag + Name */}
                <div style={{
                  display: "flex", alignItems: "center",
                  paddingLeft: "15%", height: "100%", background: currencyColBg,
                  paddingTop: `${rowPadV}px`, paddingBottom: `${rowPadV}px`,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: `${Math.max(4, 8 * scale)}px`,
                    flex: 1, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${flagSize}px`,
                      height: `${flagSize}px`,
                      minWidth: `${flagSize}px`,
                      borderRadius: "50%", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, background: "#E0E0E0",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}>
                      <FlagImage countryCode={rate.countryCode} flag={rate.flag} rateCode={rate.code} size={flagSize} />
                    </div>
                    <span style={{
                      fontSize: `${nameFont}px`,
                      color: currencyTextColor, fontWeight: 600,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {toTitleCase(rate.name || rate.code)}
                    </span>
                  </div>
                </div>

                {/* Code */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "15%", height: "100%", background: currencyColBg, paddingTop: `${rowPadV}px`, paddingBottom: `${rowPadV}px` }}>
                  <span style={{
                    fontFamily: 'Calibri, "Segoe UI", sans-serif',
                    color: currencyTextColor, fontWeight: 900,
                    fontSize: `${codeFont}px`,
                  }}>
                    {rate.code}
                  </span>
                </div>

                {/* Buy */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "15%", height: "100%", background: weBuyColBg, paddingTop: `${rowPadV}px`, paddingBottom: `${rowPadV}px` }}>
                  <span style={{
                    fontFamily: 'Calibri, "Segoe UI", sans-serif',
                    fontSize: `${rateFont}px`,
                    fontWeight: 900, color: buyColor,
                    whiteSpace: "nowrap", letterSpacing: "0.2px",
                  }}>
                    {formatWithSpaces(rate.buy)}
                  </span>
                </div>

                {/* Sell */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "15%", height: "100%", background: weSellColBg, paddingTop: `${rowPadV}px`, paddingBottom: `${rowPadV}px` }}>
                  <span style={{
                    fontFamily: 'Calibri, "Segoe UI", sans-serif',
                    fontSize: `${rateFont}px`,
                    fontWeight: 900, color: sellColor,
                    whiteSpace: "nowrap", letterSpacing: "0.2px",
                  }}>
                    {rate.sell ? formatWithSpaces(rate.sell) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExchangeRateCard;
