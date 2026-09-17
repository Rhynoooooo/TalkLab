/**
 * TALKLAB 2.0 - HIDDEN EASTER EGGS MODULE
 * Fun to find yet very hidden:
 * 1. Konami Code (↑ ↑ ↓ ↓ ← → ← → B A): Retro 8-bit Arcade Party & Secret Member Code
 * 2. 5-Click Logo Secret: Founder's Secret Diary & VIP Lounge Pass
 * 3. 3-Click Barista Coffee Mug: Steaming Latte Art & Barista Member Secret
 * 4. 3-Click Moderator Chair: Fishbowl Gavel Strike & Spontaneous Debate Penalty
 * 5. Secret Footer Slang Decoder: Hidden bilingual Tripoli conversational idioms
 */

const EasterEggs = (() => {
  // 1. Konami Code Sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  function initKonamiCode() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expectedKey = KONAMI_CODE[konamiIndex].length === 1 ? KONAMI_CODE[konamiIndex].toLowerCase() : KONAMI_CODE[konamiIndex];

      if (key === expectedKey) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
          triggerKonamiCelebration();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  function triggerKonamiCelebration() {
    if (window.ConfettiFX) ConfettiFX.blast(0.5, 0.4, 200);
    if (window.SoundFX) SoundFX.playFanfare();

    document.documentElement.classList.add('party-mode-active');
    setTimeout(() => {
      document.documentElement.classList.remove('party-mode-active');
    }, 12000);

    showSecretModal(
      '🎮 RETRO CHEAT CODE ACTIVATED!',
      `
      <div style="text-align:center;">
        <div style="font-size:3.5rem; margin-bottom:0.5rem; animation:pop-bounce 1s infinite alternate;">🕹️</div>
        <span class="pop-badge gold" style="font-size:0.85rem; margin-bottom:1rem;">Secret Developer Vault</span>
        <h4 style="font-size:1.4rem; font-weight:900; margin-bottom:0.75rem;">You Found the Konami Easter Egg!</h4>
        <p style="font-size:0.95rem; line-height:1.6; margin-bottom:1.5rem;">
          You unlocked the hidden retro gamer badge! Take a screenshot and flash it to the TalkLab team at <strong>People & Spaces</strong> for an exclusive secret welcome sticker pack.
        </p>
        <div style="background:var(--bg-surface-elevated); border:2px dashed var(--color-primary); border-radius:12px; padding:1rem; font-family:var(--font-mono); font-size:1.15rem; font-weight:900; color:var(--color-primary); margin-bottom:1.5rem;">
          SECRET PASS: <strong>TALKCHAMP-25</strong>
        </div>
      </div>
      `
    );
  }

  // 2. 5-Click Brand Logo Secret
  let logoClicks = 0;
  let logoTimer = null;

  function initLogoSecret() {
    const logoContainer = document.getElementById('header-logo-container');
    if (!logoContainer) return;

    logoContainer.style.cursor = 'pointer';
    logoContainer.addEventListener('click', () => {
      logoClicks++;
      clearTimeout(logoTimer);

      if (window.SoundFX) SoundFX.playPop(450 + logoClicks * 70);

      if (logoClicks >= 5) {
        logoClicks = 0;
        triggerFounderDiarySecret();
      } else {
        logoTimer = setTimeout(() => {
          logoClicks = 0;
        }, 2200);
      }
    });
  }

  function triggerFounderDiarySecret() {
    if (window.ConfettiFX) ConfettiFX.blast(0.3, 0.3, 90);
    if (window.SoundFX) SoundFX.playFanfare();

    showSecretModal(
      '🕵️ TALKLAB FOUNDER\'S SECRET NOTEBOOK',
      `
      <div style="text-align:left;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
          <span style="font-size:2.5rem;">📓</span>
          <div>
            <h4 style="font-size:1.25rem; font-weight:900;">The Real Story of TalkLab</h4>
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--color-primary); font-weight:800;">CONFIDENTIAL • FOUNDER VAULT</span>
          </div>
        </div>
        <p style="font-size:0.92rem; line-height:1.65; margin-bottom:1rem;">
          "We founded TalkLab because every English institute in Tripoli felt like school homework: boring grammar drills, silent rooms, and teachers grading your mistakes. We wanted a place that felt like an intellectual coffee club where people actually <em>wanted</em> to hang out, debate spicy topics, and talk without fear."
        </p>
        <p style="font-size:0.92rem; line-height:1.65; margin-bottom:1.25rem;">
          "That's why we capped sessions at 25 members, set up at <strong>People & Spaces</strong>, and banned all textbook lectures. Real fluency comes from debating about real life!"
        </p>
        <div style="background:var(--bg-surface-elevated); border:2px solid var(--border-color); border-radius:12px; padding:0.85rem 1.25rem; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
          <span>Achievement Unlocked: <strong>Curiosity Cat</strong></span>
          <span class="pop-badge mint">+250 XP</span>
        </div>
      </div>
      `
    );
  }

  // 3. 3-Click Barista Coffee Mug Easter Egg
  let coffeeClicks = 0;
  let coffeeTimer = null;

  function initCoffeeMugSecret() {
    const coffeeIcon = document.getElementById('secret-coffee-trigger');
    if (!coffeeIcon) return;

    coffeeIcon.addEventListener('click', (e) => {
      coffeeClicks++;
      clearTimeout(coffeeTimer);

      if (window.SoundFX) SoundFX.playPop(600 + coffeeClicks * 80);

      // Create steam puff
      spawnSteamBubble(e.clientX, e.clientY);

      if (coffeeClicks >= 3) {
        coffeeClicks = 0;
        triggerBaristaSecret();
      } else {
        coffeeTimer = setTimeout(() => {
          coffeeClicks = 0;
        }, 1800);
      }
    });
  }

  function spawnSteamBubble(x, y) {
    const bubble = document.createElement('div');
    bubble.className = 'steam-puff-emoji';
    bubble.textContent = '☕';
    bubble.style.left = `${x - 15}px`;
    bubble.style.top = `${y - 20}px`;
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1000);
  }

  function triggerBaristaSecret() {
    if (window.ConfettiFX) ConfettiFX.blast(0.7, 0.6, 80);
    showSecretModal(
      '☕ BARISTA SECRET UNLOCKED!',
      `
      <div style="text-align:center;">
        <div style="font-size:3.5rem; margin-bottom:0.5rem;">✨☕✨</div>
        <span class="pop-badge coral" style="font-size:0.85rem; margin-bottom:1rem;">People & Spaces Cafe Secret</span>
        <h4 style="font-size:1.35rem; font-weight:900; margin-bottom:0.75rem;">Secret Barista Recommendation</h4>
        <p style="font-size:0.95rem; line-height:1.6; margin-bottom:1.5rem;">
          The barista at People & Spaces recommends the <strong>Spanish Iced Cortado with Oat Milk</strong> or the <strong>Matcha Vanilla Cloud</strong> before the Saturday fishbowl debate.
        </p>
        <div style="background:var(--bg-surface-elevated); border:2px solid var(--border-color); border-radius:12px; padding:1rem; font-family:var(--font-mono); font-size:0.95rem; font-weight:800;">
          💡 TalkLab members get an exclusive discount at the People & Spaces Cafe! Just show your digital pass.
        </div>
      </div>
      `
    );
  }

  // 4. 3-Click Moderator Chair Gavel Strike
  let leadClicks = 0;
  let leadTimer = null;

  function initLeadChairSecret() {
    const leadChair = document.getElementById('secret-lead-chair-trigger');
    if (!leadChair) return;

    leadChair.addEventListener('click', () => {
      leadClicks++;
      clearTimeout(leadTimer);

      if (leadClicks >= 3) {
        leadClicks = 0;
        triggerGavelStrike();
      } else {
        if (window.SoundFX) SoundFX.playPop(520 + leadClicks * 80);
        leadTimer = setTimeout(() => {
          leadClicks = 0;
        }, 1800);
      }
    });
  }

  function triggerGavelStrike() {
    // Play synthetic double gavel strike
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const strike = (time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.12);
      };
      strike(ctx.currentTime);
      strike(ctx.currentTime + 0.18);
    } catch (e) {}

    showSecretModal(
      '👨‍⚖️ ORDER IN THE FISHBOWL!',
      `
      <div style="text-align:center;">
        <div style="font-size:3.5rem; margin-bottom:0.5rem;">🔨</div>
        <span class="pop-badge mint" style="font-size:0.85rem; margin-bottom:1rem;">Moderator\'s Hot Seat Gavel</span>
        <h4 style="font-size:1.4rem; font-weight:900; margin-bottom:0.75rem;">“Objection! You Must Now Speak!”</h4>
        <p style="font-size:0.95rem; line-height:1.6; margin-bottom:1.5rem;">
          You triggered the Moderator\'s Gavel! Your spontaneous speaking challenge:
        </p>
        <div style="background:var(--bg-surface-elevated); border:2px dashed var(--color-accent-coral); border-radius:12px; padding:1.2rem; font-size:1.05rem; font-weight:800; line-height:1.5; color:var(--text-main); margin-bottom:1.5rem;">
          “Explain why pineapple on pizza is either a culinary masterpiece or an international crime—without using the word 'delicious' or 'bad'!”
        </div>
      </div>
      `
    );
  }

  // 5. Secret Footer Decoder Trigger
  function initFooterDecoder() {
    const keyTrigger = document.getElementById('secret-footer-key');
    if (!keyTrigger) return;

    keyTrigger.addEventListener('click', () => {
      if (window.ConfettiFX) ConfettiFX.blast(0.5, 0.8, 70);
      showSecretModal(
        '🔑 SECRET TRIPOLI SLANG ARCHIVE',
        `
        <div style="text-align:left;">
          <h4 style="font-size:1.3rem; font-weight:900; margin-bottom:0.5rem;">Bilingual TalkLab Slang Decoded</h4>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1.25rem;">
            Phrases our Libyan university members invented during chaotic Saturday debates:
          </p>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div style="background:var(--bg-surface-elevated); border:2px solid var(--border-color); border-radius:10px; padding:0.85rem;">
              <strong style="color:var(--color-primary);">1. "Yap-Session Overdrive"</strong>
              <p style="font-size:0.85rem; margin-top:0.2rem;">When a quiet person suddenly speaks for 6 minutes straight without stopping because the debate topic hit too close to home.</p>
            </div>
            <div style="background:var(--bg-surface-elevated); border:2px solid var(--border-color); border-radius:10px; padding:0.85rem;">
              <strong style="color:var(--color-accent-coral);">2. "The Coffee Pause Pivot"</strong>
              <p style="font-size:0.85rem; margin-top:0.2rem;">Strategically sipping your People & Spaces latte to buy 5 seconds while your brain translates an idiom from Libyan Arabic to English.</p>
            </div>
            <div style="background:var(--bg-surface-elevated); border:2px solid var(--border-color); border-radius:10px; padding:0.85rem;">
              <strong style="color:var(--color-accent-mint);">3. "Fishbowl Immunity"</strong>
              <p style="font-size:0.85rem; margin-top:0.2rem;">Delivering such a hilarious argument that the whole table starts laughing and forfeits their rebuttal.</p>
            </div>
          </div>
        </div>
        `
      );
    });
  }

  // Shared Secret Modal System
  function showSecretModal(title, htmlContent) {
    let modal = document.getElementById('easter-egg-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'easter-egg-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-card" style="max-width:520px;">
          <button class="modal-close-cross" id="easter-modal-close">✕</button>
          <div id="easter-modal-body"></div>
          <button class="pop-btn pop-btn-primary" id="easter-modal-btn" style="width:100%; justify-content:center; margin-top:1.5rem;">
            Awesome, Got It!
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#easter-modal-close').addEventListener('click', () => {
        modal.classList.remove('open');
      });
      modal.querySelector('#easter-modal-btn').addEventListener('click', () => {
        modal.classList.remove('open');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    const body = modal.querySelector('#easter-modal-body');
    body.innerHTML = htmlContent;
    modal.classList.add('open');
  }

  function init() {
    initKonamiCode();
    initLogoSecret();
    initCoffeeMugSecret();
    initLeadChairSecret();
    initFooterDecoder();
  }

  return {
    init,
    showSecretModal
  };
})();

window.EasterEggs = EasterEggs;
