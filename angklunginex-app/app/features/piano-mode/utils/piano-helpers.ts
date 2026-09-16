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
export const KEY_PAD = 12;
export const MIN_KEY_WIDTH = 34;

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

export const KEYBOARD_MAP: Record<string, string> = {
  // C4 octave
  z: "C4",
  s: "C#4",
  x: "D4",
  d: "D#4",
  c: "E4",
  v: "F4",
  g: "F#4",
  b: "G4",
  h: "G#4",
  n: "A4",
  j: "A#4",
  m: "B4",

  // C5 octave
  ",": "C5",
  l: "C#5",
  ".": "D5",
  ";": "D#5",
  "/": "E5",
};
