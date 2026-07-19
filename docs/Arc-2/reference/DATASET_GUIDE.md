# Panduan Membuat Dataset Gesture Tangan

## Kenapa Dataset Penting?

Model SVM (Support Vector Machine) belajar dari **contoh**.
Semakin banyak dan bervariasi contohnya, semakin akurat prediksinya.

Sekarang akurasi masih rendah karena dataset terbatas (5 orang × 15 video, kualitas belum optimal).

---

## Cara Kerja Sistem (Sederhana)

```
KAMERA → MediaPipe (deteksi 21 titik tangan) 
       → Normalisasi koordinat 
       → SVM Classifier (membandingkan dengan data training)
       → Prediksi: "Do" / "Re" / "Mi" 
```

---

## Langkah Membuat Dataset yang Baik

### 1. Persiapan

**Yang dibutuhkan:**
- Laptop dengan webcam (resolusi minimal 640×480)
- Pencahayaan yang cukup (tidak gelap, tidak silau)
- Latar belakang polos (tembok putih / hijau)
- Tangan kanan (sistem hanya proses tangan kanan)

**14 Gesture yang harus direkam:**

| No | Nama File | Nada | Posisi Kodály |
|----|-----------|------|---------------|
| 1 | `sol_bawah` | Sol Rendah | Tinju, ibu jari ke atas |
| 2 | `la_bawah` | La Rendah | Tangan terbuka, jari rapat |
| 3 | `ti_bawah` | Ti Rendah | Kepalan, telunjuk lurus ke atas |
| 4 | `do` | Do | Kepalan, ibu jari ke samping |
| 5 | `re` | Re | Jari lurus membentuk sudut |
| 6 | `mi` | Mi | Tangan datar vertikal |
| 7 | `fa` | Fa | Ibu jari ke bawah |
| 8 | `fis` | Fis (#) | Variasi Fa |
| 9 | `sol` | Sol | Tinju, ibu jari ke atas |
| 10 | `la` | La | Tangan terbuka |
| 11 | `ti` | Ti | Telunjuk lurus ke atas |
| 12 | `do_atas` | Do Tinggi | Kepalan, ibu jari ke samping |
| 13 | `re_atas` | Re Tinggi | Jari lurus membentuk sudut |
| 14 | `mi_atas` | Mi Tinggi | Tangan datar vertikal |

> **Catatan:** Untuk bedain oktaf (sol_bawah vs sol), bedanya di posisi tangan relatif terhadap bahu. Sol_bawah di pinggang, sol di dada.

### 2. Proses Record

**Gunakan tool yang sudah dibuat:**
```bash
python Arc-2/reference/data_collection_tool.py
```

**Tool akan:**
1. Minta nama kamu
2. Tunjukin gesture yang harus dibuat
3. Tampilkan real-time landmark MediaPipe (pastikan landmark terlihat!)
4. Kamu pencet SPACE → record 30 detik
5. Otomatis simpan ke folder `dataset_baru/{nama}/{gesture}.mp4`
6. Validasi: kalau landmark kurang dari 10 frame, minta record ulang

**Tips record yang benar:**
- Duduk tegak, kamera setinggi mata
- Tangan kanan di depan dada
- Gerakin tangan sedikit (geser kiri-kanan, maju-mundur) biar model robust
- Jangan keluar frame
- Record 3-5 kali per gesture untuk variasi

### 3. Setelah Record

Jalankan training:
```bash
cd "Arc-1/AngklungineX/GUI Angklung"
python train_model.py
```

Cek akurasinya. Target: **minimal 85%**.

### 4. Cara Record Manual (Alternatif)

Kalau tool-nya belum jadi, bisa record manual:
1. Buka HP/laptop camera
2. Record video 30 detik per gesture
3. Simpan dengan nama: `{gesture}.mp4`
4. Pindahkan ke folder: `dataset_baru/{nama}/{gesture}.mp4`
5. Jalankan `train_model.py`

### 5. Troubleshooting

**Landmark tidak terdeteksi:**
- pencahayaan kurang → tambah lampu
- tangan terlalu jauh/kecil di frame → dekatkan
- tangan terlalu besar → jauhkan
- latar belakang terlalu ramai → cari latar polos

**Akurasi model rendah (< 70%):**
- Kurang data → record lebih banyak variasi
- Label salah → cek nama file video
- Gestur mirip (sol_bawah vs sol) → bedain posisi tangan

**Model prediksi selalu salah:**
- Coba record ulang dengan posisi yang lebih konsisten
- Pastikan hanya tangan kanan yang diproses
- Cek apakah landmark muncul di tool preview
