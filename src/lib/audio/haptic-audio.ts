"use client";

/**
 * Micro-Haptic Audio Synthesizer via Web Audio API.
 * Produces ultra-low latency, crisp tactile micro-feedback without external audio assets (0 KB payload).
 * Honors dispatcher & visitor workspace etiquette: Opt-in by default, persisted in localStorage.

 */

const STORAGE_KEY = "thong_dong_haptic_sound_enabled";

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

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
 * Pure 1760Hz tone (A6) with 24ms quick release.

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

/**
 * Play a futuristic dual-tone remote vehicle unlock chirp (1800Hz -> 2400Hz).
 */
export function playRemoteUnlock(): void {
  if (!isHapticAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.04);
    gain1.gain.setValueAtTime(0.045, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2400, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2800, now + 0.09);
    gain2.gain.setValueAtTime(0.045, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.09);
  } catch {
    // Fail silently
  }
}

/**
 * Play a solid mechanical vehicle lock confirmation chirp (2200Hz single pulse).
 */
export function playRemoteLock(): void {
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
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch {
    // Fail silently
  }
}

/**
 * Play a subtle rolling tick when numbers roll on an odometer/pricing counter (1400Hz 6ms).
 */
export function playRollingTick(): void {
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

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.006);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.006);
  } catch {
    // Fail silently
  }
}

/**
 * Play a subtle warning thud (140Hz -> 60Hz).
 */
export function playWarningThud(): void {
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
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Fail silently
  }
}

