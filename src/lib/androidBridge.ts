/**
 * Bridge between the Vercel web app and the Android TV-box WebView.
 *
 * Android exposes `window.AFCBridge` via addJavascriptInterface and optionally
 * pushes playlist updates via the `afc-video-playlist` custom event.
 */

export const AFC_VIDEO_PLAYLIST_EVENT = "afc-video-playlist";

/** No bundled videos — playlist comes from the TV-box Android app. */
export const DEFAULT_WEB_PLAYLIST: string[] = [];

export interface AFCAndroidBridge {
  /** Returns a JSON string array of video URLs or filenames. */
  getVideoPlaylist(): string;
  /** Base URL for local videos, e.g. http://127.0.0.1:8765/ */
  getVideoBaseUrl?(): string;
  /** True when running inside the AFC Android shell. */
  isAndroidApp?(): boolean;
}

declare global {
  interface Window {
    AFCBridge?: AFCAndroidBridge;
    /** Optional callback Android may invoke after async playlist scan. */
    onAFCVideoPlaylist?: (urls: string[]) => void;
  }
}

export function isAndroidShell(): boolean {
  try {
    if (window.AFCBridge?.isAndroidApp?.()) return true;
    if (typeof window.AFCBridge?.getVideoPlaylist === "function") return true;
  } catch {
    // Bridge access can throw if interface is restricted.
  }
  return false;
}

function parsePlaylistJson(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return null;
  }
}

function resolveUrl(entry: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(entry) || entry.startsWith("content://")) return entry;
  if (entry.startsWith("/") && !baseUrl) return entry;
  const base = baseUrl.replace(/\/+$/, "");
  const path = entry.replace(/^\/+/, "");
  return `${base}/${path}`;
}

function normalizePlaylist(entries: string[], baseUrl: string): string[] {
  return entries.map(entry => resolveUrl(entry, baseUrl));
}

/** Read playlist from the Android JS interface, if present. */
export function readAndroidPlaylist(): string[] | null {
  const bridge = window.AFCBridge;
  if (!bridge?.getVideoPlaylist) return null;

  try {
    const raw = bridge.getVideoPlaylist();
    const entries = parsePlaylistJson(raw);
    if (!entries?.length) return null;

    let baseUrl = "";
    try {
      baseUrl = bridge.getVideoBaseUrl?.() ?? "";
    } catch {
      baseUrl = "";
    }

    return normalizePlaylist(entries, baseUrl);
  } catch (err) {
    console.warn("[AFCBridge] Failed to read playlist:", err);
    return null;
  }
}

/** Dev-only override: ?videoBase=http://127.0.0.1:8765&videos=a.mp4,b.mp4 */
export function readDevPlaylistOverride(): string[] | null {
  if (import.meta.env.PROD) return null;

  const params = new URLSearchParams(window.location.search);
  const videos = params.get("videos");
  if (!videos) return null;

  const baseUrl = params.get("videoBase") ?? "http://127.0.0.1:8765";
  const entries = videos.split(",").map(v => v.trim()).filter(Boolean);
  return entries.length ? normalizePlaylist(entries, baseUrl) : null;
}

export function getInitialPlaylist(): string[] {
  return readDevPlaylistOverride() ?? readAndroidPlaylist() ?? DEFAULT_WEB_PLAYLIST;
}

/** Register Android async callback + custom-event listener. */
export function subscribeToPlaylistUpdates(onUpdate: (urls: string[]) => void): () => void {
  window.onAFCVideoPlaylist = onUpdate;

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<string[] | string>).detail;
    if (Array.isArray(detail) && detail.length) {
      onUpdate(detail);
      return;
    }
    if (typeof detail === "string") {
      const parsed = parsePlaylistJson(detail);
      if (parsed?.length) {
        const base = window.AFCBridge?.getVideoBaseUrl?.() ?? "";
        onUpdate(normalizePlaylist(parsed, base));
      }
    }
  };

  window.addEventListener(AFC_VIDEO_PLAYLIST_EVENT, onEvent);
  return () => {
    delete window.onAFCVideoPlaylist;
    window.removeEventListener(AFC_VIDEO_PLAYLIST_EVENT, onEvent);
  };
}
