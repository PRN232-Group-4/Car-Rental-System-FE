"use client";

/**
 * Micro-Haptic Audio Synthesizer via Web Audio API.
 * Produces ultra-low latency, crisp tactile micro-feedback without external audio assets (0 KB payload).
 * Honors dispatcher workspace etiquette: Opt-in by default, persisted in localStorage.
 */

const STORAGE_KEY = "thong_dong_haptic_sound_enabled";

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  return sharedAudioContext;
}

export function isHapticAudioEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHapticAudioEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new Event("thong_dong_haptic_audio_change"));
  } catch {
    // Graceful fallback for restricted storage environments
  }
}

/**
 * Play a high-precision tactile click (e.g. theme toggle, chapter glider select, row click).
 * Sweeps from 1200Hz down to 800Hz in 12ms with exponential gain decay.
 */
export function playTactileClick(): void {
  if (!isHapticAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.012);
  } catch {
    // Fail silently in environments where audio is blocked
  }
}

/**
 * Play a crisp confirmation chime (e.g. rental status progression, step completion).
 * Pure 1760Hz tone (A6) with 20ms quick release.
 */
export function playSuccessChime(): void {
  if (!isHapticAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.024);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.024);
  } catch {
    // Fail silently
  }
}
