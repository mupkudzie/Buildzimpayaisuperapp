import { useState } from "react";
import { AppState, CurrencyRate } from "@/lib/store";
import { PRESET_CURRENCIES } from "@/lib/currencies";
import { ALL_COUNTRIES, Country } from "@/lib/countries";
import { parseTreasuryPdf } from "@/lib/pdfParser";

interface Props {
  state: AppState;
  onUpdate: (state: AppState) => void;
  onClose: () => void;
}

const AdminDrawer = ({ state, onUpdate, onClose }: Props) => {
  const [tab, setTab] = useState<"rates" | "currencies" | "display" | "branding" | "settings">("rates");
  const [editRates, setEditRates] = useState<CurrencyRate[]>(() => state.currencies.map(c => ({ ...c })));
  const [feedback, setFeedback] = useState("");
  const [displayMode, setDisplayMode] = useState<"video" | "announcement">(state.displayMode || "video");
  const [announcementText, setAnnouncementText] = useState(state.announcementText || "");
  const [tickerSpeed, setTickerSpeed] = useState(state.tickerSpeed || 1);
  const [cardFontSize, setCardFontSize] = useState(state.cardFontSize || 1);
  const [buyColor, setBuyColor] = useState(state.buyColor || "#2ab7a9");
  const [sellColor, setSellColor] = useState(state.sellColor || "#e63946");
  const [companyInput, setCompanyInput] = useState(state.companyName);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [customBuy, setCustomBuy] = useState("");
  const [customSell, setCustomSell] = useState("");
  const [customAgainst, setCustomAgainst] = useState("");
  const [presetAgainst, setPresetAgainst] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const info = state.companyInfo || { values: ["Relationships", "Results", "Reach", "Relevance"], vision: "", mission: "" };
  const [valuesText, setValuesText] = useState(info.values.join("\n"));
  const [visionText, setVisionText] = useState(info.vision);
  const [missionText, setMissionText] = useState(info.mission);
  const [showDebug, setShowDebug] = useState(false);
  const [debugText, setDebugText] = useState("");

  const flash = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2500);
  };

  const saveRates = () => {
    const cleaned = editRates.map(r => ({ ...r, buy: r.buy.trim(), sell: r.sell.trim() }));
    onUpdate({ ...state, currencies: cleaned });
    flash("Rates saved!");
  };

  const removeCurrency = (code: string, against: string) => {
    const next = editRates.filter(r => !(r.code === code && (r.against || "ZWG") === against));
    setEditRates(next);
    onUpdate({ ...state, currencies: next });
    flash(`${code} removed`);
  };

  const addPreset = (preset: typeof PRESET_CURRENCIES[0]) => {
    if (!presetAgainst) { flash("Select against currency first"); return; }
    if (editRates.find(r => r.code === preset.code && (r.against || "ZWG") === presetAgainst)) { flash(`${preset.code} already added against ${presetAgainst}`); return; }
    const newRate: CurrencyRate = { ...preset, buy: "", sell: "", against: presetAgainst };
    const next = [...editRates, newRate];
    setEditRates(next);
    onUpdate({ ...state, currencies: next });
    flash(`${preset.code} added`);
  };

  const selectCountry = (country: Country) => {
    setCustomCountry(country.code);
    setShowCountryPicker(false);
    setCountrySearch("");
  };

  const addCustom = () => {
    if (!customCode) { flash("Code required"); return; }
    if (!customCountry) { flash("Please select a country flag"); return; }
    if (!customAgainst) { flash("Please select against currency"); return; }
    if (editRates.find(r => r.code === customCode.toUpperCase() && (r.against || "ZWG") === customAgainst.toUpperCase())) { flash("Already exists against this currency"); return; }
    const country = ALL_COUNTRIES.find(c => c.code === customCountry);
    const newRate: CurrencyRate = {
      code: customCode.toUpperCase(),
      name: customName.toUpperCase() || customCode.toUpperCase(),
      flag: country?.flag || "💱",
      countryCode: customCountry.toLowerCase(),
      buy: customBuy,
      sell: customSell,
      against: customAgainst.toUpperCase(),
    };
    const next = [...editRates, newRate];
    setEditRates(next);
    onUpdate({ ...state, currencies: next });
    setCustomCode(""); setCustomName(""); setCustomCountry(""); setCustomBuy(""); setCustomSell(""); setCustomAgainst("");
    flash("Currency added");
  };

  const saveDisplay = () => {
    onUpdate({ ...state, displayMode, announcementText, tickerSpeed, cardFontSize, buyColor, sellColor });
    flash("Display settings saved");
  };

  const saveCompany = () => {
    onUpdate({ ...state, companyName: companyInput.trim().toUpperCase() || "AFC BANK" });
    flash("Company name updated");
  };

  const updatePassword = () => {
    if (newPass.length < 4) { flash("Min 4 characters"); return; }
    if (newPass !== confirmPass) { flash("Passwords don't match"); return; }
    onUpdate({ ...state, adminPassword: newPass });
    setNewPass(""); setConfirmPass("");
    flash("Password updated");
  };

  const availablePresets = presetAgainst 
    ? PRESET_CURRENCIES.filter(p => !editRates.find(r => r.code === p.code && (r.against || "ZWG") === presetAgainst))
    : PRESET_CURRENCIES;
  const selectedCountry = ALL_COUNTRIES.find(c => c.code === customCountry);
  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  
  const isLight = state.adminTheme === "light";
  const bgMain = isLight ? "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" : "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)";
  const textMain = isLight ? "#0f172a" : "#fff";
  const textMuted = isLight ? "#64748b" : "rgba(255,255,255,0.4)";
  const bgInput = isLight ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.3)";
  const borderLine = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)";

  const tabItems = [
    { key: "rates" as const, label: "Rates", icon: "📊" },
    { key: "currencies" as const, label: "Currencies", icon: "💱" },
    { key: "display" as const, label: "Display", icon: "🖥" },
    { key: "branding" as const, label: "Branding", icon: "🏢" },
    { key: "settings" as const, label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={ Object.assign({}, { "--text-muted": textMuted, "--text-main": textMain, "--bg-input": bgInput, "--border-line": borderLine } as any, {
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "flex-end",
    }) } onClick={onClose}>
      <div style={{
        width: "460px", maxWidth: "92vw", height: "100%",
        background: bgMain, color: textMain,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.5), -2px 0 15px rgba(0,0,0,0.3)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(212,168,83,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(212,168,83,0.15)",
        }}>
          <div>
            <div style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 800,
              fontSize: "16px", color: "#d4af37",
              letterSpacing: "3px",
            }}>ADMIN PANEL</div>
            <div style={{
              fontFamily: "Inter, sans-serif", fontSize: "11px",
              color: textMuted, marginTop: "2px",
            }}>Manage exchange rates & display</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: textMuted, fontSize: "16px", cursor: "pointer",
            width: "36px", height: "36px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>✕</button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            background: "linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)",
            color: "#10b981", padding: "10px 24px", fontSize: "13px",
            fontFamily: "Inter, sans-serif", fontWeight: 500,
            borderBottom: "1px solid rgba(16,185,129,0.15)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span>✓</span> {feedback}
          </div>
        )}

        {/* Debug overlay */}
        {showDebug && (
          <div style={{ position: "absolute", inset: 0, zIndex: 9999, background: "#0f172a", display: "flex", flexDirection: "column", padding: "20px", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#d4af37", fontWeight: 700, fontSize: "14px", fontFamily: "Montserrat, sans-serif" }}>PDF Debug Output</span>
              <button onClick={() => setShowDebug(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: textMain, fontSize: "16px", cursor: "pointer", width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <p style={{ color: textMuted, fontSize: "12px", margin: 0 }}>Select all text below, copy, and send to developer.</p>
            <textarea
              readOnly value={debugText}
              style={{ flex: 1, background: bgInput, color: "#a0f0a0", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", resize: "none" }}
              onClick={e => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "2px", padding: "4px 12px",
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          {tabItems.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 0 8px", background: tab === t.key ? "rgba(212,168,83,0.1)" : "transparent",
                border: "none", cursor: "pointer",
                borderBottom: tab === t.key ? "2px solid #d4af37" : "2px solid transparent",
                borderRadius: "6px 6px 0 0",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "14px" }}>{t.icon}</span>
              <span style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px",
                color: tab === t.key ? "#d4af37" : "rgba(255,255,255,0.35)",
                fontFamily: "Montserrat, sans-serif",
                textTransform: "uppercase",
              }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* ─── RATES TAB ─── */}
          {tab === "rates" && (
            <div>
              {/* PDF Upload */}
              <label style={{
                cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center",
                gap: "10px", width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "10px", border: "none",
                color: textMain, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px",
                boxShadow: "0 4px 15px rgba(16,185,129,0.25)",
                marginBottom: "20px",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
                Upload PDF Rates
                <input
                  type="file" accept="application/pdf" style={{ display: "none" }}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      flash("Parsing PDF...");
                      const parsed = await parseTreasuryPdf(file);
                      const result = parsed.extracted;
                      if (result.length === 0) {
                        console.log("=== PDF DEBUG ===");
                        console.log(parsed.debug);
                        setDebugText(parsed.debug);
                        setShowDebug(true);
                        flash("0 rates found — debug view opened");
                        return;
                      }
                      let added = 0, updated = 0;
                      const next = [...editRates];
                      result.forEach(r => {
                        const rCode = r.code.toUpperCase();
                        const rAgainst = (r.against || "ZWG").toUpperCase();
                        const existingIndex = next.findIndex(x => x.code.toUpperCase() === rCode && (x.against || "ZWG").toUpperCase() === rAgainst);
                        if (existingIndex >= 0) {
                          next[existingIndex] = { ...next[existingIndex], buy: r.buy, sell: r.sell };
                          updated++;
                        } else {
                          const preset = PRESET_CURRENCIES.find(p => p.code === r.code);
                          const countryMatches = ALL_COUNTRIES.filter(c => c.code.toUpperCase() === r.code.substring(0, 2));
                          const country = countryMatches[0];
                          next.push({
                            code: r.code, against: r.against, buy: r.buy, sell: r.sell,
                            name: preset?.name || r.code,
                            flag: preset?.flag || country?.flag || "💱",
                            countryCode: preset?.countryCode || country?.code.toLowerCase() || "xx"
                          });
                          added++;
                        }
                      });
                      setEditRates(next);
                      onUpdate({ ...state, currencies: next });
                      flash(`✅ Updated ${updated}, Added ${added} rates.`);
                    } catch (err) {
                      flash("Failed to parse PDF — check console");
                      console.error(err);
                    }
                  }}
                />
              </label>

              {/* Rate rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {editRates.map((r, i) => (
                  <div key={`${r.code}-${r.against || "ZWG"}`} style={{
                    display: "grid", gridTemplateColumns: "90px 62px 1fr 1fr",
                    gap: "6px", alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 700, color: "#d4af37",
                      fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap",
                    }}>{r.flag} {r.code}</span>
                    <select
                      value={r.against || "ZWG"}
                      onChange={e => {
                        const next = [...editRates];
                        next[i] = { ...next[i], against: e.target.value };
                        setEditRates(next);
                      }}
                      style={{
                        background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px", padding: "7px 4px",
                        color: textMain, fontSize: "11px", fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                      }}
                    >
                      <option value="ZWG">ZWG</option>
                      <option value="USD">USD</option>
                      <option value="ZAR">ZAR</option>
                    </select>
                    <input
                      inputMode="decimal" value={r.buy} placeholder="Buy"
                      onKeyPress={(e) => { if (!/[0-9.]/.test(e.key)) e.preventDefault(); }}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        if ((val.match(/\./g) || []).length > 1) val = val.substring(0, val.lastIndexOf('.'));
                        const next = [...editRates]; next[i] = { ...next[i], buy: val }; setEditRates(next);
                      }}
                      style={{
                        background: bgInput, border: "1px solid rgba(42,183,169,0.2)",
                        borderRadius: "6px", padding: "8px 10px",
                        color: "#2ab7a9", fontSize: "13px", fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                      }}
                    />
                    <input
                      inputMode="decimal" value={r.sell} placeholder="Sell"
                      onKeyPress={(e) => { if (!/[0-9.]/.test(e.key)) e.preventDefault(); }}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        if ((val.match(/\./g) || []).length > 1) val = val.substring(0, val.lastIndexOf('.'));
                        const next = [...editRates]; next[i] = { ...next[i], sell: val }; setEditRates(next);
                      }}
                      style={{
                        background: bgInput, border: "1px solid rgba(230,57,70,0.2)",
                        borderRadius: "6px", padding: "8px 10px",
                        color: "#e63946", fontSize: "13px", fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
              </div>

              <button onClick={saveRates} style={{
                width: "100%", padding: "12px", marginTop: "16px",
                background: "linear-gradient(135deg, #d4af37, #b8962e)",
                color: "#0f172a", border: "none", borderRadius: "10px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(212,168,83,0.25)",
              }}>SAVE RATES</button>
            </div>
          )}

          {/* ─── CURRENCIES TAB ─── */}
          {tab === "currencies" && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: textMuted,
                letterSpacing: "2px", marginBottom: "12px",
                fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
              }}>Active Currencies</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
                {editRates.map(r => (
                  <div key={`${r.code}-${r.against || "ZWG"}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#d4af37", fontFamily: "JetBrains Mono, monospace" }}>
                      {r.flag} {r.code} <span style={{ color: "rgba(255,255,255,0.3)" }}>vs {r.against || "ZWG"}</span> <span style={{ color: textMuted, fontWeight: 400 }}>— {r.name}</span>
                    </span>
                    <button onClick={() => removeCurrency(r.code, r.against || "ZWG")} style={{
                      background: "rgba(239,68,68,0.1)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px",
                      padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontWeight: 600,
                    }}>Remove</button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: textMuted,
                  letterSpacing: "2px", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
                }}>Preset Currencies ({availablePresets.length})</span>
                <select value={presetAgainst} onChange={e => setPresetAgainst(e.target.value)} style={{
                  background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px", padding: "5px 10px",
                  color: textMain, fontSize: "11px", fontFamily: "JetBrains Mono, monospace", outline: "none",
                }}>
                  <option value="" disabled>vs...</option>
                  <option value="ZWG">vs ZWG</option>
                  <option value="USD">vs USD</option>
                  <option value="ZAR">vs ZAR</option>
                </select>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
                {availablePresets.map(p => (
                  <div key={p.code} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 12px", borderRadius: "6px",
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid rgba(255,255,255,0.03)",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: textMuted, fontFamily: "Inter, sans-serif" }}>{p.flag} {p.code} — {p.name}</span>
                    <button onClick={() => addPreset(p)} style={{
                      background: "rgba(212,168,83,0.1)", color: "#d4af37",
                      border: "1px solid rgba(212,168,83,0.2)", borderRadius: "6px",
                      padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontWeight: 600,
                    }}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DISPLAY TAB ─── */}
          {tab === "display" && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: textMuted,
                letterSpacing: "2px", marginBottom: "12px",
                fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
              }}>Content Mode</div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                {(["video", "announcement"] as const).map(mode => (
                  <button key={mode} onClick={() => setDisplayMode(mode)} style={{
                    flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer",
                    border: displayMode === mode ? "1px solid rgba(212,168,83,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    background: displayMode === mode ? "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))" : "rgba(255,255,255,0.02)",
                    color: displayMode === mode ? "#d4af37" : "rgba(255,255,255,0.5)",
                    fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                    fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase",
                  }}>{mode}</button>
                ))}
              </div>

              {displayMode === "announcement" && (
                <>
                  <div style={{
                    fontSize: "11px", fontWeight: 700, color: textMuted,
                    letterSpacing: "2px", marginBottom: "8px",
                    fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
                  }}>Announcement Text</div>
                  <textarea
                    value={announcementText} onChange={e => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement text..."
                    style={{
                      width: "100%", height: "120px", resize: "vertical", marginBottom: "16px",
                      background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px", padding: "12px", color: textMain, fontSize: "13px",
                      fontFamily: "Inter, sans-serif", outline: "none",
                    }}
                  />
                </>
              )}

              <button onClick={saveDisplay} style={{
                width: "100%", padding: "12px",
                background: "linear-gradient(135deg, #d4af37, #b8962e)",
                color: "#0f172a", border: "none", borderRadius: "10px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(212,168,83,0.25)",
              }}>SAVE DISPLAY SETTINGS</button>
            </div>
          )}

          {/* ─── BRANDING TAB ─── */}
          {tab === "branding" && (
            <div>
              {[
                { label: "Our Values (one per line)", value: valuesText, onChange: setValuesText, h: "100px", placeholder: "Relationships\nResults\nReach\nRelevance" },
                { label: "Our Vision", value: visionText, onChange: setVisionText, h: "80px", placeholder: "Enter vision statement..." },
                { label: "Our Mission", value: missionText, onChange: setMissionText, h: "80px", placeholder: "Enter mission statement..." },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: "16px" }}>
                  <div style={{
                    fontSize: "11px", fontWeight: 700, color: textMuted,
                    letterSpacing: "2px", marginBottom: "8px",
                    fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
                  }}>{field.label}</div>
                  <textarea
                    value={field.value} onChange={e => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: "100%", height: field.h, resize: "vertical",
                      background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px", padding: "12px", color: textMain, fontSize: "13px",
                      fontFamily: "Inter, sans-serif", outline: "none",
                    }}
                  />
                </div>
              ))}

              <button onClick={() => {
                onUpdate({
                  ...state,
                  companyInfo: {
                    values: valuesText.split("\n").map(v => v.trim()).filter(Boolean),
                    vision: visionText.trim(),
                    mission: missionText.trim(),
                  }
                });
                flash("Branding saved!");
              }} style={{
                width: "100%", padding: "12px",
                background: "linear-gradient(135deg, #d4af37, #b8962e)",
                color: "#0f172a", border: "none", borderRadius: "10px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(212,168,83,0.25)",
              }}>SAVE BRANDING</button>
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {tab === "settings" && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: textMuted,
                letterSpacing: "2px", marginBottom: "12px",
                fontFamily: "Montserrat, sans-serif", textTransform: "uppercase",
              }}>Change Password</div>

              {[
                { value: newPass, onChange: setNewPass, placeholder: "New Password" },
                { value: confirmPass, onChange: setConfirmPass, placeholder: "Confirm Password" },
              ].map(field => (
                <input
                  key={field.placeholder}
                  type="password" value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", marginBottom: "10px",
                    background: bgInput, border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px", padding: "10px 14px", color: textMain, fontSize: "13px",
                    fontFamily: "Inter, sans-serif", outline: "none",
                  }}
                />
              ))}

              <button onClick={updatePassword} style={{
                width: "100%", padding: "12px",
                background: "linear-gradient(135deg, #d4af37, #b8962e)",
                color: "#0f172a", border: "none", borderRadius: "10px",
                fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(212,168,83,0.25)",
              }}>UPDATE PASSWORD</button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={onClose} style={{
          padding: "14px", background: bgInput,
          border: "none", borderTop: "1px solid rgba(255,255,255,0.06)",
          color: textMuted, fontSize: "11px", fontWeight: 700,
          letterSpacing: "2px", cursor: "pointer",
          fontFamily: "Montserrat, sans-serif",
          transition: "all 0.2s",
        }}>LOGOUT & CLOSE</button>
      </div>
    </div>
  );
};

export default AdminDrawer;
