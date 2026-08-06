#!/usr/bin/env python3
"""Salin hasil training (model_kodaly_v2.pkl + gestur_14.names)
dari data/training/artifacts/ ke models/ biar dipakai runtime.

Jalankan SETELAH latih_model_v2.py selesai:
    python deploy_model.py
"""
import os
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE, "data", "training", "artifacts")
DST_DIR = os.path.join(BASE, "models")

FILES = ["model_kodaly_v2.pkl", "gestur_14.names"]


def main():
    os.makedirs(DST_DIR, exist_ok=True)
    for f in FILES:
        src = os.path.join(SRC_DIR, f)
        dst = os.path.join(DST_DIR, f)
        if not os.path.exists(src):
            print(f"SKIP: {f} belum ada (training belum selesai?)")
            continue
        # backup model lama
        if f == "model_kodaly_v2.pkl" and os.path.exists(dst):
            bak = dst + ".bak"
            shutil.copy2(dst, bak)
            print(f"Backup lama -> {bak}")
        shutil.copy2(src, dst)
        print(f"Deploy: {f} ({os.path.getsize(dst)/1024:.0f} KB)")

    # verifikasi 14 kelas cocok
    if os.path.exists(os.path.join(DST_DIR, "gestur_14.names")):
        with open(os.path.join(DST_DIR, "gestur_14.names")) as f:
            n = [l.strip() for l in f if l.strip()]
        print(f"gestur_14.names: {len(n)} kelas -> {n}")


if __name__ == "__main__":
    main()