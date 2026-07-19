# Task: Muhammad Farel Firdaus (Backend Python — Camera Detection)

Role kamu: **ngerjain bagian logic deteksi kamera pake Python**.
Fokus: **bikin dataset berkualitas** biar model SVM bisa deteksi 14 nada dengan akurat.

---

## 🔴 PRIORITAS 1 — Bikin Data Collection Tool (Minggu 1)

### Kenapa perlu tool baru?

Tool yang ada sekarang (`Arc-1\AngklungineX\GUI Angklung\train_model.py`) cuma baca dari file video.
Kita gak tau pas record, apakah tangan ke-deteksi MediaPipe atau tidak.
Akibatnya: banyak video yang landmarknya sedikit atau bahkan tidak terdeteksi sama sekali.

### Yang harus dibuat:

Buat script Python yang:
1. Buka kamera (real-time)
2. Tampilkan landmark MediaPipe di tangan **(biar kelihatan apakah deteksi jalan)**
3. Ada tombol START/STOP record
4. Setiap selesai record, simpan sebagai file video `.mp4`
5. Nama file = nama gesture (misal: `sol_bawah.mp4`)
6. Ada instruksi di layar: "Tunjukin gesture Sol Bawah"

**Template awal sudah disiapkan:** `Arc-2\reference\data_collection_tool.py`

### Cara pakai tool:
```bash
python data_collection_tool.py
```

### Fitur yang harus ada:
- [x] Kamera preview dengan landmark MediaPipe
- [x] Dropdown atau list gesture yang mau direcord
- [x] Tombol REC (spasi atau klik)
- [x] Timer record (30-60 detik)
- [x] Auto-save ke folder `dataset_baru/{nama_orang}/{gesture}.mp4`
- [x] Validasi: record ulang kalau landmark terlalu sedikit

---

## 🔴 PRIORITAS 2 — Record Dataset Baru (Minggu 1)

### Target:
- **14 gesture** × **minimal 3 orang** (Yuddha, Farel, Reisya)
- Durasi: 30-60 detik per gesture per orang
- Variasi: lighting berbeda, jarak tangan beda, angle miring dikit

### 14 gesture yang bener (cocok sama hardware):

| No | Nama | Nada |
|----|------|------|
| 1 | sol_bawah | Sol Rendah |
| 2 | la_bawah | La Rendah |
| 3 | ti_bawah | Ti Rendah |
| 4 | do | Do |
| 5 | re | Re |
| 6 | mi | Mi |
| 7 | fa | Fa |
| 8 | fis | Fis (#) |
| 9 | sol | Sol |
| 10 | la | La |
| 11 | ti | Ti |
| 12 | do_atas | Do Tinggi |
| 13 | re_atas | Re Tinggi |
| 14 | mi_atas | Mi Tinggi |

### Catatan penting:
- **Jangan pakai label `fa'`** — itu tidak ada di hardware 14 nada
- Folder `dataset_baru/` ada di `Arc-1\AngklungineX\GUI Angklung\dataset_baru\`
- Simpan file dengan format: `{nama_gesture}.mp4`

### Cara record yang bener:
1. Duduk dengan pencahayaan cukup (tidak gelap, tidak silau)
2. Tangan kanan facing camera, latar polos
3. Gesture sesuai Kodály Hand Sign
4. Gerakin tangan sedikit (variasi kecil) biar model robust

---

## 🟡 PRIORITAS 3 — Bersihin Label Dataset (Minggu 1)

### Masalah:
File `gestur_baru.names` sekarang isinya:
```
do, do', fa, fa#, fa', la, la_bawah, mi, mi', re, re', sol, sol_bawah, ti, ti_bawah
```
Ada 15 kelas, tapi hardware cuma 14 nada.

### Yang perlu diubah:
- `fa'` → dihapus (gak ada di hardware)
- Mungkin ditambah `fis` kalau belum ada
- Final list: 14 nama yang cocok sama tabel di atas

### Setelah bersihin:
- Update file `gestur_baru.names`
- Update nama file video di folder `dataset_baru/*/`
- Update mapping di controller.py (tugas Yuddha)

---

## 🟢 PRIORITAS 4 — Retrain Model SVM (Minggu 2)

### Langkah:
1. Record dataset baru (Priority 2)
2. Jalankan `train_model.py` (yang udah ada di `Arc-1\AngklungineX\GUI Angklung\`)
3. Cek akurasi: harus minimal 85%
4. Kalau kurang: record data tambahan
5. Save model sebagai `model_baru.pickle`
6. Test di `MainGUI.py` — tunjuk gesture, lihat apakah prediksi bener

---

## Referensi

| File | Lokasi |
|------|--------|
| Train model | `Arc-1\AngklungineX\GUI Angklung\train_model.py` |
| Dataset | `Arc-1\AngklungineX\GUI Angklung\dataset_baru\` |
| Main GUI | `Arc-1\AngklungineX\GUI Angklung\MainGUI.py` |
| Controller (14 nada) | `Arc-1\AngklungineX\GUI Angklung\controller.py` |
