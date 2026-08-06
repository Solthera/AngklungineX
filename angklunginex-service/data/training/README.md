# Training Data & Pipeline

Folder untuk data latih dan skrip training model SVM (14 kelas nada angklung).

## Struktur

```
data/training/
├── README.md
├── scripts/     # pipeline: buat dataset, training, deteksi
├── datasets/    # *.csv hasil ekstraksi landmark (21 titik x, y, z = 63 fitur)
├── videos/      # Dataset_Video_Kodaly/ — video mentah per orang & nada
└── artifacts/   # hasil: model *.pkl, gestur_14.names, confusion_matrix
```

## Isi

| Kelompok | File | Fungsi |
|---|---|---|
| `scripts/` | `buat_dataset_multi.py` | Ekstrak landmark dari video → CSV per orang |
| | `latih_model_v2.py` | Training SVM 14 kelas (GridSearch + augmentasi) → `model_kodaly_v2.pkl` |
| | `latih_model_final.py` | Training versi sederhana (9 kelas) |
| | `jalankan_deteksi.py` | Deteksi pakai model (versi lama) |
| `datasets/` | `dataset_combine.csv` | **Dataset utama 14 nada** (21.5k baris) — input training |
| | `dataset_clean.csv` | Tanpa augmentasi |
| | `dataset_augmented.csv` | 3x augmentasi noise |
| | `dilla/eka_mesin/fadhli/melvina/rainova/yuddha.csv` | Per orang |
| `videos/` | `Dataset_Video_Kodaly/<orang>/*.mp4` | Video mentah 9 nada |
| `artifacts/` | `model_kodaly_v2.pkl` | **Model terbaru 14 kelas** (98% akurasi) |
| | `gestur_14.names` | Label 14 nada (harus cocok model) |
| | `model_kodaly_final.pkl` | Model lama 9 kelas |
| | `confusion_matrix_v2.png` | Hasil evaluasi |

## Retrain Model

```bash
cd angklunginex-service

# 1. (Opsional) tambah data video baru, lalu regenerate CSV:
#    .venv/bin/python data/training/scripts/buat_dataset_multi.py

# 2. Training (GridSearch SVC, ~15-20 menit di CPU)
.venv/bin/python data/training/scripts/latih_model_v2.py

# 3. Deploy hasil ke models/ (dipakai main.py)
.venv/bin/python deploy_model.py
```

Script `latih_model_v2.py` path-nya relatif ke struktur di atas, jadi bisa
dijalankan dari mana pun (pakai `BASE_DIR`). Output model + names + confusion
matrix otomatis masuk `artifacts/`.

## Catatan

- Semua CSV pakai format 64 kolom: `nada` + 21×(x,y,z) landmark.
- `fa'` dibuang saat training (14 kelas final).
- Model lama pakai sklearn 1.1; retrain dengan sklearn ≥1.3 → tanpa warning unpickle.
- Data video/CSV di-`.gitignore` (regenerable), skrip tetap di-track.
