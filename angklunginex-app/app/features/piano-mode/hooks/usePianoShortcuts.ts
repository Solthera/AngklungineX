import { useEffect, useRef, useMemo } from "react";
import { getKeyboardMap } from "../utils/piano-helpers";

interface UsePianoShortcutsProps {
  onNotePress: (note: string) => void;
  onNoteRelease: (note: string) => void;
  baseKey?: string;
  enabled?: boolean;
}

export function usePianoShortcuts({
  onNotePress,
  onNoteRelease,
  baseKey = "C4",
  enabled = true,
}: UsePianoShortcutsProps) {
  // Store physical key -> played note to avoid mismatch when baseKey changes
  const activeKeyNoteMapRef = useRef<Map<string, string>>(new Map());

  const onNotePressRef = useRef(onNotePress);
  const onNoteReleaseRef = useRef(onNoteRelease);

  useEffect(() => {
    onNotePressRef.current = onNotePress;
    onNoteReleaseRef.current = onNoteRelease;
  }, [onNotePress, onNoteRelease]);

  const keyboardMap = useMemo(() => getKeyboardMap(baseKey), [baseKey]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key repeat when holding a physical key
      if (event.repeat) return;

      // Ignore if user is inside an input, textarea, or select dropdown
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const note = keyboardMap[key] || keyboardMap[event.key];
      if (!note) return;

      if (activeKeyNoteMapRef.current.has(key)) {
        return;
      }

      activeKeyNoteMapRef.current.set(key, note);
      onNotePressRef.current(note);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const playedNote =
        activeKeyNoteMapRef.current.get(key) ||
        activeKeyNoteMapRef.current.get(event.key);

      if (playedNote) {
        activeKeyNoteMapRef.current.delete(key);
        activeKeyNoteMapRef.current.delete(event.key);
        onNoteReleaseRef.current(playedNote);
      }
    };

    // Release all keys when window loses focus or tab changes
    const handleReleaseAll = () => {
      activeKeyNoteMapRef.current.forEach((note) => {
        onNoteReleaseRef.current(note);
      });
      activeKeyNoteMapRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleReleaseAll);
    document.addEventListener("visibilitychange", handleReleaseAll);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleReleaseAll);
      document.removeEventListener("visibilitychange", handleReleaseAll);
      handleReleaseAll();
    };
  }, [keyboardMap, enabled]);
}
