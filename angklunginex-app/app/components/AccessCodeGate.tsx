import { useState, type FormEvent } from "react";

interface AccessCodeGateProps {
  /** Dipanggil saat user submit access code. */
  onSubmit: (code: string) => void;
}

/**
 * Overlay minta access code saat WebSocket inference butuh token
 * (mis. versi publik via Cloudflare Tunnel). Muncul otomatis bila
 * server menolak koneksi tanpa token yang benar (close code 1008).
 */
export function AccessCodeGate({ onSubmit }: AccessCodeGateProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(code);
    setCode("");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-xl"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Akses Terproteksi</h2>
          <p className="mt-1 text-sm text-gray-400">
            Masukkan access code untuk terhubung ke layanan gestur.
          </p>
        </div>
        <input
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hubungkan
        </button>
      </form>
    </div>
  );
}
