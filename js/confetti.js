/**
 * TALKLAB 2.0 - HIGH-PERFORMANCE CANVAS CONFETTI
 * Lightweight particle explosion system for wins, bookings, and quiz results.
 */

const ConfettiFX = (() => {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animId = null;

  function init() {
    canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function blast(originX = 0.5, originY = 0.4, count = 100) {
    if (!ctx) init();
    if (window.SoundFX) SoundFX.playWinFanfare();

    const colors = ['#2F42F0', '#FF4742', '#FFC42B', '#15BD66', '#ADC0E8', '#FF69B4', '#9D4EDD'];
    const startX = window.innerWidth * originX;
    const startY = window.innerHeight * originY;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 7 + Math.random() * 14;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 7 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.014,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!animId) {
      render();
    }
  }

  function render() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.985; // drag
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
      animId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      animId = null;
    }
  }

  return {
    init,
    blast
  };
})();

window.ConfettiFX = ConfettiFX;
