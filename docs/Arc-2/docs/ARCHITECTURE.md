# Arc-2 System Architecture — Web-Based Rhythm Game

## Overview

Arc-2 shifts from Arc-1's PC-based Python hand tracking to a **pure web architecture**. The browser becomes the main processing platform, communicating directly with the Arduino Mega via **Web Serial API**.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Arc-2 Web App)                       │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐   │
│  │  Mode Router  │   │  Game Engine  │   │  Web Serial Manager    │   │
│  │               │   │              │   │                        │   │
│  │  • Free Play  │   │  • Timing    │   │  • Connect/Disconnect  │   │
│  │  • Rhythm     │──►│  • Scoring   │──►│  • Send note command   │   │
│  │  • Learning   │   │  • Combo     │   │  • Receive status      │   │
│  │               │   │  • Health    │   │  • Error handling      │   │
│  └──────────────┘   └──────────────┘   └───────────┬────────────┘   │
│                                                     │                │
│  ┌──────────────┐   ┌──────────────┐                │                │
│  │  Chart Loader  │   │  Audio Engine │                │                │
│  │  • JSON parse  │   │  • Web Audio  │                │                │
│  │  • Note pool   │   │  • Preview    │                │                │
│  │  • Difficulty  │   │  • Metronome  │                │                │
│  └──────────────┘   └──────────────┘                │                │
│                                                     │                │
└─────────────────────────────────────────────────────┼────────────────┘
                                                       │
                                                  USB Serial
                                                  (Web Serial API)
                                                       │
┌──────────────────────────────────────────────────────▼────────────────┐
│                         ARDUINO MEGA 2560                              │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  Arc-2 Firmware (serial → note → PWM)                        │     │
│  │                                                              │     │
│  │  void loop() {                                               │     │
│  │    if (Serial.available() > 0) {                             │     │
│  │      String cmd = Serial.readStringUntil('\\n');               │     │
│  │      // "LA2_ON" or "LA2_OFF"                                │     │
│  │      parseAndExecute(cmd);                                   │     │
│  │    }                                                         │     │
│  │  }                                                           │     │
│  └───────────────────────────┬───────────────────────────────────┘     │
│                              │                                        │
│  ┌───────────────────────────▼───────────────────────────────────┐     │
│  │  L293D Motor Driver ×4 (14 channels)                         │     │
│  │  PWM oscillation: forward 70ms + backward 70ms               │     │
│  └───────────────────────────┬───────────────────────────────────┘     │
│                              │                                        │
│  ┌───────────────────────────▼───────────────────────────────────┐     │
│  │  Central Lock Solenoid Actuators ×14                          │     │
│  │  → Strikes angklung tubes on command                          │     │
│  └───────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

## Communication Protocol (Web Serial)

```
→ Browser → Arduino (commands):
  "SOL1_ON\n"      → Activate Sol Rendah
  "SOL1_OFF\n"     → Deactivate Sol Rendah
  "DO2_ON\n"       → Activate Do
  "ALL_OFF\n"      → Deactivate all notes
  "PING\n"         → Health check (returns "PONG")

← Arduino → Browser (responses):
  "PONG\n"         → Acknowledge
  "OK\n"           → Command accepted
  "ERR:UNKNOWN\n"  → Invalid command
```

**Serial config:** 115200 baud, 8N1

## Note → Pin Mapping (From Arc-1, Unchanged)

| Motor | Note | PWM Pin | IN1 | IN2 |
|-------|------|---------|-----|-----|
| motor1 | Sol Rendah | A0 | 46 | 48 |
| motor2 | La Rendah | A0 | 42 | 44 |
| motor3 | Ti Rendah | A0 | 38 | 40 |
| motor4 | Do | A0 | 34 | 36 |
| motor5 | Re | A0 | 30 | 32 |
| motor6 | Mi | A1 | 26 | 28 |
| motor7 | Fa | A1 | 22 | 24 |
| motor8 | Fis | A1 | 47 | 49 |
| motor9 | Sol | A1 | 43 | 45 |
| motor10 | La | A1 | 39 | 41 |
| motor11 | Ti | A2 | 35 | 37 |
| motor12 | Do Tinggi | A2 | 31 | 33 |
| motor13 | Re Tinggi | A2 | 27 | 29 |
| motor14 | Mi Tinggi | A2 | 23 | 25 |

## Data Flow Per Mode

### Free Play
```
User taps button → Serial write "SOL1_ON" → Arduino activates solenoid
User releases    → Serial write "SOL1_OFF" → Arduino deactivates
```
**Latency target:** < 20ms (tap → sound)

### Rhythm Mode
```
Game starts → Chart loader parses JSON → Note pool created at start time
Game loop:
  Tick (requestAnimationFrame)
  → Update note positions based on elapsed time & BPM
  → Render falling notes on canvas
  → Check user input

User taps at hit zone:
  → Calculate timing offset
  → If within window: Serial write note ON → wait duration → OFF
  → Score based on offset (perfect/great/good/miss)

Song ends → Results screen
```
**Latency target:** < 50ms (tap → sound, including serial round-trip)

### Learning Mode
```
Lesson starts → Show instruction text + visual cue
  → Wait for user to press correct note
  → Compare expected vs actual
  → Show feedback (green/red)
  → Advance to next step
```
**Latency target:** < 30ms (feedback should feel instant)

## Web App Structure (Proposed)

```
angklunginex-arc2/
├── index.html              ← Entry point (PWA shell)
├── manifest.json           ← PWA manifest
├── service-worker.js       ← Offline cache
├── css/
│   └── style.css           ← Tailwind / custom styles
├── js/
│   ├── app.js              ← Main app + router
│   ├── serial.js           ← Web Serial API wrapper
│   ├── freemode.js         ← Free Play controller
│   ├── rhythm.js           ← Rhythm game engine
│   ├── learning.js         ← Learning mode controller
│   ├── chart.js            ← Chart parser + note pool
│   ├── renderer.js         ← Canvas/WebGL renderer
│   ├── scoring.js          ← Score + combo + health
│   └── audio.js            ← Web Audio API helper
├── charts/
│   ├── indonesia-raya.json
│   ├── indonesia-pusaka.json
│   ├── ibu-kita-kartini.json
│   └── ...
└── assets/
    ├── icons/
    └── sounds/
```

## Comparison: Arc-1 vs Arc-2 Architecture

| Aspect | Arc-1 (v2) | Arc-2 (v3) |
|--------|-----------|-----------|
| **Platform** | Python (PyQt5) desktop app | Web browser (PWA) |
| **Input** | Webcam → MediaPipe → SVM | Mouse / touch / keyboard |
| **Output** | PyFirmata → USB Serial | Web Serial API → USB Serial |
| **Game Logic** | None (bare note trigger) | Full rhythm game engine |
| **Songs** | Pre-programmed in Arduino (C) | JSON charts in browser |
| **Latency** | ~67.5ms (camera→sound) | <50ms (tap→sound target) |
| **Install** | Python env + dependencies | Open URL → Connect → Play |
| **Updates** | Manual reinstall | Auto-update via web |

## Power System (Carried Over From Arc-1)

```
Power Supply 12V 30A
    │
    ├──► Step Down LM2596 (12V → 5V)
    │        └──► Arduino Mega VIN
    │
    └──► Motor Driver L293D VCC (×4)
             └──► Central Lock ×14
```

INA219 power monitoring (Arc-1) is optional in Arc-2 but can be retained.
