import React from "react";
import type { FallingNote } from "../utils/falling-notes";
import { FALL_HEIGHT_PX } from "../utils/falling-notes";

interface FallingNotesProps {
  notes: FallingNote[];
  /**
   * Ref ke `.fall-layer`. Diserahkan ke induk karena induklah yang memiliki
   * jam rAF tunggal (lihat usePianoRecorder), sehingga hanya ada satu
   * penulisan transform per frame dan tidak ada re-render React.
   */
  layerRef: React.Ref<HTMLDivElement>;
}

export const FallingNotes: React.FC<FallingNotesProps> = ({ notes, layerRef }) => {
  return (
    <div
      className="fall-area"
      style={{ height: `${FALL_HEIGHT_PX}px` }}
      aria-hidden="true"
    >
      <div className="fall-layer" ref={layerRef}>
        {notes.map((n) => (
          <div
            key={n.key}
            className={`fall-note${n.isBlack ? " black" : ""}`}
            style={{
              left: `${n.left}px`,
              width: `${n.width}px`,
              top: `${n.top}px`,
              height: `${n.height}px`,
            }}
          />
        ))}
      </div>
      <div className="fall-hit-line" />
    </div>
  );
};
