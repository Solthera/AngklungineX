# Arc-2 Roadmap — 6–12 Month Development Plan

> **Start:** June 2026
>
> **Goal:** Fully playable web-based rhythm game with 3 modes, connected to physical angklung via Web Serial API.

---

## Phase 1: Foundation (Month 1–2)

| Sprint | Target | Deliverables |
|--------|--------|-------------|
| **Sprint 1** | Web Serial API + Arduino firmware | - Web Serial module (connect/disconnect/send)<br>- Arduino firmware update (raw serial → note mapping)<br>- Basic connection UI |
| **Sprint 2** | Free Play Mode | - 14-note piano layout UI<br>- Click/touch → Arduino note commands<br>- Sustain/hold support<br>- Basic audio preview (Web Audio API) |

**Milestone:** Free Play working end-to-end (browser → Arduino → angklung sounds)

---

## Phase 2: Rhythm Engine (Month 3–5)

| Sprint | Target | Deliverables |
|--------|--------|-------------|
| **Sprint 3** | Note chart system | - Chart format (JSON)<br>- Chart parser + loader<br>- Timing engine (BPM, beat subdivision)<br>- Song selection UI |
| **Sprint 4** | Core gameplay loop | - Falling note renderer (canvas/WebGL)<br>- Hit zone + timing detection<br>- Input handling (mouse + keyboard)<br>- Basic scoring system |
| **Sprint 5** | Rhythm Mode v1 | - Combo/multiplier system<br>- Health bar<br>- Song start/pause/end flow<br>- Results screen (score, accuracy, grade) |

**Milestone:** First playable Rhythm Mode with 1–2 test songs

---

## Phase 3: Content (Month 5–8)

| Sprint | Target | Deliverables |
|--------|--------|-------------|
| **Sprint 6** | Song charts creation | - Chart 5 Indonesian songs at Easy difficulty<br>- Chart 5 songs at Medium difficulty<br>- Chart editor tool (internal) |
| **Sprint 7** | Learning Mode | - Lesson system (Note Introduction → Sight Reading)<br>- Visual feedback (correct/wrong indicators)<br>- Lesson progress tracking<br>- Kodály hand sign illustrations (reference) |
| **Sprint 8** | Difficulty expansion | - Hard/Expert charts for existing songs<br>- Dynamic difficulty scaling<br>- Speed modifier options |

**Milestone:** Learning Mode complete + 15 song charts across 3 difficulties

---

## Phase 4: Polish (Month 9–12)

| Sprint | Target | Deliverables |
|--------|--------|-------------|
| **Sprint 9** | UI/UX refinement | - Responsive design (mobile + desktop)<br>- Animations + particle effects<br>- Theme/skin system |
| **Sprint 10** | PWA & offline | - Service worker caching<br>- Install prompt<br>- Offline mode (practice without Arduino) |
| **Sprint 11** | User testing | - Alpha testing with real hardware<br>- Latency measurement & optimization<br>- Bug fixes |
| **Sprint 12** | Release | - Documentation<br>- User guide<br>- Final demo video<br>- Deployment |

**Milestone:** v1.0 release — production-ready web app

---

## Post-Release Ideas (Future)

- **Hand tracking integration** — Port Arc-1 MediaPipe + SVM to web (TensorFlow.js)
- **Multiplayer mode** — Two angklung units connected, competitive/co-op play
- **Community song editor** — Let users create and share their own charts
- **Audio input mode** — CREPE pitch detection via microphone
- **Score leaderboard** — Firebase backend for global rankings
- **Angklung tuner** — Built-in tuning tool using Web Audio API

---

## Technical Stack (Tentative)

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla or React) |
| UI Framework | Tailwind CSS / Bootstrap |
| Serial | Web Serial API (navigator.serial) |
| Audio | Web Audio API (oscillator + gain) |
| Rendering | Canvas 2D / WebGL (for falling notes) |
| Storage | localStorage / IndexedDB (offline charts) |
| PWA | Service Worker + manifest.json |
| Arduino | C++ (Arduino IDE, Serial → note mapping) |
| Version Control | Git + GitHub |

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Web Serial API not supported on all browsers | High | Target Chrome/Edge/Chromium; fallback to keyboard simulation |
| USB latency > 50ms | Medium | Optimize Arduino serial baud rate, minimize protocol overhead |
| Chart creation too time-consuming | Medium | Build chart editor tool; simplify format to JSON |
| Team member availability | Medium | Modular architecture → parallel development |
| Hardware wear (Central Lock) | Low | Stock spare actuators; monitor usage |
