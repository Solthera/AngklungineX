import React, { useState, useRef, useCallback, useEffect } from "react";
import "./style.css";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { PianoControls } from "./components/PianoControls";
import { usePianoRecorder } from "./hooks/usePianoRecorder";
import { usePianoShortcuts } from "./hooks/usePianoShortcuts";
import { angklungAudio } from "./audio/angklungAudio";

export default function PianoModePage() {
  const [sustain, setSustain] = useState(false);
  const [baseKey, setBaseKey] = useState("C5");
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  // Track physically pressed notes to distinguish from sustained notes
  const currentlyPressedRef = useRef<Set<string>>(new Set());
  const sustainedNotesRef = useRef<Set<string>>(new Set());
  const sustainTimersRef = useRef<Map<string, number>>(new Map());
  const sustainRef = useRef(sustain);

  useEffect(() => {
    sustainRef.current = sustain;
  }, [sustain]);

  // Preload audio samples on mount
  useEffect(() => {
    angklungAudio.init();
    return () => {
      angklungAudio.stopAll();
      sustainTimersRef.current.forEach((t) => clearTimeout(t));
      sustainTimersRef.current.clear();
    };
  }, []);

  const handleStopAllNotes = useCallback(() => {
    currentlyPressedRef.current.clear();
    sustainedNotesRef.current.clear();
    sustainTimersRef.current.forEach((t) => clearTimeout(t));
    sustainTimersRef.current.clear();
    angklungAudio.stopAll();
    setActiveNotes(new Set());
  }, []);

  const recorderRef = useRef<ReturnType<typeof usePianoRecorder> | null>(null);

  const pressNote = useCallback((note: string) => {
    if (currentlyPressedRef.current.has(note)) return;

    // If there was an active sustain decay timer for this note, clear it
    const existingTimer = sustainTimersRef.current.get(note);
    if (existingTimer) {
      clearTimeout(existingTimer);
      sustainTimersRef.current.delete(note);
    }
    sustainedNotesRef.current.delete(note);

    currentlyPressedRef.current.add(note);

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });

    recorderRef.current?.handleNotePressRecord(note);

    // Play angklung audio
    angklungAudio.playNote(note);
  }, []);

  const releaseNote = useCallback((note: string) => {
    if (!currentlyPressedRef.current.has(note)) return;

    currentlyPressedRef.current.delete(note);
    recorderRef.current?.handleNoteReleaseRecord(note);

    const isSustain = sustainRef.current;
    // Handle audio release (loop stop or 3.5s fade out based on sustain)
    angklungAudio.releaseNote(note, isSustain);

    if (isSustain) {
      sustainedNotesRef.current.add(note);

      // Keep visual key active for the 3.0s acoustic decay, then release
      const timer = window.setTimeout(() => {
        sustainedNotesRef.current.delete(note);
        sustainTimersRef.current.delete(note);

        if (!currentlyPressedRef.current.has(note)) {
          setActiveNotes((prev) => {
            const next = new Set(prev);
            next.delete(note);
            return next;
          });
        }
      }, 3000);

      sustainTimersRef.current.set(note, timer);
    } else {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  }, []);

  // Ensure all stuck keys are cleanly released when browser loses focus/visibility
  useEffect(() => {
    const handleWindowBlur = () => {
      currentlyPressedRef.current.forEach((note) => {
        if (!sustainRef.current) {
          angklungAudio.releaseNote(note, false);
        }
      });
      currentlyPressedRef.current.clear();
      if (!sustainRef.current) {
        setActiveNotes(new Set(sustainedNotesRef.current));
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleWindowBlur);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleWindowBlur);
    };
  }, []);

  const recorder = usePianoRecorder({
    onPlayNote: (note) => {
      angklungAudio.playNote(note);
      setActiveNotes((prev) => new Set(prev).add(note));
    },
    onReleaseNote: (note) => {
      angklungAudio.releaseNote(note, false);
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

      // If turning sustain OFF, release all sustained audio voices and visual notes
      if (!nextSustain) {
        sustainTimersRef.current.forEach((t) => clearTimeout(t));
        sustainTimersRef.current.clear();
        angklungAudio.releaseSustainedNotes();
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
    baseKey,
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
            baseKey={baseKey}
            onBaseKeyChange={setBaseKey}
          />
        </section>
      </main>
    </div>
  );
}
