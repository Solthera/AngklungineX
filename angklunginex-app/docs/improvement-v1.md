# Improvement v1 — Analisis Performa Load Frontend

Analisis penyebab lambatnya load aset & model angklung pada
`angklunginex-app` yang di-hosting via **Cloudflare Pages**
(`angklunginex.farelfirdaus.site`).

Metode: pengukuran langsung terhadap situs live (curl timing + response
header) dan pembedahan isi berkas biner (GLB, WAV). Semua angka di dokumen
ini adalah **hasil ukur**, kecuali yang ditandai *(estimasi)*.

---

## Ringkasan — Total Unduhan Pengunjung Baru ≈ 19 MB

| Aset | Ukuran | Waktu unduh terukur | Kompresi |
|---|---:|---:|---|
| `angklung.glb` | **10.1 MB** | **24–34 detik** | ❌ tidak ada |
| 14× `.wav` | **4.4 MB** | ~14 detik @322 KB/s | ❌ tidak ada |
| HDR `preset="city"` | **1.5 MB** | ~2 detik | — (eksternal) |
| handsign `.webp` | 570 KB | — | — |
| JS bundle | ~2 MB | — | — |

Load model angklung yang lambat **bukan** disebabkan Cloudflare. Angka
24–34 detik bersifat reproduktif (diuji 3×: 24s, 26s, 33s) dan konsisten
dengan ukuran berkas 10 MB pada throughput ~400 KB/s.

---

## Daftar Masalah

### M1. 🔴 GLB 10.1 MB — seluruhnya geometri tanpa kompresi

Pembedahan `app/assets/models/angklung.glb`:

| Isi | Ukuran | % |
|---|---:|---:|
| Geometri `FLOAT32` (vertex) | **9.48 MB** | 94% |
| Indeks `USHORT` | 0.22 MB | 2% |
| Tekstur (2 PNG) | 0.37 MB | 4% |
| JSON glTF | 0.07 MB | <1% |
| **Total** | **10.13 MB** | |

Jumlah: **310.664 vertex / 536.812 triangle**, 35 mesh, 58 material.

Extension kompresi yang dicek — **tidak ada satu pun**:

```
KHR_draco_mesh_compression   → TIDAK ADA
EXT_meshopt_compression      → TIDAK ADA
KHR_mesh_quantization        → TIDAK ADA
KHR_texture_basisu           → TIDAK ADA
image/png (tekstur mentah)   → YA
```

**Diagnosis:** byte-nya habis di geometri (94%), bukan tekstur. 536K triangle
untuk satu alat angklung tidak proporsional — indikasi ekspor scan/CAD tanpa
proses *decimation*. Strategi "kompres tekstur" tidak akan menolong di sini.

### M2. 🔴 Cache-Control salah — aset ber-hash tidak di-cache

Header respons live:

| Aset | `Cache-Control` | `cf-cache-status` | Akibat |
|---|---|---|---|
| `.glb` | `public, max-age=0, must-revalidate` | **DYNAMIC** | dilempar ke origin, **nol caching** |
| `.wav` | `public, max-age=0, must-revalidate` | **DYNAMIC** | tiap reload unduh ulang |
| `.js` / `.css` | `public, max-age=14400` | MISS | hanya 4 jam, tanpa `immutable` |
| `.webp` | `public, max-age=14400` | MISS | idem |

`DYNAMIC` berarti Cloudflare **tidak meng-cache berkas tersebut di edge sama
sekali** — setiap permintaan diteruskan ke origin.

Penyebab: **tidak ada `public/_headers`**. Isi `public/` hanya `favicon.ico`
dan `angklung.png`, sehingga Cloudflare Pages memakai default-nya.

**Ini penyebab gejala "kadang lambat, kadang tidak":** `max-age=14400` membuat
seluruh bundle di-*refetch* setiap 4 jam, sementara `.glb` dan `.wav` **selalu**
ke origin (DYNAMIC). Persepsi kecepatan jadi bergantung pada cache state
browser dan edge POP mana yang melayani.

### M3. 🔴 `useGLTF.preload()` di module scope

`app/components/3D/AngklungModel.tsx:139`

```ts
useGLTF.preload(angklungModelUrl)
```

Dipanggil di *module scope*, sehingga unduhan 10 MB dimulai begitu modul
dievaluasi — sebelum canvas terlihat. Digabung dengan M6 membuat three.js +
GLB berada tepat di critical path render awal.

### M4. 🟠 Audio WAV 32-bit float stereo — boros 23×

Format berkas (`app/assets/angklung-14-nada/*.wav`):

```
tag=3 (IEEE float)  44100 Hz  2 ch  32-bit  durasi=0.94 s
```

Kualitas mastering untuk sampel 0.94 detik. Total 14 berkas = **4.63 MB**.

Selain itu `app/hooks/useAngklungAudio.ts:38-44` membuat seluruh 14 berkas
dengan `new Audio(); preload = 'auto'` saat mount — 4.4 MB terunduh meski
pengguna tidak pernah memicu satu nada pun.

### M5. 🟠 HDR environment 1.5 MB dari CDN pihak ketiga

`app/features/angklunginex/components/AngklungScene.tsx:19`

```tsx
<Environment preset="city" />
```

`preset="city"` memetakan ke `potsdamer_platz_1k.hdr` (1.5 MB) yang diambil dari:

```
https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/
```

CDN eksternal ini di luar Cloudflare — tidak ikut ter-cache/teroptimasi, dan
`raw.githack.com` dikenal lambat serta rawan rate-limit.

### M6. 🟠 Tidak ada code-splitting pada scene 3D

Tidak ditemukan satu pun `React.lazy` / `Suspense` di seluruh `app/`
(diverifikasi via pencarian). Akibatnya three.js + `AngklungScene` +
`AngklungModel` semuanya di-*eager import* dan berada di critical path.

### M7. 🟡 GLB duplikat 10 MB yang tidak terpakai

```
dfffc6389b82823a7792b21dd71208d9  app/assets/models/angklung.glb
dfffc6389b82823a7792b21dd71208d9  app/assets/models/Model.glb
```

Kedua berkas **byte-identik** (md5 sama). `Model.glb` tidak direferensikan di
mana pun dalam kode — 10 MB mati yang menggemukkan build context Docker.
Tidak ikut terkirim ke pengguna, tetapi tetap sia-sia.

### M8. 🟡 Sisa konfigurasi usang

`tsconfig.json` masih meng-`include` path dari folder yang sudah tidak ada:

```json
"../angklunginex-apps/src/components/3d/AngklungModel.tsx"
```

### Catatan: gzip/brotli tidak menolong GLB & WAV

Dikonfirmasi tidak ada `content-encoding` pada `.glb` dan `.wav` — dan itu
**memang sudah benar**. Keduanya format biner yang sudah padat, sehingga
kompresi transfer tidak akan memberi penghematan berarti. Yang menolong GLB
adalah *decimation* + meshopt/Draco, bukan gzip.

---

## Solusi

### S1. Decimate mesh GLB — dampak terbesar

Target: 536K triangle → ~15–30K. Untuk model alat musik, 15K sudah mulus.

```bash
npx @gltf-transform/cli simplify \
  app/assets/models/angklung.glb \
  app/assets/models/angklung-simplified.glb \
  --ratio 0.03 --error 0.001
```

Perkiraan hasil *(estimasi, berbasis scaling ukuran)*:

| Triangle | Estimasi GLB | Waktu load @400 KB/s |
|---|---:|---:|
| 536K (sekarang) | 10.1 MB | **24–34 s** |
| 54K (10%) | ~1.1 MB | ~2.7 s |
| 16K (3%) | ~0.35 MB | **~1 s** |
| 5K (1%) | ~0.15 MB | ~0.4 s |

### S2. Tambah `public/_headers`

Semua nama berkas sudah ber-hash konten (`angklung-BxmtjF1E.glb`,
`Do-(C)-BAJ63vNS.wav`), sehingga aman di-cache selamanya.

Buat `public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Efek: kunjungan kedua dan seterusnya menjadi instan, dan Cloudflare ikut
meng-cache di edge (tidak lagi `DYNAMIC`).

> Ini memperbaiki M2 sekaligus — perubahan paling murah dengan dampak besar.

### S3. Kompresi geometri — meshopt atau Draco

Setelah decimation, kompres lagi:

```bash
npx @gltf-transform/cli optimize \
  app/assets/models/angklung.glb \
  app/assets/models/angklung-optimized.glb \
  --compress meshopt --simplify 0.03
```

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| **meshopt** (`EXT_meshopt_compression`) | decode cepat (WASM), ukuran turun ~5–10× | — |
| **Draco** | lebih kecil lagi | decode lebih lambat |

Tambahan: **quantization** (`KHR_mesh_quantization`, POSITION/NORMAL/TEXCOORD
→ 16-bit) menghemat ~50% lagi.

### S4. Konversi audio ke Opus / MP3

```bash
for f in app/assets/angklung-14-nada/*.wav; do
  ffmpeg -i "$f" -ac 1 -c:a libopus -b:a 96k "${f%.wav}.opus"
done
```

| Format | Total 14 berkas | Rasio |
|---|---:|---:|
| WAV 32-bit float stereo (sekarang) | 4.63 MB | 1× |
| WAV 16-bit mono | 1.16 MB | 4× |
| **Opus 96k mono** | **~0.2 MB** | **~23×** |

Disertai perubahan perilaku di `useAngklungAudio.ts`: jangan `preload='auto'`
untuk seluruh 14 nada saat mount. Muat secara *lazy* saat nada pertama
dipicu. Dengan begitu 4.6 MB tidak perlu diunduh sama sekali sampai pengguna
benar-benar memainkan nada.

### S5. Tangani HDR environment

`AngklungScene.tsx:19`. Pilihan, dari yang paling hemat:

1. **Hapus** `<Environment>` — scene sudah punya `ambientLight` +
   `directionalLight` (`AngklungScene.tsx:17-18`). Hemat 1.5 MB penuh.
2. **Unduh HDR-nya, taruh lokal** di `app/assets/` → ikut terlayani Cloudflare
   + ter-cache immutable (perlu S2 lebih dulu).
3. Gunakan environment map custom berukuran kecil.

### S6. Perbaiki strategi loading 3D

- Pindahkan `useGLTF.preload()` keluar dari module scope; panggil setelah
  komponen ter-mount.
- *Code-split* `AngklungScene` dengan `React.lazy` + `Suspense`, tampilkan
  skeleton selagi menunggu.

Dengan ini shell halaman tampil lebih dulu, aset 3D menyusul. Dampak pada
*time-to-first-paint* signifikan karena three.js + GLB keluar dari critical path.

### S7. Optimasi render (bonus)

Pertimbangkan `frameloop="demand"` pada `<Canvas>` (`AngklungScene.tsx:12-16`)
untuk menghemat CPU/baterai saat tidak ada animasi berjalan.

### S8. Bersihkan sisa

```bash
rm app/assets/models/Model.glb   # duplikat byte-identik, tidak direferensikan
```

Hapus juga entri path usang di `tsconfig.json` (M8).

---

## Perkiraan Hasil Akhir

| | Sekarang | Setelah |
|---|---:|---:|
| GLB | 10.1 MB | ~0.15–0.35 MB |
| Audio | 4.63 MB | ~0.2 MB |
| HDR | 1.5 MB | 0 (dihapus) / 1.5 MB lokal ter-cache |
| **Total unduhan pertama** | **~19 MB** | **~0.5–1 MB** |
| **Waktu load GLB (terukur)** | **24–34 s** | **~0.5–1 s** |
| Kunjungan berikutnya | refetch (DYNAMIC) | instan (immutable) |

> Angka kolom "Setelah" adalah **estimasi** berbasis scaling ukuran, bukan
> hasil ukur. Yang sudah diverifikasi langsung: S2 (header cache — terbukti
> `DYNAMIC`) dan S8 (berkas duplikat — md5 identik).

---

## Urutan Pengerjaan yang Disarankan

1. **S1 + S2** — dua ini saja sudah memangkas ~90% waktu load.
2. **S8** — pembersihan murah, hilangkan 10 MB mati.
3. **S4 + S5** — audio dan HDR.
4. **S3, S6, S7** — polish.

---

## Status

Dokumen ini berisi **analisis saja** — belum ada perubahan kode yang
dilakukan. Semua temuan bersumber dari pemeriksaan langsung terhadap situs
live dan berkas di repositori pada 2026-09-10.

### Update 2026-09-11 — S1 dikerjakan (hasil ukur)

S1 dikerjakan di branch `perf/dedup-decimate-glb`. Temuan lapangan mengubah
pendekatan dokumen ini: 83.3% byte GLB ternyata **14× geometri byte-identik**
(md5 sama) untuk unit angklung, bukan "geometri terlalu padat" semata.
Pipeline akhir:

```
dedup + simplify (--ratio 0.1 --error 0.001)
```

Tanpa meshopt/Draco/quantize (dijelaskan di bawah). Hasil **terukur**:

| | Sebelum | Sesudah |
|---|---:|---:|
| Ukuran `angklung.glb` | 10.62 MB | **654 KB** (93.8% ↓) |
| Triangle | 536,812 | 9,706 |
| Mesh | 35 | 7 |
| Accessor | 239 | 35 |
| Material | 58 | 6 |

Kontrak yang diverifikasi byte-level terhadap GLB asli: **35 nama node identik,
transform T/R/S identik (diff=0), `Material.018` & `Bamboo` tetap ada**, dan
parse headless via `three-stdlib` GLTFLoader (loader yang dipakai drei) sukses
menghasilkan 14 node `G-Object001`..`G-Object018`.

Catatan untuk pembaca dokumen ini:

- **`--ratio 0.03` di S1 asli tidak berlaku.** `simplify` berjalan pada mesh
  unik *setelah* dedup (36,778 tri), bukan pada 536K total. `0.1` = ~3,700 tri
  per unit angklung; total akhir 9,706 tri. Angka `0.03` (≈ target 15K) di
  dokumen ini mengukur hal yang berbeda.
- **meshopt sengaja dihindari.** `meshopt` di gltf-transform memanggil
  `quantize()`, yang membakar skala mesh ke node (skala node naik ~15.36×).
  Itu mematahkan animasi `AngklungModel.tsx` (hardcode `pivotOffsetY=0.5`).
  Karena itu tidak pakai kompresi mesh sama sekali — 654 KB sudah cukup.
- **Verifikasi visual di browser belum dilakukan** (tidak ada headless browser
  di repo). Yang terverifikasi: kontrak node/transform/material + parse. Yang
  perlu mata manusia: 14 angklung tetap berayun saat nada dipicu.
- `Model.glb` (duplikat 10 MB, M7/S8) belum dihapus — di luar scope S1.
