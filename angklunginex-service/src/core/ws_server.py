"""
WebSocket inference server.

Browser kirim frame sebagai base64 JPEG → proses MediaPipe + model
→ balas JSON: {"label": "do", "confidence": 0.92}
             atau {"label": null, "confidence": 0.0}  (tidak ada tangan)

Jalankan via main.py, bukan langsung.
"""

import asyncio
import base64
import json
import os
import pickle
import numpy as np
from collections import deque, Counter

import cv2
import websockets

try:
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    try:
        from mediapipe.python.solutions import drawing_utils as mp_draw
        from mediapipe.python.solutions import hands as mp_hands_solutions
        _has_solutions = True
    except ImportError:
        _has_solutions = False
except ImportError:
    import mediapipe as mp
    _has_solutions = True


def _normalize_landmarks(landmarks):
    lms = landmarks.landmark if hasattr(landmarks, "landmark") else landmarks
    coords = np.array([(lm.x, lm.y, lm.z) for lm in lms])
    translated = coords - coords[0]
    max_dist = np.max(np.linalg.norm(translated, axis=1))
    if max_dist == 0:
        return None
    return list((translated / max_dist).flatten())


def _load_model(base_dir):
    path = os.path.join(base_dir, "models", "model_kodaly_v2.pkl")
    with open(path, "rb") as f:
        return pickle.load(f)


def make_handler(model, conf_threshold=0.60, smoothing_frames=7):
    """Closure — tiap koneksi WS dapat state smoothing sendiri."""

    using_tasks_api = not _has_solutions
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    if using_tasks_api:
        _base_opts = mp_python.BaseOptions(
            model_asset_path=os.path.join(base_dir, "models", "hand_landmarker.task")
        )
        _opts = vision.HandLandmarkerOptions(
            base_options=_base_opts,
            num_hands=1,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        detector = vision.HandLandmarker.create_from_options(_opts)
    else:
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    async def handler(websocket):
        history = deque(maxlen=smoothing_frames)
        conf_history = deque(maxlen=smoothing_frames)

        print(f"[ws] client terhubung: {websocket.remote_address}")
        try:
            async for message in websocket:
                # Decode base64 JPEG → numpy frame
                try:
                    img_data = base64.b64decode(message)
                    arr = np.frombuffer(img_data, np.uint8)
                    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                    if frame is None:
                        continue
                except Exception:
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                row = None

                if using_tasks_api:
                    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                    result = detector.detect(mp_img)
                    if result.hand_landmarks:
                        row = _normalize_landmarks(result.hand_landmarks[0])
                else:
                    result = hands.process(rgb)
                    if result.multi_hand_landmarks:
                        row = _normalize_landmarks(result.multi_hand_landmarks[0])

                if row is None:
                    history.clear()
                    conf_history.clear()
                    await websocket.send(json.dumps({"label": None, "confidence": 0.0}))
                    continue

                probs = model.predict_proba(np.array([row]))[0]
                idx = np.argmax(probs)
                history.append(model.classes_[idx])
                conf_history.append(probs[idx])

                if len(history) < smoothing_frames:
                    await websocket.send(json.dumps({"label": None, "confidence": 0.0}))
                    continue

                label, _ = Counter(history).most_common(1)[0]
                conf = float(np.mean(conf_history))

                if conf >= conf_threshold:
                    await websocket.send(json.dumps({"label": label, "confidence": round(conf, 3)}))
                else:
                    await websocket.send(json.dumps({"label": None, "confidence": round(conf, 3)}))

        except websockets.exceptions.ConnectionClosedOK:
            pass
        finally:
            print(f"[ws] client putus: {websocket.remote_address}")
            if not using_tasks_api:
                hands.close()

    return handler


async def run(host="localhost", port=8765, base_dir=None):
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model = _load_model(base_dir)
    handler = make_handler(model)
    print(f"[ws] server jalan di ws://{host}:{port}")
    async with websockets.serve(handler, host, port):
        await asyncio.Future()  # jalan selamanya
