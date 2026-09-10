import { useEffect } from "react";
import { initPiano } from "./piano";
import "./style.css";
import { Disc, Play, Square } from 'lucide-react';

export default function PianoModePage() {
  /*
   * initPiano() butuh elemen #piano dkk sudah ada di DOM,
   * jadi baru dipanggil setelah render (useEffect), bukan saat import.
   */
  useEffect(() => initPiano(), []);

  return (
    <div className="piano-mode">
      <main className="app">
        <header className="toolbar">
          <div>
            <h1>AngklungineX Piano</h1>
          </div>

          <div className="controls">
            <button id="sustainBtn" className="control-btn items-center">
              Sustain
              <span className="status">OFF</span>
            </button>

            <button id="recordBtn" className="control-btn record flex gap-3 items-center">
              <Disc size={20} />
              Record
            </button>

            <button id="replayBtn" className="control-btn flex gap-3 items-center">
              <Play size={20}/>
              Replay
            </button>

            <button id="stopBtn" className="control-btn flex gap-3 items-center">
              <Square size={20}/>
              Stop
            </button>
          </div>
        </header>

        <section className="piano-wrapper">
          <div id="piano" className="piano"></div>
        </section>

        <section className="info">
          <span id="currentNote">Note: —</span>
          <span id="recordStatus">Ready</span>
        </section>
      </main>
    </div>
  );
}
