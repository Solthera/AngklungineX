# AngklungineX — Materi Presentasi PowerPoint

> Dokumen ini berisi materi lengkap untuk pembuatan slide presentasi
> **AngklungineX: Robot Angklung Interaktif Berbasis Deep Learning dan
> Computer Vision dengan Deteksi Nada Real-Time untuk Pelestarian Budaya**
>
> Program: PKM-KC (Program Kreativitas Mahasiswa — Karsa Cipta) 2025
> Institusi: Institut Teknologi Nasional Bandung

---

## Slide 1: Sampul / Cover

**Judul:**
AngklungineX
Robot Angklung Interaktif Berbasis Deep Learning dan Computer Vision
dengan Deteksi Nada Real-Time untuk Pelestarian Budaya

**Tim PKM-KC 2025:**
- Rainova Rahaniawan (152023007)
- Shandy Handika (152021188)
- Melvina Cheda Rismayanta (152023175)
- Yuddha Wastu Pramukha (152024058)

**Dosen Pembimbing:**
Muhammad Ichwan, Ir., M.T.

**Logo:**
Institut Teknologi Nasional Bandung

**Subtitle:**
Harmoni Dunia dari Indonesia

---

## Slide 2: Pengertian / Penjelasan Produk

### Apa itu AngklungineX?

**AngklungineX** adalah robot angklung cerdas yang dapat dimainkan secara
interaktif melalui **isyarat tangan (Kodaly Hand Sign)** menggunakan kamera,
dan dapat merespons **input audio** secara real-time (dalam pengembangan).

### Konsep Utama

- **Angklung fisik** (14 nada) dipasang pada rangka robot
- **Aktuator Central Lock** memukul tabung angklung secara otomatis
- **Kamera** membaca gestur tangan pemain
- **AI (SVM)** menerjemahkan gestur menjadi nada
- **Website + Mobile App** untuk monitoring dan kendali

### Perbedaan AngklungineX vs Sistem Lain

| Fitur | AngklungineX | Robot Angklung Konvensional |
|-------|-------------|----------------------------|
| Interaksi | Dua arah (gestur → bunyi) | Satu arah (hard-coded) |
| Biaya | Rendah (webcam saja) | Mahal (Kinect/sensor khusus) |
| AI | MediaPipe + SVM | Tidak ada AI |
| Real-time | Ya (67.5 ms latensi) | Terbatas |
| Monitoring | IoT (daya, suhu) | Tidak ada |

---

## Slide 3: Latar Belakang

### Masalah

1. **Ancaman Punahnya Budaya**
   - Angklung diakui UNESCO sebagai Warisan Budaya Takbenda (2010)
   - Regenerasi pemain angklung semakin menurun
   - Generasi muda kurang tertarik pada alat musik tradisional

2. **Keterbatasan Sistem yang Ada**
   - Robot angklung yang ada bersifat **statis (hard-coded)**
   - Hanya memutar lagu yang sudah diprogram
   - Tidak ada interaksi dua arah dengan pengguna
   - Solusi berbasis Kinect mahal dan tidak aksesibel

3. **Kesenjangan Teknologi**
   - Penelitian HGR (Hand Gesture Recognition) maju pesat
   - Namun belum ada yang mengintegrasikannya ke robot angklung dengan biaya rendah

### Solusi: AngklungineX

- Robot angklung yang bisa **melihat** gestur tangan
- Biaya rendah (hanya perlu webcam standar)
- Menggabungkan **Computer Vision** + **IoT** dalam satu sistem
- Media pembelajaran interaktif untuk generasi digital

---

## Slide 4: Cara Kerja

### Alur Sistem (Hand Gesture Mode) — **Ini adalah jalur utama**

```
Pemain memberi gestur tangan Kodaly
              │
              ▼
     Kamera menangkap gambar tangan
              │
              ▼
     MediaPipe → 21 Landmark Tangan (x, y, z)
              │
              ▼
     Pre-processing (normalisasi koordinat)
              │
              ▼
     SVM Classifier (RBF kernel, akurasi 95%)
              │
              ▼
     Klasifikasi Nada (Do/Re/Mi/Fa/Sol/La/Si/Do')
              │
              ▼
     Kirim perintah via USB Serial (PyFirmata) ke Arduino Mega
              │
              ▼
     Motor Driver L293D → Central Lock → Tabung Angklung berbunyi
```

**Latensi total: ~67.5 ms**

### Alur Sistem (Audio Mode — Future)

```
Pemain menyanyikan/memainkan nada
              │
              ▼
     Mikrofon menangkap audio
              │
              ▼
     CREPE Pitch Detection (CNN-based) → **Belum diimplementasikan**
              │
              ▼
     Estimasi frekuensi → Mapping ke nada angklung
              │
              ▼
     Robot memainkan nada yang sesuai
```

### Alur Web App

```
Pengguna menekan tombol nada di website
              │
              ▼
     POST /send-note ke Laravel backend
              │
              ▼
     Web Serial API → Arduino langsung (via browser)
     Atau MQTT → ESP32 (eksperimental, tidak stabil)
```

---

## Slide 5: Diagram Blok

### Diagram Blok Sistem Keseluruhan

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ANGKLUNGINEX SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │   INPUT LAYER     │    │  PROCESSING      │    │  OUTPUT      │  │
│  │                   │    │  LAYER           │    │  LAYER       │  │
│  ├───────────────────┤    ├──────────────────┤    ├──────────────┤  │
│  │ • Kamera (Webcam) │───►│ • MediaPipe      │───►│ • Arduino    │  │
│  │ • Website Button  │    │   Hands          │    │   Mega       │  │
│  │ • Sensor INA219   │    │ • SVM (RBF)      │    │ • Motor      │  │
│  │                   │    │ • Laravel        │    │   Driver     │  │
│  │                   │    │ • PyFirmata      │    │   L293D      │  │
│  │                   │    │ • MongoDB        │    │ • Central    │  │
│  │                   │    │                  │    │   Lock (14)  │  │
│  └───────────────────┘    └──────────────────┘    │ • Angklung   │  │
│                                                    │   Tubes (14) │  │
│                                                    └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Diagram Blok Elektronik

```
                         Power Supply 12V 30A
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Step Down LM2596       Motor Driver
              (→ 5V untuk Mega)       L293D (×4)
                    │                     │
                    ▼                     ▼
             Arduino Mega 2560     Central Lock ×14
                    │                     │
                    │           ┌─────────┴──────────┐
                    │           │                    │
              ESP32 (sensor)  Angklung Tubes (14)
                    │
              MQTT/ESP-NOW (opsional)
                    │
              Mobile / Web Dashboard
```

---

## Slide 6: Hasil Pengujian

### Performa Sistem

| Parameter | Hasil |
|-----------|-------|
| Akurasi Klasifikasi Gestur | 95% (8 gestur) |
| Latensi Sistem Rata-rata | 67.5 ms |
| Target Latensi | <200 ms ✓ |
| Metode Klasifikasi | SVM RBF + GridSearchCV |

### Kendala

- Gestur **DO** dan **FA** sering salah klasifikasi (data training kurang)
- Dataset baru 8 dari 14 gestur

---

## Slide 7: Rencana Pengembangan

### Tahap 1: Dasar (Sudah Tercapai) ✓
- [x] Prototipe mekanik dengan Central Lock (14 aktuator)
- [x] Arduino Mega standalone dengan lagu terprogram (7 lagu)
- [x] Python GUI hand tracking (8 nada, SVM, akurasi 95%)
- [x] Laravel web app dengan tombol nada
- [x] Mobile app (Main Bebas, Mode Belajar, Auto Play)
- [x] Power monitoring dengan INA219
- [x] Database MongoDB untuk logging

### Tahap 2: Peningkatan (Sedang Dikerjakan)
- [ ] Dataset gestur tangan untuk 14 nada dengan variasi lebih banyak
- [ ] Fix model SVM untuk DO dan FA (data imbalance)
- [ ] Integrasi hand tracking 14 nada penuh
- [ ] UI web yang lebih baik (real-time, animasi)

### Tahap 3: Audio & AI (Rencana)
- [ ] Implementasi CREPE pitch detection
- [ ] Integrasi audio input (mikrofon → deteksi nada → gerakkan angklung)
- [ ] Source separation (Spleeter/Demucs) untuk pemisahan instrumen
- [ ] Auto-transkripsi musik ke notasi angklung
- [ ] Koreksi nada otomatis (feedback loop)

### Tahap 4: Produksi & Publikasi
- [ ] Pengujian latensi sistem < 200ms
- [ ] Uji coba dengan pengguna (siswa/guru seni)
- [ ] Pengujian ketahanan (1 jam operasi kontinu)
- [ ] Publikasi artikel ilmiah
- [ ] Dokumentasi dan panduan pengguna

---

## Slide 8: Timeline / Jadwal Kegiatan

### Jadwal PKM-KC (4 Bulan)

| No | Kegiatan | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 |
|----|----------|:-------:|:-------:|:-------:|:-------:|
| 1 | Perancangan AngklungineX | ████████ | | | |
| 2 | Pengujian AngklungineX | | ████████ | ████████ | |
| 3 | Evaluasi | | | ████████ | ████████ |
| 4 | Penyusunan Laporan Akhir | | | | ████████ |

### Capaian 2025

| Milestone | Status |
|-----------|--------|
| 14-note hardware + Central Lock | ✓ Tercapai |
| Arduino song player (7 lagu) | ✓ Tercapai |
| Hand tracking 8 nada (95% akurasi) | ✓ Tercapai |
| Latensi 67.5 ms | ✓ Tercapai |
| Web app + Mobile app | ✓ Tercapai |
| IoT monitoring (INA219 + MongoDB) | ✓ Tercapai |
| Hand tracking 14 nada | 🔜 Dalam proses |
| Audio processing (CREPE) | 🔜 Rencana |

---

## Slide 9: Anggaran Biaya

### Rekapitulasi Rencana Anggaran (PKM-KC 2025)

| No | Jenis | Jumlah |
|----|-------|--------|
| 1 | Bahan Habis Pakai | Rp4.550.000 (Belmawa) + Rp900.000 (PT) |
| 2 | Sewa dan Jasa | Rp650.000 (Belmawa) + Rp750.000 (PT) |
| 3 | Transportasi | Rp1.400.000 (Belmawa) + Rp350.000 (PT) |
| 4 | Lain-lain | Rp900.000 (Belmawa) |
| | **Total** | **Rp9.500.000** |

### Komponen Utama

| Komponen | Qty | Harga Satuan | Total |
|----------|:---:|:------------:|:-----:|
| Arduino Mega 2560 | 1 | Rp500.000 | Rp500.000 |
| ESP32 Devkit | 1 | Rp195.000 | Rp195.000 |
| Motor Driver L293D | 4 | Rp50.000 | Rp200.000 |
| Central Lock | 16 | Rp35.000 | Rp560.000 |
| Power Supply 12V 30A | 1 | Rp250.000 | Rp250.000 |
| Angklung Nada Dasar | 1 set | Rp950.000 | Rp950.000 |
| Angklung Nada Lanjutan | 1 set | Rp850.000 | Rp850.000 |
| Akrilik + Laser Cutting | 1 | Rp400.000 | Rp400.000 |
| Filamen 3D PLA+ | 1 kg | Rp180.000 | Rp180.000 |
| Sensor INA219 | 1 | Rp50.000 | Rp50.000 |
| Step Down LM2596 | 1 | Rp70.000 | Rp70.000 |

---

## Slide 10: Kodaly Hand Sign

### Metode Kodaly

Metode Kodaly adalah pendekatan pendidikan musik yang menggunakan
**isyarat tangan (hand signs)** untuk merepresentasikan setiap nada.

### Gestur Tangan (7 Nada Dasar + Oktaf)

| Nada | Gestur | Deskripsi |
|------|--------|-----------|
| Do | Kepal tangan | Tangan dikepal, menghadap bawah |
| Re | Telapak terbuka | Tangan terbuka, jari agak miring |
| Mi | Telapak rata | Tangan rata, horizontal |
| Fa | Ibu jari ke bawah | Tangan mengepal, ibu jari ke bawah |
| Sol | Telapak ke bawah | Tangan terbuka, telapak ke bawah |
| La | Telapak ke bawah (jari turun) | Tangan terbuka, jari-jari agak turun |
| Si | Telunjuk ke atas | Tangan mengepal, telunjuk ke atas |

**Catatan:** Sistem Kodály juga mendukung nada kromatis (kres/mol) dengan
variasi gestur khusus, serta pembedaan oktaf berdasarkan posisi vertikal tangan.

### Dataset

Dataset dikumpulkan dalam format CSV (21 landmark × 3 sumbu koordinat).
Bukan gambar mentah — lebih ringan dan cepat diproses.
Target: minimal 100 sample per gesture.

### Kendala yang Ditemukan

- Gestur **DO** dan **FA** sering salah klasifikasi
- Penyebab: data training kurang, gestur mirip
- Solusi: tambah data, latih ulang model

---

## Slide 11: Manfaat & Dampak

### Manfaat

1. **Edukasi**
   - Media pembelajaran angklung interaktif
   - Mengatasi kekurangan instruktur ahli
   - Meningkatkan minat generasi muda

2. **Teknologi**
   - Kontribusi pada Robotika Musik
   - Pengembangan Human-Computer Interaction (HCI)
   - Penerapan AI pada instrumen tradisional

3. **Budaya**
   - Digitalisasi warisan budaya
   - Dokumentasi format modern
   - Revitalisasi minat generasi digital

### Dampak Jangka Panjang

- **Jembatan** antara tradisi dan teknologi
- **Inspirasi** bagi pengembangan alat musik tradisional lainnya
- **Pelestarian** budaya Indonesia yang relevan dengan zaman

---

## Slide 12: Kesimpulan

### Kesimpulan

1. Angklung adalah warisan budaya Indonesia yang sangat berharga
2. AngklungineX menggabungkan **AI, IoT, dan Robotika** untuk pelestarian
3. Sistem bekerja **real-time** dengan akurasi 95% dan latensi 67.5 ms
4. Produk siap dikembangkan menjadi media edukasi interaktif

### Pesan Penutup

> "Melalui angklung, kita dapat belajar tentang sejarah, budaya,
> dan nilai-nilai luhur bangsa Indonesia. Dengan terus melestarikan
> angklung, kita turut menjaga identitas bangsa dan memperkaya
> khazanah budaya dunia."

---

## Slide 13: Terima Kasih

**Terima Kasih**

**AngklungineX**
Harmoni Dunia dari Indonesia

Tim PKM-KC Institut Teknologi Nasional Bandung 2025

*"Dari Indonesia untuk Dunia"*
