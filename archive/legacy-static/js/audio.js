/**
 * TALKLAB 2.0 - ARCADE AUDIO SYNTHESIZER
 * Zero external audio files required. All sounds generated via Web Audio API.
 */

const SoundFX = (() => {
  let ctx = null;
  let isMuted = false;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function updateAudioButtons(muted) {
    document.querySelectorAll('#unified-audio-btn, #sound-toggle-btn').forEach(btn => {
      btn.classList.toggle('audio-muted', muted);
      const icon = btn.querySelector('.audio-btn-icon');
      const label = btn.querySelector('.audio-btn-label');
      if (icon) icon.textContent = muted ? '🔇' : '🔊';
      if (label) label.textContent = muted ? 'Sound: OFF' : 'Sound: ON';
    });
    const drawerIcon = document.getElementById('drawer-audio-icon');
    const drawerLabel = document.getElementById('drawer-audio-label');
    if (drawerIcon) drawerIcon.textContent = muted ? '🔇' : '🔊';
    if (drawerLabel) drawerLabel.textContent = muted ? 'Sound: OFF' : 'Sound: ON';
  }

  function toggleUnifiedAudio() {
    isMuted = !isMuted;
    localStorage.setItem('talklab_sound_muted', isMuted ? 'true' : 'false');
    updateAudioButtons(isMuted);

    const lofiAudio = document.getElementById('lofi-background-audio');
    if (lofiAudio) {
      if (isMuted) {
        lofiAudio.pause();
      } else {
        lofiAudio.play().catch(() => {});
      }
    }

    if (!isMuted) playPop(700);
    return isMuted;
  }

  function toggleMute() {
    return toggleUnifiedAudio();
  }

  function playPop(freq = 550) {
    if (isMuted) return;
    try {
      const c = getContext();
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
    } catch (e) {}
  }

  function playSlotTick() {
    if (isMuted) return;
    try {
      const c = getContext();
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
    } catch (e) {}
  }

  function playWinFanfare() {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, c.currentTime);
          gain.gain.setValueAtTime(0.07, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.38);
        }, idx * 75);
      });
    } catch (e) {}
  }

  function playBuzzer() {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, c.currentTime);
      osc.frequency.linearRampToValueAtTime(120, c.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.3);
    } catch (e) {}
  }

  function init() {
    const saved = localStorage.getItem('talklab_sound_muted');
    if (saved === 'true') {
      isMuted = true;
    }
    updateAudioButtons(isMuted);

    document.addEventListener('click', (e) => {
      if (e.target.closest('#unified-audio-btn, #sound-toggle-btn')) {
        toggleUnifiedAudio();
      }
    });
  }

  function setMuted(val) {
    isMuted = !!val;
    localStorage.setItem('talklab_sound_muted', isMuted ? 'true' : 'false');
    updateAudioButtons(isMuted);
  }

  function getMuted() {
    return isMuted;
  }

  return {
    init,
    toggleMute,
    toggleUnifiedAudio,
    setMuted,
    getMuted,
    updateAudioButtons,
    playPop,
    playSlotTick,
    playWinFanfare,
    playBuzzer
  };
})();

window.SoundFX = SoundFX;
