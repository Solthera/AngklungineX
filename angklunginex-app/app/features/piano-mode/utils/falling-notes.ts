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
