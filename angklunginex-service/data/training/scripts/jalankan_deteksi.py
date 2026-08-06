import cv2
import mediapipe as mp
import pickle
import numpy as np
import serial
import time
import pandas as pd
from collections import deque
import threading

# ==============================
# PREPROCESSING
# ==============================
def preprocess_landmarks(hand_landmarks):
    x = np.array([lm.x for lm in hand_landmarks])
    y = np.array([lm.y for lm in hand_landmarks])
    z = np.array([lm.z for lm in hand_landmarks])

    x -= x[0]
    y -= y[0]
    z -= z[0]

    scale = np.sqrt(x[12]**2 + y[12]**2 + z[12]**2)
    if scale != 0:
        x /= scale
        y /= scale
        z /= scale

    return np.concatenate([x, y, z])

# ==============================
# KONFIGURASI
# ==============================
NAMA_MODEL = 'model_kodaly_final.pkl'
PORT_ARDUINO = 'COM4'
BAUDRATE = 9600

CONF_THRESHOLD = 0.60 
COOLDOWN = 0.5         
CONF_BUFFER = deque(maxlen=5)

# ==============================
# SERIAL & MODEL
# ==============================
ser = None
arduino_connected = False
try:
    ser = serial.Serial(PORT_ARDUINO, BAUDRATE, timeout=0.1)
    time.sleep(2)
    ser.flush()
    arduino_connected = True
    print("Arduino Berhasil Terhubung")
except Exception as e:
    print(f"Arduino Gagal Terhubung: {e}")

with open(NAMA_MODEL, 'rb') as f:
    model = pickle.load(f)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# ==============================
# FUNGSI SERIAL ASYNC
# ==============================
def send_serial_async(ser_obj, command, label):
    try:
        if ser_obj and ser_obj.is_open:
            ser_obj.reset_output_buffer()
            ser_obj.write(command)
            print(f">>> KIRIM: {label}")
    except:
        pass

# ==============================
# LOOP UTAMA
# ==============================
cap = cv2.VideoCapture(0)
last_sent_time = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        hand = results.multi_hand_landmarks[0]
        mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)

        try:
            features = preprocess_landmarks(hand.landmark)
            data = pd.DataFrame([features], columns=model.feature_names_in_)
            
            prediksi_raw = model.predict(data)[0]
            prob = model.predict_proba(data)[0]
            confidence = np.max(prob)

            CONF_BUFFER.append(confidence)
            avg_conf = np.mean(CONF_BUFFER)
            label = prediksi_raw.upper().replace(" ", "_")

            # ==========================================
            # LOGIKA KOREKSI BERDASARKAN GAMBAR REFERENSI
            # ==========================================
            wrist = hand.landmark[0]
            thumb_tip = hand.landmark[4]
            index_mcp = hand.landmark[5]
            
            # 1. Deteksi Jempol (Untuk FA Gambar 4)
            # Menghitung jarak horizontal jempol terhadap telapak
            thumb_width = abs(thumb_tip.x - index_mcp.x)

            # 2. Logika MI vs FA (Gambar 3 vs 4)
            # MI (Gambar 3) kepalan rapat, FA (Gambar 4) jempol keluar
            if "MI" in label or "FA" in label:
                if thumb_width > 0.18: # Ambang batas jempol menjulur
                    label = "FA"
                else:
                    label = "MI"

            # 3. Logika DO vs DO_TINGGI (Gambar 1 vs 7)
            # Dibedakan berdasarkan posisi pergelangan tangan di layar
            if "DO" in label:
                if wrist.y < 0.45: # Jika tangan berada di area atas frame
                    label = "DO_TINGGI"
                else:
                    label = "DO"
            # ==========================================

            # Visualisasi
            color = (0, 255, 0) if avg_conf > CONF_THRESHOLD else (0, 165, 255)
            cv2.putText(frame, f"{label} {avg_conf*100:.1f}%", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

            # Pengiriman ke Arduino
            current_time = time.time()
            if avg_conf > CONF_THRESHOLD and (current_time - last_sent_time > COOLDOWN):
                cmd_map = {
                    "DO": b'1', "RE": b'2', "MI": b'3', "FA": b'4',
                    "SOL": b'5', "LA": b'6', "SI": b'7', "DO_TINGGI": b'8'
                }
                cmd = cmd_map.get(label)
                if cmd and arduino_connected:
                    threading.Thread(target=send_serial_async, args=(ser, cmd, label), daemon=True).start()
                    last_sent_time = current_time

        except Exception as e:
            print(f"Error: {e}")
    else:
        CONF_BUFFER.clear()

    cv2.imshow("Deteksi Kodaly Sesuai Referensi", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()
if ser: ser.close()