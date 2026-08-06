"""
TRAINING V3 — 3 tahap:
1. Gabung semua data person CSV + dataset_combine → dataset_gabung.csv
2. GridSearch LUAS di dataset_clean.csv — C=0.1..1000, gamma=1..auto, 5-fold
3. Train final di dataset_augmented.csv pakai param terbaik
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
import csv

# Resolve path relatif ke struktur folder (data/training/{scripts,datasets,artifacts})
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../data/training
DATASETS = os.path.join(BASE_DIR, "datasets")
ARTIFACTS = os.path.join(BASE_DIR, "artifacts")


def path_data(name):
    return os.path.join(DATASETS, name)


def path_art(name):
    return os.path.join(ARTIFACTS, name)


# ========== TAHAP 0: Gabung semua data ==========
print("=== TAHAP 0: Gabung semua data person CSV ===")

# Baca dataset utama (dari 4 orang: yuddha, rainova, ihsan, dilla)
df_main = pd.read_csv(path_data("dataset_combine.csv"))
print(f"dataset_combine.csv: {len(df_main)} baris, {df_main['nada'].nunique()} kelas")

# Data tambahan dari orang yang TIDAK ada di video folders
# (bagas = format lm_ compatible, melvina/eka/fadhli = sudah dikonversi)
EXTRA_FILES = ["bagas_clean.csv", "melvina_norm.csv", "eka_norm.csv", "fadhli_norm.csv"]
all_dfs = [df_main]
for fn in EXTRA_FILES:
    p = path_data(fn)
    if not os.path.exists(p):
        print(f"  {fn}: TIDAK DITEMUKAN, skip")
        continue
    df = pd.read_csv(p)
    if len(df.columns) == 64:
        df.columns = ["nada"] + [f"lm_{i}" for i in range(63)]
    all_dfs.append(df)
    print(f"  + {fn}: {len(df)} baris")

df_gabung = pd.concat(all_dfs, ignore_index=True)
df_gabung = df_gabung[df_gabung["nada"] != "fa'"]
print(f"\nTotal gabungan: {len(df_gabung)} baris, {df_gabung['nada'].nunique()} kelas")

# Simpan dataset gabung sementara
df_gabung.to_csv(path_data("dataset_gabung_sementara.csv"), index=False)

# ========== TAHAP 1: GridSearch di dataset gabung (tanpa augmentasi) ==========
print("\n=== TAHAP 1: GridSearch (C=0.1..1000, gamma=1..auto, 5-fold) ===")

labels = df_gabung['nada'].values
Xk = df_gabung.drop('nada', axis=1).values
yk = labels

Xk_train, Xk_test, yk_train, yk_test = train_test_split(
    Xk, yk, test_size=0.2, random_state=42, stratify=yk
)

param_grid = {
    'C': [0.1, 1, 10, 100, 1000],
    'gamma': [1, 0.1, 0.01, 0.001, 'scale', 'auto'],
    'kernel': ['rbf']
}

n_fits = len(param_grid['C']) * len(param_grid['gamma'])
print(f"Total kombinasi: {n_fits}, tiap 5-fold = {n_fits * 5} fit")

grid = GridSearchCV(
    SVC(probability=True, class_weight='balanced'),
    param_grid,
    cv=StratifiedKFold(5, shuffle=True, random_state=42),
    verbose=2,
    n_jobs=-1
)

grid.fit(Xk_train, yk_train)

best_C = grid.best_params_['C']
best_gamma = grid.best_params_['gamma']
print(f"\nParameter terbaik: C={best_C}, gamma={best_gamma}")
print(f"Akurasi GridSearch (5-fold CV): {grid.best_score_ * 100:.2f}%")

# ========== TAHAP 1b: Augmentasi dataset gabung ==========
print(f"\n=== TAHAP 1b: Augmentasi dataset ({len(df_gabung)} baris) ===")
augmented_rows = []
for idx, row in df_gabung.iterrows():
    label = row['nada']
    feats = row.drop('nada').values.astype(np.float64)
    # 2 copy augmented dengan noise kecil
    for _ in range(2):
        noise = np.random.normal(0, 0.005, feats.shape)
        feats_noise = feats + noise
        augmented_rows.append(pd.DataFrame(
            [[label] + list(feats_noise)],
            columns=df_gabung.columns
        ))

df_aug = pd.concat([df_gabung] + augmented_rows, ignore_index=True)
df_aug.to_csv(path_data("dataset_augmented.csv"), index=False)
print(f"Dataset augmented: {len(df_aug)} baris (3x lipat)")

# Simpan dataset clean (tanpa augmentasi)
df_gabung.to_csv(path_data("dataset_clean.csv"), index=False)
print("dataset_clean.csv tersimpan")

# ========== TAHAP 2: Train final di dataset augmented ==========
print(f"\n=== TAHAP 2: Train final di dataset augmented ({len(df_aug)} baris) ===")

X = df_aug.drop('nada', axis=1).values
y = df_aug['nada'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Data latih: {len(X_train)}, Data tes: {len(X_test)}")

print("Training final model...")
final_model = SVC(
    C=best_C, gamma=best_gamma, kernel='rbf',
    probability=True, class_weight='balanced',
    max_iter=-1
)
final_model.fit(X_train, y_train)
print("Selesai!")

# ========== EVALUASI ==========
y_pred = final_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n--- HASIL EVALUASI ---")
print(f"Akurasi: {accuracy * 100:.2f}%")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred, labels=final_model.classes_)
plt.figure(figsize=(14, 12))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=final_model.classes_, yticklabels=final_model.classes_)
plt.title("Confusion Matrix — 14 Kelas (v3)")
plt.ylabel("Actual")
plt.xlabel("Predicted")
plt.tight_layout()
plt.savefig(path_art("confusion_matrix_v2.png"), dpi=150)
print("confusion_matrix_v2.png tersimpan")

print("\n=== AKURASI PER KELAS ===")
report = classification_report(y_test, y_pred, output_dict=True)
for cls in sorted(final_model.classes_):
    recall = report[cls]['recall']
    f1 = report[cls]['f1-score']
    flag = "⚠️" if recall < 0.85 else "✅"
    print(f"  {cls:12s}: recall={recall:.2%} f1={f1:.2%} {flag}")

# ========== SIMPAN ==========
NAMA_MODEL = path_art("model_kodaly_v2.pkl")
NAMA_NAMES = path_art("gestur_14.names")
with open(NAMA_MODEL, "wb") as f:
    pickle.dump(final_model, f)
print(f"\nModel disimpan: {NAMA_MODEL}")

sorted_classes = sorted(final_model.classes_)
with open(NAMA_NAMES, "w") as f:
    f.write("\n".join(sorted_classes))
print(f"Class names: {NAMA_NAMES} ({len(sorted_classes)} kelas)")

# Hapus file sementara
tmp = path_data("dataset_gabung_sementara.csv")
if os.path.exists(tmp):
    os.remove(tmp)
