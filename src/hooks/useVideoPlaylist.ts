import { useEffect, useState } from "react";
import {
  getInitialPlaylist,
  isAndroidShell,
  readAndroidPlaylist,
  subscribeToPlaylistUpdates,
} from "@/lib/androidBridge";

const INDEX_KEY = "primeVideoIndex";

export function useVideoPlaylist() {
  const [playlist, setPlaylist] = useState<string[]>(() => getInitialPlaylist());
  const [source, setSource] = useState<"android" | "web">(() =>
    isAndroidShell() || readAndroidPlaylist() ? "android" : "web",
  );

  useEffect(() => {
    const refresh = () => {
      const local = readAndroidPlaylist();
      if (local?.length) {
        setPlaylist(local);
        setSource("android");
      }
    };

    refresh();
    return subscribeToPlaylistUpdates(urls => {
      if (urls.length) {
        setPlaylist(urls);
        setSource("android");
      }
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = parseInt(localStorage.getItem(INDEX_KEY) || "0", 10);
    return !isNaN(saved) && saved >= 0 ? saved : 0;
  });

  useEffect(() => {
    if (currentIndex >= playlist.length) {
      setCurrentIndex(0);
    }
  }, [playlist.length, currentIndex]);

  useEffect(() => {
    localStorage.setItem(INDEX_KEY, currentIndex.toString());
  }, [currentIndex]);

  const advance = () => {
    setCurrentIndex(i => (playlist.length ? (i + 1) % playlist.length : 0));
  };

  return {
    playlist,
    source,
    currentIndex,
    setCurrentIndex,
    advance,
    currentSrc: playlist[currentIndex] ?? "",
  };
}
