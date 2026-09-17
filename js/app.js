/**
 * TALKLAB 2.0 - MAIN ORCHESTRATOR & PALETTE ENGINE
 * Handles instant dynamic palette switching, tactile theme selector,
 * multi-logo theme synchronization, floating reactions, and community voting.
 */

const TalkLabApp = (() => {
  let activePalette = 'pop';

  const THEMES = ['pop', 'cyber', 'ember'];

  const THEME_INFO = {
    pop: {
      name: 'Pop',
      icon: '⚡',
      sub: 'Electric Day',
      logo: 'assets/logo-cream.png',
      bg: '#FFF8EE',
      boxBorder: '#13172E',
      angle: 60,
      soundPitch: 640
    },
    cyber: {
      name: 'Cyber',
      icon: '🌙',
      sub: 'Midnight Neon',
      logo: 'assets/logo-blue.png',
      bg: '#3D46A5',
      boxBorder: '#5965F3',
      angle: -60,
      soundPitch: 520
    },
    ember: {
      name: 'Ember',
      icon: '🔥',
      sub: 'Sunset Warmth',
      logo: 'assets/logo-red.png',
      bg: '#AB3731',
      boxBorder: '#F5C266',
      angle: 180,
      soundPitch: 760
    }
  };

  function normalizeTheme(name) {
    if (!name) return 'pop';
    const lower = String(name).toLowerCase();
    if (lower === 'cyber' || lower === 'midnight') return 'cyber';
    if (lower === 'ember' || lower === 'terracotta') return 'ember';
    return 'pop';
  }

  function calculateSectorFromAngle(angleDeg) {
    const normalized = ((angleDeg % 360) + 360) % 360;
    // 3 Equal 120° sectors matching the user sketch:
    // Pop: centered at 60° (0° to 120°)
    // Ember: centered at 180° (120° to 240°)
    // Cyber: centered at 300° / -60° (240° to 360°)
    if (normalized >= 0 && normalized < 120) return 'pop';
    if (normalized >= 120 && normalized < 240) return 'ember';
    return 'cyber';
  }

  // 1. Dynamic Palette & Multi-Logo Sync Engine
  function setPalette(paletteInput, playFx = true) {
    const paletteName = normalizeTheme(paletteInput);
    activePalette = paletteName;
    document.documentElement.setAttribute('data-palette', paletteName);
    localStorage.setItem('talklab_palette', paletteName);

    const info = THEME_INFO[paletteName] || THEME_INFO.pop;

    // Update active button & card states for theme selector
    document.querySelectorAll('.theme-pill-btn, .drawer-theme-card, .palette-btn').forEach(el => {
      const target = el.getAttribute('data-theme') || el.getAttribute('data-palette-target');
      el.classList.toggle('active', normalizeTheme(target) === paletteName);
    });

    // Update mobile quick cycle button
    const mobIcon = document.getElementById('mobile-theme-icon');
    const mobName = document.getElementById('mobile-theme-name');
    if (mobIcon) mobIcon.textContent = info.icon;
    if (mobName) mobName.textContent = info.name;

    // Synchronize ALL logos across the site
    // 1. Header/Navbar Logo
    const logoImg = document.getElementById('navbar-brand-logo');
    const logoBox = document.getElementById('header-logo-container');
    if (logoImg) logoImg.src = info.logo;
    if (logoBox) {
      logoBox.style.backgroundColor = info.bg;
      logoBox.style.borderColor = info.boxBorder;
    }

    // 2. Spotlight Logo
    const spotImg = document.getElementById('spotlight-brand-logo');
    const spotBox = document.getElementById('spotlight-logo-container');
    if (spotImg) spotImg.src = info.logo;
    if (spotBox) {
      spotBox.style.backgroundColor = info.bg;
      spotBox.style.borderColor = info.boxBorder;
    }

    // 3. Footer Logo
    const footImg = document.getElementById('footer-brand-logo');
    const footBox = document.getElementById('footer-logo-container');
    if (footImg) footImg.src = info.logo;
    if (footBox) {
      footBox.style.backgroundColor = info.bg;
      footBox.style.borderColor = info.boxBorder;
    }

    // 4. Hero Watermark Logo
    const watermark = document.querySelector('.hero-logo-watermark img');
    if (watermark) watermark.src = info.logo;

    // 5. Official Partnership TalkLab Logo
    const partnerImg = document.querySelector('.partnership-talklab-img');
    if (partnerImg) {
      partnerImg.src = info.logo;
      partnerImg.style.backgroundColor = info.bg;
      partnerImg.style.borderColor = info.boxBorder;
    }

    // 6. Browser Favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.setAttribute('href', info.logo);

    if (playFx && window.SoundFX) SoundFX.playPop(info.soundPitch);
  }

  function cycleNextTheme() {
    const currentIndex = THEMES.indexOf(activePalette);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setPalette(THEMES[nextIndex], true);
  }

  function cyclePrevTheme() {
    const currentIndex = THEMES.indexOf(activePalette);
    const prevIndex = (currentIndex - 1 + THEMES.length) % THEMES.length;
    setPalette(THEMES[prevIndex], true);
  }

  // 2. Tactile Theme Selector & Atmosphere Engine
  function initPalettes() {
    const saved = localStorage.getItem('talklab_palette') || 'pop';
    setPalette(saved, false);

    // Click handler for theme pill buttons, drawer cards, and mobile quick cycle
    document.addEventListener('click', (e) => {
      // 1. Theme Switcher Bar Pills
      const themePill = e.target.closest('.theme-pill-btn, .drawer-theme-card, .palette-btn');
      if (themePill) {
        const target = themePill.getAttribute('data-theme') || themePill.getAttribute('data-palette-target');
        if (target) setPalette(target, true);
        return;
      }

      // 2. Mobile Quick Cycle Button
      const mobCycleBtn = e.target.closest('#mobile-theme-cycle-btn');
      if (mobCycleBtn) {
        cycleNextTheme();
        return;
      }
    });

    // Keyboard shortcut 't' to cycle theme
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 't' || e.key === 'T') cycleNextTheme();
    });
  }

  // 3. Floating Emoji Reactions
  function shootFloatingEmoji(emoji, clientX, clientY) {
    if (window.SoundFX) SoundFX.playPop(480 + Math.random() * 260);

    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emoji;
    el.style.left = `${clientX - 20}px`;
    el.style.top = `${clientY - 20}px`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1250);
  }

  function initEmojiReactions() {
    document.querySelectorAll('.emoji-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = btn.getAttribute('data-emoji') || btn.textContent.trim();
        const rect = btn.getBoundingClientRect();
        shootFloatingEmoji(emoji, rect.left + rect.width / 2, rect.top);
      });
    });
  }

  // 4. Toast Notifications - PERMANENTLY MUTED per user instruction
  function showToast(message, icon = '💬') {
    // Intentionally muted: eliminates disruptive notification popups on every user action
    return;
  }

  // 5. Community Debate Topic Voting (With LocalStorage Persistence & Anti-Spam Mitigation)
  const STORAGE_KEY_VOTES = 'talklab_poll_votes_v2';
  const STORAGE_KEY_USER_PICK = 'talklab_poll_user_voted_id_v2';

  const DEFAULT_POLL_OPTIONS = [
    { id: 1, text: 'Is social media ruining Gen-Z conversational skills?', votes: 42 },
    { id: 2, text: 'Will AI make human essay writing completely obsolete?', votes: 38 },
    { id: 3, text: 'Should homework be banned by international law?', votes: 55 },
    { id: 4, text: 'Would you rather speak 10 languages or talk to animals?', votes: 49 }
  ];

  let pollOptions = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_POLL_OPTIONS.length) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_POLL_OPTIONS.map(o => ({ ...o }));
  })();

  let userVotedId = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PICK);
      return saved ? parseInt(saved, 10) : null;
    } catch (e) {
      return null;
    }
  })();

  let isVotingProcessing = false;
  let lastVoteClickTime = 0;

  function renderPoll() {
    const container = document.getElementById('community-poll-box');
    if (!container) return;

    const total = pollOptions.reduce((acc, o) => acc + o.votes, 0);

    // Update the total votes counter in the section header
    const totalLabel = document.getElementById('poll-total-votes-label');
    if (totalLabel) {
      totalLabel.textContent = `${total} Votes Cast`;
    }

    const hasVoted = userVotedId !== null;

    let html = pollOptions.map(opt => {
      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
      const isSelected = userVotedId === opt.id;

      return `
        <div class="pop-card poll-card-option ${isSelected ? 'poll-option-chosen' : ''} ${hasVoted ? 'poll-option-voted' : ''}" 
             style="position:relative; overflow:hidden; padding:1.15rem 1.25rem; margin-bottom:0.85rem; cursor:${hasVoted ? 'default' : 'pointer'}; border:${isSelected ? '2.5px solid var(--color-primary)' : 'var(--border-width) solid var(--border-color)'}; box-shadow:${isSelected ? '0 0 0 2px var(--color-primary-light), 4px 4px 0 var(--shadow-color)' : 'var(--shadow-pop)'};"
             onclick="TalkLabApp.votePoll(${opt.id})"
             role="button"
             aria-pressed="${isSelected}"
             title="${hasVoted ? (isSelected ? 'Your recorded vote' : 'You have already voted') : 'Click to cast your vote'}">
          
          <!-- Background progress fill representing vote share -->
          <div style="position:absolute; top:0; left:0; bottom:0; width:${pct}%; background:${isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface-elevated)'}; opacity:0.7; z-index:0; transition:width 0.45s cubic-bezier(0.16, 1, 0.3, 1); pointer-events:none;"></div>
          
          <div style="position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <div style="font-weight:800; font-size:1.02rem; display:flex; align-items:center; gap:0.6rem; flex:1; min-width:200px;">
              <span style="font-size:1.15rem;">${isSelected ? '✅' : '⚡'}</span>
              <span style="color:${isSelected ? 'var(--color-primary)' : 'var(--text-main)'}; line-height:1.35;">${opt.text}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              ${isSelected ? '<span class="pop-badge mint" style="font-size:0.72rem; padding:0.2rem 0.5rem; margin:0;">Your Pick ✓</span>' : ''}
              <div style="font-family:var(--font-mono); font-weight:900; font-size:1.15rem; color:var(--color-primary); white-space:nowrap;">
                ${pct}% <span style="font-size:0.88rem; color:var(--text-muted); font-weight:700;">(${opt.votes})</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Status / Anti-Spam Notification Banner below options
    if (hasVoted) {
      const chosenOpt = pollOptions.find(o => o.id === userVotedId);
      html += `
        <div style="margin-top:1rem; padding:0.85rem 1rem; border-radius:var(--radius-sm); background:var(--color-accent-mint-light); border:1.5px solid var(--color-accent-mint); color:#0B5B2E; display:flex; align-items:center; gap:0.65rem; font-size:0.88rem; font-weight:800;">
          <span style="font-size:1.2rem;">✓</span>
          <span>Your vote has been securely recorded for: <em>"${chosenOpt ? chosenOpt.text : 'Topic'}"</em>. Thank you for shaping TalkLab!</span>
        </div>
      `;
    } else {
      html += `
        <div style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-muted); text-align:center; font-weight:700;">
          🔒 Anti-Spam Protected • One vote per member • Results update live
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function votePoll(id) {
    const now = Date.now();

    // 1. Anti-Spam Mitigation: Rate-limiting / debounce check
    if (now - lastVoteClickTime < 800 || isVotingProcessing) {
      return;
    }
    lastVoteClickTime = now;

    // 2. Anti-Spam Mitigation: Check if already voted
    if (userVotedId !== null) {
      if (window.SoundFX && typeof window.SoundFX.playPop === 'function') {
        window.SoundFX.playPop(340);
      }
      return;
    }

    const opt = pollOptions.find(o => o.id === id);
    if (!opt) return;

    isVotingProcessing = true;

    // Increment vote count and record state
    opt.votes++;
    userVotedId = id;

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(pollOptions));
      localStorage.setItem(STORAGE_KEY_USER_PICK, id.toString());
    } catch (e) {}

    // Audio-visual celebration
    if (window.SoundFX && typeof window.SoundFX.playPop === 'function') {
      window.SoundFX.playPop(680);
    }
    if (window.ConfettiFX && typeof window.ConfettiFX.blast === 'function') {
      window.ConfettiFX.blast(0.5, 0.6, 70);
    }

    renderPoll();
    isVotingProcessing = false;
  }

  // 6. Mobile Navigation Drawer
  function initMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');

    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });

      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
        });
      });
    }
  }

  // 7. Direct 1-Click Google Maps Navigation
  const GOOGLE_MAPS_LOCATION = {
    name: 'مركز سفراء العلم للتدريب والتطوير',
    nameEn: 'Sofaraa Al-Elm Training & Development Center',
    address: 'حي الأندلس، شارع البريد، طرابلس',
    phone: '0920920230',
    shortUrl: 'https://maps.app.goo.gl/MAhR7ex6inas34818',
    fullUrl: 'https://maps.google.com/?q=%D9%85%D8%B1%D9%83%D8%B2+%D8%B3%D9%81%D8%B1%D8%A7%D8%A1+%D8%A7%D9%84%D8%B9%D9%84%D9%84%D9%85+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D9%88%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%D8%8C+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%A8%D8%B1%D9%8A%D8%AF,+Tripoli&ftid=0x13a8edb16770518d:0xac3648e0d6923b2e',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=%D9%85%D8%B1%D9%83%D8%B2+%D8%B3%D9%81%D8%B1%D8%A7%D8%A1+%D8%A7%D9%84%D8%B9%D9%84%D9%84%D9%85+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D9%88%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%D8%8C+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%A8%D8%B1%D9%8A%D8%AF,+Tripoli'
  };

  function openGoogleMapsLocation(mode = 'short') {
    const targetUrl = mode === 'directions' 
      ? GOOGLE_MAPS_LOCATION.directionsUrl 
      : GOOGLE_MAPS_LOCATION.shortUrl;
    
    if (window.SoundFX) window.SoundFX.playPop(520);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  window.openGoogleMapsLocation = openGoogleMapsLocation;

  // 8. Master Init
  function init() {
    initPalettes();
    initEmojiReactions();
    initMobileNav();
    renderPoll();

    document.addEventListener('click', (e) => {
      const mapsTarget = e.target.closest('[data-action="open-maps"], .js-open-maps');
      if (mapsTarget) {
        e.preventDefault();
        const mode = mapsTarget.getAttribute('data-maps-mode') || 'short';
        openGoogleMapsLocation(mode);
      }
    });

    const modules = [
      { name: 'SoundFX', obj: window.SoundFX },
      { name: 'ConfettiFX', obj: window.ConfettiFX },
      { name: 'ConversationSlotMachine', obj: window.ConversationSlotMachine },
      { name: 'VibeQuiz', obj: window.VibeQuiz },
      { name: 'TabooArcade', obj: window.TabooArcade },
      { name: 'BookingSystem', obj: window.BookingSystem },
      { name: 'SlangAndDebateLab', obj: window.SlangAndDebateLab },
      { name: 'LofiSoundscape', obj: window.LofiSoundscape },
      { name: 'EasterEggs', obj: window.EasterEggs }
    ];

    modules.forEach(m => {
      if (m.obj && typeof m.obj.init === 'function') {
        try {
          m.obj.init();
        } catch (err) {
          console.warn(`[TalkLab] Init error in ${m.name}:`, err);
        }
      }
    });
  }

  return {
    init,
    setPalette,
    cycleNextTheme,
    cyclePrevTheme,
    votePoll,
    showToast,
    openGoogleMapsLocation,
    GOOGLE_MAPS_LOCATION
  };
})();

window.TalkLabApp = TalkLabApp;

document.addEventListener('DOMContentLoaded', () => {
  TalkLabApp.init();
});
