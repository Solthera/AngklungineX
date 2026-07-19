# Task: Yuddha Wastu Pramukha (Lead / Mentor)

Prioritas utama: **Hardware dulu, lalu Web Paralel dengan bimbingan anggota lain.**

---

## 🔴 PRIORITAS 1 — Fix Hardware (Minggu 1)

### Task 1.1: Perbaiki 3 Central Lock yang Rusak

**Langkah:**
1. Buka casing dan cek secara visual: kabel putus? solder lepas? solenoid macet?
2. Test pake multimeter (Reisya bisa bantu):
   - Ukur resistansi kumparan solenoid (normal: ~10-30 ohm)
   - Ukur output pin L293D untuk channel yang rusak
3. Coba pindah solenoid yang rusak ke channel L293D lain yang kerja
   - Kalau pindah channel -> solenoid jalan = L293D rusak
   - Kalau tetep gak jalan = solenoid rusak
4. Ganti komponen yang rusak (solenoid/L293D)

**File referensi:**
- `Arc-1\Arduino\Lagu_AngklungineX\Lagu_AngklungineX.ino` — pin mapping 14 motor (baris 17-30)
- `Arc-1\AngklungineX\GUI Angklung\controller.py` — cara kontrol motor via PyFirmata

### Task 1.2: Test dengan `check_sound()`

Buka `Lagu_AngklungineX.ino`, uncomment `check_sound()` di loop(), upload ke Arduino.
Jalankan: semua 14 nada harus bunyi bergantian 600ms.

---

## 🔴 PRIORITAS 2 — Firmware Arduino Arc-2 (Minggu 1)

### Task 2.1: Buat firmware serial parser (bareng Adinda)

**Apa ini:** Firmware yang gantikan peran PyFirmata.
- Arduino dengerin Serial, terima command `"SOL1_ON\n"` atau `"DO2_OFF\n"`
- Langsung kontrol L293D tanpa perantara Python
- Latensi lebih rendah, no Python dependency

**Template sudah disiapkan di:** `Arc-2\reference\arduino_firmware_arc2\angklunginex_serial.ino`

**Testing:** Buka Serial Monitor → kirim `SOL1_ON` → motor 1 bunyi

**Prosedur:**
1. Jelaskan kodenya ke Adinda baris per baris
2. Biarkan Adinda yang ngetik ulang/coba-coba
3. Review & approve sebelum upload ke hardware asli

---

## 🟡 PRIORITAS 3 — Web App (Minggu 1-2)

### Task 3.1: Inisialisasi project web

**Arsitektur (dari ARC-2/docs/ARCHITECTURE.md):**
```
angklunginex-web/
├── index.html
├── manifest.json       ← PWA
├── service-worker.js   ← offline cache
├── css/
│   └── style.css       ← styling by Fauzan
├── js/
│   ├── app.js          ← router + init
│   ├── serial.js       ← Web Serial API wrapper
│   ├── freemode.js     ← Free Play logic
│   ├── rhythm.js       ← Rhythm engine
│   └── learning.js     ← Learning mode
├── charts/             ← JSON lagu
└── assets/
```

**Langkah awal:**
1. Buat `index.html` — shell kosong dengan header + 3 tombol mode
2. Buat `serial.js` — wrapper connect/disconnect/send command via Web Serial API
3. Buat `freemode.js` — 14 tombol nada, tap → kirim NOTE_ON → release → NOTE_OFF

**Starter files sudah disediakan di:** `Arc-2\reference\web_starter\`

### Task 3.2: Implementasi Free Play Mode

- 14 tombol nada (susunan piano: sol rendah - mi tinggi)
- Connect USB via tombol "Connect"
- Tap tombol → Arduino bunyi
- Release → mati

---

## 🟢 PRIORITAS 4 — Review & Integrasi

### Task 4.1: Review dataset baru Farel
Cek apakah label di `gestur_baru.names` sudah cocok dengan 14 nada hardware.

### Task 4.2: Retrain model SVM bareng Farel
Setelah dataset terkumpul, jalankan `train_model.py` bareng Farel, evaluasi akurasi.

### Task 4.3: Bimbing anggota lain
- Coding Arduino bareng Adinda (Task 2.1)
- Arah wiring bareng Reisya (Task 1.1)
- Ngajar frontend dasar ke Fauzan (nanti setelah UI design jadi)
