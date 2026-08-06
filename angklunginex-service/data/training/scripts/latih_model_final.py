import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle

# =========================
# KONFIGURASI
# =========================
NAMA_FILE_CSV = 'dataset_combine.csv'
NAMA_MODEL_OUTPUT = 'model_kodaly_final.pkl'

print(f"Membaca dataset dari '{NAMA_FILE_CSV}'...")

# =========================
# 1. LOAD DATASET
# =========================
df = pd.read_csv(NAMA_FILE_CSV)

X = df.drop('nada', axis=1)
y = df['nada']

print(f"Total data: {len(df)}")
print(f"Kelas nada: {y.unique()}")

# =========================
# 2. SPLIT DATA
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"Data latih: {len(X_train)}")
print(f"Data uji  : {len(X_test)}")

# =========================
# 3. GRID SEARCH SVM
# =========================
print("\nMelakukan GridSearchCV...")

param_grid = {
    'C': [5, 10, 50, 100],
    'gamma': ['scale', 0.01, 0.005],
    'kernel': ['rbf']
}

grid = GridSearchCV(
    SVC(probability=True),
    param_grid,
    cv=3,
    n_jobs=-1,
    verbose=2
)

grid.fit(X_train, y_train)

best_model = grid.best_estimator_

print("\nParameter terbaik:")
print(grid.best_params_)

# =========================
# 4. EVALUASI MODEL
# =========================
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n==============================")
print(f"Akurasi Model: {accuracy * 100:.2f}%")
print("==============================\n")

print("Classification Report:")
print(classification_report(y_test, y_pred))

# =========================
# 5. SIMPAN MODEL
# =========================
with open(NAMA_MODEL_OUTPUT, 'wb') as f:
    pickle.dump(best_model, f)

print(f"\nModel berhasil disimpan sebagai '{NAMA_MODEL_OUTPUT}'")
