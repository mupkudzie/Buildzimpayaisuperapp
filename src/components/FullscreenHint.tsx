import { useEffect, useCallback } from "react";

const FullscreenHint = () => {
  const goFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    window.dispatchEvent(new CustomEvent("force-video-play"));
  }, []);

  useEffect(() => {
    // Try fullscreen immediately (works in kiosk/some TV browsers)
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Silent fullscreen listeners: enter fullscreen on first interaction
    const handleClick = () => goFullscreen();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
      }
      goFullscreen();
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [goFullscreen]);

  return null;
};

export default FullscreenHint;
