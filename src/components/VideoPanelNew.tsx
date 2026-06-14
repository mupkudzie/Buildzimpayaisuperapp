import { useState, useRef, useEffect } from "react";
import CompanyInfoCard from "./CompanyInfoCard";
import { CompanyInfo } from "@/lib/store";
import { useVideoPlaylist } from "@/hooks/useVideoPlaylist";

interface Props {
  companyName: string;
  displayMode?: "video" | "announcement";
  announcementText?: string;
  companyInfo: CompanyInfo;
}

const VideoPanelNew = ({ displayMode = "video", announcementText = "", companyInfo }: Props) => {
  const showVideo = displayMode === "video";
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playlist, source, currentIndex, advance, currentSrc } = useVideoPlaylist();
  const [isMuted, setIsMuted] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const bridgeFound =
  typeof window !== "undefined" && !!window.AFCBridge;
  useEffect(() => {
    if (!showVideo) return;
    const el = videoRef.current;
    if (!el) return;

    setShowFallback(false);
    el.muted = true;
    el.volume = 1.0;
    el.playsInline = true;

    const tryPlay = () => {
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          const retry = () => { el.play().catch(() => {}); };
          document.addEventListener("click", retry, { once: true });
          document.addEventListener("touchstart", retry, { once: true });
          document.addEventListener("keydown", retry, { once: true });
        });
      }
    };

    if (el.readyState >= 2) tryPlay();
    else el.addEventListener("loadeddata", tryPlay, { once: true });

    const unmute = () => {
      el.muted = false;
      setIsMuted(false);
      document.removeEventListener("click", unmute);
      document.removeEventListener("touchstart", unmute);
      document.removeEventListener("keydown", unmute);
    };
    document.addEventListener("click", unmute, { once: true });
    document.addEventListener("touchstart", unmute, { once: true });
    document.addEventListener("keydown", unmute, { once: true });

    const onError = () => {
      console.warn("[Video] error loading", el.currentSrc, `(source: ${source})`);
      setShowFallback(true);
    };
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("error", onError);
      document.removeEventListener("click", unmute);
      document.removeEventListener("touchstart", unmute);
      document.removeEventListener("keydown", unmute);
    };
  }, [showVideo, currentIndex, currentSrc, source]);

  const handleEnded = () => {
    advance();
  };

  const handleError = () => {
    advance();
  };

  if (showVideo) {
    if (!playlist.length || !currentSrc) {
      return (
        <div style={{ height: "100%", width: "100%", position: "relative", overflow: "hidden", background: "#000", borderRadius: "6px" }}>
          <CompanyInfoCard companyInfo={companyInfo} />
        </div>
      );
    }

    
      return (
  <div
    style={{
      height: "100%",
      width: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#000",
      borderRadius: "6px",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 9999,
        padding: "8px 12px",
        borderRadius: "4px",
        background: bridgeFound ? "green" : "red",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      {bridgeFound ? "AFCBridge FOUND" : "AFCBridge NOT FOUND"}
    </div>

    <video
          key={`${source}-${currentIndex}-${currentSrc}`}
          ref={videoRef}
          src={currentSrc}
          autoPlay
          muted={isMuted}
          playsInline
          loop={playlist.length === 1}
          preload="auto"
          onEnded={handleEnded}
          onError={handleError}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            height: "100%", width: "100%", objectFit: "fill", borderRadius: "6px",
          }}
        />
        {showFallback && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
            <CompanyInfoCard companyInfo={companyInfo} />
          </div>
        )}
      </div>
    );
  }

  if (displayMode === "announcement") {
    return (
      <div
        style={{
          height: "100%", width: "100%",
          background: "linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "#fff", borderRadius: "6px", padding: "40px", textAlign: "center",
          border: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.9 }}>📢</div>
        <h2 style={{ fontFamily: "Montserrat, Arial, sans-serif", fontSize: "2.5rem", color: "#d4af37", marginBottom: "30px", textTransform: "uppercase", letterSpacing: "2px" }}>Announcement</h2>
        <p style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "1.8rem", color: "rgba(255,255,255,0.9)", lineHeight: "1.6", whiteSpace: "pre-wrap", maxWidth: "80%" }}>
          {announcementText || "No announcement at this time."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <CompanyInfoCard companyInfo={companyInfo} />
    </div>
  );
};

export default VideoPanelNew;
