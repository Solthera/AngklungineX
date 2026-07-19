# AngklungineX (v2) — Arc-1

> **Status: COMPLETED** — This phase concluded with **PKM-KC 2025**. The project continues in **Arc-2** (see `../../Arc-2/docs/`).

## Overview

AngklungineX is the second-generation robotic angklung, completed as a **PKM-KC 2025** project. The **hardware platform**
supports **14 diatonic notes** using **Central Lock (solenoid) actuators**
controlled by **Arduino Mega**. The primary control method was **hand gesture
recognition** via **USB Serial (PyFirmata)** from a PC running MediaPipe + SVM, achieving **95% accuracy and 67.5ms latency**.

**Important:** MQTT-based wireless note control was experimental only and is
**not used in the main project**. The production system uses:
- **USB Serial (PyFirmata)** — Real-time note commands from hand tracking to Arduino
- **ESP-NOW** — Direct wireless communication for IoT sensor data
- **MQTT** — Optional cloud bridge for power monitoring dashboard (not for note control)

The project also included a **Laravel web app** for virtual angklung play and
teammate-developed **mobile apps + website v2** (see `IOT-angklung-main/`).

> **→ Arc-2 continues with a web-based rhythm game platform. See `../../Arc-2/docs/README.md`.**

## Note List (14 Notes — Hardware)

| Index | Note Name | Solfege | Note Label in Code |
|-------|-----------|---------|-------------------|
| 1 | Sol Rendah | 5. | `sol_bawah` / `SOL1` |
| 2 | La Rendah | 6. | `la_bawah` / `LA1` |
| 3 | Ti Rendah | 7. | `si_bawah` / `TI1` |
| 4 | Do | 1 | `do` / `DO2` |
| 5 | Re | 2 | `re` / `RE2` |
| 6 | Mi | 3 | `mi` / `MI2` |
| 7 | Fa | 4 | `fa` / `FA2` |
| 8 | Feast (Fis) | 4♯ | `fa2` / `FIS2` |
| 9 | Sol | 5 | `sol` / `SOL2` |
| 10 | La | 6 | `la` / `LA2` |
| 11 | Ti | 7 | `si` / `TI2` |
| 12 | Do Tinggi | 1' | `do_atas` / `DO3` |
| 13 | Re Tinggi | 2' | `re_atas` / `RE3` |
| 14 | Mi Tinggi | 3' | `mi_atas` / `MI3` |

**Note:** Hand tracking currently supports **8 notes** (Do – Do'). Expansion to
14 notes is planned.

## Hardware Wiring (Standalone Arduino — v2)

From `Lagu_AngklungineX.ino` — pin mapping for 14 Central Lock actuators via
L293D H-Bridge drivers:

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

Multiple motors share the same PWM pin (A0/A1/A2 as shared PWM groups)
because Central Lock actuators draw less current per channel.

## Communication Architecture

```
┌─────────────────────────────────────────────────────┐
│  PC (Python GUI)                                     │
│  MediaPipe → SVM → Note String                       │
│         │                                             │
│         ▼ USB Serial (PyFirmata)                     │
│  ┌──────────────────────────────────────────────┐    │
│  │  Arduino Mega 2560                             │    │
│  │  - Receives note commands via serial           │    │
│  │  - Drives L293D → Central Lock actuators       │    │
│  │  - Reads INA219 power sensor (I2C)             │    │
│  └────────────┬────────────────────────┬─────────┘    │
│               │                        │              │
│               ▼                        ▼              │
│         Central Lock ×14          ESP32               │
│         (Solenoid hitters)        - ESP-NOW / WiFi    │
│                                   - Publishes sensor  │
│                                    data to cloud/MQTT │
└─────────────────────────────────────────────────────┘
```

## Communication Protocols

| Protocol | Purpose | Status |
|----------|---------|--------|
| **USB Serial (PyFirmata)** | Send note commands from PC to Arduino | **Primary (active)** |
| **ESP-NOW** | Direct ESP32↔ESP32 sensor data | Active |
| **MQTT** | Cloud dashboard for power monitoring | **Experimental only** |
| **MQTT (Note Control)** | Wireless note commands via ESP32 | **Abandoned** — unreliable |

## Performance Benchmarks (from Laporan Akhir)

| Metric | Value |
|--------|-------|
| Gesture Classification Accuracy | 95% (avg) |
| System Latency (gesture→sound) | 67.5 ms |
| SVM Model | RBF kernel, GridSearchCV tuned |
| Training Data | Hundreds of samples per gesture (CSV format) |
| Gesture Classes | 8 (Do, Re, Mi, Fa, Sol, La, Si, Do') |

Known issue: **DO** and **FA** gestures are often misclassified due to similar
hand shapes and insufficient training data.

## 3D Model

- File: `3D Model/Model.blend` and `Model edited.blend`
- Designed for 3D-printed frame to hold 14 angklung tubes
- Central Lock actuators mounted to strike each tube

## Web Application (Laravel 12)

Located at `angklunginex/`:

| Component | Details |
|-----------|---------|
| Framework | Laravel 12 + PHP 8.2+ |
| Frontend | Vite + Tailwind CSS |
| Routes | `POST /send-note` → `MqttController@sendNote` |
| | `GET /` → `welcome.blade.php` |
| Host | Local development (requires `php artisan serve`) |

### Web Interface Features

- Circular note buttons (14 notes + FIS)
- "Connect Arduino" button using Web Serial API
- MQTT publish on button click (experimental)
- Partiture toggle for song sheet (Indonesia Pusaka)

## Pre-Programmed Songs (Standalone Arduino)

The Arduino file `Arduino/Lagu_AngklungineX/Lagu_AngklungineX.ino`
contains 7 Indonesian national/folk songs:

| Song | Function |
|------|----------|
| Indonesia Raya (4 verses) | `baitsatu()`, `baitdua()`, `baittiga()`, `baitempat()` + `pembukaan()` |
| Ibu Kita Kartini | `ibu_kita_kartini()` |
| Indonesia Pusaka | `indonesia_pusaka()` |
| Halo-Halo Bandung | `halo_halo_bandung()` |
| Padamu Negeri | `padamu_negeri()` |
| Apuse | `apuse()` |
| Manuk Dadali | `manuk_dadali()` |
| Test (all notes) | `check_sound()` |

### Song Playback Logic

```cpp
void mainkanNada(const int motor[3], int ketukan) {
    // Oscillates forward/backward to strike angklung tube
    // PWM = 70, period = ~140ms per oscillation cycle
    // Duration = ketukan (milliseconds)
}
```

## Mobile Applications (Teammate Projects)

Companion mobile apps developed by teammates, archived in `IOT-angklung-main/`:
- **Main Bebas (Free Play)** — Play angklung by tapping note buttons
- **Mode Belajar (Learning Mode)** — Guided learning with visual cues
- **Mode Auto Play** — Plays pre-programmed songs automatically

## Power System

- **Power Supply**: 12V 30A
- **Step Down**: LM2596 (12V → 5V for Arduino)
- **Monitoring**: INA219 I2C sensor (current, voltage, power)
- **Protection**: Overcurrent monitoring via INA219

## Database

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | MongoDB (NoSQL) | Store session history, sensor data |
| Data Format | BSON (Binary JSON) | Flexible schema for IoT data streams |
| Storage | Session logs, power metrics, game history | Analytics & monitoring |

## Legacy — What Arc-1 Passes to Arc-2

| Asset | Status in Arc-2 |
|-------|----------------|
| 14-note hardware (Central Lock + Mega) | **Reused** — core hardware unchanged |
| 3D-printed frame & tube holders | **Reused** |
| Standalone Arduino song player | **Reused** — can be triggered from web |
| Hand tracking (Python SVM) | **Optional** — can be integrated later |
| Web Serial API concept | **Evolved** — becomes primary input method |
| Laravel web app | Superseded by Arc-2 web app |
| MQTT / ESP32 IoT monitoring | Carried over if needed |

### Arc-1 Ideas for Future Reference

These ideas from Arc-1 are **not in scope for Arc-2's initial roadmap** but may be revisited:
1. **Audio Pitch Detection (CREPE)** — Let robot "hear" and respond to audio
2. **14-Note Hand Tracking** — Extend SVM from 8 to 14 gestures
3. **Source Separation** — Spleeter/Demucs for isolating instruments
4. **Automatic Music Transcription** — Audio → angklung notes
