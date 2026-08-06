import os
os.environ.setdefault("OPENCV_LOG_LEVEL", "ERROR")

import cv2
import pickle
import numpy as np
from collections import deque, Counter
import time

from src.arduino.serial_controller import ArduinoSender

try:
    # Mediapipe Tasks API (newer versions like 1.0.0+)
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    
    # We still need drawing utils which might be missing in some v1.0.0 installs
    # Fallback if missing
    try:
        from mediapipe.python.solutions import drawing_utils as mp_draw
        from mediapipe.python.solutions import hands as mp_hands_solutions
        has_solutions = True
    except ImportError:
        has_solutions = False
except ImportError:
    import mediapipe as mp
    has_solutions = True

def normalize_landmarks(landmarks):
    # Depending on API used, landmark access might differ slightly
    if hasattr(landmarks, 'landmark'):
        lms = landmarks.landmark
    else:
        lms = landmarks
        
    coords = np.array([(lm.x, lm.y, lm.z) for lm in lms])
    wrist_coords = coords[0]
    coords_translated = coords - wrist_coords
    max_dist = np.max(np.linalg.norm(coords_translated, axis=1))
    if max_dist == 0:
        return None
    return list((coords_translated / max_dist).flatten())

def list_cameras(max_test=8):
    """Deteksi index kamera yang bisa dibuka OpenCV.
    Di Linux: kandidat index dari /dev/video*, lalu verifikasi isOpened().
    OPENCV_LOG_LEVEL=ERROR menekan warning C++ pas index kosong."""
    import glob

    if os.path.isdir("/dev"):
        cand = []
        for p in glob.glob("/dev/video*"):
            try:
                cand.append(int(p.rsplit("video", 1)[1]))
            except ValueError:
                pass
    else:
        cand = list(range(max_test))

    available = []
    for i in sorted(cand)[:max_test]:
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available.append(i)
        cap.release()
    return available


def pick_camera():
    """Tanya user pilih index kamera. Pakai 0 bila tak ada input/1 kamera."""
    cams = list_cameras()
    if not cams:
        return None
    if len(cams) == 1:
        print(f"Kamera terdeteksi: index {cams[0]} (satu-satunya)")
        return cams[0]

    print("\nKamera yang terdeteksi:")
    for idx, c in enumerate(cams, 1):
        label = "webcam" if c == 0 else f"kamera {c}"
        print(f"  [{idx}] {label}")
    while True:
        try:
            pilih = input("Pilih kamera [1-" + str(len(cams)) + "]: ").strip()
            if pilih == "":
                return cams[0]
            n = int(pilih)
            if 1 <= n <= len(cams):
                return cams[n - 1]
        except (ValueError, EOFError):
            pass
        print("Input tidak valid. Coba lagi.")


def main_loop(port=None, camera=None):
    # =============== PENGATURAN ===============
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    NAMA_MODEL = os.path.join(BASE_DIR, 'models', 'model_kodaly_v2.pkl')
    CONF_THRESHOLD = 0.60
    SMOOTHING_FRAMES = 7
    COOLDOWN_DETIK = 0.3
    SERIAL_PORT = port
    SERIAL_BAUD = 9600
    # ==========================================

    try:
        with open(NAMA_MODEL, 'rb') as f:
            model = pickle.load(f)
        print(f"Model dimuat: {NAMA_MODEL}")
    except Exception as e:
        print(f"Gagal memuat model: {e}")
        return

    arduino = ArduinoSender(port=SERIAL_PORT, baud=SERIAL_BAUD)

    # Fallback to Task API if old solutions API is missing
    using_tasks_api = not has_solutions
    
    if using_tasks_api:
        print("Menggunakan MediaPipe Tasks API v1.0.0+")
        # Create hands detector using tasks API
        base_options = mp_python.BaseOptions(model_asset_path=os.path.join(BASE_DIR, 'models', 'hand_landmarker.task'))
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5)
        detector = vision.HandLandmarker.create_from_options(options)
    else:
        print("Menggunakan MediaPipe Solutions API")
        mp_hands = mp.solutions.hands
        mp_draw = mp.solutions.drawing_utils
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    # Pilih kamera: argumen eksplisit, atau prompt user
    cam_idx = camera if camera is not None else pick_camera()
    if cam_idx is None:
        print("Tidak ada kamera terdeteksi.")
        return

    cap = cv2.VideoCapture(cam_idx)
    if not cap.isOpened():
        print(f"Gagal membuka kamera index {cam_idx}.")
        return

    history = deque(maxlen=SMOOTHING_FRAMES)
    conf_history = deque(maxlen=SMOOTHING_FRAMES)
    
    last_trigger_time = 0
    last_note_sent = ""
    paused = False

    print("\nTekan ESC untuk keluar, SPACE untuk pause\n")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        
        if not paused:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            hand_detected = False
            final_label = ""
            final_conf = 0.0
            
            if using_tasks_api:
                # Tasks API
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                detection_result = detector.detect(mp_image)
                
                if detection_result.hand_landmarks:
                    for hand_landmarks in detection_result.hand_landmarks:
                        # Draw manually if no draw utils
                        for lm in hand_landmarks:
                            x, y = int(lm.x * w), int(lm.y * h)
                            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
                            
                        row = normalize_landmarks(hand_landmarks)
                        if row is not None:
                            hand_detected = True
            else:
                # Solutions API
                results = hands.process(rgb_frame)
                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                        row = normalize_landmarks(hand_landmarks)
                        if row is not None:
                            hand_detected = True

            if hand_detected and 'row' in locals():
                X = np.array([row])
                probs = model.predict_proba(X)[0]
                pred_idx = np.argmax(probs)
                pred_label = model.classes_[pred_idx]
                pred_conf = probs[pred_idx]
                
                history.append(pred_label)
                conf_history.append(pred_conf)

                if len(history) == SMOOTHING_FRAMES:
                    most_common_label, _ = Counter(history).most_common(1)[0]
                    avg_conf = np.mean(conf_history)
                    
                    final_label = most_common_label
                    final_conf = avg_conf

                    if final_conf >= CONF_THRESHOLD:
                        now = time.time()
                        if arduino.connected and (final_label != last_note_sent or (now - last_trigger_time) > COOLDOWN_DETIK):
                            arduino.send(final_label)
                            last_note_sent = final_label
                            last_trigger_time = now

            if not hand_detected:
                history.clear()
                conf_history.clear()
                final_label = "Tidak ada tangan"
                final_conf = 0.0

            if final_conf >= CONF_THRESHOLD and final_label != "Tidak ada tangan" and final_label != "":
                status_color = (0, 255, 0)
                status_text = f"{final_label} ({final_conf:.0%})"
            elif final_label != "Tidak ada tangan" and final_label != "":
                status_color = (100, 100, 255)
                status_text = f"{final_label} ({final_conf:.0%}) - ragu"
            else:
                status_color = (50, 50, 50)
                status_text = "Menunggu..."

            cv2.rectangle(frame, (0, 0), (w, 60), (30, 30, 30), -1)
            cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, status_color, 2)

            if len(history) > 0:
                hist_text = "Hist: " + " -> ".join(list(history))
                cv2.putText(frame, hist_text, (10, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        else:
            cv2.rectangle(frame, (0, 0), (w, 60), (30, 30, 30), -1)
            cv2.putText(frame, "PAUSED", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 165, 255), 2)

        cv2.imshow("AngklungineX Deteksi", frame)
        key = cv2.waitKey(1)

        # Window ditutup via tombol X -> break (bukan kebuka lagi)
        if cv2.getWindowProperty("AngklungineX Deteksi", cv2.WND_PROP_VISIBLE) < 1:
            break

        if key == 27:
            break
        elif key == 32:
            paused = not paused
            if paused:
                history.clear()
                conf_history.clear()

    cap.release()
    cv2.destroyAllWindows()
    if not using_tasks_api:
        hands.close()
    arduino.close()
