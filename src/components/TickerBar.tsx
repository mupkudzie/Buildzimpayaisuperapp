import { useState, useEffect } from "react";
import { CurrencyRate, formatWithCommas } from "@/lib/store";

interface Props {
  rates: CurrencyRate[];
  onAdminClick: () => void;
  speed?: number;
}

const codeMap: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", ZAR: "za", BWP: "bw",
  AED: "ae", JPY: "jp", CHF: "ch", CAD: "ca", AUD: "au",
  CNY: "cn", INR: "in", RAND: "za", PULA: "bw"
};

const FlagImage = ({ countryCode, flag, rateCode }: { countryCode: string; flag: string; rateCode?: string }) => {
  const [error, setError] = useState(false);
  const actualCode = (rateCode ? codeMap[rateCode.toUpperCase()] : null) || countryCode;

  if (error || !actualCode) {
    return <span style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 1 }}>{flag}</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${actualCode.toLowerCase()}.png`}
      alt={actualCode}
      style={{ width: "clamp(40px, 4vw, 80px)", height: "clamp(26px, 2.6vw, 53px)", objectFit: "cover", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)" }}
      onError={() => setError(true)}
    />
  );
};

const TickerBar = ({ rates, onAdminClick, speed = 1 }: Props) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const entries = [...rates, ...rates, ...rates, ...rates];

  return (
    <div style={{
      height: "12vh", minHeight: "80px", maxHeight: "140px",
      display: "flex", width: "100%", flexShrink: 0, overflow: "hidden",
    }}>
      {/* LIVE RATES badge */}
      <div style={{
        width: "clamp(140px, 15vw, 250px)", flexShrink: 0,
        background: "#cc0000",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
      }}>
        <div style={{
          width: "12px", height: "12px", borderRadius: "50%",
          background: "#ffffff",
          animation: "pulse-dot 1.2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800,
          fontSize: "clamp(0.9rem, 1.4vw, 2.5rem)",
          color: "#FFFFFF", letterSpacing: "1px", textTransform: "uppercase",
        }}>
          LIVE RATES
        </span>
      </div>

      {/* Scrolling ticker */}
      <div style={{
        flex: 1, background: "#0a0f1e", overflow: "hidden",
        display: "flex", alignItems: "center", position: "relative",
      }}>
        <div
          className="ticker-scroll-track"
          style={{
            display: "inline-flex", alignItems: "center",
            whiteSpace: "nowrap", width: "max-content",
            "--ticker-duration": `${(Math.max(10, rates.length) * 20) / speed}s`,
          } as React.CSSProperties}
        >
          {entries.map((r, i) => (
            <span key={`${r.code}-${i}`} style={{ display: "inline-flex", alignItems: "center", marginRight: "30px" }}>
              <div style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
                <FlagImage countryCode={r.countryCode} flag={r.flag} rateCode={r.code} />
              </div>
              <span style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: "clamp(2rem, 3.6vw, 5rem)", fontWeight: 700,
                color: "#ffffff", letterSpacing: "1px",
              }}>
                {r.code.includes("/") ? r.code : `${r.code}/${(r.against || "ZWG").toUpperCase()}`}
              </span>
              <span style={{
                fontSize: "clamp(1.5rem, 2.4vw, 4rem)",
                color: "rgba(255,255,255,0.45)", letterSpacing: "1px", marginLeft: "10px",
              }}>BUY</span>
              <span style={{
                fontFamily: '"Arial Rounded MT Bold", sans-serif',
                fontSize: "clamp(2rem, 3.6vw, 5rem)", fontWeight: 700,
                color: "#d4af37", marginLeft: "8px",
              }}>
                {formatWithCommas(r.buy)}
              </span>
              <span style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "clamp(1.5rem, 2.4vw, 4rem)",
                margin: "0 clamp(8px, 1vw, 20px)",
              }}>· SELL</span>
              <span style={{
                fontFamily: '"Arial Rounded MT Bold", sans-serif',
                fontSize: "clamp(2rem, 3.6vw, 5rem)", fontWeight: 700,
                color: "#ff6b6b", marginLeft: "8px",
              }}>
                {r.sell ? formatWithCommas(r.sell) : "—"}
              </span>
              <span style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: "clamp(2rem, 3.3vw, 5rem)",
                margin: "0 clamp(15px, 2.5vw, 40px)",
              }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Clock & Date */}
      <div style={{
        width: "clamp(160px, 15vw, 280px)", flexShrink: 0,
        background: "linear-gradient(135deg, #0DAA48 0%, #066D28 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
        boxShadow: "inset 0px 4px 10px rgba(0,0,0,0.1)",
      }}>
        <span style={{
          fontFamily: "Montserrat, Arial, sans-serif",
          fontSize: "clamp(1.5rem, 2.2vw, 3.2rem)", fontWeight: 800,
          color: "#FFFFFF", letterSpacing: "1px", lineHeight: 1,
          textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
        }}>
          {timeStr}
        </span>
        <span style={{
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "clamp(0.9rem, 1.2vw, 1.8rem)", fontWeight: 600,
          color: "rgba(255,255,255,0.9)", letterSpacing: "1px",
          marginTop: "6px", textTransform: "uppercase",
        }}>
          {dateStr}
        </span>
        <button
          onClick={onAdminClick}
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: "40px", height: "40px",
            opacity: 0.1, cursor: "pointer",
            background: "transparent", border: "none",
          }}
          title="Admin"
        >🔒</button>
      </div>
    </div>
  );
};

export default TickerBar;
