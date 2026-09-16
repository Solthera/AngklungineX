import React, { useState, useRef, useCallback } from "react";
import "./style.css";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { PianoControls } from "./components/PianoControls";
import { usePianoRecorder } from "./hooks/usePianoRecorder";
import { usePianoShortcuts } from "./hooks/usePianoShortcuts";

export default function PianoModePage() {
  const [sustain, setSustain] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  // Track physically pressed notes to distinguish from sustained notes
  const currentlyPressedRef = useRef<Set<string>>(new Set());
  const sustainedNotesRef = useRef<Set<string>>(new Set());

  const handleStopAllNotes = useCallback(() => {
    currentlyPressedRef.current.clear();
    sustainedNotesRef.current.clear();
    setActiveNotes(new Set());
  }, []);

  const recorderRef = useRef<ReturnType<typeof usePianoRecorder> | null>(null);

  const pressNote = useCallback((note: string) => {
    if (currentlyPressedRef.current.has(note)) return;

    currentlyPressedRef.current.add(note);

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });

    recorderRef.current?.handleNotePressRecord(note);

    /*
     * In AngklungineX:
     * playAngklung(note);
     */
  }, []);

  const releaseNote = useCallback(
    (note: string) => {
      if (!currentlyPressedRef.current.has(note)) return;

      currentlyPressedRef.current.delete(note);
      recorderRef.current?.handleNoteReleaseRecord(note);

      if (sustain) {
        sustainedNotesRef.current.add(note);
      } else {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    },
    [sustain],
  );

  const recorder = usePianoRecorder({
    onPlayNote: (note) => {
      setActiveNotes((prev) => new Set(prev).add(note));
    },
    onReleaseNote: (note) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    },
    onStopAllNotes: handleStopAllNotes,
  });

  recorderRef.current = recorder;

  const toggleSustain = useCallback(() => {
    setSustain((prev) => {
      const nextSustain = !prev;

      // If turning sustain OFF, release all sustained notes that aren't physically held
      if (!nextSustain) {
        sustainedNotesRef.current.clear();
        setActiveNotes(new Set(currentlyPressedRef.current));
      }

      return nextSustain;
    });
  }, []);

  // Keyboard shortcut support (A-Z keys)
  usePianoShortcuts({
    onNotePress: pressNote,
    onNoteRelease: releaseNote,
  });

  return (
    <div className="piano-mode">
      <main className="app">
        <header className="toolbar" />

        <PianoKeyboard
          activeNotes={activeNotes}
          onNotePress={pressNote}
          onNoteRelease={releaseNote}
        />

        <section className="info">
          <PianoControls
            sustain={sustain}
            onToggleSustain={toggleSustain}
            isRecording={recorder.isRecording}
            onToggleRecord={() => {
              if (recorder.isRecording) {
                recorder.stopRecording();
              } else {
                recorder.startRecording();
              }
            }}
            isReplaying={recorder.isReplaying}
            onReplay={recorder.playReplay}
            onStop={() => {
              if (recorder.isRecording) {
                recorder.stopRecording();
              }
              recorder.stopReplay();
            }}
          />
        </section>
      </main>
    </div>
  );
}
