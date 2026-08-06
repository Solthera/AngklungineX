import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Logo / branding */}
      <div className="text-7xl mb-6 select-none">🎋</div>

      <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
        AngklungineX
      </h1>
      <p className="mt-2 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Arc-2
      </p>

      <p className="mt-6 text-gray-500 dark:text-gray-400 max-w-sm text-base">
        Mainkan angklung secara virtual menggunakan keyboard dan camera tracking. Eksplorasi nada, bebas berekspresi.
      </p>

      {/* Menu */}
      <nav className="mt-10 flex flex-col gap-3 w-full max-w-xs">
        <Link
          to="/free-play"
          className="w-full px-6 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-80 transition-opacity"
        >
          Mode Free Play
        </Link>
      </nav>

      <p className="mt-12 text-xs text-gray-300 dark:text-gray-700">
        AngklungineX · Warisan Budaya Digital
      </p>
    </div>
  );
}
