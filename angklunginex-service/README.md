# AngklungineX Service

Backend Python untuk **camera tracking** — mendeteksi gestur tangan (Kodály hand-sign) via MediaPipe, mengklasifikasikan jadi 14 nada angklung dengan model SVM, lalu mengirim hasil ke **Arduino Mega 2560** yang menggerakkan solenoid/central lock angklung.

Membaca tangan → membedah → hasilnya disalurkan ke Arduino (melalui serial) → angklung berbunyi.

---

## 1. Arsitektur Umum

```
         Kamera                    OpenCV/MediaPipe              SVM (14 kelas)
┌────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────┐
│ Webcam / bawaan    │──▶│ Hand landmark (21 titik)   │──▶│ model_kodaly_v2.pkl   │
│ (~/dev/video*)     │    │ overlay 63 fitur          │    │ klasifikasi nada       │
└────────────────────┘    └───────────────────────────┘    └──────────┬────────────┘
                                                                     │  map_label()
                                                                     ▼
┌────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────┐
│ Arduino Mega 2560  │◀──│ Serial ("do\n")           │◀──│ ArduinoSender          │
│ SerialControl.ino  │    │ via pyserial (9600 ba/Dis)│    │ + debounce 300ms      │
└────────────────────┘    └───────────────────────────┘    └───────────────────────┘
        │  strikeNote()
        ▼
  14× solenoid/central lock → angklung berbunyi
```

**Alur lengkap:** kamera → MVC → landmark → normalisasi → SVM 14 nada → mapping label → serial → Arduino → solenoid.

---

## 2. Struktur Proyek

```
angklunginex-service/
├── main.py                       # Entry point CLI (argparse)
├── app.py                        # (Opsional) server WebSocket ke frontend Three.js
├── deploy_model.py               # Salin hasil training artifacts/ → models/
├── requirements.txt              # Dependensi PIP
├── README.md
│
├── models/                       # 🟢 DIPAKAI RUNTIME
│   ├── model_kodaly_v2.pkl       #   Model SVM 14 kelas (98% akurasi)
│   ├── model_kodaly_v2.pkl.bak   #   Backup model lama (otomatis dari deploy)
│   ├── gestur_14.names           #   Label 14 nada (harus cocok model)
│   └── hand_landmarker.task      #   MediaPipe hand landmarker (v1.0.0+)
│
├── arduino/                      # 🟢 Sketsa Arduino (upload ke Mega)
│   ├── SerialControl_AngklungineX.ino  # ⭐ SKETCH UTAMA tracking
│   ├── Lagu_AngklungineX.ino     # Autoplayer lagu (Indonesia Raya dll)
│   └── mapping_pin.ino           # Alat tes 14 central lock (kirim angka 1-14)
│
├── src/
│   └── core/
│       └── detector.py           # 🟢 Loop kamera + klasifikasi gesture
│   └── arduino/
│       └── serial_controller.py  # 🟢 Deteksi port + mapping label → serial
│
└── data/training/                # (Data regenerable, di-.gitignore)
    ├── datasets/                 # *.csv hasil ekstraksi landmark
    ├── videos/                   # Dataset_Video_Kodaly/ (video mentah)
    ├── artifacts/                 # model hasil training, names, confusion_matrix
    └── scripts/                   # pipeline training (buat dataset, train, detect)
```

Legend: 🟢 kapak di runtime, 🟠 upload ke hardware, ⚪ opsional, 📦 data/tooling.

---

## 3. Setup Lingkungan

```bash
# 1. Virtual env
cd angklunginex-service
python3 -m venv .venv
source .venv/bin/activate

# 2. Dependensi
pip install -r requirements.txt
```

`requirements.txt`:
```
opencv-python   # webcam, frame, overlay
mediapipe       # hand landmarker (1.0.0+)
scikit-learn    # model SVM (unpickle + predict)
pyserial        # komunikasi serial → Arduino
numpy           # array / fitur
pandas          # training dataset
seaborn         # confusion matrix (training)
```

> **Catatan mediapipe:** versi `1.0.0+` API-nya berubah. `detector.py` otomatis:
> - bila ada `mediapipe.tasks` → pakai **Tasks API** (butuh `hand_landmarker.task`)
> - bila versi lama (`0.10.x`) → pakai **Solutions API** (`mp.solutions.hands`)
>
> `detector.py` otomatis fallback, jadi dua-duanya jalan.

---

## 4. Menjalankan

```bash
# Jalankan tracking (pilih kamera otomatis)
python main.py

# Force serial port (agar hasil dikirim ke Arduino)
python main.py --port /dev/ttyACM0
python main.py --port COM5        # Windows

# Paksa kamera tertentu (tanpa prompt)
python main.py --camera 1 --port /dev/ttyACM0
```

**Argumen CLI (`main.py`):**

| Flag | Default | Fungsi |
|------|---------|--------|
| `--port <device>` | `None` | port serial Arduino; tanpa ini hasil HANYA ditayangkan |
| `--camera <int>` | auto | index kamera; tanpa ini prompt pilih kamera |

**Kontrol saat window terbuka:**
| Tombol | Fungsi |
|--------|--------|
| `ESC` | keluar (loop berhenti + cleanup kamera/serial) |
| `SPACE` | pause/resume tracking |
| klik **X** pada window | keluar (cek `WND_PROP_VISIBLE`) |

---

## 5. Alur Deteksi (`detector.py`)

Urutan di dalam `main_loop()`:

1. **Load model** — `models/model_kodaly_v2.pkl` (validasi: kelas vs `gestur_14.names`).
2. **Inisialisasi Arduino** — `ArduinoSender(port)`. `None` → tak tersambung, skip kirim.
3. **Inisialisasi MediaPipe** — Tasks API / Solutions API (auto-detect).
4. **Pilih kamera** — `--camera` atau `pick_camera()`.
5. **Loop frame:**
   - flip frame → RGB
   - `hands.process()` → hand landmarks
   - `normalize_landmarks()` → 21×(x,y,z) relatif wrist, dinormalisasi → 63 fitur
   - `model.predict_proba()` → probabilitas tiap kelas
   - **Temporal smoothing** — deque 7 frame, majority vote (Counter)
   - **Trigger** — rata-rata confidence ≥ `CONF_THRESHOLD` (0.60) → kirim ke Arduino (+ isolasi)

**Threshold & konstanta di `detector.py`:**
```python
CONF_THRESHOLD    = 0.60   # min confidence untuk trigger
SMOOTHING_FRAMES  = 7      # jumlah frame majority-vote
COOLDOWN_DETIK    = 0.3    # debounce antar kirim
SERIAL_BAUD       = 9600
```

### Normalisasi landmark

```python
coords = [(x,y,z) untuk 21 landmark]         # koordinat mentah
terjemah = coords - wrist_coords            # jadikan relatif ke pergelangan (landmark[0])
max_dist = max(||terjemah||)                # skala jarak
result = terjemah / max_dist                # 63 fitur ternormalisasi
```

Kernel untuk membedah shape jar matrices dengan shifts/warna — membuat model robust terhadap jarak/ukuranHand.

### Temporal smoothing (majority vote)

Daripada output 1 frame (berisik), ambil 7 frame terakhir:
```python
history   = deque(maxlen=7)   # label prediksi per frame
conf_hist = deque(maxlen=7)   # confidence per frame
# bila penuh -> Counter(history).most_common(1) -> majoriti
# conf = rata-rata conf_history
```
Menghilangkan jitter/tremor pada gestur tetap.

---

## 6. Kirim ke Arduino (serial_controller.py)

### Deteksi port otomatis (`find_port()`)
1. Baca file `com_port.txt` (bila ada) — port eksplisit.
2. `serial.tools.list_ports.comports()` — cari deskripsi berisi `"Arduino"`/`"Mega"`.
3. Kembalikan `None` bila tidak ketemu → Arduino skip.

### Mapping label → command Arduino (`LABEL_MAP`)

Model klasifikasi pakai label **pendek**, Arduino pakai **nama produk**. Ini penting karena label beda format.

| Label model | Command Arduino | Central lock |
|-------------|-----------------|--------------|
| `do`        | `do`            | 11 |
| `do'`       | `do_atas`       | 5 |
| `re`        | `re`            | 12 |
| `re'`       | `re_atas`       | 6 |
| `mi`        | `mi`            | 13 |
| `mi'`       | `mi_atas`       | 7 |
| `fa`        | `fa`            | 14 |
| `fa#`       | `fa#`           | 1 |
| `sol`       | `sol`           | 2 |
| `sol_bawah` | `sol_bawah`     | 8 |
| `la`        | `la`            | 3 |
| `la_bawah`  | `la_bawah`      | 9 |
| `ti`        | `ti`            | 4 |
| `ti_bawah`  | `ti_bawah`      | 10 |

`map_label()` — terjemahkan, `None` bila label tak dikenal / kosong (mis. `"Tidak ada tangan"`).

### Debounce + kirim (`send()`)

```python
now = int(time.time()*1000)
if cmd == last_note and (now - last_time) < debounce_ms:  # 300ms
    return False                                          # skip duplikat
ser.write((cmd + "\n").encode())
ser.flush()
last_note, last_time = cmd, now
```

- Hemat: tidak kirim naada yang sama berulang terlalu cepat (tremor).
- Bila Arduino tidak terkonektesi → `send()` return False, skip — **tidak crash**.

---

## 7. Wiring Arduino

Sketch utama: `arduino/SerialControl_AngklungineX.ino`.

Wiring DOC: `docs/wiring-angklung.md` — tabel central lock → pin Arduino Mega.

### Central lock (2 pin `{IN1, IN2}` per aktuator)

| Central lock | Pin IN1 | Pin IN2 | Nada |
|:---:|:---:|:---:|:---:|
| 1  | 49 | 47 | fa# |
| 2  | 45 | 43 | sol |
| 3  | 41 | 39 | la |
| 4  | 37 | 35 | ti |
| 5  | 33 | 31 | do_atas |
| 6  | 29 | 27 | re_atas |
| 7  | 25 | 23 | mi_atas |
| 8  | 48 | 46 | sol_bawah |
| 9  | 44 | 42 | la_bawah |
| 10 | 40 | 38 | si_bawah |
| 11 | 36 | 34 | do |
| 12 | 32 | 30 | re |
| 13 | 28 | 26 | mi |
| 14 | 24 | 22 | fa |

### Sketches yang mana

| Sketch | Fungsi | Kapan pakai |
|--------|--------|-------------|
| **`SerialControl_AngklungineX.ino`** | Baca nama nada dari serial → pukul solenoid | ⭐ **UTAMA** — kombinasi dengan `main.py` |
| `mapping_pin.ino` | Tes/posn: kirim angka 1-14 → pukul aktuator | debug sinyal / cek wiring |
| `Lagu_AngklungineX.ino` | Autoplayer (main lagu mandiri) | test suara tanpa kamera |

Sketch utama terima command per baris (di-`\n`), `cmd.trim()`, lalu `cariNote()` → central lock index.

> Catatan: sketch lain yang di folder `Arc-1` (MQTT/WiFi/Firmata/autoplayer lama) bukan bagian dari flow tracking — evolusi proyek, tidak diflash untuk use case ini.

---

## 8. Retraining Model

### Pipeline
```
data/training/videos/  (video mentah)
   → data/training/scripts/buat_dataset_multi.py  → datasets/*.csv
   → data/training/scripts/latih_model_v2.py      → artifacts/model_kodaly_v2.pkl
   → deploy_model.py                              → models/
```

### Alur lengkap
```bash
cd angklunginex-service

# (opsional) tambah video baru di data/training/videos/Dataset_Video_Kodaly/<orang>/
# lalu regenerate CSV dari video:
.venv/bin/python data/training/scripts/buat_dataset_multi.py

# Training GridSearch SVC (14 kelas, ~15-20 menit CPU)
.venv/bin/python data/training/scripts/latih_model_v2.py

# Deploy hasil → models/bakal dipakai main.py
.venv/bin/python deploy_model.py
```

`latih_model_v2.py` melakukan:
1. Gabung dataset (filter `fa'`).
2. GridSearch `C` + `gamma` (rbf, 5-fold).
3. Augmentasi (noise kecil ×2).
4. Train final + evaluasi.
5. Simpan `model_kodaly_v2.pkl` + `gestur_14.names` → `artifacts/`.

`deploy_model.py` — backup model lama `.bak`, salin baru ke `models/`, verifikasi 14 kelas.

### Dataset
- Format: 64 kolom `nada` + 21×(x, y, z) landmark.
- `dataset_combine.csv` ~21.5k baris, kelas 14 (minus `fa'`).
- Akurasi model terbaru: **98.16%** (holdout 20%).

---

## 9. WebSocket bridge (app.py — opsional)

`app.py` = contoh server WebSocket untuk kirim trigger ke **frontend Three.js** (`ws://localhost:8765`).

- Bukan bagian dari alur camera→serial utama.
- `await kirim_trigger(angklung_id, intensity)` — panggil dari pipeline bila mau visualisasi 3D paralel.
- **Bukan** diintegrasikan ke `detector.py` (perlu wiring manual bila dimau).

```bash
pip install websockets
python app.py
```

---

## 10. Dependensi (`requirements.txt`)

| Paket | Peran |
|-------|-------|
| opencv-python | capture kamera, frame, overlay |
| mediapipe | hand landmark (video tracking) |
| scikit-learn | model SVM (predict/pickle) |
| pyserial | serial → Arduino |
| numpy | landmark arrays, normalisasi |
| pandas | dataset training |
| seaborn | confusion matrix |

---

## 11. Troubleshooting umum

| Masalah | Solusi |
|---------|--------|
| `mp.solutions` tidak ada | mediapipe v1.0.0 → otomatis pakai Tasks API (butuh `hand_landmarker.task`) |
| warning `InconsistentVersionWarning` (SVC 1.1.2) | retrain dengan sklearn ≥1.3 → hilang |
| kamera tidak terdeteksi | cek `/dev/video*`; pakai `--camera N` |
| hasil hanya tampil tidak tekan angklung | **wajib `--port`** / pastikan port arduino terbenben |
| `Port serial tidak ditemukan` | flash sketch `SerialControl`, cek kabel, `--port` eksplisit |
| lagut / deteksi salah | naikkan `CONF_THRESHOLD`, tambah data video, retrain |

---

## 12. Ukuran & ignition

- `models/`, `src/`, `arduino/`, scripts `deploy_model.py` → **di-track git**.
- `data/training/{videos,datasets,artifacts}/*.csv/*.pkl/*.mp4` → di-`.gitignore` (regenerable, ±688M).
- `.venv/`, `__pycache__/` → di-`.gitignore`.