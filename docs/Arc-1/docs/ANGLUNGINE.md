# Angklungine (v1) — The Original Prototype

> **Status: DISCONTINUED** — No longer developed. Only used as Python hand
> tracking base for v2.

## Overview

Angklungine is the first-generation robotic angklung. It uses **8 diatonic notes**
with **DC vibration motors** as actuators, controlled via **Arduino Mega** running
**Standard Firmata** firmware.

## Specifications

| Parameter | Value |
|-----------|-------|
| Notes | 8 (Do, Re, Mi, Fa, Sol, La, Si, Do') |
| Actuator | DC Vibration Motor |
| Motor Driver | H-Bridge (2 direction pins + 1 PWM per motor) |
| Controller | Arduino Mega 2560 |
| Firmware | StandardFirmata.ino (USB Serial protocol) |
| PC Interface | PyFirmata (Python library) |
| Power | USB / External |

## Hardware Wiring (Pin Mapping)

From `controller.py` — each note uses 3 pins: PWM, Direction 1, Direction 2.

| Note | PWM Pin | D1 Pin | D2 Pin |
|------|---------|--------|--------|
| Do   | d:4     | d:36   | d:37   |
| Re   | d:5     | d:34   | d:35   |
| Mi   | d:6     | d:30   | d:31   |
| Fa   | d:7     | d:32   | d:33   |
| Sol  | d:8     | d:26   | d:27   |
| La   | d:9     | d:28   | d:29   |
| Si   | d:10    | d:22   | d:23   |
| Do'  | d:11    | d:24   | d:25   |

## Software Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PC (Windows)                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GUI Angklung (Python 3.10)                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ MainGUI  │  │controller│  │ SVM Model (.pkl) │   │   │
│  │  │ (PyQt5)  │  │(PyFirmata)│  │ (scikit-learn)   │   │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────┘   │   │
│  │       │              │                                │   │
│  │  ┌────▼──────────────▼──────────────────────────┐    │   │
│  │  │  MediaPipe Hands + OpenCV                    │    │   │
│  │  │  → 21 landmarks per hand                     │    │   │
│  │  │  → SVM classifier → note prediction          │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │ USB Serial (Firmata)             │
└───────────────────────────┼─────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Arduino Mega 2560         │
              │   (StandardFirmata.ino)     │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   8× DC Vibration Motors    │
              │   (H-Bridge Drivers)        │
              └─────────────────────────────┘
```

## Python Files

### `GUI Angklung/MainGUI.py`
- PyQt5 GUI with camera preview
- Loads SVM model from `.pickle` files
- Selects COM port via dropdown
- Runs real-time hand tracking loop
- Sends note commands to `controller.py`

### `GUI Angklung/controller.py`
- Connects to Arduino via PyFirmata on selected COM port
- `setup_motors()` — initializes all motor pins
- `nada(msg)` — deactivates all motors, then activates the requested note
- `activate_motor()` / `deactivate_motor()` — individual motor control

### `GUI Angklung/setup.py`
- cx_Freeze build script for creating standalone .exe

## Gesture Recognition Pipeline

1. **Capture** — OpenCV reads webcam frame
2. **Preprocess** — BGR→RGB, horizontal flip (mirror)
3. **Detect** — MediaPipe Hands extracts 21 landmarks (x, y, z)
4. **Filter** — Only Right hand is processed
5. **Normalize** — Convert to relative coordinates (relative to wrist), flatten
6. **Classify** — SVM model (RBF kernel) predicts note (Do/Re/Mi/Fa/Sol/La/Si/Do')
7. **Output** — Send note string to Arduino via Firmata (USB Serial)

**Performance:** ~95% accuracy, ~67.5 ms latency (also used as base for v2)

## SVM Models (`.pickle` files)

| File | Description |
|------|-------------|
| `Model_SVM_GridSearch.pickle` | Final trained model (GridSearchCV) |
| `svm_RBF.pickle` | RBF kernel SVM |
| `svm_RBF_combine.pickle` | Combined RBF model |
| `best_model_grid_search.pkl` | GridSearchCV result |
| `svm_coba.pickle` / `SVM_Coba copy.pickle` | Experimental |

## Gesture Classes (`gesture.names`)

```
DO
RE
MI
FA
SOL
LA
SI
DO'
```

## Known Issues

- Gestures for **DO** and **FA** are often misclassified due to:
  - Insufficient training data
  - Similar hand shapes between gestures
  - Solution: add more varied training data, retrain model

## Setup Guide

```bash
# Install dependencies
pip install opencv-python mediapipe scikit-learn pyfirmata pyqt5 pyserial

# Upload Firmata to Arduino
# Open StandardFirmata/StandardFirmata.ino in Arduino IDE
# Select board: Arduino Mega
# Upload

# Run the GUI
cd "GUI Angklung"
python MainGUI.py
```
