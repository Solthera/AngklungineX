import angklungC4Url from "~/assets/angklung-3-nada-c/angklung-C4.wav";
import angklungC5Url from "~/assets/angklung-3-nada-c/angklung-C5.wav";
import angklungC6Url from "~/assets/angklung-3-nada-c/angklung-C6.wav";
import { noteToMidi, isNotePlayable } from "../utils/piano-helpers";

interface ActiveVoice {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  note: string;
  isSustained: boolean;
}

class AngklungAudioManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private activeVoices: Map<string, ActiveVoice> = new Map();
  private isLoaded = false;
  private isLoading = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async init(): Promise<void> {
    if (this.isLoaded || this.isLoading || typeof window === "undefined") return;
    this.isLoading = true;

    try {
      const ctx = this.getAudioContext();
      const samples: [string, string][] = [
        ["C4", angklungC4Url],
        ["C5", angklungC5Url],
        ["C6", angklungC6Url],
      ];

      await Promise.all(
        samples.map(async ([key, url]) => {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          this.buffers.set(key, audioBuffer);
        }),
      );

      this.isLoaded = true;
    } catch (err) {
      console.error("Failed to load Angklung audio buffers:", err);
    } finally {
      this.isLoading = false;
    }
  }

  public playNote(note: string): void {
    if (typeof window === "undefined") return;
    const midi = noteToMidi(note);
    if (!isNotePlayable(midi)) return;

    const ctx = this.getAudioContext();

    // Determine base sample & semitone offset
    let baseNote = "C4";
    let baseMidi = 60;

    if (midi >= 60 && midi < 72) {
      baseNote = "C4";
      baseMidi = 60;
    } else if (midi >= 72 && midi < 84) {
      baseNote = "C5";
      baseMidi = 72;
    } else if (midi >= 84) {
      baseNote = "C6";
      baseMidi = 84;
    }

    const buffer = this.buffers.get(baseNote);
    if (!buffer) {
      // Trigger lazy load if not ready
      this.init();
      return;
    }

    // Stop existing voice for the same note if already playing
    this.stopVoice(note, 0);

    const semitones = midi - baseMidi;
    const playbackRate = Math.pow(2, semitones / 12);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.loop = true; // Continuous loop while key is held down

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    // Quick linear ramp (8ms attack) to prevent digital click
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.008);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);

    this.activeVoices.set(note, {
      source,
      gainNode,
      note,
      isSustained: false,
    });
  }

  public releaseNote(note: string, sustain: boolean = false): void {
    if (typeof window === "undefined") return;
    const voice = this.activeVoices.get(note);
    if (!voice) return;

    if (sustain) {
      // With sustain ON, keep looping while smoothly decaying over 3.0 seconds (natural acoustic ring-out)
      voice.isSustained = true;
      this.stopVoice(note, 3.0);
    } else {
      // With sustain OFF, apply smooth 500ms natural fade-out
      this.stopVoice(note, 0.5);
    }
  }

  public releaseSustainedNotes(): void {
    if (typeof window === "undefined") return;
    this.activeVoices.forEach((voice, note) => {
      if (voice.isSustained) {
        this.stopVoice(note, 0.2);
      }
    });
  }

  public stopAll(): void {
    if (typeof window === "undefined") return;
    this.activeVoices.forEach((_, note) => {
      this.stopVoice(note, 0.1);
    });
    this.activeVoices.clear();
  }

  private stopVoice(note: string, fadeDuration: number = 0): void {
    const voice = this.activeVoices.get(note);
    if (!voice || !this.ctx) return;

    const { source, gainNode } = voice;
    const now = this.ctx.currentTime;

    if (fadeDuration > 0) {
      const currentGain = Math.max(gainNode.gain.value, 0.001);
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(currentGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);
      try {
        source.stop(now + fadeDuration + 0.02);
      } catch (_) {}
    } else {
      try {
        source.stop(now);
      } catch (_) {}
    }

    this.activeVoices.delete(note);
  }
}

export const angklungAudio = new AngklungAudioManager();
