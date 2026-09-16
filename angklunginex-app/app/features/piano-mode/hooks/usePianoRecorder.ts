import { useState, useRef, useCallback, useEffect } from "react";
import type { RecordedNote } from "../utils/piano-helpers";

interface UsePianoRecorderProps {
  onPlayNote: (note: string) => void;
  onReleaseNote: (note: string) => void;
  onStopAllNotes: () => void;
}

export function usePianoRecorder({
  onPlayNote,
  onReleaseNote,
  onStopAllNotes,
}: UsePianoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");

  const recordedNotesRef = useRef<RecordedNote[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const notePressTimeMapRef = useRef<Map<string, number>>(new Map());
  const replayTimersRef = useRef<number[]>([]);

  const stopReplay = useCallback(() => {
    replayTimersRef.current.forEach((timer) => clearTimeout(timer));
    replayTimersRef.current = [];
    setIsReplaying(false);
    onStopAllNotes();
    setStatusMessage("Stopped");
  }, [onStopAllNotes]);

  const startRecording = useCallback(() => {
    stopReplay();
    recordedNotesRef.current = [];
    notePressTimeMapRef.current.clear();
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

    const notes = recordedNotesRef.current;

    notes.forEach((recorded) => {
      const pressTimer = window.setTimeout(() => {
        onPlayNote(recorded.note);

        const releaseTimer = window.setTimeout(() => {
          onReleaseNote(recorded.note);
        }, recorded.duration);

        replayTimersRef.current.push(releaseTimer);
      }, recorded.start);

      replayTimersRef.current.push(pressTimer);
    });

    const totalDuration = Math.max(
      ...notes.map((n) => n.start + n.duration),
    );

    const finishTimer = window.setTimeout(() => {
      setIsReplaying(false);
      setStatusMessage("Replay finished");
    }, totalDuration + 100);

    replayTimersRef.current.push(finishTimer);
  }, [stopReplay, onPlayNote, onReleaseNote]);

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      replayTimersRef.current.forEach((timer) => clearTimeout(timer));
      replayTimersRef.current = [];
    };
  }, []);

  return {
    isRecording,
    isReplaying,
    statusMessage,
    startRecording,
    stopRecording,
    playReplay,
    stopReplay,
    handleNotePressRecord,
    handleNoteReleaseRecord,
  };
}
