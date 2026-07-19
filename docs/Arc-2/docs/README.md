# AngklungineX Arc-2 (v3) — Web-Based Rhythm Game

> **Status: ACTIVE DEVELOPMENT** — June 2026 onward
>
> Regenerated team, new direction. Hardware carried over from Arc-1.

## What Is Arc-2?

Arc-2 transforms AngklungineX from a PC-based hand tracking system into a **web-based rhythm game platform**. The core concept: a browser application that connects directly to the Arduino Mega via **Web Serial API**, allowing users to play the physical angklung through interactive game modes.

## Three Core Modes

| Mode | Concept | Inspiration |
|------|---------|-------------|
| **Free Play** | Tap note buttons on screen → angklung plays instantly | onlinepianist.com |
| **Rhythm Mode** | Falling notes (Guitar Hero style) → hit the right note at the right time | Guitar Hero / osu! |
| **Learning Mode** | Guided note progression + visual feedback for beginners | — |

## Why Web-Based?

- Zero installation — open a browser, connect to Arduino, play
- Cross-platform (Windows, macOS, Android, Chromebook)
- PWA-ready for offline use
- Web Serial API provides **direct USB communication** with Arduino Mega
- No MQTT, no server middleware, no delay

## Hardware

Arc-2 **reuses the same hardware** from Arc-1 (PKM-KC 2025):
- 14 Central Lock solenoid actuators
- Arduino Mega 2560
- 4× L293D motor drivers
- 3D-printed frame + tube holders
- 12V 30A power supply

The only change: connection to the PC is now handled by the **browser (Web Serial API)** instead of PyFirmata.

## Communication

```
Browser (Web Serial API) ─── USB ───► Arduino Mega ───► L293D ───► Central Lock ×14
```

No MQTT. No cloud. Direct USB serial. **<50ms latency target.**

## Project Scope (6–12 Months)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Foundation | Month 1–2 | Web Serial module, basic UI, Free Play mode |
| Rhythm Engine | Month 3–5 | Note chart system, timing engine, first playable build |
| Content | Month 5–8 | Song charts, difficulty levels, Learning Mode content |
| Polish | Month 9–12 | PWA, offline support, user testing, documentation |

See [ROADMAP.md](ROADMAP.md) for detailed timeline.
