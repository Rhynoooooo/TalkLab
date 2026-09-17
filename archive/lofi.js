/**
 * TALKLAB 2.0 - LOFI AUDIO SYSTEM
 * Legacy Web Audio synthesizer has been permanently removed.
 * Background music is exclusively driven by the YouTube player (Super Lofi World 4-minute loop).
 */
const LofiSoundscape = {
  init: function() {},
  play: function() {
    if (window.LofiSoundscape && window.LofiSoundscape !== LofiSoundscape && typeof window.LofiSoundscape.play === 'function') {
      window.LofiSoundscape.play();
    }
  },
  pause: function() {
    if (window.LofiSoundscape && window.LofiSoundscape !== LofiSoundscape && typeof window.LofiSoundscape.pause === 'function') {
      window.LofiSoundscape.pause();
    }
  },
  toggle: function() {
    if (window.LofiSoundscape && window.LofiSoundscape !== LofiSoundscape && typeof window.LofiSoundscape.toggle === 'function') {
      window.LofiSoundscape.toggle();
    }
  },
  setMood: function() {},
  setVolume: function(v) {
    if (window.LofiSoundscape && window.LofiSoundscape !== LofiSoundscape && typeof window.LofiSoundscape.setVolume === 'function') {
      window.LofiSoundscape.setVolume(v);
    }
  },
  isPlaying: function() {
    return window.LofiSoundscape && window.LofiSoundscape !== LofiSoundscape && typeof window.LofiSoundscape.isPlaying === 'function'
      ? window.LofiSoundscape.isPlaying()
      : false;
  }
};

window.LofiSoundscape = window.LofiSoundscape || LofiSoundscape;
