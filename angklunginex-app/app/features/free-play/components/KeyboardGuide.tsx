const KEYS = ["Q","W","E","R","T","1","2","3","4","5","6","7","8","9"];

export function KeyboardGuide() {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Keyboard</p>
      <div className="grid grid-cols-5 gap-1.5">
        {KEYS.map((key) => (
          <kbd
            key={key}
            className="flex items-center justify-center h-8 rounded-md bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono font-bold"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
