# Angklungine & AngklungineX — Project Overview

## What Is This Project?

A robotic angklung (traditional Indonesian bamboo instrument) that can be played
automatically or via **hand gesture recognition** using the Kodaly hand sign
method. Two generations exist:

| Aspect | Angklungine (v1) | AngklungineX Arc-1 (v2) | AngklungineX Arc-2 (v3) |
|--------|------------------|--------------------------|--------------------------|
| **Notes** | 8 (Do Re Mi Fa Sol La Si Do') | 14 (Sol rendah – Mi tinggi) | 14 (existing hardware) |
| **Actuator** | DC Vibration Motor | Central Lock (solenoid) | Central Lock (solenoid) |
| **Controller** | Arduino Mega + Firmata | Arduino Mega (standalone) + ESP32 | Arduino Mega (Web Serial) |
| **Comm (→Arduino)** | USB Serial (PyFirmata) | USB Serial (PyFirmata) | Web Serial API (browser) |
| **Comm (Sensor IoT)** | — | ESP-NOW / MQTT (experimental) | ESP-NOW |
| **Input Mode** | — | Hand gesture (Kodaly) | Web game (click/tap) + gesture |
| **Status** | **Discontinued** | **Completed (PKM-KC 2025)** | **Active development** |
| **Platform** | Python + PyQt5 | Python + PyQt5 + Laravel | Web Browser (PWA) |
| **Accuracy** | ~95% (8 gestures) | ~95% (8 gestures) | N/A (game input) |
| **Latency** | ~67.5 ms avg | ~67.5 ms avg | <50 ms (Web Serial) |

## Repository Location

```
c:\Itenas\IWill\AngklungineX\
├── Arc-1\          ← Completed phase (PKM-KC 2025)
│   ├── GUI Angklung\         → Python hand tracking app (v1/v2)
│   ├── Arduino\              → Standalone Arduino song player (v2)
│   ├── ArduinoWeb\           → ESP32 firmware (MQTT experimental)
│   ├── angklunginex\         → Laravel web app (virtual angklung)
│   ├── StandardFirmata\      → Firmata for Arduino (v1)
│   ├── 3D Model\             → Blender 3D print files
│   ├── IOT-angklung-main\    → Mobile apps + Website v2 (teammates)
│   ├── Website\              → Web Serial API prototype
│   ├── Development\          → Build photos & documentation
│   ├── Laporan\              → Academic reports (PDF/DOCX)
│   └── PPT\                  → Presentation slides
├── Arc-2\          ← Active development phase
│   └── docs\                 → Arc-2 project guides
└── AGENTS.md       ← AI agent context file
```

## Key Technical Stack

- **Python 3.10** — Hand tracking, GUI, ML inference
- **OpenCV + MediaPipe** — Camera capture + hand landmark extraction (21 landmarks)
- **Scikit-learn (SVM)** — Gesture classification (pickle models)
- **PyQt5** — Desktop GUI
- **PyFirmata** — Serial communication with Arduino (primary control path)
- **Arduino Mega** — Low-level motor/actuator control
- **ESP32** — WiFi + MQTT for IoT sensor monitoring (experimental for note control)
- **ESP-NOW** — Direct peer-to-peer wireless communication
- **Laravel 12** — Web interface (virtual angklung, monitoring dashboard)
- **MongoDB** — NoSQL database for session history & sensor logs
- **INA219** — I2C current/voltage sensor for power monitoring
- **PWM + H-Bridge (L293D)** — Motor driving
- **MQTT (HiveMQ)** — Cloud message broker (experimental, IoT data only)

## Teams

### Arc-1 Team (PKM-KC 2025) — Completed

| Name | Role | NRP |
|------|------|-----|
| Rainova Rahaniawan | Ketua | 152023007 |
| Shandy Handika | Anggota | 152021188 |
| Melvina Cheda Rismayanta | Anggota | 152023175 |
| Yuddha Wastu Pramukha | Anggota | 152024058 |
| Muhammad Ichwan, Ir., M.T. | Dosen Pembimbing | – |

### Arc-2 Team (Regeneration 2026) — Active

| Name | Role | NRP |
|------|------|-----|
| Yuddha Wastu Pramukha | Ketua | 152024058 |
| Muhammad Farel Firdaus | Anggota | 152024061 |
| Reisya Putri Ramadhani | Anggota | 152025112 |
| Adinda Candra Putri | Anggota | 162025004 |
| Fauzan Ramadhan | Anggota | 332024130 |

## Performance Benchmarks

| Metric | Value |
|--------|-------|
| Gesture Classification Accuracy | 95% (avg, 8 classes) |
| System Latency (gesture→sound) | 67.5 ms (avg) |
| Target Latency | <200 ms |
| Number of Gesture Classes | 8 (Do/Re/Mi/Fa/Sol/La/Si/Do') |
| Dataset Format | CSV (21 landmarks × 3 axes per sample) |
| SVM Kernel | RBF (GridSearchCV tuned) |

## Related External Projects

- **Mobile Apps (Hand Tracking)** — Owned by teammates, now archived in `Arc-1/IOT-angklung-main/`
- **Website v2 (Hand Tracking)** — Owned by teammates, now archived in `Arc-1/IOT-angklung-main/`

## Goals (Arc-1 — Achieved ✓)

1. Preserve angklung as Indonesia's intangible cultural heritage (UNESCO 2010)
2. Create interactive learning media for Kodaly hand sign method
3. Bridge traditional music with modern IoT/AI technology
4. Enable real-time gesture-to-sound conversion with <200ms latency

---

## Arc-1 → Arc-2 Transition

Arc-1 (v2) was completed as a PKM-KC 2025 project with **95% accuracy and 67.5ms latency** on 8-note hand gesture recognition. After a ~4-month hiatus (March – June 2026), the project entered **Arc-2 (v3)** with a regenerated team.

**Arc-2 shifts focus** from PC-based hand tracking to a **web-based rhythm game platform**:
- **Rhythm Mode** — Guitar Hero-style gameplay with angklung
- **Free Play** — Virtual Piano mode (like onlinepianist.com)
- **Learning Mode** — Interactive note education
- **Direct Web Serial API** → Arduino Mega (no MQTT, no delay)
- Hardware (14 Central Lock actuators, Mega 2560) carried over from Arc-1

See `Arc-2/docs/` for full details.
