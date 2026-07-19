# Development Log & Timeline

## Project Origin

This project started as an academic endeavor at **Institut Teknologi Nasional
Bandung** (ITENAS), evolving from a simple IoT angklung into a full AI-powered
interactive robotic music system.

## Angklungine v1 (The Original)

| Date | Milestone |
|------|-----------|
| ~2023 | Initial concept: IoT angklung with 8 notes |
| | Arduino Mega + DC vibration motors |
| | Basic Python control via PyFirmata |
| | Discontinued in favor of v2 |

## AngklungineX v2 Development

### Phase 1: Foundation (PKM-KC Proposal Stage)

| Date | Milestone |
|------|-----------|
| Early 2025 | PKM-KC 2025 proposal submission |
| | Title: "AngklungineX: Robot Angklung Interaktif Berbasis Deep Learning dan Computer Vision dengan Deteksi Nada Real-Time untuk Pelestarian Budaya" |
| | Team formed: Rainova (lead), Shandy, Melvina, Yuddha |
| | Supervisor: Muhammad Ichwan, Ir., M.T. |
| | Budget: Rp9.500.000 |

### Phase 2: Hardware Development

| Date | Milestone |
|------|-----------|
| 2025 | Designed 14-note system (Sol rendah → Mi tinggi) |
| | Central Lock actuators selected (upgrade from v1 DC motors) |
| | Arduino Mega as main controller |
| | L293D motor drivers (×4) for 14 channels |
| | Step Down LM2596 for voltage regulation (12V → 5V) |
| | INA219 I2C sensor for current monitoring |
| | 3D model created (Blender) |
| | Frame: akrilik + 3D printed parts |
| | Power: 12V 30A supply |

### Phase 3: Arduino Song Player

| Date | Milestone |
|------|-----------|
| 2025 | Standalone Arduino firmware `Lagu_AngklungineX.ino` |
| | 7 songs programmed: Indonesia Raya (4 verses), Ibu Kita Kartini, Indonesia Pusaka, Halo-Halo Bandung, Padamu Negeri, Apuse, Manuk Dadali |
| | `mainkanNada()` function with PWM oscillation (70ms forward + 70ms backward) |
| | Test function `check_sound()` for all 14 notes |

### Phase 4: Wireless Connectivity (ESP32) — Experimental

| Date | Milestone |
|------|-----------|
| 2025 | ESP32 connected to WiFi |
| | MQTT broker experiments: HiveMQ cloud, HiveMQ public |
| | Topic experiments: `NoteAngklungineX`, `angklung/play`, `angklung/power` |
| | First iteration: `mqtt1test.ino` (basic subscribe) |
| | Second iteration: `MQTTAngklung1.ino` (14-note mapping) |
| | Third iteration: `MQTTLast.ino` (cleaner version) |
| | **Outcome: MQTT note control abandoned due to unreliability** |
| | ESP-NOW adopted for direct sensor data transmission |
| | MQTT retained **only** for optional cloud dashboard (power data) |

### Phase 5: Web Application (Laravel)

| Date | Milestone |
|------|-----------|
| 2025 | Laravel 12 project initialized |
| | Vite + Tailwind CSS setup |
| | Welcome page with note buttons |
| | Web Serial API for direct Arduino connection |
| | Partiture toggle for song sheet display |

### Phase 6: Hand Tracking (Python)

| Date | Milestone |
|------|-----------|
| 2025 | PyQt5 GUI with camera preview |
| | MediaPipe Hands integration (21 landmarks) |
| | SVM classifier with scikit-learn (RBF kernel) |
| | 8 gesture classes (Do/Re/Mi/Fa/Sol/La/Si/Do') |
| | Training with GridSearchCV |
| | Multiple model files (RBF, GridSearch, combined) |
| | Dataset: CSV format (21 landmarks × 3 axes) |
| | **Accuracy: 95% | Latency: 67.5 ms** |

### Phase 7: Mobile Applications

| Date | Milestone |
|------|-----------|
| 2025 | Mobile app with 3 modes: Free Play, Learning, Auto Play |
| | MongoDB integration for session data logging |
| | Power monitoring display |

### Phase 8: Arc-1 Completion & Hiatus

| Date | Milestone |
|------|-----------|
| March 2025 | PKM-KC 2025 project deliverables completed (laporan akhir, PPT, demo) |
| March – June 2026 | **Project hiatus (~4 months)** — no active development |
| June 2026 | **Arc-2 launch** — team regeneration, new focus on web-based rhythm game |

## Arc-1 → Arc-2 Transition

The project transitioned from PC-based hand tracking (SVM + MediaPipe) to
a **web-based rhythm game platform** delivered via browser with Web Serial API
→ Arduino Mega direct communication.

### Arc-1 Key Achievements (Carried Forward)

- Hardware platform: 14 Central Lock actuators + Arduino Mega + L293D drivers
- Standalone Arduino firmware with 7 pre-programmed songs
- 3D-printed frame and tube holders
- Proven latency benchmark: 67.5ms (exceeded <200ms target)
- Power monitoring system (INA219 + ESP-NOW)

### Arc-2 New Direction

- **Rhythm Mode** — Guitar Hero-style falling notes → click/tap to play
- **Free Play** — Virtual Piano mode (inspiration: onlinepianist.com)
- **Learning Mode** — Interactive note education with visual feedback
- Web Serial API direct to Arduino (no MQTT, no server-side delay)
- All modes accessible from a single web application (PWA-ready)

## Performance Benchmarks

| Metric | Result | Notes |
|--------|--------|-------|
| Classification Accuracy | 95% avg | 8 gestures, SVM RBF |
| System Latency | 67.5 ms avg | Camera→Gesture→Sound |
| Target Latency | <200 ms | Exceeded target |
| DO/FA Accuracy | Lower | Needs more training data |
| Dataset Size | Hundreds per class | CSV landmark format |
| Training Method | GridSearchCV | Hyperparameter optimization |

## Known Issues & Status

| Issue | Status | Notes |
|-------|--------|-------|
| DO/FA gesture misclassification | 🟡 Open | Needs more training data |
| ESP32 MQTT callback redundancy | 🟡 Low priority | MQTT note control abandoned |
| 14-note hand tracking | 🔴 Pending | Only 8 notes implemented so far |
| CREPE pitch detection | 🔴 Pending | Planned but not started |
| Audio integration | 🔴 Pending | Future phase |
| Mobile apps | 🔴 External | Teammates' projects, not in repo |
| Web UI improvements | 🟡 Open | Basic interface, needs polish |

## Arc-2 Next Steps

See `../../Arc-2/docs/ROADMAP.md` for the full 6-12 month development plan.

Summary:
1. **Develop Web Serial API module** — browser ↔ Arduino Mega bidirectional
2. **Build Free Play mode** — Virtual Piano interface with 14 note buttons
3. **Build Rhythm mode** — falling note chart system + timing engine
4. **Build Learning mode** — guided note progression + visual feedback
5. **Integrate audio feedback** — waveform/Web Audio API for sound preview
6. **PWA packaging** — installable web app, offline support
7. **User testing & iteration** — latency optimization, UI refinement

## References

- Ningsih et al. (2024) — Automated Angklung Using Arduino and Android
- Cui et al. (2025) — Deep Vision-based Real-time Hand Gesture Recognition
- Yaseen et al. (2025) — Benchmark Datasets and DL Models for HGR
- de Cheveigné & Kawahara (2002) — YIN Pitch Estimation Algorithm
- Coccoluto et al. (2023) — OneBitPitch (OBP) Algorithm
- Kharis & Anugrah (2023) — Digital Documentation of Diatonic Angklung
- Liu et al. (2023) — Deep Learning for Vocal Pitch Estimation
- Agrawal et al. (2022) — Automatic Music Transcription Survey
- Wicaksono, Subur & Taufiqurrohman (2023) — Robot Angklung Otomatis berbasis Arduino
- Wardana, Budi & Sudarsono (2023) — Klungbot: Wireless Distributed Real-time Angklung Robot
- Singh et al. (2024) — Enhancing Sign Language Detection through Mediapipe and CNN
