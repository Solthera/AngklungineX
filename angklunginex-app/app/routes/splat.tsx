import { Link, useLocation } from "react-router";

export default function Splat() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center text-center px-6">
      {/* Angklung icon placeholder */}
      <div className="text-8xl mb-6 select-none">🎋</div>

      <h1 className="text-9xl font-black text-gray-900 dark:text-white tracking-tighter">
        404
      </h1>

      <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
        Halaman tidak ditemukan
      </p>

      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 font-mono">
        {location.pathname}
      </p>

      <p className="mt-6 text-gray-500 dark:text-gray-400 max-w-xs">
        Nada yang kamu cari nggak ada di sini. Yuk balik ke menu utama.
      </p>

      <Link
        to="/"
        className="mt-8 px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:opacity-80 transition-opacity"
      >
        Kembali ke Menu
      </Link>
    </div>
  );
}
