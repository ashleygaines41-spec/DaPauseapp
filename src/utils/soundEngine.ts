/**
 * Web Audio API Sound Synthesizer
 * Zero-latency audio feedback with 5 customizable tones.
 */

import { ToneId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play any of the 5 selectable tones
   */
  public playTone(tone: ToneId) {
    if (this.isMuted) return;
    switch (tone) {
      case 'gentle_harmony':
        this.playGentleHarmony();
        break;
      case 'celestial_chime':
        this.playCelestialChime();
        break;
      case 'modern_pulse':
        this.playModernPulse();
        break;
      case 'classic_bell':
        this.playClassicBell();
        break;
      case 'urgent_staccato':
        this.playUrgentStaccato();
        break;
      default:
        this.playGentleHarmony();
    }
  }

  /**
   * Tone 1: Gentle Harmony (Melodic Triad C5 -> E5 -> G5)
   */
  public playGentleHarmony() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0, now + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.65);
    });
  }

  /**
   * Tone 2: Celestial Chime (Harp Arpeggio G4 -> B4 -> D5 -> G5 -> B5)
   */
  public playCelestialChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.19, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.8);
    });
  }

  /**
   * Tone 3: Modern Pulse (Electronic Dual-Tone Beep 660Hz -> 880Hz)
   */
  public playModernPulse() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bursts = [
      { freq: 659.25, offset: 0, duration: 0.12 },
      { freq: 880.0, offset: 0.14, duration: 0.22 },
    ];

    bursts.forEach(({ freq, offset, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.22, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + duration + 0.05);
    });
  }

  /**
   * Tone 4: Classic Bell (Resonant 440Hz with Rich Overtones)
   */
  public playClassicBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [
      { freq: 440, vol: 0.22 },
      { freq: 880, vol: 0.12 },
      { freq: 1320, vol: 0.06 },
    ];

    partials.forEach(({ freq, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  /**
   * Tone 5: Urgent Staccato (Rapid High-Attention Dual Beep 800Hz / 1000Hz)
   */
  public playUrgentStaccato() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beeps = [0, 0.12, 0.24, 0.36];

    beeps.forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 800 : 1000, now + offset);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.12, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  // Backward compatibility aliases
  public playReminderChime() {
    this.playGentleHarmony();
  }

  public playMedicationChime() {
    this.playCelestialChime();
  }

  public playUrgentRing() {
    this.playUrgentStaccato();
  }

  /**
   * Gentle Family Check-in Chime
   */
  public playCheckInChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.55);
    });
  }

  /**
   * Pulsing Emergency SOS Siren
   */
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  public startSiren() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || this.sirenOsc) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    for (let t = 0; t < 20; t += 0.7) {
      osc.frequency.linearRampToValueAtTime(1100, now + t + 0.35);
      osc.frequency.linearRampToValueAtTime(600, now + t + 0.7);
    }

    gain.gain.setValueAtTime(0.25, now);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);

    this.sirenOsc = osc;
    this.sirenGain = gain;
  }

  public stopSiren() {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      this.sirenGain.disconnect();
      this.sirenGain = null;
    }
  }

  public playSuccessDing() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundEngine = new SoundEngine();
