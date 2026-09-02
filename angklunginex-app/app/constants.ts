// URL WebSocket service. Di build produksi di-set via VITE_WS_URL
// (mis. wss://ws.angklunginex.farelfirdaus.site). Fallback = dev lokal.
export const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined)?.replace(/\/+$/, "") ||
  "ws://localhost:8765";
export const CAPTURE_INTERVAL_MS = 100;
