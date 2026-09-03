import { useState, type FormEvent } from "react";
import { X } from 'lucide-react';

interface AccessCodeGateProps {
  /** Dipanggil saat user submit access code. */
  onSubmit: (code: string) => void;
  /** Dipanggil saat user menekan ikon X untuk menutup modal. */
  onClose?: () => void;
  /** Menandakan apakah percobaan masukan token sebelumnya gagal/salah. */
  isError?: boolean;
  /** Menandakan apakah koneksi sedang mencoba terhubung. */
  isConnecting?: boolean;
}

/**
 * Overlay minta access code saat WebSocket inference butuh token
 * (mis. versi publik via Cloudflare Tunnel). Muncul otomatis bila
 * server menolak koneksi tanpa token yang benar (close code 1008).
 */
export function AccessCodeGate({ onSubmit, onClose, isError, isConnecting }: AccessCodeGateProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form
        action="javascript:void(0);"
        onSubmit={handleSubmit}
        className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-[24px] border border-gray-700 bg-white p-6 shadow-xl"
      >
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Akses Terproteksi</h2>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            ) : (
              <X className="size-5 text-gray-400" />
            )}
          </div>
          <p className="mt-1 text-sm text-black pt-1 pb-1">
            Masukkan access code untuk terhubung ke layanan gestur.
          </p>
          {isError && (
            <p className="text-xs font-medium text-red-500 mt-1">
              Access code salah. Silakan coba lagi.
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <input
            type="password"
            autoFocus
            disabled={isConnecting}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className={`rounded-[24px] border bg-[#EBEBEB] px-3 py-2 text-sm text-black placeholder-[#838383] outline-none ${
              isError
                ? "border-red-500 focus:border-red-600"
                : "border-[#C4C4C4] focus:border-[#818181]"
            }`}
          />
          <button
            type="submit"
            disabled={!code.trim() || isConnecting}
            className="rounded-[24px] bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </form>
    </div>
  );
}
