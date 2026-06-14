import { useState, useEffect, useCallback } from "react";

const FullscreenHint = () => {
  const [visible, setVisible] = useState(false);

  const goFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    window.dispatchEvent(new CustomEvent("force-video-play"));
    setVisible(false);
  }, []);

  useEffect(() => {
    // Try fullscreen immediately (works in kiosk/some TV browsers)
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Always keep listeners active so the user can re-trigger fullscreen or force unmute at any point
    const handleClick = () => goFullscreen();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
      }
      goFullscreen();
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);

    const timer = setTimeout(() => setVisible(false), 8000);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
      clearTimeout(timer);
    };
  }, [goFullscreen]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "fade-hint 8s ease-in-out forwards",
      }}
    >
      <p style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", letterSpacing: "2px" }}>
        Click or press any key to go fullscreen
      </p>
      <p style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "clamp(0.7rem, 1vw, 0.9rem)", color: "rgba(255,255,255,0.5)" }}>
        TV remote · Keyboard · Mouse click
      </p>
    </div>
  );
};

export default FullscreenHint;
