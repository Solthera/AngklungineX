import React from "react";
import { Disc, Play, Square, ChevronDown } from "lucide-react";
import { BASE_KEY_OPTIONS } from "../utils/piano-helpers";

interface PianoControlsProps {
  sustain: boolean;
  onToggleSustain: () => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  isReplaying: boolean;
  onReplay: () => void;
  onStop: () => void;
  baseKey: string;
  onBaseKeyChange: (key: string) => void;
}

export const PianoControls: React.FC<PianoControlsProps> = ({
  sustain,
  onToggleSustain,
  isRecording,
  onToggleRecord,
  isReplaying,
  onReplay,
  onStop,
  baseKey,
  onBaseKeyChange,
}) => {
  return (
    <div className="controls items-center">
      <button
        id="sustainBtn"
        type="button"
        className={`control-btn items-center ${sustain ? "active" : ""}`}
        onClick={onToggleSustain}
      >
        Sustain
        <span className="status">{sustain ? "ON" : "OFF"}</span>
      </button>

      <button
        id="recordBtn"
        type="button"
        className={`control-btn record flex gap-3 items-center ${isRecording ? "recording" : ""}`}
        onClick={onToggleRecord}
      >
        <Disc size={20} />
        {isRecording ? "Stop Recording" : "Record"}
      </button>

      <button
        id="replayBtn"
        type="button"
        className={`control-btn flex gap-3 items-center ${isReplaying ? "active" : ""}`}
        onClick={onReplay}
      >
        <Play size={20} />
        Replay
      </button>

      <button
        id="stopBtn"
        type="button"
        className="control-btn flex gap-3 items-center"
        onClick={onStop}
      >
        <Square size={20} />
        Stop
      </button>

      <div className="relative control-btn flex items-center gap-1.5 cursor-pointer text-sm font-medium select-none">
        <span>Z =</span>
        <span className="text-white font-semibold">{baseKey}</span>
        <ChevronDown size={14} className="opacity-60 pointer-events-none" />

        {/* Full area select so clicking anywhere on the button opens the dropdown */}
        <select
          id="baseKeySelect"
          value={baseKey}
          onChange={(e) => onBaseKeyChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {BASE_KEY_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-neutral-900 text-white">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
