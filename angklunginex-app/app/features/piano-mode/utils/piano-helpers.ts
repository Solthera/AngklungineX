export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export interface PianoNote {
  name: string;
  midi: number;
  octave: number;
  isBlack: boolean;
  whiteIndex: number;
}

export interface RecordedNote {
  note: string;
  start: number;
  duration: number;
}

export const START_MIDI = 36; // C2
export const END_MIDI = 96;   // C7
export const PLAYABLE_START_MIDI = 60; // C4 (sample available from C4)
export const PLAYABLE_END_MIDI = 96;   // C7
export const KEY_PAD = 12;
export const MIN_KEY_WIDTH = 34;

/** Rasio lebar tuts hitam terhadap tuts putih. Harus sama dengan
 *  `--black-w: calc(var(--key-w) * 0.63)` di style.css. */
export const BLACK_KEY_RATIO = 0.63;

export const NOTE_NAMES: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const BLACK_NOTES = new Set([
  "C#",
  "D#",
  "F#",
  "G#",
  "A#",
]);

export function midiToNote(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

export function noteToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return -1;
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTE_NAMES.indexOf(note as NoteName);
  if (noteIndex === -1) return -1;
  return (octave + 1) * 12 + noteIndex;
}

export function isNotePlayable(noteNameOrMidi: string | number): boolean {
  const midi = typeof noteNameOrMidi === "number" ? noteNameOrMidi : noteToMidi(noteNameOrMidi);
  return midi >= PLAYABLE_START_MIDI && midi <= PLAYABLE_END_MIDI;
}

export function isBlackKey(midi: number): boolean {
  return BLACK_NOTES.has(NOTE_NAMES[midi % 12]);
}

export function generatePianoNotes(): {
  allNotes: PianoNote[];
  whiteNotes: PianoNote[];
  blackNotes: PianoNote[];
} {
  const allNotes: PianoNote[] = [];
  const whiteNotes: PianoNote[] = [];
  const blackNotes: PianoNote[] = [];

  let whiteIndex = 0;

  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const isBlack = isBlackKey(midi);
    const noteObj: PianoNote = {
      midi,
      name: midiToNote(midi),
      octave: Math.floor(midi / 12) - 1,
      isBlack,
      whiteIndex: isBlack ? whiteIndex : whiteIndex++,
    };

    allNotes.push(noteObj);
    if (isBlack) {
      blackNotes.push(noteObj);
    } else {
      whiteNotes.push(noteObj);
    }
  }

  return { allNotes, whiteNotes, blackNotes };
}

export const KEY_OFFSETS: [string, number][] = [
  ["z", 0],
  ["s", 1],
  ["x", 2],
  ["d", 3],
  ["c", 4],
  ["v", 5],
  ["g", 6],
  ["b", 7],
  ["h", 8],
  ["n", 9],
  ["j", 10],
  ["m", 11],
  [",", 12],
  ["q", 12],
  ["2", 13],
  ["w", 14],
  ["3", 15],
  ["e", 16],
  ["r", 17],
  ["5", 18],
  ["t", 19],
  ["6", 20],
  ["y", 21],
  ["7", 22],
  ["u", 23],
  ["i", 24],
];

export function getKeyboardMap(baseNote: string): Record<string, string> {
  const baseMidi = noteToMidi(baseNote);
  if (baseMidi === -1) return {};
  const map: Record<string, string> = {};
  KEY_OFFSETS.forEach(([key, offset]) => {
    const targetMidi = baseMidi + offset;
    if (targetMidi <= END_MIDI) {
      map[key] = midiToNote(targetMidi);
    }
  });
  return map;
}

export const BASE_KEY_OPTIONS = ["C2", "C3", "C4", "C5", "C6"];

export const KEYBOARD_MAP: Record<string, string> = getKeyboardMap("C4");

/** Jumlah tuts putih pada keyboard (C2–C7). Dihitung sekali saat modul dimuat.
 *  Ditempatkan setelah definisi BLACK_NOTES/NOTE_NAMES karena
 *  generatePianoNotes() membacanya — sebelum baris ini keduanya masih di TDZ. */
export const TOTAL_WHITE_KEYS = generatePianoNotes().whiteNotes.length;
