# System Architecture

## Overview

**This document describes the Arc-1 (v2) architecture — completed PKM-KC 2025.**
For the Arc-2 architecture (web-based rhythm game), see `../../Arc-2/docs/ARCHITECTURE.md`.

AngklungineX has a modular architecture with multiple control paths
all converging on the actuator hardware. The **primary control path** was
hand gesture recognition over USB Serial. MQTT-based note control was
**experimental/abandoned** — MQTT was used only for optional IoT sensor
data publishing to cloud dashboards.

## Communication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CONTROL PATHS                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PATH 1: Hand Tracking (Python) — PRIMARY                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Webcam   │───►│ MediaPipe│───►│ SVM      │───►│ PyFirmata        │   │
│  │          │    │ Hands    │    │ Classify │    │ Serial (USB)     │   │
│  └──────────┘    └──────────┘    └──────────┘    └────────┬─────────┘   │
│                                                            │             │
│  PATH 2: Standalone Arduino (Pre-programmed songs)          │             │
│  ┌─────────────────────────────────────────────────────────┘             │
│  │  Arduino Mega (Lagu_AngklungineX.ino)                                 │
│  │  7 songs stored in PROGMEM, plays via button/auto                     │
│  └───────────────────────────────────────────────────────────────────────┘
│                                    │
│                                    ▼
│                     ┌──────────────────────────┐
│                     │  Motor Driver L293D (×4)  │
│                     │  (4 chips, 4 channels ea) │
│                     └────────────┬─────────────┘
│                                  │
│                     ┌────────────▼─────────────┐
│                     │  Central Lock ×14         │
│                     │  (Solenoid Actuators)     │
│                     └────────────┬─────────────┘
│                                  │
│                     ┌────────────▼─────────────┐
│                     │  Angklung Tubes ×14       │
│                     │  (Sol rendah - Mi tinggi) │
│                     └──────────────────────────┘
│
│  PATH 3: IoT Monitoring (ESP32) — SECONDARY
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐
│  │ INA219   │───►│ ESP32    │───►│ MQTT Broker      │
│  │ Sensor   │    │          │    │ (optional cloud)  │
│  └──────────┘    └────┬─────┘    └──────────────────┘
│                       │
│                  ESP-NOW (direct peer-to-peer)
│                       │
│                  Secondary ESP32 / Mobile
│
│  PATH 4: Web App (Laravel) — VIRTUAL
│  ┌──────────┐    ┌──────────┐
│  │ Browser  │───►│ Laravel  │
│  │ Click    │    │ Backend  │
│  └──────────┘    └──────────┘
│  (Web Serial API for direct Arduino connection)
│
│  PATH 5: MQTT Note Control — EXPERIMENTAL (ABANDONED)
│  ┌──────────┐    ┌──────────┐    ┌──────────┐
│  │ ESP32    │◄───│ MQTT     │◄───│ Publisher│
│  │ (WiFi)   │    │ Broker   │    │          │
│  └──────────┘    └──────────┘    └──────────┘
│  (Unreliable, copy-paste bugs in firmware)
└──────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Hand Gesture Recognition (Python) — PRIMARY

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Camera | OpenCV (cv2.VideoCapture) | Capture webcam feed |
| Hand Detection | MediaPipe Hands | 21 landmarks per hand |
| Feature Extraction | Custom normalization | Relative coords + flatten + normalize |
| Classification | SVM (scikit-learn, RBF kernel) | Predict note from landmarks |
| GUI | PyQt5 | User interface + camera preview |
| Serial | PyFirmata | Send note to Arduino (USB) |
| Model Tuning | GridSearchCV | Hyperparameter optimization |

### 2. Arduino Mega (Motor Control)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Firmware A | Lagu_AngklungineX.ino | Standalone song player (7 songs) |
| Firmware B | StandardFirmata.ino | PC-controlled via Firmata (v1/v2) |
| Motor Driver | L293D (×4) | Drive Central Lock actuators |
| Actuator | Central Lock (×14) | Strike angklung tubes |
| PWM | analogWrite(70) | Speed control (~70/255) |
| Oscillation | Forward 70ms + Backward 70ms | Creates striking motion |

### 3. Web Application (Laravel)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Laravel 12 + PHP 8.2 | Backend |
| Frontend | Vite + Tailwind CSS | Build pipeline |
| Web Serial API | Browser native | Direct Arduino connection |

### 4. ESP32 (IoT Monitoring)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| WiFi | WiFi.h | Network connectivity |
| MQTT | PubSubClient | Publish sensor data (optional) |
| ESP-NOW | ESP-NOW protocol | Direct peer-to-peer data |
| INA219 | Adafruit_INA219 | Power monitoring (I2C) |
| Note Control MQTT | PubSubClient | **Experimental — not used in production** |

## Note Mapping

### Mapping: String → Pin (Python to Arduino via Firmata) — v1 8-note

| Note String | Motor Array Index | PWM Pin | D1 Pin | D2 Pin |
|------------|:-----------------:|:-------:|:------:|:------:|
| "do" | 0 | d:4 | d:36 | d:37 |
| "re" | 1 | d:5 | d:34 | d:35 |
| "mi" | 2 | d:6 | d:30 | d:31 |
| "fa" | 3 | d:7 | d:32 | d:33 |
| "sol" | 4 | d:8 | d:26 | d:27 |
| "la" | 5 | d:9 | d:28 | d:29 |
| "si" | 6 | d:10 | d:22 | d:23 |
| "do_" | 7 | d:11 | d:24 | d:25 |

### Mapping: Arduino Standalone — v2 14-note (Lagu_AngklungineX.ino)

| Motor | Note | PWM Pin | IN1 | IN2 |
|-------|------|---------|-----|-----|
| motor1 | Sol Rendah | A0 | 46 | 48 |
| motor2 | La Rendah | A0 | 42 | 44 |
| motor3 | Ti Rendah | A0 | 38 | 40 |
| motor4 | Do | A0 | 34 | 36 |
| motor5 | Re | A0 | 30 | 32 |
| motor6 | Mi | A1 | 26 | 28 |
| motor7 | Fa | A1 | 22 | 24 |
| motor8 | Feast (Fis) | A1 | 47 | 49 |
| motor9 | Sol | A1 | 43 | 45 |
| motor10 | La | A1 | 39 | 41 |
| motor11 | Ti | A2 | 35 | 37 |
| motor12 | Do Tinggi | A2 | 31 | 33 |
| motor13 | Re Tinggi | A2 | 27 | 29 |
| motor14 | Mi Tinggi | A2 | 23 | 25 |

## Electrical Wiring

### Power Distribution

```
Power Supply 12V 30A
    │
    ├──► Step Down LM2596 (12V → 5V)
    │        └──► Arduino Mega VIN
    │
    └──► Motor Driver L293D VCC (×4)
             └──► Central Lock ×14
```

### Sensor Monitoring

```
INA219 I2C Sensor
    ├──► VCC → Arduino 5V
    ├──► GND → Arduino GND
    ├──► SCL → Arduino SCL (21)
    └──► SDA → Arduino SDA (22)
    → Monitors current draw on 12V rail
    → Prevents overload
```

### ESP32 Wiring (IoT Monitoring)

```
ESP32
    ├──► INA219 SDA → GPIO 21
    ├──► INA219 SCL → GPIO 22
    ├──► Serial2 TX → GPIO 17
    └──► Serial2 RX → GPIO 16
```

## Database Schema

| Collection | Purpose |
|-----------|---------|
| `gesture_sessions` | Logs of hand tracking sessions |
| `power_readings` | Time-series INA219 data |
| `game_history` | User play sessions & scores |

Database: **MongoDB** (NoSQL, document-based)

## 3D Model Structure

```
3D Model/Model.blend
    ├── Frame (akrilik + 3D printed parts)
    ├── Central Lock mounts (×14)
    ├── Angklung tube holders (×14)
    └── Base plate with decorative elements
```

## File Directory Reference

| Directory | Contents | System |
|-----------|----------|--------|
| `GUI Angklung/` | Python GUI + controller + ML models | Hand Tracking (PC) |
| `StandardFirmata/` | Firmata firmware | Arduino (v1) |
| `Arduino/` | Song player firmware | Arduino (v2 standalone) |
| `ArduinoWeb/` | ESP32 firmware (MQTT experimental) | ESP32 |
| `angklunginex/` | Laravel web app | Web Server |
| `IOT-angklung-main/` | Mobile apps + Website v2 | Teammate projects |
| `Website/` | Web Serial API prototype | Web Browser |
| `3D Model/` | Blender 3D models | Manufacturing |
