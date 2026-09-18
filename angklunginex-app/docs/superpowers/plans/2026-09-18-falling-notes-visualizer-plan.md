# Falling Notes Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan visualisasi *falling notes* di atas keyboard piano — setiap nada pada Replay tampil sebagai kotak yang jatuh menuju satu garis hit, dan nada berbunyi tepat saat kotak menyentuh garis itu.

**Architecture:** Replay yang sekarang memakai satu `setTimeout` per nada diganti dengan **satu `requestAnimationFrame`** yang menjadi jam tunggal untuk audio *dan* animasi. Geometri kolom/ kotak diturunkan murni dari `usePianoLayout` yang sudah ada, sehingga area jatuh selalu sejajar dengan tutsnya. Kotak diposisikan **statis**; yang bergerak per frame hanyalah `transform: translateY` pada satu wadah — jadi satu penulisan DOM per frame dan **nol re-render React**.

**Tech Stack:** React 19, TypeScript 5.9, React Router 8 (SSR), Vite 8, Web Audio API, `node:test` + `--experimental-strip-types` (Node 26) untuk test logika murni.

**Spec:** `angklunginex-app/docs/superpowers/specs/2026-09-18-falling-notes-visualizer-design.md`

## Global Constraints

- **Tidak ada `git commit` otomatis oleh AI agen.** Setiap langkah "Checkpoint" di bawah berarti *berhenti dan laporkan* — bukan menjalankan `git commit`. Agen hanya commit bila diminta pengguna.
- **Satu branch per fitur.** Branch: `feat/falling-notes-visualizer`, dibuat dari `development`.
- TypeScript `.ts` / `.tsx`. `verbatimModuleSyntax: true` → import tipe **wajib** `import type { X } from "..."`.
- **Repo tidak punya framework test.** Jangan pasang vitest/jest. Test memakai `node:test` bawaan + `--experimental-strip-types`.
- File test bernama `*.test.ts`, diletakkan **di samping** modul yang diuji, dan mengimpor dengan ekstensi `.ts` eksplisit.
- `tsconfig.json` punya `noEmit: true`, jadi file test tidak ikut ter-build.
- Nilai konstanta yang dipakai di seluruh plan: `TRAVEL_MS = 2000`, `FALL_HEIGHT_PX = 280`, `BLACK_KEY_RATIO = 0.63`.

---

## Struktur Berkas

| Berkas | Tanggung jawab |
|---|---|
| `utils/falling-notes.ts` **(baru)** | Murni geometri: `RecordedNote[]` → kotak (x, lebar, top, tinggi). Tanpa React, tanpa DOM. |
| `utils/falling-notes.test.ts` **(baru)** | Test `node:test` untuk geometri. Menjaga invarian sinkronisasi. |
| `utils/piano-helpers.ts` (ubah) | Tambah `BLACK_KEY_RATIO` dan `TOTAL_WHITE_KEYS` agar tidak ada angka kembar. |
| `hooks/usePianoRecorder.ts` (ubah) | Replay berbasis satu rAF; ekspos `replayNotes` + prop `onReplayTick`. |
| `hooks/usePianoLayout.ts` (ubah) | Pakai `BLACK_KEY_RATIO`. Tidak ada perubahan perilaku. |
| `components/PianoKeyboard.tsx` (ubah) | Terima `keyWidth` + `getBlackKeyLeft` sebagai prop; `.piano-wrapper` dipindah keluar. |
| `components/FallingNotes.tsx` **(baru)** | Presentasi saja: area jatuh, garis hit, kotak statis. Menerima `layerRef`. |
| `piano-mode.tsx` (ubah) | Pemilik bersama: `usePianoLayout`, `.piano-stage`, `fallLayerRef`, penulisan transform per frame. |
| `style.css` (ubah) | Gaya `.piano-stage`, `.fall-area`, `.fall-hit-line`, `.fall-layer`, `.fall-note`. |
| `tsconfig.json` (ubah) | `allowImportingTsExtensions: true` supaya test bisa diimpor Node dan tetap lolos `tsc`. |

---

### Task 1: Modul geometri + test

**Files:**
- Modify: `tsconfig.json:21` (tambah `allowImportingTsExtensions`)
- Modify: `app/features/piano-mode/utils/piano-helpers.ts` (tambah dua konstanta)
- Create: `app/features/piano-mode/utils/falling-notes.ts`
- Create: `app/features/piano-mode/utils/falling-notes.test.ts`

**Interfaces:**
- Consumes: `RecordedNote` dan `generatePianoNotes()` dari `./piano-helpers`; `KEY_PAD` dari `./piano-helpers`.
- Produces:
  - `TRAVEL_MS: number` (nilai `2000`)
  - `FALL_HEIGHT_PX: number` (nilai `280`)
  - `computePxPerMs(fallHeightPx?: number): number`
  - `interface FallingNote { key: string; note: string; left: number; width: number; top: number; height: number; isBlack: boolean }`
  - `buildFallingNotes(notes: RecordedNote[], keyWidth: number, getBlackKeyLeft: (whiteIndex: number) => number): FallingNote[]`
  - dari `piano-helpers`: `BLACK_KEY_RATIO: number` (nilai `0.63`), `TOTAL_WHITE_KEYS: number`

- [ ] **Step 1: Aktifkan import ber-ekstensi `.ts`**

Node ESM mewajibkan ekstensi eksplisit (`./falling-notes.ts`), sementara `tsc` menolaknya kecuali opsi ini menyala. `noEmit: true` sudah ada, jadi opsi ini aman.

Di `tsconfig.json`, tepat setelah `"noEmit": true,` tambahkan:

```json
    "allowImportingTsExtensions": true,
```

- [ ] **Step 2: Tambah konstanta bersama ke `piano-helpers.ts`**

Angka `0.63` sekarang hidup di dua tempat (`style.css` dan `usePianoLayout.ts:44`). Karena modul geometri juga butuh, jadikan satu konstanta agar tidak lahir angka kembar ketiga. Sisipkan setelah `MIN_KEY_WIDTH`:

```ts
/** Rasio lebar tuts hitam terhadap tuts putih. Harus sama dengan
 *  `--black-w: calc(var(--key-w) * 0.63)` di style.css. */
export const BLACK_KEY_RATIO = 0.63;
```

Lalu — **di AKHIR file, bukan di bawah `MIN_KEY_WIDTH`** — tambahkan:

```ts
/** Jumlah tuts putih pada keyboard (C2–C7). Dihitung sekali saat modul dimuat. */
export const TOTAL_WHITE_KEYS = generatePianoNotes().whiteNotes.length;
```

**Kenapa harus di akhir file:** `generatePianoNotes()` memang ter-hoist, tetapi ia membaca `BLACK_NOTES` dan `NOTE_NAMES` yang berupa `const` di bawah `MIN_KEY_WIDTH`. Memanggilnya di awal file mengenai *temporal dead zone* dan gagal saat import dengan `ReferenceError: Cannot access 'BLACK_NOTES' before initialization`. Menaruhnya di akhir file mengikuti idiom yang sudah dipakai `KEYBOARD_MAP`. Diverifikasi dengan menjalankan test.

- [ ] **Step 3: Tulis test yang gagal**

Buat `app/features/piano-mode/utils/falling-notes.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { RecordedNote } from "./piano-helpers.ts";
import { BLACK_KEY_RATIO, KEY_PAD } from "./piano-helpers.ts";
import {
  FALL_HEIGHT_PX,
  TRAVEL_MS,
  buildFallingNotes,
  computePxPerMs,
} from "./falling-notes.ts";

const KEY_W = 54;

/** Tiruan setia dari usePianoLayout.getBlackKeyLeft. */
const getBlackKeyLeft = (whiteIndex: number) => {
  const blackWidth = KEY_W * BLACK_KEY_RATIO;
  return whiteIndex * KEY_W - blackWidth / 2 + KEY_PAD;
};

const note = (n: string, start: number, duration: number): RecordedNote => ({
  note: n,
  start,
  duration,
});

test("computePxPerMs membagi tinggi area dengan waktu tempuh", () => {
  assert.equal(computePxPerMs(), FALL_HEIGHT_PX / TRAVEL_MS);
  assert.equal(computePxPerMs(280), 0.14);
});

test("INVARIAN: tepi bawah kotak tepat di garis hit saat start = 0", () => {
  const result = buildFallingNotes([note("C5", 0, 500)], KEY_W, getBlackKeyLeft);
  assert.equal(result.length, 1);
  // Inilah jaminan sinkronisasi: saat elapsed == start, tepi bawah kotak
  // berada persis di FALL_HEIGHT_PX, yaitu garis hit.
  assert.equal(result[0].top + result[0].height, FALL_HEIGHT_PX);
});

test("INVARIAN: tepi bawah kotak berada di garis hit dikurangi start x pxPerMs", () => {
  const pxPerMs = computePxPerMs();
  for (const start of [0, 250, 1000, 1999]) {
    const result = buildFallingNotes([note("C5", start, 300)], KEY_W, getBlackKeyLeft);
    // Perbandingan dengan toleransi, bukan assert.equal: `top + height` dan
    // `FALL_HEIGHT_PX - start * pxPerMs` mencapai hasil yang sama lewat dua
    // jalur aritmetika berbeda, sehingga IEEE-754 memberi selisih ~1e-14
    // (terukur: 2.8e-14 pada start=1000). Jauh di bawah seperseratus piksel,
    // jadi ini pembulatan, bukan bug. Nilai produksi tidak diubah.
    const selisih = Math.abs(
      result[0].top + result[0].height - (FALL_HEIGHT_PX - start * pxPerMs),
    );
    assert.ok(
      selisih < 1e-9,
      `gagal pada start=${start}: selisih ${selisih}`,
    );
  }
});

test("tinggi kotak sebanding dengan durasi nada", () => {
  const pxPerMs = computePxPerMs();
  const pendek = buildFallingNotes([note("C5", 0, 200)], KEY_W, getBlackKeyLeft)[0];
  const panjang = buildFallingNotes([note("C5", 0, 800)], KEY_W, getBlackKeyLeft)[0];
  assert.equal(pendek.height, 200 * pxPerMs);
  assert.equal(panjang.height, 800 * pxPerMs);
  assert.ok(panjang.height > pendek.height);
});

test("nada tuts putih memakai lebar tuts dan x berbasis whiteIndex", () => {
  const result = buildFallingNotes([note("C5", 0, 200)], KEY_W, getBlackKeyLeft);
  const c5 = result[0];
  assert.equal(c5.isBlack, false);
  assert.equal(c5.width, KEY_W);
  // x tuts putih selalu kelipatan keyWidth dari tepi kiri, setelah KEY_PAD.
  assert.equal((c5.left - KEY_PAD) % KEY_W, 0);
});

test("urutan kolom mengikuti urutan tuts: C5 di kiri D5, D5 di kiri E5", () => {
  const [c5] = buildFallingNotes([note("C5", 0, 200)], KEY_W, getBlackKeyLeft);
  const [d5] = buildFallingNotes([note("D5", 0, 200)], KEY_W, getBlackKeyLeft);
  const [e5] = buildFallingNotes([note("E5", 0, 200)], KEY_W, getBlackKeyLeft);
  assert.ok(c5.left < d5.left, "C5 harus di kiri D5");
  assert.ok(d5.left < e5.left, "D5 harus di kiri E5");
  // Tepat satu lebar tuts per langkah tuts putih.
  assert.equal(d5.left - c5.left, KEY_W);
});

test("lebar kotak hitam lebih sempit dari tuts putih", () => {
  const [c5] = buildFallingNotes([note("C5", 0, 200)], KEY_W, getBlackKeyLeft);
  const [cs5] = buildFallingNotes([note("C#5", 0, 200)], KEY_W, getBlackKeyLeft);
  assert.ok(cs5.width < c5.width, "kotak tuts hitam harus lebih sempit");
});

test("nada tuts hitam memakai x hasil getBlackKeyLeft dan lebar lebih sempit", () => {
  const result = buildFallingNotes([note("C#5", 0, 200)], KEY_W, getBlackKeyLeft);
  const cs5 = result[0];
  assert.equal(cs5.isBlack, true);
  assert.equal(cs5.width, KEY_W * BLACK_KEY_RATIO);
  assert.ok(cs5.width < KEY_W);
  // C#5 harus menyilang: x-nya BUKAN kelipatan keyWidth + KEY_PAD
  assert.notEqual((cs5.left - KEY_PAD) % KEY_W, 0);
});

test("nada yang tidak dikenal dilewati, bukan error", () => {
  const result = buildFallingNotes([note("H9", 0, 200)], KEY_W, getBlackKeyLeft);
  assert.deepEqual(result, []);
});

test("key unik walau nada dan waktu sama (akor/unison)", () => {
  const result = buildFallingNotes(
    [note("C5", 0, 200), note("C5", 0, 200)],
    KEY_W,
    getBlackKeyLeft,
  );
  assert.equal(new Set(result.map((n) => n.key)).size, 2);
});
```

- [ ] **Step 4: Jalankan test, pastikan GAGAL**

Jalankan:
```bash
node --test --experimental-strip-types app/features/piano-mode/utils/
```
Diharapkan: **FAIL** — `Cannot find module './falling-notes.ts'`, karena modulnya belum ada.

- [ ] **Step 5: Implementasi `falling-notes.ts`**

```ts
// Import WAJIB ber-ekstensi .ts: Node ESM (yang menjalankan test ini) menolak
// specifier tanpa ekstensi dengan ERR_MODULE_NOT_FOUND.
import type { RecordedNote } from "./piano-helpers.ts";
import { BLACK_KEY_RATIO, KEY_PAD, generatePianoNotes } from "./piano-helpers.ts";

/** Lama perjalanan kotak dari tepi atas area jatuh sampai garis hit (ms). */
export const TRAVEL_MS = 2000;

/** Tinggi area jatuh (px). Tidak terikat pada tinggi piano di CSS. */
export const FALL_HEIGHT_PX = 280;

/**
 * Jarak geser per milidetik. Dipakai untuk dua hal yang harus konsisten:
 * tinggi kotak, dan kecepatan `translateY` pada `.fall-layer`.
 */
export function computePxPerMs(fallHeightPx: number = FALL_HEIGHT_PX): number {
  return fallHeightPx / TRAVEL_MS;
}

export interface FallingNote {
  /** Kunci stabil untuk React; unik walau nada+waktu sama. */
  key: string;
  note: string;
  /** x relatif terhadap tepi kiri `.piano` (sudah termasuk KEY_PAD). */
  left: number;
  width: number;
  /** y statis di dalam `.fall-layer`. */
  top: number;
  height: number;
  isBlack: boolean;
}

/**
 * Ubah timeline rekaman menjadi kotak siap gambar.
 *
 * Posisi ditulis STATIS: `.fall-layer` yang akan digeser `translateY`
 * seiring waktu. Karena itu `top + height` adalah tepi bawah kotak pada
 * elapsed = 0, dan invarian `top + height === FALL_HEIGHT_PX - start * pxPerMs`
 * yang menjamin nada berbunyi tepat saat kotak menyentuh garis hit.
 */
export function buildFallingNotes(
  notes: RecordedNote[],
  keyWidth: number,
  getBlackKeyLeft: (whiteIndex: number) => number,
): FallingNote[] {
  const pxPerMs = computePxPerMs();
  // Satu lookup untuk seluruh timeline; generatePianoNotes() deterministik.
  const byName = new Map(
    generatePianoNotes().allNotes.map((n) => [n.name, n]),
  );

  const result: FallingNote[] = [];

  notes.forEach((recorded, index) => {
    const pianoNote = byName.get(recorded.note);
    // Nada di luar jangkauan keyboard (C2–C7) tidak punya kolom: lewati.
    if (!pianoNote) return;

    const width = pianoNote.isBlack ? keyWidth * BLACK_KEY_RATIO : keyWidth;
    const left = pianoNote.isBlack
      ? getBlackKeyLeft(pianoNote.whiteIndex)
      : pianoNote.whiteIndex * keyWidth + KEY_PAD;

    const height = recorded.duration * pxPerMs;

    result.push({
      key: `${recorded.note}-${recorded.start}-${index}`,
      note: recorded.note,
      left,
      width,
      top: FALL_HEIGHT_PX - (recorded.start + recorded.duration) * pxPerMs,
      height,
      isBlack: pianoNote.isBlack,
    });
  });

  return result;
}
```

- [ ] **Step 6: Jalankan test, pastikan LULUS**

Jalankan:
```bash
node --test --experimental-strip-types app/features/piano-mode/utils/
```
Diharapkan: **PASS**, 10 test lulus, 0 gagal.

- [ ] **Step 7: Typecheck**

Jalankan:
```bash
npm run typecheck
```
Diharapkan: exit code 0.

- [ ] **Step 8: Checkpoint** — lapor ke pengguna: 10 test lulus, typecheck bersih. **Jangan commit.**

---

### Task 2: Replay dengan satu jam rAF

**Files:**
- Modify: `app/features/piano-mode/hooks/usePianoRecorder.ts`

**Interfaces:**
- Consumes: `RecordedNote` dari `../utils/piano-helpers`.
- Produces (dari hook):
  - `replayNotes: RecordedNote[]` — timeline terurut saat replay aktif, `[]` saat tidak.
  - prop input baru `onReplayTick?: (elapsedMs: number) => void` — dipanggil tiap frame.
  - Sisanya tidak berubah: `isRecording`, `isReplaying`, `statusMessage`, `recordedNoteCount`, `startRecording`, `stopRecording`, `playReplay`, `stopReplay`, `handleNotePressRecord`, `handleNoteReleaseRecord`.

- [ ] **Step 1: Ganti ref timer menjadi ref jam**

Ganti blok ref (baris `replayTimersRef`) menjadi:

```ts
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
```

Tambahkan `onReplayTick` ke destrukturisasi props:

```ts
export function usePianoRecorder({
  onPlayNote,
  onReleaseNote,
  onStopAllNotes,
  onReplayTick,
}: UsePianoRecorderProps) {
```

dan ke `interface UsePianoRecorderProps`:

```ts
  onReplayTick?: (elapsedMs: number) => void;
```

- [ ] **Step 2: Tulis ulang `stopReplay`**

```ts
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
```

- [ ] **Step 3: Tulis ulang `playReplay`**

```ts
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
```

- [ ] **Step 4: Perbarui cleanup unmount**

Ganti `useEffect` cleanup di akhir hook:

```ts
  // Bersihkan jam rAF saat unmount agar tidak ada frame yang tertinggal.
  useEffect(() => {
    return () => {
      if (replayRafRef.current !== null) {
        cancelAnimationFrame(replayRafRef.current);
        replayRafRef.current = null;
      }
    };
  }, []);
```

- [ ] **Step 5: Ekspos `replayNotes` dari return**

Tambahkan `replayNotes,` ke objek yang di-return.

- [ ] **Step 6: Typecheck**

Jalankan:
```bash
npm run typecheck
```
Diharapkan: exit code 0. Kalau muncul error "declared but never read" pada `replayTimersRef`, berarti masih ada sisa referensi — hapus.

- [ ] **Step 7: Uji manual di browser — replay masih berbunyi benar**

Ini regresi yang paling berbahaya: replay ditulis ulang total. Sebelum lanjut, pastikan **audio-nya tidak rusak**.

Jalankan `npm run dev`, buka `/piano-mode`, lalu:
1. Rekam 4 nada berurutan dengan jeda berbeda.
2. Tekan Replay → urutan dan jeda nada harus **terdengar sama** seperti sebelumnya.
3. Rekam akor (3 nada bersamaan) → harus berbunyi bersamaan, bukan berurutan.
4. Tekan Stop di tengah replay → suara langsung berhenti, tidak ada nada nyangkut.
5. Biarkan replay selesai sendiri → tidak ada nada yang tetap berbunyi.

Diharapkan: kelima poin lolos. Belum ada kotak yang muncul di tahap ini — itu Task 5.

- [ ] **Step 8: Checkpoint** — lapor hasil kelima pengujian manual. **Jangan commit.**

---

### Task 3: Naikkan `usePianoLayout` dan pisahkan `.piano-stage`

Tanpa langkah ini, area jatuh berada di luar kontainer scroll keyboard, sehingga kotak akan menunjuk tuts yang salah begitu keyboard digeser.

**Files:**
- Modify: `app/features/piano-mode/hooks/usePianoLayout.ts:44` (pakai `BLACK_KEY_RATIO`)
- Modify: `app/features/piano-mode/components/PianoKeyboard.tsx`
- Modify: `app/features/piano-mode/piano-mode.tsx`
- Modify: `app/features/piano-mode/style.css`

**Interfaces:**
- Consumes: `TOTAL_WHITE_KEYS` dari `../utils/piano-helpers` (Task 1).
- Produces:
  - `PianoKeyboard` props baru: `keyWidth: number`, `getBlackKeyLeft: (whiteIndex: number) => number`.
  - `piano-mode.tsx` memiliki `usePianoLayout` dan elemen `.piano-wrapper` + `.piano-stage`.

- [ ] **Step 1: Pakai konstanta bersama di `usePianoLayout`**

Di `usePianoLayout.ts`, impor dan ganti angka harfiah:

```ts
import { BLACK_KEY_RATIO, KEY_PAD, MIN_KEY_WIDTH } from "../utils/piano-helpers";
```

lalu di `getBlackKeyLeft`:

```ts
      const blackWidth = keyWidth * BLACK_KEY_RATIO;
```

- [ ] **Step 2: `PianoKeyboard` menerima geometri sebagai prop**

Ganti isi `PianoKeyboard.tsx` bagian atas dan elemen pembungkusnya:

```tsx
import React, { useMemo } from "react";
import { generatePianoNotes, isNotePlayable } from "../utils/piano-helpers";

interface PianoKeyboardProps {
  activeNotes: Set<string>;
  onNotePress: (note: string) => void;
  onNoteRelease: (note: string) => void;
  keyWidth: number;
  getBlackKeyLeft: (whiteIndex: number) => number;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNotes,
  onNotePress,
  onNoteRelease,
  keyWidth,
  getBlackKeyLeft,
}) => {
  const { whiteNotes, blackNotes } = useMemo(() => generatePianoNotes(), []);
```

Di blok `return`, **hapus** `<section ref={wrapperRef} className="piano-wrapper">` beserta penutupnya sehingga yang di-return langsung `<div id="piano" className="piano" ...>`. Ganti juga `keyWidth` pada style — nilainya sekarang dari prop, bukan dari hook:

```tsx
  return (
    <div
      id="piano"
      className="piano"
      style={{ "--key-w": `${keyWidth}px` } as React.CSSProperties}
    >
      {/* Render White Keys */}
      ...
    </div>
  );
};
```

Hapus juga baris `import { usePianoLayout } from "../hooks/usePianoLayout";` dan pemanggilan `usePianoLayout(...)`.

- [ ] **Step 3: `piano-mode.tsx` memegang layout dan struktur baru**

Tambah impor:

```tsx
import { usePianoLayout } from "./hooks/usePianoLayout";
import { TOTAL_WHITE_KEYS } from "./utils/piano-helpers";
```

Tambah hook di dalam komponen:

```tsx
  const { wrapperRef, keyWidth, getBlackKeyLeft } = usePianoLayout(TOTAL_WHITE_KEYS);
```

Ganti JSX keyboard menjadi:

```tsx
        <section ref={wrapperRef} className="piano-wrapper">
          <div className="piano-stage">
            <PianoKeyboard
              activeNotes={activeNotes}
              onNotePress={pressNote}
              onNoteRelease={releaseNote}
              keyWidth={keyWidth}
              getBlackKeyLeft={getBlackKeyLeft}
            />
          </div>
        </section>
```

- [ ] **Step 4: Tambah gaya `.piano-stage`**

Di `style.css`, setelah aturan `.piano-wrapper`:

```css
/*
 * Wadah bersama untuk area jatuh + keyboard. Keduanya harus bersaudara
 * dengan aturan lebar yang sama supaya kolom area jatuh sejajar dengan
 * tutsnya. width: max-content -> melebar mengikuti kebutuhan; min-width:
 * 100% -> minimal selebar layar. Tidak ada padding: containing block anak
 * absolute adalah padding box, jadi padding akan menggeser semua kolom.
 */
.piano-stage {
  width: max-content;
  min-width: 100%;
}
```

- [ ] **Step 5: Typecheck**

Jalankan:
```bash
npm run typecheck
```
Diharapkan: exit code 0.

- [ ] **Step 6: Uji manual — keyboard tidak boleh berubah**

Ini langkah refactor murni, jadi tampilannya harus **identik** dengan sebelum perubahan.

Jalankan `npm run dev`, buka `/piano-mode`:
1. Tuts putih dan hitam **sejajar** seperti sebelumnya — tidak ada yang bergeser.
2. Tutus hitam duduk tepat di perbatasan dua tuts putih.
3. Klik tuts → berbunyi dan tertekan.
4. Tekan keyboard (mis. `Z`, `X`, `C`) → berbunyi.
5. Kecilkan jendela sampai keyboard menyempit → tuts mengikuti dan bisa di-scroll horizontal.
6. Ubah `baseKey` → pemetaan keyboard berubah seperti sebelumnya.

Diharapkan: keenam poin sama persis seperti sebelum perubahan. Kalau ada yang berbeda, refactor ini salah — perbaiki sebelum lanjut.

- [ ] **Step 7: Checkpoint** — lapor bahwa tampilan keyboard tidak berubah. **Jangan commit.**

---

### Task 4: Komponen `FallingNotes`

**Files:**
- Create: `app/features/piano-mode/components/FallingNotes.tsx`
- Modify: `app/features/piano-mode/style.css`

**Interfaces:**
- Consumes: `FallingNote` dan `FALL_HEIGHT_PX` dari `../utils/falling-notes`.
- Produces: `FallingNotes` dengan props `{ notes: FallingNote[]; layerRef: React.Ref<HTMLDivElement> }`.

- [ ] **Step 1: Buat komponennya**

Komponen ini **presentasi murni**: tidak punya state, tidak punya rAF, tidak menghitung posisi. Posisi sudah dihitung `buildFallingNotes` (Task 1), dan pergerakan ditulis `piano-mode.tsx` ke `layerRef` (Task 5).

```tsx
import React from "react";
import type { FallingNote } from "../utils/falling-notes";
import { FALL_HEIGHT_PX } from "../utils/falling-notes";

interface FallingNotesProps {
  notes: FallingNote[];
  /**
   * Ref ke `.fall-layer`. Diserahkan ke induk karena induklah yang memiliki
   * jam rAF tunggal (lihat usePianoRecorder), sehingga hanya ada satu
   * penulisan transform per frame dan tidak ada re-render React.
   */
  layerRef: React.Ref<HTMLDivElement>;
}

export const FallingNotes: React.FC<FallingNotesProps> = ({ notes, layerRef }) => {
  return (
    <div
      className="fall-area"
      style={{ height: `${FALL_HEIGHT_PX}px` }}
      aria-hidden="true"
    >
      <div className="fall-layer" ref={layerRef}>
        {notes.map((n) => (
          <div
            key={n.key}
            className={`fall-note${n.isBlack ? " black" : ""}`}
            style={{
              left: `${n.left}px`,
              width: `${n.width}px`,
              top: `${n.top}px`,
              height: `${n.height}px`,
            }}
          />
        ))}
      </div>
      <div className="fall-hit-line" />
    </div>
  );
};
```

`aria-hidden="true"` karena ini murni dekorasi — pembaca layar tidak perlu membacakan kotak. Informasi "ada rekaman N nada" sudah tersedia dari `recordedNoteCount` dan `statusMessage`.

- [ ] **Step 2: Tambah gayanya**

Di `style.css`, setelah aturan `.piano-stage`:

```css
/* Falling notes */

/*
 * Area jatuh. overflow: hidden -> kotak yang belum waktunya tampil (di atas)
 * dan yang sudah lewat (di bawah) terpotong, bukan melimpah ke luar.
 * TIDAK ADA padding di sini: containing block anak absolute adalah padding
 * box, jadi padding akan menggeser SEMUA kolom sebesar padding itu.
 * Kolom sudah memperhitungkan KEY_PAD sendiri di buildFallingNotes().
 */
.fall-area {
  position: relative;
  overflow: hidden;

  border-radius: 18px 18px 0 0;
  border: 1px solid #1f1f1f;
  border-bottom: none;
  background: #0d0d0d;
}

/* Satu-satunya elemen yang bergerak per frame (translateY). */
.fall-layer {
  position: absolute;
  inset: 0;

  will-change: transform;
}

.fall-note {
  position: absolute;

  border-radius: 4px;
  background: #f2f2f2;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
}

.fall-note.black {
  background: #3a3a3a;
  box-shadow: inset 0 0 0 1px #111;
}

/* Garis hit: nada berbunyi tepat saat tepi bawah kotak menyentuhnya. */
.fall-hit-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 2px;

  background: #7dd3fc;
  box-shadow: 0 0 8px rgba(125, 211, 252, 0.8);
}
```

- [ ] **Step 3: Typecheck**

Jalankan:
```bash
npm run typecheck
```
Diharapkan: exit code 0.

- [ ] **Step 4: Checkpoint** — lapor komponen dan gaya selesai; belum terpasang di halaman sampai Task 5. **Jangan commit.**

---

### Task 5: Sambungkan semuanya

**Files:**
- Modify: `app/features/piano-mode/piano-mode.tsx`
- Modify: `app/features/piano-mode/style.css` (penyesuaian penyambungan)

**Interfaces:**
- Consumes: `FallingNotes` (Task 4), `buildFallingNotes` + `computePxPerMs` (Task 1), `recorder.replayNotes` + `onReplayTick` (Task 2), `keyWidth` + `getBlackKeyLeft` (Task 3).
- Produces: fitur lengkap yang bisa diuji pengguna.

- [ ] **Step 1: Tambah impor dan perhitungan kotak**

Di `piano-mode.tsx`:

```tsx
import { FallingNotes } from "./components/FallingNotes";
import { buildFallingNotes, computePxPerMs } from "./utils/falling-notes";
import { useMemo } from "react";
```

Di dalam komponen, setelah `usePianoLayout`:

```tsx
  const fallLayerRef = useRef<HTMLDivElement>(null);

  // Geometri kotak hanya dihitung ulang saat timeline berubah atau saat
  // lebar tuts berubah (resize) — bukan tiap frame.
  const fallingNotes = useMemo(
    () => buildFallingNotes(recorder.replayNotes, keyWidth, getBlackKeyLeft),
    [recorder.replayNotes, keyWidth, getBlackKeyLeft],
  );

  // Satu penulisan DOM per frame. Sengaja tanpa state: menyimpan posisi di
  // state akan me-render ulang seluruh kotak 60x per detik.
  const handleReplayTick = useCallback((elapsedMs: number) => {
    const layer = fallLayerRef.current;
    if (layer) {
      layer.style.transform = `translateY(${elapsedMs * computePxPerMs()}px)`;
    }
  }, []);
```

- [ ] **Step 2: Teruskan `onReplayTick` ke hook**

```tsx
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
```

- [ ] **Step 3: Render area jatuh di dalam `.piano-stage`**

```tsx
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
```

- [ ] **Step 4: Rapikan sambungan visual di `style.css`**

Area jatuh dan piano harus terlihat menyatu: sudut atas piano dibuat datar (sudut membulat tetap di baris bawah) supaya bertemu area jatuh tanpa celah. **Jangan ubah `padding` `.piano`** — tingginya 280px dengan padding 12px menyisakan tepat 256px untuk tuts putih setinggi 250px, jadi menambah padding membuat tuts melimpah ke luar.

Tambahkan setelah `.piano`:

```css
/*
 * Area jatuh dan piano satu kesatuan visual. Sudut atas piano dibuat datar
 * karena bersambung langsung dengan bagian bawah area jatuh; sudut membulat
 * dipindah ke baris bawah. Padding .piano TIDAK diubah: 280 - 12*2 = 256px
 * adalah ruang tepat untuk tuts putih 250px.
 */
.piano-stage > .fall-area + .piano {
  border-radius: 0 0 18px 18px;
}
```

- [ ] **Step 5: Typecheck**

Jalankan:
```bash
npm run typecheck
```
Diharapkan: exit code 0.

- [ ] **Step 6: Uji manual lengkap**

Jalankan `npm run dev`, buka `/piano-mode`:

1. Rekam 4 nada dengan jeda berbeda (pendek, panjang, pendek, panjang), lalu Replay.
2. Kotak harus jatuh dari atas dengan **panjang berbeda** sesuai durasi tiap nada.
3. Perhatikan **satu nada saja**: bunyinya harus terdengar **tepat saat** tepi bawah kotaknya menyentuh garis hit — bukan sebelum, bukan sesudah.
4. Biarkan lagu berjalan **30 detik lebih** → sinkronisasi **tidak boleh** makin melenceng di akhir. Ini yang membuktikan perbaikan dari `setTimeout`.
5. Rekam akor (3 nada bersamaan) → kotak muncul **sejajar pada ketinggian sama**.
6. Nada tuts hitam (mis. C#5) → kotaknya harus **menyilang di perbatasan** dua kolom, sejajar dengan tuts hitamnya.
7. Geser keyboard horizontal saat replay → kotak tetap sejajar dengan tutsnya.
8. Tekan Stop saat replay → kotak hilang, tidak ada nada nyangkut.
9. Ukur ulang jendela browser saat replay → kolom menyesuaikan lebar, tidak ada kotak yang meleset.

Diharapkan: kesembilan poin lolos. **Poin 3 dan 4 hanya bisa dinilai telinga dan mata Anda** — tidak ada jalur verifikasi otomatis di repo ini.

- [ ] **Step 7: Checkpoint** — lapor hasil kesembilan poin, termasuk yang gagal. **Jangan commit.**

---

## Verifikasi Akhir

Setelah semua task selesai:

- [ ] `npm run typecheck` → exit 0
- [ ] `node --test --experimental-strip-types app/features/piano-mode/utils/` → semua lulus
- [ ] `npm run build` → sukses
- [ ] Periksa CSS hasil build agar aturan bertahan setelah minifikasi:

```bash
F=$(ls build/client/assets/*.css | head -1)
grep -o "\.fall-area{[^}]*}" "$F"
grep -o "\.fall-hit-line{[^}]*}" "$F"
```

Diharapkan: `.fall-area` punya `position:relative` dan `overflow:hidden`; `.fall-hit-line` punya `position:absolute` dan `bottom:0`.

---

## Catatan Penting untuk Pelaksana

**Yang tidak diperbaiki plan ini, dan tidak boleh "sekalian" diperbaiki:**

1. **Sustain tidak terekam.** `piano-mode.tsx` masih `releaseNote(note, false)` di jalur replay. Rekaman yang dimainkan dengan sustain ON tetap berbunyi berbeda saat diputar ulang.
2. **Replay tidak mengisi `currentlyPressedRef`.** Pengguna dan replay bisa berebut nada yang sama. Visualizer ini membuat cacat ini lebih kelihatan, bukan memperbaikinya.

Keduanya sudah ada sebelum fitur ini dan berada di luar cakupan spec.

**Risiko terbesar:** Task 2 menulis ulang replay. Itulah satu-satunya bagian yang bisa merusak fitur yang sudah berfungsi, dan Task 2 Step 7 ada khusus untuk menangkapnya. Jangan lewati langkah itu.
