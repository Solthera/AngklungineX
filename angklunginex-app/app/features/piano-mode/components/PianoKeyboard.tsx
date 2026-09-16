import React, { useMemo } from "react";
import { generatePianoNotes } from "../utils/piano-helpers";
import { usePianoLayout } from "../hooks/usePianoLayout";

interface PianoKeyboardProps {
  activeNotes: Set<string>;
  onNotePress: (note: string) => void;
  onNoteRelease: (note: string) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNotes,
  onNotePress,
  onNoteRelease,
}) => {
  const { whiteNotes, blackNotes } = useMemo(() => generatePianoNotes(), []);
  const { wrapperRef, keyWidth, getBlackKeyLeft } = usePianoLayout(whiteNotes.length);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, note: string) => {
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    onNotePress(note);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>, note: string) => {
    event.preventDefault();
    onNoteRelease(note);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>, note: string) => {
    event.preventDefault();
    onNoteRelease(note);
  };

  return (
    <section ref={wrapperRef} className="piano-wrapper">
      <div
        id="piano"
        className="piano"
        style={{ "--key-w": `${keyWidth}px` } as React.CSSProperties}
      >
        {/* Render White Keys */}
        {whiteNotes.map((note, index) => {
          const isFirst = index === 0;
          const isLast = index === whiteNotes.length - 1;
          const isActive = activeNotes.has(note.name);

          const classNames = [
            "white-key",
            isFirst && "first-key",
            isLast && "last-key",
            isActive && "active",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={note.name}
              data-note={note.name}
              className={classNames}
              onPointerDown={(e) => handlePointerDown(e, note.name)}
              onPointerUp={(e) => handlePointerUp(e, note.name)}
              onPointerCancel={(e) => handlePointerCancel(e, note.name)}
            >
              <span className="label">{note.name}</span>
            </div>
          );
        })}

        {/* Render Black Keys */}
        {blackNotes.map((note) => {
          const isActive = activeNotes.has(note.name);
          const leftPosition = getBlackKeyLeft(note.whiteIndex);

          const classNames = [
            "black-key",
            isActive && "active",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={note.name}
              data-note={note.name}
              className={classNames}
              style={{ left: `${leftPosition}px` }}
              onPointerDown={(e) => handlePointerDown(e, note.name)}
              onPointerUp={(e) => handlePointerUp(e, note.name)}
              onPointerCancel={(e) => handlePointerCancel(e, note.name)}
            >
              <span className="label">{note.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
