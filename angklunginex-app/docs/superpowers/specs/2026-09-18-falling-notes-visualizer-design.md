# Falling Notes Visualizer — Piano Mode

**Goal:** Menampilkan visualisasi *falling notes* di atas keyboard piano: setiap tuts
diproyeksikan ke atas sebagai kolom, dan saat Replay setiap nada tampil sebagai kotak
yang jatuh dari atas menuju satu garis hit. Ketika kotak mencapai garis hit, nada
berbunyi dan tuts-nya tertekan.

**Scope:** hanya mode **Replay** dari rekaman yang ada (`usePianoRecorder`). Playback
dari file MIDI adalah fitur terpisah dan tidak termasuk di sini — tetapi fondasi jam
yang dibangun di sini dipakai ulang olehnya.

---

## 1. Keputusan yang mengunci desain

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Kolom = proyeksi vertikal tuts **putih**. Tuts hitam **tidak** punya kolom sendiri; kotaknya menyilang di perbatasan dua tuts putih, persis seperti tuts hitam aslinya. | `getBlackKeyLeft` memusatkan tuts hitam di perbatasan (`usePianoLayout.ts:42-48`). Membuat kolom untuk tuts hitam akan merusak kesejajaran. |
| 2 | Lebar kolom mengikuti lebar tuts apa adanya (tetap tidak seragam). | Kotak harus tepat di atas tuts yang dibunyikan. Kolom seragam membuat geseran yang **menumpuk** makin ke kanan. |
| 3 | Panjang kotak = durasi nada. | Kapan mulai → posisi. Berapa lama → panjang. |
| 4 | Satu jam bersama untuk audio dan animasi. | Tanpa ini, kotak dan bunyi pasti melenceng (lihat §3). |
| 5 | Kecepatan: **waktu tempuh tetap** untuk rekaman, **ikut tempo** untuk MIDI (nanti). | Rekaman tidak menyimpan tempo — `RecordedNote` hanya `{note, start, duration}` dalam ms, tanpa ketukan/BPM. Menebak tempo dari jeda manusia tidak stabil (jeda antar-take bervariasi untuk nada yang sama). |
| 6 | Di HP **tidak ada auto-scroll**. | Keputusan sadar. Nada di luar layar tetap berbunyi; kotaknya tidak terlihat. |

---

## 2. Arsitektur & Komponen

### 2.1 Struktur DOM

`usePianoLayout` naik dari `PianoKeyboard` ke `piano-mode.tsx`, sehingga kontainer
scroll horizontal (`.piano-wrapper`) berpindah ke sana juga. Alasannya: area jatuh
**harus** berada di dalam kontainer scroll yang sama dengan keyboard, kalau tidak
kotak akan menunjuk tuts yang salah begitu keyboard digeser.

```
.piano-wrapper                (kontainer scroll, di piano-mode.tsx)
  └ .piano-stage              (width: max-content; min-width: 100%)
      ├ .fall-area            (tinggi FALL_HEIGHT_PX, position: relative, overflow: hidden)
      │   ├ .fall-hit-line    (position: absolute; bottom: 0; left: 0; right: 0)
      │   └ .fall-layer       (transform: translateY(elapsedMs × pxPerMs) — ditulis per frame)
      │       └ .fall-note ×N  (absolute; left/top/width/height inline; posisi statis)
      └ .piano                (tuts, tidak berubah)
```

**Jebakan yang harus dihindari:** `.fall-area` **tidak boleh** punya `padding`
horizontal. Containing block untuk anak `position: absolute` adalah *padding box*,
jadi `left: 0` mengabaikan padding — rumus di §2.3 sudah memasukkan `KEY_PAD`
sendiri. Menambah padding di sini akan menggeser semua kolom sebesar padding itu.

`.piano` dan `.fall-area` harus bersaudara dengan aturan lebar yang sama
(`width: max-content; min-width: 100%`) supaya kolomnya sejajar. `.piano` tidak
punya `border`, dan `* { box-sizing: border-box }` sudah global, sehingga `keyWidth`
adalah lebar terender yang sebenarnya — tanpa offset 1px tersembunyi.

### 2.2 Jam replay

Saat ini `playReplay` memakai **satu `setTimeout` per nada** (`usePianoRecorder.ts:92-104`)
dan tidak ada `requestAnimationFrame` di seluruh fitur. Tidak ada jam bersama antara
audio dan apa pun, sehingga animasi yang punya jam sendiri akan melenceng: `setTimeout`
tertunda saat main thread sibuk (setiap `setActiveNotes` memicu re-render), sementara
rAF tetap ~60fps.

Replay dibangun ulang agar **satu rAF menjadi jam tunggal** yang menggerakkan audio
*dan* animasi:

```
replayStartRef      : number                    // performance.now() saat replay mulai
sortedNotesRef      : RecordedNote[]             // diurutkan naik berdasarkan start
nextPressIdxRef     : number                     // indeks nada berikutnya yang belum dibunyikan
soundingRef         : { note, endMs }[]          // nada yang sedang berbunyi
rafRef              : number

setiap frame (elapsedMs = performance.now() - replayStartRef):
  1. selama sortedNotes[nextPressIdx].start <= elapsedMs:
       onPlayNote(note)
       soundingRef.push({ note, endMs: start + duration })
       nextPressIdx++
  2. untuk setiap soundingRef dengan endMs <= elapsedMs:
       onReleaseNote(note), hapus dari soundingRef
  3. onReplayTick(elapsedMs)          // visualizer menulis transform
  4. jika nextPressIdx habis DAN soundingRef kosong → replay selesai, batalkan rAF
```

Error sinkronisasi ≤1 frame (~16.7 ms), di bawah ambang persepsi untuk
sinkronisasi audio-visual. Kalau tab disembunyikan, browser menghentikan rAF —
sehingga audio dan animasi **berhenti bersama**, bukan salah satu tertinggal.

`onReplayTick` adalah callback opsional yang diteruskan ke visualizer. Satu rAF
dimiliki hook, jadi dijamin hanya ada satu jam dan satu frame.

### 2.3 Geometri

Semua turunan dari fungsi yang sudah ada — **tidak ada grid atau angka kembar dengan CSS.**

```
pxPerMs   = FALL_HEIGHT_PX / TRAVEL_MS

kolom putih : left = whiteIndex × keyWidth + KEY_PAD        width = keyWidth
kolom hitam : left = getBlackKeyLeft(whiteIndex)            width = keyWidth × 0.63

kotak       : width  = lebar kolom
              height = durationMs × pxPerMs
              yBottom = FALL_HEIGHT_PX − (startMs × pxPerMs)
              yTop    = yBottom − height
```

Verifikasi rumus: `.fall-layer` digeser `translateY(elapsedMs × pxPerMs)`, sehingga
tepi bawah kotak berada di `FALL_HEIGHT_PX + (elapsedMs − startMs) × pxPerMs`. Saat
`elapsedMs === startMs`, tepi bawahnya **tepat di `FALL_HEIGHT_PX`**, yaitu garis hit.
Sebelum itu ia berada di atas garis hit.

`whiteIndex` untuk tuts hitam sudah menunjuk tuts putih sebelumnya
(`generatePianoNotes`), sehingga `getBlackKeyLeft` memusatkan kotak hitam di
perbatasan — sama seperti tuts hitamnya.

### 2.4 Penggambaran

**Bukan React state per frame.** Kalau posisi kotak disimpan di state dan diperbarui
60×/detik, React akan me-render ulang puluhan elemen tiap frame.

Sebagai gantinya: **kotak diposisikan statis, wadahnya yang bergerak.** Tiap kotak
diletakkan sekali di `yTop` hasil §2.3, lalu `.fall-layer` diberi satu
`transform: translateY(...)` per frame. **Satu penulisan DOM per frame**, bukan
50. Mulus karena transform di-compositor, dan nol re-render React.

DOM + CSS, bukan canvas. Untuk rekaman, kotak di layar hanya belasan sampai puluhan.
Kalau MIDI nanti perlu ribuan note, canvas jadi pertimbangan baru — bukan sekarang.

### 2.5 Konstanten & warna

| Konstanta | Nilai usulan | Di mana |
|---|---|---|
| `TRAVEL_MS` | `2000` (2 detik dari atas ke garis hit) | `utils/falling-notes.ts` |
| `FALL_HEIGHT_PX` | `280` | `utils/falling-notes.ts` |

**Konsekuensi yang harus diketahui:** dengan kedua nilai di atas, `pxPerMs = 0.14`,
sehingga **panjang kotak maksimum yang terlihat penuh adalah 2000 ms**. Nada yang
ditahan lebih lama dari 2 detik akan lebih tinggi dari area jatuh dan **terpotong di
atas** (di-clip oleh `overflow: hidden`). Ini perilaku normal dan sama seperti
Synthesia, tapi harus disadari — bukan bug.

`FALL_HEIGHT_PX` adalah konstanta JS dan **tidak terikat** pada tinggi piano.
Tinggi piano berubah di mobile (280 → 220, `style.css`), sedangkan tinggi area jatuh
tetap. Jadi jarak dari atas area jatuh ke garis hit **selalu** 280px di semua ukuran
layar, dan `TRAVEL_MS` tetap 2 detik.

Warna kotak mengikuti tutsnya: terang untuk nada tuts putih, gelap bergaris untuk
nada tuts hitam. Garis hit: garis terang tipis (1–2px) dengan sedikit glow.

### 2.6 Berkas

| Berkas | Perubahan |
|---|---|
| `hooks/usePianoRecorder.ts` | **ubah** — replay dari `setTimeout` per nada → satu rAF; tambah `getRecordedNotes()` dan prop `onReplayTick` |
| `hooks/usePianoLayout.ts` | **tidak berubah** — hanya pemanggilnya naik |
| `utils/falling-notes.ts` | **baru** — `RecordedNote[]` → `FallingNote[]` (x, lebar, yTop, tinggi) + konstanta |
| `components/FallingNotes.tsx` | **baru** — `.fall-area`, garis hit, kotak; menulis transform lewat ref |
| `components/PianoKeyboard.tsx` | **ubah** — terima `keyWidth` + `getBlackKeyLeft` sebagai prop; `.piano-wrapper` pindah keluar |
| `piano-mode.tsx` | **ubah** — pegang `usePianoLayout`, render `.piano-stage` + area jatuh di atas keyboard |
| `style.css` | **tambah** — `.piano-stage`, `.fall-area`, `.fall-hit-line`, `.fall-layer`, `.fall-note` |

---

## 3. Error Handling

- **Replay tanpa rekaman:** tidak ada kotak, tidak ada rAF. Perilaku lama dipertahankan
  (`"Nothing to replay"`).
- **Stop saat replay:** batalkan rAF, bersihkan `soundingRef`, panggil `onStopAllNotes()`.
- **Unmount saat replay:** batalkan rAF di cleanup `useEffect` (sekarang membersihkan timer).
- **Resize saat replay:** `keyWidth` berubah → geometri kotak dihitung ulang dari
  `useMemo` yang bergantung pada `keyWidth`; posisi statis diperbarui, layer tetap
  memakai `elapsedMs` yang sama.
- **`onReplayTick` tidak diberikan:** jalur audio tetap berjalan; visualizer opsional.
- **Nada duplikat dalam satu frame:** `soundingRef` diperiksa per `note` sebelum
  menambah, supaya tidak ada dua rilis untuk satu nada.

---

## 4. Di Luar Cakupan (sengaja tidak disentuh)

Dua cacat yang sudah ada sebelumnya dan **tidak** diperbaiki di sini:

1. **Sustain tidak terekam.** `piano-mode.tsx:137` masih `releaseNote(note, false)`.
   Rekaman yang dimainkan dengan sustain ON tetap berbunyi berbeda saat diputar ulang.
2. **Replay tidak mengisi `currentlyPressedRef`.** Pengguna dan replay bisa berebut
   nada yang sama; melepas salah satu akan mematikan suaranya. Visualizer ini akan
   membuat cacat ini **lebih kelihatan**, bukan memperbaikinya.

Juga di luar cakupan: playback MIDI, auto-scroll ke nada yang berbunyi, kontrol
kecepatan, loop, dan persistensi rekaman.

---

## 5. Verifikasi

**Yang bisa saya buktikan:** `npm run typecheck` (exit 0) dan pemeriksaan berkas hasil
`npm run build` — memastikan aturan CSS dan logika geometri bertahan setelah minifikasi.

**Yang tidak bisa saya buktikan:** **sinkronisasi audio-visual.** Repo ini tidak punya
jalur verifikasi browser (tidak ada Playwright/Puppeteer/vitest, dan `firefox --headless`
menghasilkan screenshot kosong). Klaim "kotak mengenai garis tepat saat nada berbunyi"
**harus** dinilai pengguna di browser sungguhan.

Skenario uji manual yang harus dijalankan pengguna:

1. Rekam 4 nada berurutan dengan jeda berbeda-beda (pendek, panjang, pendek, panjang).
2. Tekan Replay → kotak harus jatuh dengan **panjang berbeda** sesuai durasi tiap nada.
3. Perhatikan satu nada saja: bunyinya harus terdengar **tepat saat** tepi bawah kotaknya
   menyentuh garis hit, bukan sebelum atau sesudah.
4. Biarkan lagu berjalan 30 detik lebih → sinkronisasi **tidak boleh** makin melenceng
   di akhir (ini yang membuktikan perbaikan dari `setTimeout`).
5. Rekam akor (3 nada bersamaan) → kotak harus muncul sejajar pada ketinggian sama.
6. Uji nada tuts hitam (mis. C#5) → kotaknya harus **menyilang di perbatasan** dua kolom,
   sejajar dengan tuts hitamnya.
7. Geser keyboard horizontal saat replay → kotak harus tetap sejajar dengan tutsnya.

---

## 6. Global Constraints

- Tidak ada `git commit` otomatis oleh AI agen.
- Menggunakan TypeScript (`.ts` / `.tsx`).
- Satu branch per fitur (aturan repo): usulan `feat/falling-notes-visualizer`.
