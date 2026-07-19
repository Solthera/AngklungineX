# Task: Fauzan Ramadhan (Design — UI Web + 3D Print)

Kamu satu-satunya anak DKV di tim, jadi **semua design dari kamu**.
Gak perlu coding dulu — fokus ke visual dan konsep.

---

## 🔴 PRIORITAS 1 — Design UI Web App (Minggu 1)

Bikin mockup buat web AngklungineX Arc-2.
Bisa pakai **Figma, Canva, atau Adobe XD** — terserah yang kamu kuasai.

### Halaman yang perlu di-design:

#### Halaman 1: Home / Menu Utama
- Judul: "AngklungineX Arc-2"
- Subtitle: "Web-Based Angklung Rhythm Game"
- 3 tombol mode: **Free Play** | **Rhythm Mode** | **Learning Mode**
- Ada logo/icon angklung
- Warna tema: bebas, saran: nuansa Sunda (hitam, putih, aksen emas/batik)
- Font: harus jelas terbaca (jangan font dekoratif untuk tombol)

#### Halaman 2: Free Play
- 14 tombol nada, disusun seperti piano (kiri = rendah, kanan = tinggi)
- Layout: 3 baris
  - Baris 1: Sol Rendah | La Rendah | Ti Rendah
  - Baris 2: Do | Re | Mi | Fa | Fis
  - Baris 3: Sol | La | Ti | Do Tinggi | Re Tinggi | Mi Tinggi
- Tombol Connect USB (atas)
- Ada label nama nada di setiap tombol
- Warna tombol: bedain oktaf (rendah = warna X, sedang = warna Y, tinggi = warna Z)

**Mockup referensi (text):**
```
┌─────────────────────────────────────────┐
│ 🔌 Connect USB           ⚡ Status: OK  │
├─────────────────────────────────────────┤
│                                         │
│ [Mi'] [Re'] [Do']                       │
│ [Ti] [La] [Sol] [Fis] [Fa]              │
│ [Mi] [Re] [Do]                          │
│ [Ti_] [La_] [Sol_]                      │
│                                         │
└─────────────────────────────────────────┘
```

#### Halaman 3: Rhythm Mode (Game)
- 14 lajur (lane) vertikal
- Judul lagu + difficulty
- Score, Combo, Health Bar di atas
- Hit zone di bagian bawah (garis horizontal)
- Catatan jatuh dari atas ke bawah

#### Halaman 4: Learning Mode
- Area instruksi (tulisan "Tunjuk nada DO!")
- 14 tombol nada (sama kayak Free Play)
- Feedback: hijau kalau benar, merah kalau salah
- Progress bar

### Output yang diharapkan:
1. File Figma / Canva (bisa di-share link)
2. Ekspor color palette: `--primary`, `--secondary`, `--bg`, `--text`, dll
3. Ukuran tombol, font size, spacing untuk tiap halaman
4. File PNG mockup untuk referensi coding

---

## 🔴 PRIORITAS 2 — Design 3D Print Wadah Angklung (Minggu 2)

### Desain housing untuk:
- 14 tabung angklung
- 14 central lock solenoid
- 4x L293D motor driver
- Arduino Mega 2560
- Rangka akrilik existing

### Yang perlu dipertimbangkan:
- Bahan: PLA+ (filamen 3D print)
- Setiap solenoid harus tepat di belakang tabung angklung
- Akses untuk penggantian kabel (harus mudah dibuka)
- Ventilasi untuk panas L293D
- Lubang baut untuk mounting ke meja

### Referensi:
- `Arc-1\3D Model\` — lihat desain 3D yang sudah ada dari Arc-1
- Boleh modify desain lama atau bikin baru

---

## 🟡 PRIORITAS 3 — Belajar Frontend Dasar (Minggu 2+)

Nanti setelah design jadi, kamu bakal dibantu Yuddha untuk **implementasi design ke HTML+CSS**.
Tapi untuk sekarang, cukup fokus ke design dulu.

Yang perlu kamu pelajari nanti:
- HTML dasar (div, button, class)
- CSS (warna, font, layout flexbox/grid)

Tapi tenang, itu nanti aja.

---

## Tools yang Bisa Dipakai

| Keperluan | Tools |
|-----------|-------|
| UI Design | Figma (gratis), Canva, Adobe XD |
| 3D Design | Blender (gratis), Fusion 360, Tinkercad |
| Referensi UI | Lihat game rhythm: Guitar Hero, osu!, Muse Dash |

---

Kalau bingung mau mulai dari mana, mulai aja dari **Free Play mockup** — itu yang paling gampang dan paling urgent buat Yuddha coding.
