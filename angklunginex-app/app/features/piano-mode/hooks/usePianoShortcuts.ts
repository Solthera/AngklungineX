import { useEffect, useRef } from "react";
import { KEYBOARD_MAP } from "../utils/piano-helpers";

interface UsePianoShortcutsProps {
  onNotePress: (note: string) => void;
  onNoteRelease: (note: string) => void;
  enabled?: boolean;
}

export function usePianoShortcuts({
  onNotePress,
  onNoteRelease,
  enabled = true,
}: UsePianoShortcutsProps) {
  const physicalKeysDownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if input/textarea is focused
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const note = KEYBOARD_MAP[event.key];
      if (!note) return;

      if (physicalKeysDownRef.current.has(event.key)) {
        return;
      }

      physicalKeysDownRef.current.add(event.key);
      onNotePress(note);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = KEYBOARD_MAP[event.key];
      if (!note) return;

      physicalKeysDownRef.current.delete(event.key);
      onNoteRelease(note);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      physicalKeysDownRef.current.clear();
    };
  }, [onNotePress, onNoteRelease, enabled]);
}
