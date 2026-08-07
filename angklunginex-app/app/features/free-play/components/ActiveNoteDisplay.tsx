import { NODE_TO_LABEL } from "~/lib/angklung";

interface ActiveNoteDisplayProps {
  mode: "camera" | "keyboard";
  gestureLabel: string | null;
  gestureConfidence: number;
  keyboardNotes: Set<string>;
}

export function ActiveNoteDisplay({ mode, gestureLabel, gestureConfidence, keyboardNotes }: ActiveNoteDisplayProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
        {mode === "camera" ? "Gesture Aktif" : "Nada Aktif"}
      </p>

      {mode === "camera" ? (
        gestureLabel ? (
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-black text-amber-400">{gestureLabel}</span>
            <div className="w-full h-1.5 rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-100"
                style={{ width: `${gestureConfidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{(gestureConfidence * 100).toFixed(0)}% konfiden</span>
          </div>
        ) : (
          <span className="text-sm text-gray-600">Menunggu gesture...</span>
        )
      ) : (
        keyboardNotes.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(keyboardNotes).map((nodeId) => (
              <span
                key={nodeId}
                className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30"
              >
                {NODE_TO_LABEL[nodeId] ?? nodeId}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-600">Tekan tombol keyboard...</span>
        )
      )}
    </div>
  );
}
