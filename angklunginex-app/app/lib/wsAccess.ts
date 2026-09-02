import { WS_URL } from "~/constants";

const STORAGE_KEY = "angklunginex_ws_token";

/** Token akses yang tersimpan (localStorage). Kosong = belum ada. */
export function getWsToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Simpan/hapus token. Tetap dipakai sesi ini walau storage gagal (private mode). */
export function saveWsToken(token: string): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
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
