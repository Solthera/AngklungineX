# Arc-2 Game Concept — AngklungineX Rhythm Game

## Overview

A web-based rhythm game where players interact with a **physical angklung** (14 notes) connected via **Web Serial API → Arduino Mega**. Three modes serve different use cases: free exploration, structured gameplay, and guided learning.

---

## Mode 1: Free Play

**Concept:** Virtual Piano for angklung. Tap on-screen note buttons → angklung plays instantly.

**Inspiration:** [onlinepianist.com](https://onlinepianist.com)

**Features:**
- 14 note buttons arranged like a piano keyboard (bottom = low notes, top = high notes)
- Each button highlights when played
- Sustained notes while button is held (via Arduino PWM oscillation)
- Audio preview (Web Audio API) for silent practice
- Optional: record & playback session

**Technical:**
- On click/touch → Web Serial API sends note string to Arduino
- On release → Web Serial API sends stop command
- No buffering, no server round-trip — direct USB serial

**UI Mockup (text):**
```
┌──────────────────────────────────────┐
│  ○ Mi Tinggi  ○ Re Tinggi  ○ Do Ting│
│  ○ Ti  ○ La  ○ Sol  ○ Fis  ○ Fa     │
│  ○ Mi  ○ Re  ○ Do                    │
│  ○ Ti Rendah  ○ La Rendah  ○ Sol Ren│
└──────────────────────────────────────┘
           (piano-style layout)
```

---

## Mode 2: Rhythm Mode (Guitar Hero)

**Concept:** Notes fall from the top of the screen in lanes. Player must click/tap the correct note button when it reaches the hit zone.

**Inspiration:** Guitar Hero, osu!, Muse Dash

**Core Mechanics:**
- **Note lanes** — 14 vertical lanes, each mapped to an angklung note
- **Falling notes** — Notes scroll downward (or left-to-right) toward a hit zone
- **Hit zone** — A horizontal bar at the bottom; notes must be played when they align with it
- **Scoring**:
  - Perfect (< 50ms offset) — 300 points
  - Great (50–100ms) — 200 points
  - Good (100–150ms) — 100 points
  - Miss (> 150ms) — 0 points, combo breaks
- **Combo multiplier** — x2 at 10 streak, x3 at 25, x4 at 50, x5 at 100
- **Health bar** — Decreases on miss, increases on hit; empty = song fails

**Song Chart Format:**
```json
{
  "title": "Indonesia Pusaka",
  "bpm": 120,
  "notes": [
    { "time": 0.0, "note": "sol", "duration": 0.5 },
    { "time": 0.5, "note": "la", "duration": 0.25 },
    { "time": 0.75, "note": "si", "duration": 0.25 }
  ]
}
```

**UI Mockup (text):**
```
┌──────────────────────────────────────┐
│          ▒▒  ▒▒    ▒▒                │  ← notes falling
│        ▒▒  ▒▒  ▒▒  ▒▒  ▒▒           │
│      ▒▒  ▒▒  ▒▒  ▒▒  ▒▒  ▒▒ ▒▒     │
│    ▒▒  ▒▒  ▒▒  ▒▒  ▒▒  ▒▒ ▒▒ ▒▒    │
│══════════════════════════════════════│  ← hit zone
│  Sol  La  Ti  Do  Re  Mi Fa Fis ... │  ← 14 lanes
└──────────────────────────────────────┘
Score: 12,450  |  Combo: x23  |  ♥♥♥♥♡
```

**Difficulty Levels:**
| Level | Note Speed | Complexity | Example |
|-------|-----------|------------|---------|
| Easy | Slow | Only 7 notes (Do–Do') | "Halo-Halo Bandung" |
| Medium | Moderate | 14 notes, simple patterns | "Ibu Kita Kartini" |
| Hard | Fast | 14 notes, complex rhythms | "Indonesia Pusaka" |
| Expert | Very Fast | Full song + variations | "Indonesia Raya" |

---

## Mode 3: Learning Mode

**Concept:** Guided interactive lessons that teach users to recognize and play angklung notes.

**Features:**

| Lesson | Objective | Gameplay |
|--------|-----------|----------|
| 1. Note Introduction | Learn note names & sounds | Highlight a note → user taps it |
| 2. Note Recognition | Identify notes by sound | Play a note audio → user picks correct button |
| 3. Simple Sequences | Play 2–3 note patterns | Follow highlighted notes in order |
| 4. Scale Practice | Play ascending/descending scales | Guided scale with visual cues |
| 5. Song Practice | Learn a full song section by section | Slow speed → gradually increase tempo |
| 6. Sight Reading | Read and play from note sheet | Show sheet music notation → user plays |

**Visual Feedback:**
- **Green** — correct note played
- **Red** — wrong note (show which was expected)
- **Yellow** — close but wrong octave
- Progress bar shows lesson completion

**Teaching Methodology:**
- Based on Kodály method (carried over from Arc-1)
- Scaffolded learning: simple → complex
- Positive reinforcement (stars, streaks, encouragement)
- Repeat until mastered

---

## Technical Architecture (Per Mode)

```
                    Web Browser (Arc-2)
                    ┌─────────────────────┐
                    │  Mode Selector       │
                    │  ┌─────┬──────┬────┐│
                    │  │Free │Rhythm│Learn││
                    │  │Play │      │     ││
                    │  └──┬──┴──┬───┴──┬─┘│
                    │     │     │      │   │
                    │  ┌──▼─────▼──────▼─┐ │
                    │  │ Web Serial API   │ │
                    │  └────────┬────────┘ │
                    └───────────┼──────────┘
                                │ USB
                    ┌───────────▼──────────┐
                    │    Arduino Mega       │
                    │  (firmware: serial →  │
                    │   note→PWM mapping)   │
                    └───────────┬──────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Central Lock ×14     │
                    │  → Angklung Tubes     │
                    └──────────────────────┘
```

## Audio Strategy

- **Physical sound** — The real angklung makes sound when struck (primary)
- **Web Audio preview** — Optional tone generator for silent practice / feedback
- **No microphone input** in initial release (future: pitch detection via CREPE)

## Note Mapping (from Arc-1, unchanged)

| Lane | Note | Arduino ID |
|------|------|-----------|
| 1 | Sol Rendah | `SOL1` |
| 2 | La Rendah | `LA1` |
| 3 | Ti Rendah | `TI1` |
| 4 | Do | `DO2` |
| 5 | Re | `RE2` |
| 6 | Mi | `MI2` |
| 7 | Fa | `FA2` |
| 8 | Fis (Feast) | `FIS2` |
| 9 | Sol | `SOL2` |
| 10 | La | `LA2` |
| 11 | Ti | `TI2` |
| 12 | Do Tinggi | `DO3` |
| 13 | Re Tinggi | `RE3` |
| 14 | Mi Tinggi | `MI3` |
