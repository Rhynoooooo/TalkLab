/**
 * TALKLAB - HIGH-IMPACT INTERACTIVE ENGINE
 * Inspired by modern creative web experiences (Antigravity-level craft):
 * - Canvas Confetti blast
 * - Web Audio synth sound design (pops, chimes, dice rolls)
 * - Interactive Confidence Slider & Track Recommender
 * - 3D Conversation Dice Roller with physics bounce
 * - Live Audio Speech Waveform visualizer
 * - Mouse-tracking card spotlight sheen
 */

const InteractiveEffects = (() => {
  // --------------------------------------------------------------------------
  // 1. Web Audio Sound Synthesizer (Zero external dependencies)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPop(freq = 600) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  function playSuccessChord() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.42);
        }, i * 65);
      });
    } catch (e) {}
  }

  function playDiceRoll() {
    if (!soundEnabled) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playPop(300 + Math.random() * 250), i * 50);
    }
  }

  // --------------------------------------------------------------------------
  // 2. High-Performance Particle Confetti Canvas
  // --------------------------------------------------------------------------
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationFrameId = null;

  function initConfetti() {
    canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function fireConfetti(originX = 0.5, originY = 0.5, count = 90) {
    if (!ctx) initConfetti();
    playSuccessChord();

    // Brand color palette: Cobalt blue, warm terracotta, golden amber, periwinkle, cream
    const colors = ['#3848A4', '#AB3731', '#F5C875', '#B5C8DF', '#2ECC71', '#FF6B6B', '#4D5BCE'];

    const startX = window.innerWidth * originX;
    const startY = window.innerHeight * originY;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const velocity = 8 + Math.random() * 12;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.015,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!animationFrameId) {
      renderConfetti();
    }
  }

  function renderConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > window.innerHeight) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      animationFrameId = null;
    }
  }

  // --------------------------------------------------------------------------
  // 3. Interactive Conversation Dice Roller
  // --------------------------------------------------------------------------
  const DICE_PROMPTS = [
    { icon: '🌶️', text: 'Spicy Hot Take: Defend an unpopular opinion about social media or work culture!' },
    { icon: '✈️', text: 'Travel Story: Tell the story of your most chaotic trip in 60 seconds!' },
    { icon: '🔮', text: 'Future Scenario: If you could download one skill directly into your brain today, what would it be?' },
    { icon: '🎭', text: 'Improv Pitch: Convince the group why your ordinary pen is worth 1,000 LYD!' },
    { icon: '💡', text: 'Moral Dilemma: Would you tell your best friend if their startup idea was terrible?' },
    { icon: '🍕', text: 'Food Debate: What is one dish everyone praises that you secretly despise?' },
    { icon: '⚡', text: 'Quickfire: Name 5 things you would do if days were 36 hours long!' }
  ];

  let currentDiceIdx = 0;

  function rollDice() {
    playDiceRoll();
    const diceCube = document.getElementById('interactive-dice-cube');
    const promptText = document.getElementById('dice-prompt-display');
    const promptIcon = document.getElementById('dice-icon-display');

    if (diceCube) {
      diceCube.classList.remove('rolling');
      void diceCube.offsetWidth; // trigger reflow
      diceCube.classList.add('rolling');
    }

    setTimeout(() => {
      currentDiceIdx = (currentDiceIdx + 1 + Math.floor(Math.random() * (DICE_PROMPTS.length - 1))) % DICE_PROMPTS.length;
      const chosen = DICE_PROMPTS[currentDiceIdx];

      if (promptIcon) promptIcon.textContent = chosen.icon;
      if (promptText) promptText.textContent = chosen.text;
      playPop(750);
    }, 450);
  }

  // --------------------------------------------------------------------------
  // 4. Interactive Confidence Diagnostic Slider
  // --------------------------------------------------------------------------
  const CONFIDENCE_LEVELS = [
    {
      level: 'Hesitant Explorer',
      badge: 'Step 1: Overcoming The Freeze',
      color: '#3848A4',
      advice: 'You have good vocabulary in your head, but hesitate to speak. TalkLab pairs you in 1-on-1 warmups and icebreakers where no one interrupts.',
      recommendedSession: 'Saturday Immersion (12:00 PM)',
      activityFocus: 'Speed Networking & Word Prompts'
    },
    {
      level: 'Conversationalist',
      badge: 'Step 2: Building Speed & Rhythm',
      color: '#AB3731',
      advice: 'You can hold a daily conversation, but search for specific words. Our Taboo and Word-Ban sprints train circumlocution so you never stall.',
      recommendedSession: 'Tuesday Twilight (4:00 PM)',
      activityFocus: 'Dilemma Cards & Taboo Labs'
    },
    {
      level: 'Fluent Debater',
      badge: 'Step 3: Nuance, Wit & Persuasion',
      color: '#B27B1E',
      advice: 'You speak smoothly, now you want to master rhetorical flair, defend controversial points, and command the roundtable.',
      recommendedSession: 'Saturday Immersion (Fishbowl Debates)',
      activityFocus: 'Fishbowl Debates & Spontaneous Improv'
    }
  ];

  function updateConfidenceSlider(val) {
    playPop(450 + val * 4);
    const index = Math.min(Math.floor(val / 34), 2);
    const data = CONFIDENCE_LEVELS[index];

    const titleEl = document.getElementById('conf-slider-title');
    const badgeEl = document.getElementById('conf-slider-badge');
    const descEl = document.getElementById('conf-slider-desc');
    const sessionEl = document.getElementById('conf-slider-session');
    const focusEl = document.getElementById('conf-slider-focus');
    const meterPercent = document.getElementById('conf-meter-percent');

    if (titleEl) titleEl.textContent = data.level;
    if (badgeEl) {
      badgeEl.textContent = data.badge;
      badgeEl.style.color = data.color;
    }
    if (descEl) descEl.textContent = data.advice;
    if (sessionEl) sessionEl.textContent = data.recommendedSession;
    if (focusEl) focusEl.textContent = data.activityFocus;
    if (meterPercent) meterPercent.textContent = `${val}%`;
  }

  // --------------------------------------------------------------------------
  // 5. Mouse Sheen & Magnetic Hover for Cards
  // --------------------------------------------------------------------------
  function initSpotlightCards() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. Sound Toggle
  // --------------------------------------------------------------------------
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.innerHTML = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      soundBtn.classList.toggle('active', soundEnabled);
    }
    if (soundEnabled) playPop(700);
  }

  function init() {
    initConfetti();
    initSpotlightCards();

    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);

    // Dice roller
    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) rollBtn.addEventListener('click', rollDice);

    // Confidence slider
    const slider = document.getElementById('confidence-range-input');
    if (slider) {
      slider.addEventListener('input', (e) => {
        updateConfidenceSlider(parseInt(e.target.value, 10));
      });
      updateConfidenceSlider(50);
    }

    // Attach confetti to booking and vote actions
    window.addEventListener('talklab:booked', (e) => {
      fireConfetti(0.5, 0.4, 120);
    });

    // Add audio click to primary buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => playPop(550));
    });
  }

  return {
    init,
    fireConfetti,
    playPop,
    playSuccessChord,
    rollDice,
    toggleSound
  };
})();

window.InteractiveEffects = InteractiveEffects;
