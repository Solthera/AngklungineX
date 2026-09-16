# Improvement v1 — Analisis Performa Load Frontend

Analisis penyebab lambatnya load aset & model angklung pada
`angklunginex-app` yang di-hosting via **Cloudflare Pages**
(`angklunginex.farelfirdaus.site`).

Metode: pengukuran langsung terhadap situs live (curl timing + response
header) dan pembedahan isi berkas biner (GLB, WAV). Semua angka di dokumen
ini adalah **hasil ukur**, kecuali yang ditandai *(estimasi)*.

> **Status per 2026-09-11:** S1, S2, dan S8 sudah dikerjakan dan di-merge ke
> `development`. S3 **dibatalkan** — meshopt/Draco terbukti merusak animasi
> angklung. Sisa: S4, S5, S6, S7, M8. Rincian di [Status](#status).

> **Koreksi penting terhadap analisis awal:** penyebab utama ukuran GLB bukan
> "terlalu banyak triangle", melainkan **83.3% isi berkas berupa 14× geometri
> byte-identik** untuk unit angklung. Lihat bagian [S1](#s1-dedup--simplify-glb--dampak-terbesar--selesai).

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

### S1. Dedup + simplify GLB — dampak terbesar ✅ SELESAI

> **Status:** dikerjakan 2026-09-11 di `perf/dedup-decimate-glb` (merge #6).
> Pendekatan berubah dari rencana awal — baca koreksi di bawah.

#### Koreksi: akar masalahnya bukan jumlah triangle

Rencana awal hanya menyebut "536K triangle terlalu padat". Pembedahan accessor
menunjukkan penyebab utamanya berbeda: **semua 14 mesh `G-Object` punya
geometri byte-identik** (md5 POSITION & indices sama). Satu unit angklung
disimpan 14 kali dalam satu berkas.

| Isi GLB asli | Byte | % |
|---|---:|---:|
| Geometri 14× `G-Object` | 8.85 MB | **83.3%** |
| Geometri lain (Cube/Cylinder) | 1.32 MB | 12.4% |
| 2 tekstur PNG | 0.38 MB | 3.6% |
| JSON + padding | 0.07 MB | <1% |

Artinya `dedup` saja memangkas **~7.84 MB secara lossless**, sebelum satu pun
triangle dibuang. Decimation jadi langkah kedua, bukan yang utama.

#### Pipeline yang dipakai

```bash
npx @gltf-transform/cli@4 optimize \
  app/assets/models/angklung.glb /tmp/angklung-opt.glb \
  --join false --flatten false --instance false \
  --palette false --texture-compress false \
  --compress false \
  --simplify-ratio 0.1 --simplify-error 0.001
```

`--join`/`--flatten` **wajib** dimatikan: keduanya menggabungkan node dan
membakar transform ke geometri, yang akan mematikan animasi per-angklung.
`--palette` juga dimatikan agar nama material tidak digabung.

#### Hasil terukur

| | Sebelum | Sesudah |
|---|---:|---:|
| Ukuran | 10.62 MB | **654 KB** (−93.8%) |
| Triangle | 536,812 | 9,706 |
| Mesh | 35 | 7 |
| Accessor | 239 | 35 |
| Material | 58 | 6 |

Penurunan material 58→6 adalah efek dedup yang **benar**: `Bamboo.001`..`.013`
adalah duplikat konten yang semuanya menunjuk tekstur sama.

#### Kontrak yang dijaga (kode bergantung padanya)

`AngklungModel.tsx` bergantung pada nama node dan nama material di dalam GLB,
sehingga keduanya tidak boleh berubah:

- 35 nama node harus utuh (`G-Object.001`..`.018`; three.js membuang titiknya
  jadi `G-Object001` — sudah disesuaikan kode).
- Transform T/R/S per-node harus identik: 14 node punya skala berbeda
  (0.068 → 0.046) yang membuat tiap tabung berputar di porosnya sendiri.
- `Material.018` dan `Bamboo` direferensikan langsung di JSX dan harus tetap
  ada namanya.

**Verifikasi yang sudah dilakukan:** 35 nama node identik (tidak ada yang
hilang/bertambah), transform T/R/S identik **diff=0 tanpa toleransi**,
`Material.018` & `Bamboo` ada, dan parse headless via `three-stdlib`
GLTFLoader (loader yang dipakai drei) menghasilkan 14 node
`G-Object001`..`G-Object018`.

**Belum diverifikasi:** animasi ayun secara visual di browser. Tidak ada
headless browser di repositori, jadi penilaian ini menunggu pengujian manual
(`npm run dev` → pastikan 14 angklung berayun saat nada dipicu).

> Catatan: `--ratio 0.03` di rencana awal **tidak berlaku** dan tidak dipakai.
> `simplify` berjalan pada mesh unik *setelah* dedup (36,778 tri), bukan pada
> 536K total, sehingga rasio 0.03 berarti sesuatu yang jauh berbeda. Dipakai
> `0.1` = ~3,700 tri per unit angklung — untuk model alat musik itu sudah mulus.

### S2. Tambah `public/_headers` ✅ SELESAI

> **Status:** dikerjakan 2026-09-11 di `perf/assets-cache-headers` (merge #8).

Deployment terkonfirmasi **Cloudflare Pages** (output `build/client`), dan
seluruh 51 berkas di `/assets/` terbukti ber-hash konten
(`angklung-BxmtjF1E.glb`, `Do-(C)-BAJ63vNS.wav`). Karena hash berasal dari isi
berkas, URL tidak akan pernah berubah isinya — aman di-cache selamanya.

Dibuat `public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Pola `/assets/*` sengaja tidak mencakup `favicon.ico` dan `angklung.png`
(berada di root, tanpa hash) — berkas tanpa hash memang tidak aman di-cache
selamanya.

**Verifikasi yang sudah dilakukan:** berkas tersalin ke `build/client/_headers`
saat `npm run build` — lokasi yang dibaca Cloudflare Pages.

**Belum diverifikasi:** perubahan header sebenarnya (`cf-cache-status`
`DYNAMIC` → `HIT`) baru muncul setelah deploy. Cara cek:

```bash
curl -sI https://angklunginex.farelfirdaus.site/assets/angklung-BxmtjF1E.glb \
  | grep -iE "cache-control|cf-cache-status"
```

### S3. Kompresi geometri — meshopt atau Draco ❌ DIBATALKAN

> **Status:** dibatalkan. Rekomendasi di bagian ini **tidak boleh diikuti**.

Rencana awal menyarankan `--compress meshopt` untuk menurunkan ukuran lagi.
Setelah diuji, keduanya bermasalah untuk model ini:

**meshopt merusak animasi.** Command `meshopt` di gltf-transform bukan
kompresi murni — ia memanggil `quantize()` di dalamnya
(`functions/src/meshopt.ts`). Dan `quantize()` **secara sengaja membakar skala
mesh ke node** untuk menormalkan geometri ke rentang [-1,1]
(`functions/src/quantize.ts`, fungsi `transformMeshParents`).

Hasil terukur pada model ini: skala ke-14 node `G-Object` naik **~15.36×**
seragam, translasi bergeser. Itu mematahkan `AngklungModel.tsx` yang
hardcode `pivotOffsetY = 0.5` dengan asumsi skala node asli — angklung akan
berayun meleset dari porosnya. **Tidak error, tapi animasinya rusak.**

**Draco menjaga transform** (terverifikasi diff=0) dan hasilnya lebih kecil
(435 KB vs 654 KB), tetapi:

- Decode lebih lambat, dan `AngklungModel.tsx` akan butuh perubahan untuk
  mengarahkan decoder (drei default mengambil decoder dari CDN `gstatic`).
- Selisih 219 KB tidak sebanding dengan tambahan dependensi eksternal +
  perubahan kode, mengingat target utama (10.6 MB → <1 MB) sudah tercapai
  tanpa kompresi sama sekali.

**Keputusan:** tidak memakai kompresi mesh. 654 KB sudah memadai.

Bukti isolasi langkah (bisect) — hanya `meshopt` yang mengubah transform:

| Langkah | Transform `G-Object` | Ukuran |
|---|---|---:|
| `dedup` | ✅ utuh | 1.35 MB |
| `+ weld` | ✅ utuh | 1.36 MB |
| `+ simplify 0.1` | ✅ utuh | 707 KB |
| `+ meshopt` | ❌ rusak (skala ×15.36) | 473 KB |
| `+ draco` (pengganti) | ✅ utuh | 435 KB |

> Bila kelak tetap ingin kompresi mesh, gunakan **Draco**, bukan meshopt —
> dan pastikan transform node diverifikasi tetap identik.

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

### S8. Bersihkan sisa ✅ SELESAI (sebagian)

> **Status:** penghapusan `Model.glb` dikerjakan 2026-09-11 di
> `chore/remove-duplicate-glb` (merge #7). Entri usang di `tsconfig.json`
> (M8) **belum** dikerjakan.

`Model.glb` dihapus setelah dipastikan tidak direferensikan di kode mana pun
(diverifikasi via `grep` ke seluruh `*.ts/tsx/js/jsx/json/mjs`).

> Koreksi terhadap M7: setelah S1, `Model.glb` **bukan lagi duplikat
> byte-identik** dari `angklung.glb` — ia tersisa sebagai salinan original
> 10 MB. Tetap aman dihapus karena backup-nya ada di riwayat git
> (commit `714dc36` dan branch `development`).

Sisa: hapus entri path usang di `tsconfig.json` (M8).

---

## Hasil Akhir

### Sudah terukur (per 2026-09-11)

| | Sebelum | Sesudah | Catatan |
|---|---:|---:|---|
| Ukuran `angklung.glb` | 10.62 MB | **654 KB** (−93.8%) | S1, hasil ukur |
| Triangle GLB | 536,812 | 9,706 | S1, hasil ukur |
| `Model.glb` duplikat | 10.6 MB | **dihapus** | S8 |
| Aset `/assets/*` | refetch tiap 4 jam / `DYNAMIC` | `immutable` 1 tahun | S2, verifikasi pasca-deploy |
| **Total unduhan pengunjung baru** | **~19 MB** | **~9 MB** | hitungan dari hasil S1 |

### Masih estimasi — belum dikerjakan

| | Sekarang | Target | Item |
|---|---:|---:|---|
| Audio (14× WAV) | 4.63 MB | ~0.2 MB | S4 |
| HDR environment | 1.5 MB | 0 / lokal ter-cache | S5 |
| Waktu load GLB | 24–34 s | ~0.5–1 s | perlu ukur ulang pasca-deploy |
| **Total unduhan pengunjung baru** | **~9 MB** | **~0.5–1 MB** | setelah S4 + S5 |

> Baris "Sudah terukur" adalah hasil ukur langsung terhadap berkas di
> repositori. Baris "Masih estimasi" adalah proyeksi berbasis scaling ukuran,
> bukan hasil ukur. Total unduhan pengunjung baru ~9 MB adalah hitungan
> aritmetika dari hasil S1 (bukan pengukuran jaringan langsung).

---

## Urutan Pengerjaan

### Selesai

1. ✅ **S1** — dedup + simplify GLB (`perf/dedup-decimate-glb`, merge #6)
2. ✅ **S8** — hapus `Model.glb` duplikat (`chore/remove-duplicate-glb`, merge #7)
3. ✅ **S2** — `public/_headers` (`perf/assets-cache-headers`, merge #8)
4. ❌ **S3** — dibatalkan (meshopt merusak animasi; lihat S3)

### Berikutnya

5. **S4** — audio ke Opus + muat secara lazy. **Dampak terbesar yang tersisa**
   (4.63 MB), dan sekarang berkasnya sudah ter-cache immutable berkat S2.
6. **S5** — HDR environment (1.5 MB dari CDN pihak ketiga). Perlu diputuskan:
   hapus, atau lokalkan.
7. **S6** — strategi loading 3D (`preload` di module scope + code-splitting).
8. **S7** — `frameloop="demand"` (bonus).
9. **M8** — bersihkan entri usang di `tsconfig.json` (sisa dari S8).

### Perlu diukur ulang setelah deploy

- Waktu load GLB sebenarnya pada situs live (semula 24–34 s). Target ~1 s.
- Header `cf-cache-status` untuk `/assets/*` (S2) — apakah sudah `HIT`.

> Catatan urutan: S1, S8, dan S2 dikerjakan bercabang. S8 dibuat bercabang dari
> S1, sehingga S1 harus di-merge lebih dulu; S2 independen (bercabang dari
> `development`). Bila mengerjakan S4/S5/S6 selanjutnya, buat branch baru dari
> `development` sesuai aturan satu-branch-per-fitur.

---

## Status

Dokumen ini awalnya murni **analisis** (disusun 2026-09-10 dari pengukuran
langsung terhadap situs live dan berkas di repositori). Sejak 2026-09-11
sebagian solusinya sudah dikerjakan dan merge ke `development`.

### Ringkasan pengerjaan

| Item | Branch | PR | Status |
|---|---|---|---|
| S1 — dedup + simplify GLB | `perf/dedup-decimate-glb` | #6 | ✅ merge |
| S8 — hapus `Model.glb` | `chore/remove-duplicate-glb` | #7 | ✅ merge |
| S2 — `public/_headers` | `perf/assets-cache-headers` | #8 | ✅ merge |
| S3 — kompresi mesh | — | — | ❌ dibatalkan |
| S4, S5, S6, S7, M8 | — | — | ⬜ belum |

### Angka terukur

| | Sebelum | Sesudah | Item |
|---|---:|---:|---|
| `angklung.glb` | 10.62 MB | **654 KB** (−93.8%) | S1 |
| Triangle GLB | 536,812 | 9,706 | S1 |
| `Model.glb` | 10.6 MB | dihapus | S8 |
| Total unduhan pengunjung baru | ~19 MB | **~9 MB** | S1 + S8 |

Audio (4.63 MB) dan HDR (1.5 MB) **belum** dikerjakan, jadi keduanya masih
menyumbang pada angka ~9 MB.

### Tiga hal yang perlu diketahui pembaca

1. **Akar masalah GLB bukan jumlah triangle.** 83.3% isi berkas adalah 14×
   geometri byte-identik. `dedup` (lossless) memangkas ~7.84 MB; decimation
   hanya menyempurnakan. Lihat bagian [S1](#s1-dedup--simplify-glb--dampak-terbesar--selesai).
2. **S3 dibatalkan karena meshopt merusak animasi.** `meshopt` memanggil
   `quantize()`, yang membakar skala mesh ke node (naik ~15.36×) dan
   mematahkan `pivotOffsetY` hardcoded di `AngklungModel.tsx`. Draco aman dan
   lebih kecil (435 KB), tetapi tidak dipakai karena butuh dependensi decoder
   + perubahan kode, sementara target ukuran sudah tercapai.
3. **Dua verifikasi masih menggantung** dan keduanya butuh lingkungan nyata,
   bukan analisis berkas:
   - **Animasi 3D** (S1) — perlu dilihat mata di browser: apakah 14 angklung
     tetap berayun saat nada dipicu. Tidak ada headless browser di repositori.
   - **Header cache** (S2) — efek `immutable` baru terlihat setelah deploy.
     Cek dengan `curl -sI` ke `/assets/*` dan lihat `cf-cache-status`.

### Definisi "terverifikasi" di dokumen ini

- **Terverifikasi** = diukur langsung dari berkas/repositori pada tanggal
  pengerjaan (md5, jumlah accessor, diff transform, isi output build).
- **Belum terverifikasi** = butuh deploy ke Cloudflare Pages atau pengujian
  visual di browser, keduanya di luar jangkauan pemeriksaan berkas.
- **Estimasi** = proyeksi berbasis scaling ukuran, ditandai eksplisit.
