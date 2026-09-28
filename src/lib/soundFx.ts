// SoundFX engine using Web Audio API (Zero external audio assets needed for FX)

class SoundFXService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('talklab_sound_muted');
      this.isMuted = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('talklab_sound_muted', muted ? 'true' : 'false');
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) this.playPop(700);
    return this.isMuted;
  }

  public playPop(freq = 550): void {
    if (this.isMuted) return;
    try {
      const c = this.getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, c.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.1);
    } catch {
      // Audio context may not be unlocked yet
    }
  }

  public playSlotTick(): void {
    if (this.isMuted) return;
    try {
      const c = this.getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200 + Math.random() * 300, c.currentTime);
      gain.gain.setValueAtTime(0.04, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  public playBuzzer(): void {
    if (this.isMuted) return;
    try {
      const c = this.getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, c.currentTime);
      osc.frequency.linearRampToValueAtTime(110, c.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }

  public playFanfare(): void {
    if (this.isMuted) return;
    try {
      const c = this.getContext();
      if (!c) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, c.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.09, c.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime + idx * 0.09);
        osc.stop(c.currentTime + idx * 0.09 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  public playGavel(): void {
    if (this.isMuted) return;
    try {
      const c = this.getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }
}

export const SoundFX = new SoundFXService();
