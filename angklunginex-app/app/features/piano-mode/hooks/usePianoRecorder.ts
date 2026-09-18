import { useState, useRef, useCallback, useEffect } from "react";
import type { RecordedNote } from "../utils/piano-helpers";

interface UsePianoRecorderProps {
  onPlayNote: (note: string) => void;
  onReleaseNote: (note: string) => void;
  onStopAllNotes: () => void;
  onReplayTick?: (elapsedMs: number) => void;
}

export function usePianoRecorder({
  onPlayNote,
  onReleaseNote,
  onStopAllNotes,
  onReplayTick,
}: UsePianoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");
  // Mirrors recordedNotesRef.length so the UI can react to it — a ref alone
  // would never re-render, leaving the Record button unable to tell an empty
  // take from a full one.
  const [recordedNoteCount, setRecordedNoteCount] = useState(0);

  const recordedNotesRef = useRef<RecordedNote[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const notePressTimeMapRef = useRef<Map<string, number>>(new Map());
  const replayRafRef = useRef<number | null>(null);
  const replayClockRef = useRef<number>(0);
  const sortedNotesRef = useRef<RecordedNote[]>([]);
  const nextPressIdxRef = useRef(0);
  const soundingRef = useRef<{ note: string; endMs: number }[]>([]);

  // Timeline yang sedang diputar, diangkat ke state supaya visualizer bisa
  // menggambar kotak. Berubah dua kali per replay (mulai & selesai), jadi
  // tidak memicu render per frame.
  const [replayNotes, setReplayNotes] = useState<RecordedNote[]>([]);

  // Callback disimpan di ref supaya jam rAF tidak perlu dipasang ulang tiap
  // render, dan tidak pernah menyentuh callback basi.
  const onReplayTickRef = useRef(onReplayTick);
  useEffect(() => {
    onReplayTickRef.current = onReplayTick;
  }, [onReplayTick]);

  const stopReplay = useCallback(() => {
    if (replayRafRef.current !== null) {
      cancelAnimationFrame(replayRafRef.current);
      replayRafRef.current = null;
    }
    sortedNotesRef.current = [];
    nextPressIdxRef.current = 0;
    soundingRef.current = [];
    setReplayNotes([]);
    setIsReplaying(false);
    onStopAllNotes();
    setStatusMessage("Stopped");
  }, [onStopAllNotes]);

  const startRecording = useCallback(() => {
    stopReplay();
    recordedNotesRef.current = [];
    notePressTimeMapRef.current.clear();
    setRecordedNoteCount(0);
    recordingStartTimeRef.current = performance.now();
    setIsRecording(true);
    setStatusMessage("Recording...");
  }, [stopReplay]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setStatusMessage(`Recorded ${recordedNotesRef.current.length} notes`);
  }, []);

  const handleNotePressRecord = useCallback(
    (note: string) => {
      if (!isRecording) return;
      const start = performance.now() - recordingStartTimeRef.current;
      notePressTimeMapRef.current.set(note, start);
    },
    [isRecording],
  );

  const handleNoteReleaseRecord = useCallback(
    (note: string) => {
      if (!isRecording) return;
      const start = notePressTimeMapRef.current.get(note);
      if (start === undefined) return;

      notePressTimeMapRef.current.delete(note);
      const now = performance.now() - recordingStartTimeRef.current;
      const duration = Math.max(50, now - start);

      recordedNotesRef.current.push({
        note,
        start,
        duration,
      });
      setRecordedNoteCount(recordedNotesRef.current.length);
    },
    [isRecording],
  );

  const playReplay = useCallback(() => {
    if (recordedNotesRef.current.length === 0) {
      setStatusMessage("Nothing to replay");
      return;
    }

    stopReplay();
    setIsReplaying(true);
    setStatusMessage("Replaying...");

    // Diurutkan naik berdasarkan waktu BUNYI (start = momen tekan).
    const sorted = [...recordedNotesRef.current].sort((a, b) => a.start - b.start);
    sortedNotesRef.current = sorted;
    setReplayNotes(sorted);
    nextPressIdxRef.current = 0;
    soundingRef.current = [];
    replayClockRef.current = performance.now();

    const tick = () => {
      const elapsedMs = performance.now() - replayClockRef.current;

      // 1. Bunyikan semua nada yang sudah jatuh tempo. `while`, bukan `if`:
      //    satu frame bisa melewati beberapa nada sekaligus.
      while (
        nextPressIdxRef.current < sorted.length &&
        sorted[nextPressIdxRef.current].start <= elapsedMs
      ) {
        const recorded = sorted[nextPressIdxRef.current];
        onPlayNote(recorded.note);
        // Satu suara per nada. Map di recorder tidak bisa menghasilkan dua
        // nada sama yang tumpang tindih, tapi data dari MIDI nanti bisa —
        // dan dua entri untuk satu nada akan memicu dua rilis.
        if (!soundingRef.current.some((v) => v.note === recorded.note)) {
          soundingRef.current.push({
            note: recorded.note,
            endMs: recorded.start + recorded.duration,
          });
        }
        nextPressIdxRef.current++;
      }

      // 2. Lepas nada yang durasinya sudah habis.
      if (soundingRef.current.length > 0) {
        const masihBerbunyi: { note: string; endMs: number }[] = [];
        for (const voice of soundingRef.current) {
          if (voice.endMs <= elapsedMs) {
            onReleaseNote(voice.note);
          } else {
            masihBerbunyi.push(voice);
          }
        }
        soundingRef.current = masihBerbunyi;
      }

      // 3. Beri tahu visualizer pada frame yang sama — satu jam untuk
      //    audio dan animasi, jadi keduanya tidak bisa saling melenceng.
      onReplayTickRef.current?.(elapsedMs);

      // 4. Selesai hanya bila semua nada sudah dibunyikan DAN tidak ada
      //    yang masih berbunyi.
      if (
        nextPressIdxRef.current >= sorted.length &&
        soundingRef.current.length === 0
      ) {
        replayRafRef.current = null;
        setIsReplaying(false);
        setReplayNotes([]);
        setStatusMessage("Replay finished");
        return;
      }

      replayRafRef.current = requestAnimationFrame(tick);
    };

    replayRafRef.current = requestAnimationFrame(tick);
  }, [stopReplay, onPlayNote, onReleaseNote]);

  // Bersihkan jam rAF saat unmount agar tidak ada frame yang tertinggal.
  useEffect(() => {
    return () => {
      if (replayRafRef.current !== null) {
        cancelAnimationFrame(replayRafRef.current);
        replayRafRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    isReplaying,
    statusMessage,
    recordedNoteCount,
    replayNotes,
    startRecording,
    stopRecording,
    playReplay,
    stopReplay,
    handleNotePressRecord,
    handleNoteReleaseRecord,
  };
}
