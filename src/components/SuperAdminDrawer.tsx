import { useEffect, useState } from "react";
import { AppState } from "@/lib/store";
import {
  DeviceRecord,
  approveDevice,
  getDeviceId,
  loadRegistry,
  removeDevice,
  renameDevice,
  revokeDevice,
  setMaxDevices,
} from "@/lib/deviceRegistry";

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
  const [tab, setTab] = useState<"display" | "header" | "typography" | "devices" | "security">("display");
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

  
  const isLight = state.adminTheme === "light";
  const [adminTheme, setAdminTheme] = useState<"light"|"dark">(state.adminTheme === "light" ? "light" : "dark");
  const bgMain = isLight ? "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" : "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)";
  const textMain = isLight ? "#0f172a" : "#fff";
  const textMuted = isLight ? "#64748b" : "rgba(255,255,255,0.4)";
  const bgInput = isLight ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.4)";
  const borderLine = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";

  const tabItems = [
    { key: "display" as const, label: "Display", icon: "🖥" },
    { key: "header" as const, label: "Header", icon: "📰" },
    { key: "typography" as const, label: "Fonts", icon: "🔤" },
    { key: "devices" as const, label: "Devices", icon: "📺" },
    { key: "security" as const, label: "Security", icon: "🔐" },
  ];

  const accent = "#a855f7";
  const accentDark = "#7c3aed";

  return (
    <div
      style={ Object.assign({}, { "--text-muted": textMuted, "--text-main": textMain, "--bg-input": bgInput, "--border-line": borderLine } as any, {
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "flex-end",
      }) }
      onClick={onClose}
    >
      <div
        style={{
          width: "520px", maxWidth: "94vw", height: "100%",
          background: bgMain, color: textMain,
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "-12px 0 50px rgba(0,0,0,0.7)",
          borderLeft: `1px solid ${accent}33`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "22px 26px",
            background: `linear-gradient(135deg, ${accent}1f 0%, transparent 100%)`,
            borderBottom: `1px solid ${accent}33`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${accent}66`,
                fontSize: "20px",
              }}
            >
              👑
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                  fontSize: "15px", color: textMain, letterSpacing: "3px",
                }}
              >
                SUPER ADMIN
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "11px",
                  color: accent, marginTop: "2px", letterSpacing: "0.5px",
                }}
              >
                Full system control
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: textMuted, fontSize: "16px", cursor: "pointer",
              width: "36px", height: "36px", borderRadius: "8px",
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
              background: `linear-gradient(90deg, ${accent}33 0%, ${accent}0d 100%)`,
              color: textMain, padding: "11px 26px", fontSize: "13px",
              fontFamily: "Inter, sans-serif", fontWeight: 500,
              borderBottom: `1px solid ${accent}33`,
            }}
          >
            ✓ {feedback}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex", gap: "4px", padding: "8px 14px",
            background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {tabItems.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "11px 0 9px",
                background: tab === t.key ? `linear-gradient(135deg, ${accent}26, ${accent}0d)` : "transparent",
                border: tab === t.key ? `1px solid ${accent}40` : "1px solid transparent",
                cursor: "pointer", borderRadius: "8px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{t.icon}</span>
              <span
                style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
                  color: tab === t.key ? accent : "rgba(255,255,255,0.4)",
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

          {/* DEVICES */}
          {tab === "devices" && <DevicesPanel accent={accent} />}

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
            padding: "14px", background: bgInput,
            border: "none", borderTop: `1px solid ${accent}33`,
            color: textMuted, fontSize: "11px", fontWeight: 700,
            letterSpacing: "2px", cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
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
      background: "rgba(255,255,255,0.03)", borderRadius: "12px",
      padding: "16px", marginBottom: "22px",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
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
  width: "100%", background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: 13,
  fontFamily: "Inter, sans-serif", outline: "none", marginBottom: 10, boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
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
      width: "100%", padding: "13px",
      background: "linear-gradient(135deg, #a855f7, #7c3aed)",
      color: "var(--text-main)", border: "none", borderRadius: "10px",
      fontFamily: "Montserrat, sans-serif", fontWeight: 800,
      fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
      boxShadow: "0 6px 20px rgba(168,85,247,0.35)",
    }}
  >
    {children}
  </button>
);

/* ───────── Devices Panel ───────── */

const DevicesPanel = ({ accent }: { accent: string }) => {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [maxDev, setMaxDev] = useState(10);
  const currentId = getDeviceId();

  const refresh = () => {
    const reg = loadRegistry();
    setDevices([...reg.devices].sort((a, b) => a.firstSeen.localeCompare(b.firstSeen)));
    setMaxDev(reg.maxDevices);
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("device-registry-updated", h);
    window.addEventListener("storage", h);
    const iv = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("device-registry-updated", h);
      window.removeEventListener("storage", h);
      clearInterval(iv);
    };
  }, []);

  const pending = devices.filter(d => d.status === "pending");
  const approved = devices.filter(d => d.status === "approved");
  const revoked = devices.filter(d => d.status === "revoked");

  const statusColor = (s: string) =>
    s === "approved" ? "#10b981" : s === "pending" ? "#f59e0b" : "#ef4444";

  const DeviceRow = ({ d }: { d: DeviceRecord }) => (
    <div
      style={{
        background: "rgba(255,255,255,0.03)", border: `1px solid ${d.id === currentId ? accent + "55" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 10, padding: 12, marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <input
          value={d.name}
          onChange={e => { renameDevice(d.id, e.target.value); refresh(); }}
          style={{
            background: "transparent", border: "none", color: "var(--text-main)",
            fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif",
            outline: "none", width: "60%",
          }}
        />
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
          padding: "3px 8px", borderRadius: 4,
          background: statusColor(d.status) + "22", color: statusColor(d.status),
          textTransform: "uppercase",
        }}>
          {d.status}{d.id === currentId ? " · this" : ""}
        </span>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", wordBreak: "break-all", marginBottom: 8 }}>
        {d.id}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {d.status !== "approved" && (
          <button onClick={() => { approveDevice(d.id); refresh(); }}
            style={miniBtn("#10b981")}>APPROVE</button>
        )}
        {d.status === "approved" && d.id !== currentId && (
          <button onClick={() => { revokeDevice(d.id); refresh(); }}
            style={miniBtn("#ef4444")}>REVOKE</button>
        )}
        {d.id !== currentId && (
          <button onClick={() => { if (confirm("Remove this device?")) { removeDevice(d.id); refresh(); } }}
            style={miniBtn("rgba(255,255,255,0.15)")}>REMOVE</button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <SectionLabel>Max Devices Allowed</SectionLabel>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="number" min={1} value={maxDev}
            onChange={e => { const n = parseInt(e.target.value, 10) || 1; setMaxDev(n); setMaxDevices(n); }}
            style={{
              width: 90, background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", color: "var(--text-main)", fontSize: 14, outline: "none",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {approved.length} approved · {pending.length} pending
          </span>
        </div>
      </Card>

      {pending.length > 0 && (
        <>
          <SectionLabel>Pending Approval <span style={{ color: "#f59e0b" }}>({pending.length})</span></SectionLabel>
          {pending.map(d => <DeviceRow key={d.id} d={d} />)}
        </>
      )}

      <SectionLabel>Approved Devices <span style={{ color: "#10b981" }}>({approved.length})</span></SectionLabel>
      {approved.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>No approved devices yet.</div>
      )}
      {approved.map(d => <DeviceRow key={d.id} d={d} />)}

      {revoked.length > 0 && (
        <>
          <SectionLabel>Revoked <span style={{ color: "#ef4444" }}>({revoked.length})</span></SectionLabel>
          {revoked.map(d => <DeviceRow key={d.id} d={d} />)}
        </>
      )}
    </div>
  );
};

const miniBtn = (color: string): React.CSSProperties => ({
  flex: 1, padding: "7px 10px", background: color + "22",
  border: `1px solid ${color}66`, borderRadius: 6,
  color: color === "rgba(255,255,255,0.15)" ? "rgba(255,255,255,0.7)" : color,
  fontSize: 10, fontWeight: 800, letterSpacing: 1, cursor: "pointer",
  fontFamily: "Montserrat, sans-serif",
});

export default SuperAdminDrawer;
