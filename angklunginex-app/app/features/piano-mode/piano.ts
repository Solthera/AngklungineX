type NoteName =
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

interface PianoNote {
  name: string;
  midi: number;
  octave: number;
  isBlack: boolean;
}

interface RecordedNote {
  note: string;
  start: number;
  duration: number;
}

/* =========================================================
   INIT — dipanggil dari piano-mode.tsx setelah DOM ter-render.
========================================================= */

export function initPiano() {
  const piano = document.querySelector<HTMLDivElement>("#piano")!;
  const pianoWrapper = piano.parentElement!;
  const currentNote = document.querySelector<HTMLSpanElement>("#currentNote")!;
  const recordStatus = document.querySelector<HTMLSpanElement>("#recordStatus")!;

  const sustainBtn =
    document.querySelector<HTMLButtonElement>("#sustainBtn")!;
  const recordBtn =
    document.querySelector<HTMLButtonElement>("#recordBtn")!;
  const replayBtn =
    document.querySelector<HTMLButtonElement>("#replayBtn")!;
  const stopBtn =
    document.querySelector<HTMLButtonElement>("#stopBtn")!;

  /* =========================================================
     CONFIG
  ========================================================= */

  const START_MIDI = 36; // C2
  const END_MIDI = 96;   // C7

  /*
   * Geometri piano.
   *
   * Lebar tuts TIDAK lagi tetap — dihitung dari lebar layar di layout(),
   * lalu ditulis ke custom property `--key-w`. CSS (.white-key) dan
   * perhitungan posisi tuts hitam di sini sama-sama membaca nilai itu,
   * jadi keduanya tidak mungkin melenceng.
   */
  const KEY_PAD = 12;        // harus sama dengan padding .piano di style.css
  const MIN_KEY_WIDTH = 34;  // batas bawah — di bawah ini piano scroll
  const MAX_KEY_WIDTH = 54;  // batas atas = lebar desain asli

  /* =========================================================
     STATE
  ========================================================= */

  let sustain = false;
  let isRecording = false;
  let recordingStartedAt = 0;
  let recordedNotes: RecordedNote[] = [];

  const currentlyPressed = new Map<string, number>();
  const sustainedNotes = new Set<string>();

  let replayTimers: number[] = [];

  /* =========================================================
     NOTE HELPERS
  ========================================================= */

  const NOTE_NAMES: NoteName[] = [
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

  const BLACK_NOTES = new Set([
    "C#",
    "D#",
    "F#",
    "G#",
    "A#",
  ]);

  function midiToNote(midi: number): string {
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;

    return `${note}${octave}`;
  }

  function isBlackKey(midi: number): boolean {
    return BLACK_NOTES.has(NOTE_NAMES[midi % 12]);
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /* =========================================================
     CREATE 61 KEYS
  ========================================================= */

  const notes: PianoNote[] = [];

  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    notes.push({
      midi,
      name: midiToNote(midi),
      octave: Math.floor(midi / 12) - 1,
      isBlack: isBlackKey(midi),
    });
  }

  /* =========================================================
     DOM KEY MAP
  ========================================================= */

  const keyElements = new Map<string, HTMLElement>();

  /* =========================================================
     CREATE WHITE KEYS
  ========================================================= */

  let whiteIndex = 0;

  for (const note of notes) {
    if (note.isBlack) continue;

    const key = document.createElement("div");

    key.className = "white-key";
    key.dataset.note = note.name;
    key.innerHTML = `
      <span class="label">${note.name}</span>
    `;
    keyElements.set(note.name, key);

    attachPointerEvents(key, note.name);
    piano.appendChild(key);
    whiteIndex++;
  }

  /* =========================================================
     CREATE BLACK KEYS
  ========================================================= */

  whiteIndex = 0;

  for (const note of notes) {

    if (!note.isBlack) {
      whiteIndex++;
      continue;
    }

    const key = document.createElement("div");

    key.className = "black-key";
    key.dataset.note = note.name;
    key.innerHTML = `
      <span class="label">${note.name}</span>
    `;

    /*
     * Black key sits between the previous
     * and current white key. Posisi pixel-nya baru dihitung di
     * layout(), karena bergantung pada lebar tuts saat ini.
     */
    key.dataset.whiteIndex = String(whiteIndex);
    keyElements.set(note.name, key);
    attachPointerEvents(key, note.name);
    piano.appendChild(key);
  }

  /* =========================================================
     LAYOUT — lebar tuts mengikuti lebar layar
  ========================================================= */

  const whiteKeys = piano.querySelectorAll<HTMLElement>(".white-key");
  const blackKeys = piano.querySelectorAll<HTMLElement>(".black-key");

  function layout() {

    /*
     * Lebar piano yang tersedia = lebar wrapper dikurangi padding
     * kiri-kanan .piano dan bayangan tepi, supaya tidak meluber.
     */
    const available =
      pianoWrapper.clientWidth - KEY_PAD * 2;

    const nextWidth = clamp(
      Math.floor(available / whiteKeys.length),
      MIN_KEY_WIDTH,
      MAX_KEY_WIDTH,
    );

    piano.style.setProperty("--key-w", `${nextWidth}px`);

    /*
     * Tuts hitam diposisikan relatif ke lebar tuts saat ini.
     * Lebar tuts hitam DIUKUR dari DOM, bukan diasumsikan, supaya
     * kalau CSS mengubahnya (mis. lewat media query) tetap sejajar.
     */
    const blackWidth =
      blackKeys[0]?.getBoundingClientRect().width ?? 0;

    blackKeys.forEach((key) => {
      const whiteIndex =
        Number(key.dataset.whiteIndex ?? 0);

      key.style.left =
        `${whiteIndex * nextWidth - blackWidth / 2 + KEY_PAD}px`;
    });
  }

  layout();

  window.addEventListener("resize", layout);

  /* =========================================================
     POINTER EVENTS
  ========================================================= */

  function attachPointerEvents(
    element: HTMLElement,
    note: string,
  ) {

    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      pressNote(note);
      element.setPointerCapture(event.pointerId);
    });

    element.addEventListener("pointerup", () => {
      releaseNote(note);
    });

    element.addEventListener("pointercancel", () => {
      releaseNote(note);
    });
  }

  /* =========================================================
     PRESS NOTE
  ========================================================= */

  function pressNote(note: string) {
    const existing = currentlyPressed.get(note);
    /*
     * Prevent duplicate pointer/key events.
     */
    if (existing !== undefined) {
      return;
    }

    currentlyPressed.set(
      note,
      performance.now(),
    );

    activateKey(note);
    currentNote.textContent = `Note: ${note}`;

    /*
     * In AngklungineX:
     *
     * playAngklung(note)
     *
     * would go here.
     */
    if (isRecording) {
      const start =
        performance.now() -
        recordingStartedAt;
      currentlyPressed.set(note, start);
    }
  }

  /* =========================================================
     RELEASE NOTE
  ========================================================= */

  function releaseNote(note: string) {
    const start = currentlyPressed.get(note);

    if (start === undefined) {
      return;
    }

    currentlyPressed.delete(note);

    /*
     * Sustain keeps the visual key pressed.
     */
    if (sustain) {
      sustainedNotes.add(note);
    } else {
      deactivateKey(note);
    }

    /*
     * Save recording.
     */

    if (isRecording) {
      const now =
        performance.now() -
        recordingStartedAt;

      recordedNotes.push({
        note,
        start:
          typeof start === "number"
            ? start
            : now,

        duration:
          Math.max(
            50,
            now - start,
          ),
      });
    }
  }

  /* =========================================================
     KEY VISUAL
  ========================================================= */

  function activateKey(note: string) {
    const element =
      keyElements.get(note);

    element?.classList.add("active");
  }

  function deactivateKey(note: string) {
    const element =
      keyElements.get(note);

    element?.classList.remove("active");
  }

  /* =========================================================
     SUSTAIN
  ========================================================= */
  sustainBtn.addEventListener(
    "click",
    toggleSustain,
  );

  function toggleSustain() {
    sustain = !sustain;

    sustainBtn.classList.toggle(
      "active",
      sustain,
    );

    const status =
      sustainBtn.querySelector<HTMLSpanElement>(
        ".status",
      );

    if (status) {
      status.textContent =
        sustain ? "ON" : "OFF";
    }

    /*
     * When sustain is released,
     * release all sustained keys.
     */

    if (!sustain) {
      for (const note of sustainedNotes) {
        deactivateKey(note);
      }
      sustainedNotes.clear();
    }
  }

  /* =========================================================
     COMPUTER KEYBOARD
  ========================================================= */

  /*
   * Simple keyboard mapping.
   *
   * You can replace this with your
   * existing AngklungineX keyboard mapping.
   */

  const keyboardMap: Record<string, string> = {

    // C4 octave
    "z": "C4",
    "s": "C#4",
    "x": "D4",
    "d": "D#4",
    "c": "E4",
    "v": "F4",
    "g": "F#4",
    "b": "G4",
    "h": "G#4",
    "n": "A4",
    "j": "A#4",
    "m": "B4",

    // C5 octave
    ",": "C5",
    "l": "C#5",
    ".": "D5",
    ";": "D#5",
    "/": "E5",
  };

  const physicalKeysDown =
    new Set<string>();

  window.addEventListener("keydown", onKeyDown);

  function onKeyDown(event: KeyboardEvent) {
    const note =
      keyboardMap[event.key];

    if (!note) return;

    /*
     * Prevent holding one keyboard key
     * from triggering repeatedly.
     */

    if (
      physicalKeysDown.has(
        event.key,
      )
    ) {
      return;
    }

    physicalKeysDown.add(
      event.key,
    );

    pressNote(note);
  }

  window.addEventListener("keyup", onKeyUp);

  function onKeyUp(event: KeyboardEvent) {
    const note =
      keyboardMap[event.key];

    if (!note) return;

    physicalKeysDown.delete(
      event.key,
    );

    releaseNote(note);
  }

  /* =========================================================
     RECORD
  ========================================================= */
  recordBtn.addEventListener(
    "click", () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    },
  );

  function startRecording() {
    stopReplay();
    recordedNotes = [];
    isRecording = true;

    recordingStartedAt =
      performance.now();
    recordBtn.classList.add(
      "recording",
    );

    recordStatus.textContent =
      "Recording...";
  }

  function stopRecording() {
    isRecording = false;

    recordBtn.classList.remove(
      "recording",
    );

    recordStatus.textContent =
      `Recorded ${recordedNotes.length} notes`;
  }

  /* =========================================================
     REPLAY
  ========================================================= */
  replayBtn.addEventListener(
    "click",
    replayRecording,
  );

  function replayRecording() {
    if (
      recordedNotes.length === 0
    ) {
      recordStatus.textContent =
        "Nothing to replay";
      return;
    }

    stopReplay();

    recordStatus.textContent =
      "Replaying...";

    for (
      const recorded of recordedNotes
    ) {
      const startTimer =
        window.setTimeout(() => {
          pressNote(
            recorded.note,
          );

          /*
           * Automatically release
           * after recorded duration.
           */

          const releaseTimer =
            window.setTimeout(() => {
              releaseNote(
                recorded.note,
              );
            },
              recorded.duration,
            );

          replayTimers.push(
            releaseTimer,
          );

        },
          recorded.start,
        );

      replayTimers.push(
        startTimer,
      );
    }

    const totalDuration =
      Math.max(
        ...recordedNotes.map((note) => note.start + note.duration,),
      );

    const finishTimer =
      window.setTimeout(() => {
        recordStatus.textContent =
          "Replay finished";
      },
        totalDuration + 100,
      );

    replayTimers.push(
      finishTimer,
    );
  }

  /* =========================================================
     STOP REPLAY
  ========================================================= */
  stopBtn.addEventListener(
    "click",
    stopReplay,
  );

  function stopReplay() {
    for (
      const timer of replayTimers
    ) {
      clearTimeout(timer);
    }

    replayTimers = [];

    /*
     * Release every key currently
     * held by replay.
     */

    for (
      const note of keyElements.keys()
    ) {
      deactivateKey(note);
    }

    currentlyPressed.clear();
    sustainedNotes.clear();

    recordStatus.textContent =
      "Stopped";
  }

  /* Lepas listener global & bersihkan papan saat unmount. */
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", layout);
    stopReplay();
    piano.replaceChildren();
    keyElements.clear();
    currentlyPressed.clear();
    sustainedNotes.clear();
  };
}