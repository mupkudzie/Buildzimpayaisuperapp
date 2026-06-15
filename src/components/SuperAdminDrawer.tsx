import { useEffect, useState } from "react";
import { AppState } from "@/lib/store";

interface Props {
  state: AppState;
  onUpdate: (state: AppState) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
];

const SuperAdminDrawer = ({ state, onUpdate, onClose }: Props) => {
  const [tab, setTab] = useState<"display" | "header" | "typography" | "security">("display");
  const [feedback, setFeedback] = useState("");

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Display controls
  const [tickerSpeed, setTickerSpeed] = useState(state.tickerSpeed || 1);
  const [cardFontSize, setCardFontSize] = useState(state.cardFontSize || 1);
  const [buyColor, setBuyColor] = useState(state.buyColor || "#2ab7a9");
  const [sellColor, setSellColor] = useState(state.sellColor || "#e63946");
  const [columnBgColor, setColumnBgColor] = useState(state.columnBgColor || "#F2EFED");
  const [rowOddBgColor, setRowOddBgColor] = useState(state.rowOddBgColor || "#ffffff");
  const [rowEvenBgColor, setRowEvenBgColor] = useState(state.rowEvenBgColor || "#ffffff");
  const [currencyColBg, setCurrencyColBg] = useState(state.currencyColBg || "transparent");
  const [weBuyColBg, setWeBuyColBg] = useState(state.weBuyColBg || "transparent");
  const [weSellColBg, setWeSellColBg] = useState(state.weSellColBg || "transparent");

  // Header
  const [headerText, setHeaderText] = useState(
    state.headerText || `WELLCOME TO ${state.companyName} : FOREIGN EXCHANGE RATES`
  );
  const [headerFontFamily, setHeaderFontFamily] = useState(state.headerFontFamily || "Montserrat, sans-serif");
  const [headerFontSize, setHeaderFontSize] = useState(state.headerFontSize ?? 1);

  // Global typography
  const [globalFontFamily, setGlobalFontFamily] = useState(state.globalFontFamily || "Montserrat, sans-serif");

  const flash = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2200);
  };

  const saveDisplay = () => {
    onUpdate({ ...state, tickerSpeed, cardFontSize, buyColor, sellColor, columnBgColor, rowOddBgColor, rowEvenBgColor, adminTheme, currencyColBg, weBuyColBg, weSellColBg });
    flash("Display settings saved");
  };

  const resetColors = () => {
    setBuyColor("#2ab7a9");
    setSellColor("#e63946");
    setColumnBgColor("#F2EFED");
    setRowOddBgColor("#ffffff");
    setRowEvenBgColor("#ffffff");
    setCurrencyColBg("transparent");
    setWeBuyColBg("transparent");
    setWeSellColBg("transparent");
  };

  const saveHeader = () => {
    onUpdate({ ...state, headerText, headerFontFamily, headerFontSize });
    flash("Header updated");
  };

  const saveTypography = () => {
    onUpdate({ ...state, globalFontFamily });
    flash("Typography updated");
  };

  const changePassword = () => {
    setPwdError("");
    const current = state.superAdminPassword || "kudzaim52000";
    if (currentPwd !== current) { setPwdError("Current password is incorrect"); return; }
    if (newPwd.length < 6) { setPwdError("New password must be at least 6 characters"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match"); return; }
    onUpdate({ ...state, superAdminPassword: newPwd });
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    flash("Super Admin password updated");
  };

  
  const [adminTheme, setAdminTheme] = useState<"light"|"dark">(state.adminTheme === "light" ? "light" : "dark");
  const isLight = adminTheme === "light";
  const bgMain = isLight ? "#ffffff" : "#0f0f0f";
  const textMain = isLight ? "#000000" : "#ffffff";
  const textMuted = isLight ? "#212121" : "#f1f1f1";
  const bgInput = isLight ? "#f9f9f9" : "#272727";
  const borderLine = isLight ? "#e5e5e5" : "#3f3f3f";
  const cardShadow = isLight ? "0 4px 12px rgba(0,0,0,0.03)" : "0 4px 12px rgba(0,0,0,0.18)";

  const tabItems = [
    { key: "display" as const, label: "Display", icon: "🖥" },
    { key: "header" as const, label: "Header", icon: "📰" },
    { key: "typography" as const, label: "Fonts", icon: "🔤" },
    { key: "security" as const, label: "Security", icon: "🔐" },
  ];

  const accent = "#ff0000";
  const accentDark = "#cc0000";

  return (
    <div
      style={ Object.assign({}, { 
        "--text-muted": textMuted, 
        "--text-main": textMain, 
        "--bg-input": bgInput, 
        "--border-line": borderLine,
        "--card-shadow": cardShadow,
      } as Record<string, string>, {
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", justifyContent: "flex-end",
      }) }
    >
      {/* Sibling backdrop overlay with blur, keeping drawer text crisp and sharp */}
      <div 
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "520px", maxWidth: "94vw", height: "100%",
          background: bgMain, color: textMain,
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "-12px 0 50px rgba(0,0,0,0.7)",
          borderLeft: `1px solid ${borderLine}`,
          zIndex: 1,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "22px 26px",
            background: isLight ? "#ffffff" : "#0f0f0f",
            borderBottom: `1px solid ${borderLine}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px", height: "42px", borderRadius: "21px",
                background: "#ff0000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}
            >
              👑
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                  fontSize: "15px", color: "#ff0000", letterSpacing: "2px",
                }}
              >
                SUPER ADMIN
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "11px",
                  color: textMuted, marginTop: "2px", letterSpacing: "0.5px",
                }}
              >
                Full system control
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: `1px solid ${borderLine}`,
              color: textMuted, fontSize: "16px", cursor: "pointer",
              width: "36px", height: "36px", borderRadius: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            style={{
              background: "rgba(16,185,129,0.15)",
              color: "#10b981", padding: "11px 26px", fontSize: "13px",
              fontFamily: "Inter, sans-serif", fontWeight: 500,
              borderBottom: `1px solid ${borderLine}`,
            }}
          >
            ✓ {feedback}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex", gap: "4px", padding: "8px 14px",
            background: isLight ? "#f9f9f9" : "#0f0f0f",
            borderBottom: `1px solid ${borderLine}`,
          }}
        >
          {tabItems.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 0 8px", background: "transparent",
                border: "none", cursor: "pointer",
                borderBottom: tab === t.key ? "3px solid #ff0000" : "3px solid transparent",
                borderRadius: "0",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "16px", color: tab === t.key ? "#ff0000" : textMuted }}>{t.icon}</span>
              <span
                style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
                  color: tab === t.key ? (isLight ? "#0f0f0f" : "#ffffff") : textMuted,
                  fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
                }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 26px" }}>
          {/* DISPLAY */}
          {tab === "display" && (
            <div>
              <SectionLabel>Ticker Speed <span style={{ color: accent }}>({tickerSpeed.toFixed(1)}x)</span></SectionLabel>
              <Card>
                <input
                  type="range" min="0.2" max="3" step="0.1" value={tickerSpeed}
                  onChange={e => setTickerSpeed(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
                <Row><span style={hintStyle}>Slow</span><span style={hintStyle}>Fast</span></Row>
              </Card>

              <SectionLabel>Card Font Size <span style={{ color: accent }}>({cardFontSize.toFixed(1)}x)</span></SectionLabel>
              <Card>
                <input
                  type="range" min="0.6" max="2" step="0.1" value={cardFontSize}
                  onChange={e => setCardFontSize(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
                <Row><span style={hintStyle}>Small</span><span style={hintStyle}>Large</span></Row>
              </Card>

              <SectionLabel>Rate Column Colors</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "16px" }}>
                  <ColorPicker label="We Buy" value={buyColor} onChange={setBuyColor} />
                  <ColorPicker label="We Sell" value={sellColor} onChange={setSellColor} />
                </div>
              </Card>

              <SectionLabel>Card Row Layout Colors</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <ColorPicker label="Header Block" value={columnBgColor} onChange={setColumnBgColor} />
                  <ColorPicker label="Odd Row Bg" value={rowOddBgColor} onChange={setRowOddBgColor} />
                  <ColorPicker label="Even Row Bg" value={rowEvenBgColor} onChange={setRowEvenBgColor} />
                </div>
              </Card>

              <SectionLabel>Vertical Column Backgrounds</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <ColorPicker label="Currency" value={currencyColBg} onChange={setCurrencyColBg} />
                  <ColorPicker label="We Buy" value={weBuyColBg} onChange={setWeBuyColBg} />
                  <ColorPicker label="We Sell" value={weSellColBg} onChange={setWeSellColBg} />
                </div>
              </Card>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button
                  onClick={resetColors}
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, padding: "8px 14px",
                    borderRadius: "8px", cursor: "pointer", fontFamily: "Montserrat, sans-serif"
                  }}
                >
                  RESET COLORS TO DEFAULT
                </button>
              </div>

              <SectionLabel>Admin Theme</SectionLabel>
              <Card>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setAdminTheme("dark")} style={{ flex: 1, padding: "10px", background: adminTheme === "dark" ? "#a855f7" : bgInput, color: adminTheme === "dark" ? "#fff" : textMain, border: "none", borderRadius: "8px", cursor: "pointer" }}>Dark Mode</button>
                  <button onClick={() => setAdminTheme("light")} style={{ flex: 1, padding: "10px", background: adminTheme === "light" ? "#a855f7" : bgInput, color: adminTheme === "light" ? "#fff" : textMain, border: "none", borderRadius: "8px", cursor: "pointer" }}>Light Mode</button>
                </div>
              </Card>

              <PrimaryButton onClick={saveDisplay}>SAVE DISPLAY SETTINGS</PrimaryButton>
            </div>
          )}

          {/* HEADER */}
          {tab === "header" && (
            <div>
              <SectionLabel>Header Title Text</SectionLabel>
              <Card>
                <textarea
                  value={headerText}
                  onChange={e => setHeaderText(e.target.value)}
                  placeholder="WELLCOME TO AFC BANK : FOREIGN EXCHANGE RATES"
                  style={{
                    width: "100%", minHeight: "70px", resize: "vertical",
                    background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px", padding: "12px", color: textMain, fontSize: "13px",
                    fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: "10px", color: textMuted, marginTop: "8px" }}>
                  This is the top banner displayed on every screen.
                </div>
              </Card>

              <SectionLabel>Header Font Family</SectionLabel>
              <Card>
                <select
                  value={headerFontFamily}
                  onChange={e => setHeaderFontFamily(e.target.value)}
                  style={selectStyle}
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value} style={{ background: "#1a0b2e" }}>{f.label}</option>
                  ))}
                </select>
                <div
                  style={{
                    marginTop: "12px", padding: "10px 12px",
                    background: "rgba(0,0,0,0.3)", borderRadius: "6px",
                    color: textMain, fontFamily: headerFontFamily, fontSize: "14px",
                    fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase",
                  }}
                >
                  {headerText || "Preview"}
                </div>
              </Card>

              <SectionLabel>Header Font Size <span style={{ color: accent }}>({headerFontSize.toFixed(2)}x)</span></SectionLabel>
              <Card>
                <input
                  type="range" min="0.5" max="2" step="0.05" value={headerFontSize}
                  onChange={e => setHeaderFontSize(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
                <Row><span style={hintStyle}>Small</span><span style={hintStyle}>Large</span></Row>
              </Card>

              <PrimaryButton onClick={saveHeader}>SAVE HEADER</PrimaryButton>
            </div>
          )}

          {/* TYPOGRAPHY */}
          {tab === "typography" && (
            <div>
              <SectionLabel>Global Font Family</SectionLabel>
              <Card>
                <select
                  value={globalFontFamily}
                  onChange={e => setGlobalFontFamily(e.target.value)}
                  style={selectStyle}
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value} style={{ background: "#1a0b2e" }}>{f.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: "11px", color: textMuted, marginTop: "10px", lineHeight: 1.5 }}>
                  Sets the default font used across the entire dashboard interface.
                </div>
                <div
                  style={{
                    marginTop: "14px", padding: "14px",
                    background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                    fontFamily: globalFontFamily,
                  }}
                >
                  <div style={{ color: textMain, fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>
                    The quick brown fox
                  </div>
                  <div style={{ color: textMuted, fontSize: "13px" }}>
                    Jumps over the lazy dog · 0123456789
                  </div>
                </div>
              </Card>

              <PrimaryButton onClick={saveTypography}>SAVE TYPOGRAPHY</PrimaryButton>
            </div>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <div>
              <SectionLabel>Change Super Admin Password</SectionLabel>
              <Card>
                {pwdError && (
                  <div style={{
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
                    color: "#fca5a5", padding: "8px 12px", borderRadius: 6,
                    fontSize: 12, marginBottom: 12, fontFamily: "Inter, sans-serif",
                  }}>
                    {pwdError}
                  </div>
                )}
                <input
                  type="password" placeholder="Current password"
                  value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                  style={pwdInputStyle}
                />
                <input
                  type="password" placeholder="New password (min 6 chars)"
                  value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  style={pwdInputStyle}
                />
                <input
                  type="password" placeholder="Confirm new password"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  style={pwdInputStyle}
                />
                <div style={{ fontSize: 11, color: textMuted, marginTop: 4, lineHeight: 1.5 }}>
                  This password unlocks the Super Admin dashboard. Keep it secret.
                </div>
              </Card>
              <PrimaryButton onClick={changePassword}>UPDATE PASSWORD</PrimaryButton>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "12px", background: isLight ? "#f2f2f2" : "#272727",
            border: "none", borderTop: `1px solid ${borderLine}`,
            color: textMain, fontSize: "11px", fontWeight: 700,
            letterSpacing: "2px", cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            borderRadius: "18px", margin: "16px",
            transition: "all 0.2s",
          }}
        >
          LOGOUT & CLOSE
        </button>
      </div>
    </div>
  );
};

/* ───────── helpers ───────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
      letterSpacing: "2px", marginBottom: "10px", marginTop: "4px",
      fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: "var(--bg-input)", borderRadius: "12px",
      padding: "16px", marginBottom: "22px",
      border: "1px solid var(--border-line)",
      boxShadow: "var(--card-shadow)",
    }}
  >
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>{children}</div>
);

const hintStyle: React.CSSProperties = { fontSize: "10px", color: "var(--text-muted)" };

const pwdInputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-line)",
  borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: 13,
  fontFamily: "Inter, sans-serif", outline: "none", marginBottom: 10, boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-line)",
  borderRadius: "8px", padding: "10px 12px", color: "var(--text-main)", fontSize: "13px",
  fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer",
};

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "40px", height: "40px", border: "none", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
      />
      <span style={{ fontSize: "12px", color: value, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
        {value}
      </span>
    </div>
  </div>
);

const PrimaryButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", padding: "12px",
      background: "#ff0000",
      color: "#ffffff", border: "none", borderRadius: "20px",
      fontFamily: "Montserrat, sans-serif", fontWeight: 700,
      fontSize: "13px", letterSpacing: "1px", cursor: "pointer",
      transition: "background 0.2s",
    }}
  >
    {children}
  </button>
);

export default SuperAdminDrawer;
