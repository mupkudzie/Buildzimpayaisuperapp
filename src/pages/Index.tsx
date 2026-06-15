import { useState, useCallback, useEffect } from "react";
import { loadState, saveState, AppState, getLocalState } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import ExchangeRateCard from "@/components/ExchangeRateCard";
import VideoPanelNew from "@/components/VideoPanelNew";
import TickerBar from "@/components/TickerBar";
import AdminDrawer from "@/components/AdminDrawer";
import LoginModalNew from "@/components/LoginModalNew";
import FullscreenHint from "@/components/FullscreenHint";
import SuperAdminDrawer from "@/components/SuperAdminDrawer";

const Index = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [adminMode, setAdminMode] = useState<"closed" | "login" | "open" | "super">("closed");

  useEffect(() => {
    const init = async () => {
      const s = await loadState();
      setState(s);
    };
    init();

    // 1. Supabase Realtime channel subscription for instant state push updates
    const channel = supabase
      .channel("app_state_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state", filter: "id=eq.1" },
        (payload) => {
          if (payload.new && (payload.new as any).state) {
            const newState = (payload.new as any).state as AppState;
            setState(newState);
            localStorage.setItem("afc.appState", JSON.stringify(newState));
          }
        }
      )
      .subscribe();

    // 2. Visibility-aware backup polling (every 6 seconds, skips when tab is in background)
    const pollInterval = setInterval(async () => {
      if (document.hidden) return; 
      const s = await loadState();
      setState(s);
    }, 6000);

    // 3. Immediately refresh when tab becomes visible (e.g., waking from screen saver / kiosk wake)
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const s = await loadState();
        setState(s);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Cross-tab synchronization (O(1) synchronous load from local storage to bypass redundant DB queries)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "afc.appState") {
        const s = getLocalState();
        setState(s);
      }
    };
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setState(detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("app-state-updated", onLocal);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("app-state-updated", onLocal);
    };
  }, []);

  const handleUpdate = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = () => setAdminMode("closed");
    window.addEventListener("admin-cancel", handler);
    return () => window.removeEventListener("admin-cancel", handler);
  }, []);

  if (!state) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "var(--dash-bg)", color: "var(--dash-gold)",
        fontFamily: "Montserrat, sans-serif", fontSize: "1.5rem",
      }}>
        Loading Display...
      </div>
    );
  }

  const headerSizeMult = state.headerFontSize ?? 1;
  const headerFamily = state.headerFontFamily || "Montserrat, sans-serif";
  const globalFamily = state.globalFontFamily || "Montserrat, sans-serif";

  return (
    <div style={{
      width: "100vw", height: "100vh",
      display: "flex", flexDirection: "column",
      overflow: "hidden", background: "var(--dash-bg)",
      fontFamily: globalFamily,
    }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{
          position: "relative",
          background: "linear-gradient(135deg, #c41e22 0%, #a01518 100%)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(196,30,34,0.3)",
        }}>
          <img
            src="/favicon.png"
            alt="AFC Logo"
            style={{
              position: "absolute", left: 0, top: 0,
              height: "100%", width: "auto", objectFit: "contain",
            }}
          />
          <h1 style={{
            margin: 0, color: "#fff",
            fontFamily: headerFamily,
            fontSize: `clamp(${0.7 * headerSizeMult}rem, ${1.6 * headerSizeMult}vw, ${2.2 * headerSizeMult}rem)`,
            letterSpacing: "2px", textTransform: "uppercase",
            fontWeight: 900,
          }}>
            {state.headerText || `WELLCOME TO ${state.companyName} : FOREIGN EXCHANGE RATES`}
          </h1>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0, padding: "8px 10px", gap: "10px" }}>
        <div style={{ flex: "1 1 0", height: "100%", minWidth: 0 }}>
          <ExchangeRateCard
            rates={state.currencies}
            companyName={state.companyName}
            fontSizeMultiplier={state.cardFontSize || 1}
            buyColor={state.buyColor || "#2ab7a9"}
            sellColor={state.sellColor || "#e63946"}
            columnBgColor={state.columnBgColor || "#F2EFED"}
            rowOddBgColor={state.rowOddBgColor || "#ffffff"}
            rowEvenBgColor={state.rowEvenBgColor || "#ffffff"}
            currencyColBg={state.currencyColBg || "transparent"}
            weBuyColBg={state.weBuyColBg || "transparent"}
            weSellColBg={state.weSellColBg || "transparent"}
            currencyTextColor={state.currencyTextColor || "#000000"}
          />
        </div>

        <div style={{ flex: "1.4 1 0", height: "100%", minWidth: 0 }}>
          <VideoPanelNew
            companyName={state.companyName}
            displayMode={state.displayMode}
            announcementText={state.announcementText}
            companyInfo={state.companyInfo || { values: ["Relationships", "Results", "Reach", "Relevance"], vision: "", mission: "" }}
          />
        </div>
      </div>

      <TickerBar
        rates={state.currencies}
        onAdminClick={() => setAdminMode("login")}
        speed={state.tickerSpeed || 1}
      />

      <FullscreenHint />

      {adminMode === "login" && (
        <LoginModalNew
          password={state.adminPassword}
          superPassword={state.superAdminPassword || "kudzaim52000"}
          onLogin={async (role) => {
            if (role) {
              const freshState = await loadState();
              setState(freshState);
              setAdminMode(role === "super" ? "super" : "open");
            }
          }}
        />
      )}
      {adminMode === "open" && (
        <AdminDrawer state={state} onUpdate={handleUpdate} onClose={() => setAdminMode("closed")} />
      )}
      {adminMode === "super" && (
        <SuperAdminDrawer state={state} onUpdate={handleUpdate} onClose={() => setAdminMode("closed")} />
      )}
    </div>
  );
};

export default Index;
