type InputMode = "camera" | "keyboard";

interface InputModeToggleProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}

export function InputModeToggle({ value, onChange }: InputModeToggleProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Input</p>
      <div className="flex rounded-lg overflow-hidden border border-gray-700">
        <button
          onClick={() => onChange("camera")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            value === "camera"
              ? "bg-gray-100 dark:bg-white text-gray-900"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Camera
        </button>
        <button
          onClick={() => onChange("keyboard")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            value === "keyboard"
              ? "bg-gray-100 dark:bg-white text-gray-900"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Keyboard
        </button>
      </div>
    </div>
  );
}
