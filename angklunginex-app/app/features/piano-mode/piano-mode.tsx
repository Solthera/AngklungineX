import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import "./style.css";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { PianoControls } from "./components/PianoControls";
import { FallingNotes } from "./components/FallingNotes";
import { usePianoRecorder } from "./hooks/usePianoRecorder";
import { usePianoShortcuts } from "./hooks/usePianoShortcuts";
import { usePianoLayout } from "./hooks/usePianoLayout";
import { TOTAL_WHITE_KEYS } from "./utils/piano-helpers";
import { buildFallingNotes, computePxPerMs } from "./utils/falling-notes";
import { angklungAudio } from "./audio/angklungAudio";

export default function PianoModePage() {
  const [sustain, setSustain] = useState(false);
  const [baseKey, setBaseKey] = useState("C5");
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const { wrapperRef, keyWidth, getBlackKeyLeft } = usePianoLayout(TOTAL_WHITE_KEYS);

  const fallLayerRef = useRef<HTMLDivElement>(null);

  // Satu penulisan DOM per frame. Sengaja tanpa state: menyimpan posisi di
  // state akan me-render ulang seluruh kotak 60x per detik.
  //
  // Tanda positif: buildFallingNotes menulis tepi bawah kotak di
  // FALL_HEIGHT_PX - start * pxPerMs, sedangkan garis hit ada di
  // FALL_HEIGHT_PX (bottom: 0 dari .fall-area). Menggeser layer ke BAWAH
  // sebesar elapsedMs * pxPerMs membuat tepi bawah kotak bertemu garis hit
  // tepat saat elapsedMs === start, yaitu momen nada berbunyi.
  const handleReplayTick = useCallback((elapsedMs: number) => {
    const layer = fallLayerRef.current;
    if (layer) {
      layer.style.transform = `translateY(${elapsedMs * computePxPerMs()}px)`;
    }
  }, []);

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
    onReplayTick: handleReplayTick,
  });

  recorderRef.current = recorder;

  // Setiap replay baru memasang kotak di posisi statisnya. Transform sisa dari
  // replay sebelumnya harus dibersihkan sebelum frame pertama, kalau tidak
  // kotak tampak melompat selama satu frame.
  useEffect(() => {
    if (fallLayerRef.current) {
      fallLayerRef.current.style.transform = "translateY(0px)";
    }
  }, [recorder.replayNotes]);

  // Geometri kotak hanya dihitung ulang saat timeline berubah atau saat
  // lebar tuts berubah (resize) — bukan tiap frame. Ditempatkan setelah
  // usePianoRecorder karena bergantung pada recorder.replayNotes.
  const fallingNotes = useMemo(
    () => buildFallingNotes(recorder.replayNotes, keyWidth, getBlackKeyLeft),
    [recorder.replayNotes, keyWidth, getBlackKeyLeft],
  );

  // Starting a recording discards the previous take, so only ask when there is
  // something to lose — a first recording goes straight through.
  const handleRecordPress = useCallback(() => {
    if (recorder.isRecording) {
      recorder.stopRecording();
      return;
    }
    if (recorder.recordedNoteCount > 0) {
      setShowOverwriteConfirm(true);
      return;
    }
    recorder.startRecording();
  }, [recorder]);

  const confirmOverwrite = useCallback(() => {
    setShowOverwriteConfirm(false);
    recorder.startRecording();
  }, [recorder]);

  // Escape dismisses the confirmation, matching its "Batal" button.
  useEffect(() => {
    if (!showOverwriteConfirm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowOverwriteConfirm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOverwriteConfirm]);

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
        {/* <header className="toolbar">
        </header> */}
        <section ref={wrapperRef} className="piano-wrapper">
          <div className="piano-stage">
            <FallingNotes notes={fallingNotes} layerRef={fallLayerRef} />
            <PianoKeyboard
              activeNotes={activeNotes}
              onNotePress={pressNote}
              onNoteRelease={releaseNote}
              keyWidth={keyWidth}
              getBlackKeyLeft={getBlackKeyLeft}
            />
          </div>
        </section>

        <p className="pt-3 text-[#888]">{recorder.statusMessage}</p>

        {showOverwriteConfirm && (
          <div
            className="record-confirm"
            role="dialog"
            aria-modal="false"
            aria-label="Konfirmasi rekam ulang"
          >
            <div className="record-confirm-text">
              <strong>
                Rekaman lama ({recorder.recordedNoteCount} nada) akan hilang.
              </strong>
              <span>Lanjut merekam yang baru?</span>
            </div>
            <div className="record-confirm-actions">
              <button
                type="button"
                className="control-btn"
                onClick={() => setShowOverwriteConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="control-btn destructive"
                onClick={confirmOverwrite}
              >
                Hapus &amp; Rekam
              </button>
            </div>
          </div>
        )}

        <section className="info">
          <PianoControls
            sustain={sustain}
            onToggleSustain={toggleSustain}
            isRecording={recorder.isRecording}
            onToggleRecord={handleRecordPress}
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
