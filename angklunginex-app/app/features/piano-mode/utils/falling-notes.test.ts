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
    // Perbandingan toleran, bukan `assert.equal`: `top + height` dan
    // `FALL_HEIGHT_PX - start * pxPerMs` mathematically identik, tetapi
    // masing-masing membulat beda di IEEE-754 (start=1000 ->
    // 139.99999999999997 vs 140; start=1999 beda ~7e-15). Implementasi
    // sengaja tidak diubah; hanya perbandingan exact yang dilonggarkan.
    const selisih =
      result[0].top + result[0].height - (FALL_HEIGHT_PX - start * pxPerMs);
    assert.ok(
      Math.abs(selisih) < 1e-9,
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
