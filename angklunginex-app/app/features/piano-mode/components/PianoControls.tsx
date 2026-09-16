import React from "react";
import { Disc, Play, Square } from "lucide-react";

interface PianoControlsProps {
  sustain: boolean;
  onToggleSustain: () => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  isReplaying: boolean;
  onReplay: () => void;
  onStop: () => void;
}

export const PianoControls: React.FC<PianoControlsProps> = ({
  sustain,
  onToggleSustain,
  isRecording,
  onToggleRecord,
  isReplaying,
  onReplay,
  onStop,
}) => {
  return (
    <div className="controls">
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

      <span className="text-neutral-400 text-sm flex items-center ml-2">Z = C4</span>
    </div>
  );
};
