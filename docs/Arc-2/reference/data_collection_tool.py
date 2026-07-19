"""
AngklungineX Arc-2 — Data Collection Tool

Gunakan tool ini untuk merekam video dataset gesture Kodály Hand Sign.
Tool ini menampilkan real-time landmark MediaPipe agar kamu bisa
memastikan tangan terdeteksi dengan baik sebelum merekam.

Cara pakai:
  python data_collection_tool.py

Persyaratan:
  pip install opencv-python mediapipe numpy
"""

import cv2
import os
import time
from mediapipe import solutions as mps
# ======================== KONFIGURASI ========================

# 14 gesture yang benar (cocok dengan hardware)
GESTURES = [
    "sol_bawah", "la_bawah", "ti_bawah", "do", "re", "mi", "fa", "fis",
    "sol", "la", "ti", "do_atas", "re_atas", "mi_atas"
]

RECORD_DURATION = 30       # detik per gesture
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# ======================== SETUP ========================

# Nama orang (ganti sesuai yang record)
person_name = input("Masukkan nama kamu: ").strip().lower()
if not person_name:
    person_name = "unknown"

# Folder dataset
dataset_dir = os.path.join(os.path.dirname(__file__), "..", "..",
                           "Arc-1", "AngklungineX", "GUI Angklung", "dataset_baru")
person_dir = os.path.join(dataset_dir, person_name)
os.makedirs(person_dir, exist_ok=True)

print(f"\nDataset akan disimpan di: {person_dir}")
print(f"Total gesture: {len(GESTURES)}")
print("Tekan SPACE untuk mulai record, ESC untuk skip gesture\n")
input("Tekan ENTER untuk mulai...")

# ======================== MAIN LOOP ========================

mp_drawing = mps.drawing_utils
mp_hands = mps.hands

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)

if not cap.isOpened():
    print("ERROR: Kamera tidak terbuka!")
    exit()

for gesture_idx, gesture_name in enumerate(GESTURES):
    output_path = os.path.join(person_dir, f"{gesture_name}.mp4")
    
    # Skip if already exists
    if os.path.exists(output_path):
        print(f"[{gesture_idx+1}/{len(GESTURES)}] {gesture_name} — sudah ada, skip")
        continue

    print(f"\n[{gesture_idx+1}/{len(GESTURES)}] Gesture: {gesture_name}")
    print("Tunjukin gesture-nya ke kamera. Tekan SPACE untuk record, ESC untuk skip.")

    # Tunggu input user
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = None
    recording = False
    start_time = 0
    frame_count = 0
    landmark_count = 0
    recording_frames = []
    
    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as hands:
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            display = frame.copy()
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)
            
            # Draw landmarks if detected
            hand_detected = False
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Only process right hand
                    # (handedness checking is optional here)
                    mp_drawing.draw_landmarks(
                        display, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(250, 44, 250), thickness=2, circle_radius=2),
                    )
                    hand_detected = True
            
            # Recording logic
            if recording:
                elapsed = time.time() - start_time
                remaining = RECORD_DURATION - elapsed
                
                if hand_detected:
                    landmark_count += 1
                
                recording_frames.append(frame.copy())
                
                # Status overlay
                cv2.putText(display, f"RECORDING {gesture_name}", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(display, f"Remaining: {int(remaining)}s", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(display, f"Landmark frames: {landmark_count}", (10, 90),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                
                if elapsed >= RECORD_DURATION:
                    recording = False
                    
                    # Check quality
                    if landmark_count < 10:
                        print(f"  PERINGATAN: Hanya {landmark_count} frame dengan landmark! Record ulang?")
                        cv2.putText(display, "TOO FEW LANDMARKS! Press SPACE to redo, ESC to skip",
                                    (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                        cv2.imshow("Data Collection - AngklungineX", display)
                        cv2.waitKey(1500)
                        
                        while True:
                            key = cv2.waitKey(1)
                            if key == 32:  # SPACE — redo
                                recording_frames = []
                                landmark_count = 0
                                start_time = time.time()
                                recording = True
                                break
                            elif key == 27:  # ESC — skip
                                recording_frames = []
                                break
                    else:
                        # Save video
                        print(f"  Saving {len(recording_frames)} frames ({landmark_count} with landmarks)...")
                        h, w = recording_frames[0].shape[:2]
                        out = cv2.VideoWriter(output_path, fourcc, 30.0, (w, h))
                        for f in recording_frames:
                            out.write(f)
                        out.release()
                        print(f"  Saved: {output_path}")
                        break
            else:
                # Preview mode
                cv2.putText(display, f"Gesture: {gesture_name}", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(display, "SPACE = Record | ESC = Skip", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
                if hand_detected:
                    cv2.putText(display, "Tangan terdeteksi ✓", (10, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
                else:
                    cv2.putText(display, "Tangan TIDAK terdeteksi ✗", (10, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1)
            
            cv2.imshow("Data Collection - AngklungineX", display)
            
            key = cv2.waitKey(1)
            if key == 27:  # ESC
                if recording:
                    recording = False
                    recording_frames = []
                    print("  Recording dibatalkan")
                else:
                    print(f"  Gesture {gesture_name} di-skip")
                    break
            elif key == 32 and not recording:  # SPACE — start recording
                recording = True
                start_time = time.time()
                frame_count = 0
                landmark_count = 0
                recording_frames = []
                print(f"  Recording {gesture_name} selama {RECORD_DURATION}s...")

cap.release()
cv2.destroyAllWindows()

print("\n\n===== Selesai! =====")
print(f"Dataset tersimpan di: {person_dir}")
print("Sekarang jalankan train_model.py untuk melatih model baru.")
