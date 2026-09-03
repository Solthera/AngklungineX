import { WS_URL } from "~/constants";

const STORAGE_KEY = "angklunginex_ws_token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

interface StoredToken {
  token: string;
  timestamp: number;
}

/** Token akses yang tersimpan (localStorage). Kosong = belum ada / kadaluarsa (>24 jam). */
export function getWsToken(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";

    try {
      const parsed = JSON.parse(raw) as Partial<StoredToken>;
      if (typeof parsed === "object" && parsed !== null && typeof parsed.token === "string" && typeof parsed.timestamp === "number") {
        const isExpired = Date.now() - parsed.timestamp > TOKEN_TTL_MS;
        if (isExpired) {
          localStorage.removeItem(STORAGE_KEY);
          return "";
        }
        return parsed.token;
      }
    } catch {
      // Jika data tersimpan dalam format string lama (bukan JSON),
      // migrasikan ke format baru dengan timestamp saat ini.
      saveWsToken(raw);
      return raw;
    }

    return "";
  } catch {
    return "";
  }
}

/** Simpan/hapus token dengan timestamp. Tetap dipakai sesi ini walau storage gagal (private mode). */
export function saveWsToken(token: string): void {
  try {
    if (token) {
      const payload: StoredToken = {
        token,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // abaikan — storage tak tersedia
  }
}

/** Bangun URL WS final: tambah ?token= hanya bila ada token. */
export function buildWsUrl(token: string): string {
  const base = WS_URL;
  if (!token) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}
