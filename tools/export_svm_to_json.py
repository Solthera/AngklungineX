import pickle
import json
import sys
import os

model_path = "C:/Itenas/IWill/AngklungineX/Arc-1/AngklungineX/GUI AngklungineX/model_baru.pickle"
names_path = "C:/Itenas/IWill/AngklungineX/Arc-1/AngklungineX/GUI AngklungineX/gestur_baru.names"
out_dir = "C:/Itenas/IWill/AngklungineX/Arc-2/reference/web_starter/assets/models"

with open(model_path, "rb") as f:
    model = pickle.load(f)

with open(names_path, "r") as f:
    class_names = [line.strip() for line in f.read().split("\n") if line.strip()]

os.makedirs(out_dir, exist_ok=True)

sv = model.support_vectors_.tolist()
dual_coef = model.dual_coef_.tolist()
intercept = model.intercept_.tolist()
gamma = model.gamma if model.gamma != "scale" else 1.0 / model.n_features_in_
n_features = model.n_features_in_
n_classes = len(model.classes_)

model_json = {
    "type": "svm_rbf",
    "kernel": "rbf",
    "gamma": gamma,
    "n_features": n_features,
    "n_classes": n_classes,
    "classes": class_names,
    "class_indices": [int(c) for c in model.classes_],
    "support_vectors": sv,
    "dual_coef": dual_coef,
    "intercept": intercept,
}

out_path = os.path.join(out_dir, "svm_model.json")
with open(out_path, "w") as f:
    json.dump(model_json, f, indent=2)

print(f"Model exported to: {out_path}")
print(f"Classes ({n_classes}): {class_names}")
print(f"Support vectors: {len(sv)}")
print(f"Features: {n_features}")
print(f"Gamma: {gamma}")