/**
 * TALKLAB - PARTICIPANT DASHBOARD & COMMUNITY TRACKER
 * Visualizes fluency milestones, speaking hours, attendance streak,
 * gamified badges, ticket wallet, and community debate topic voting.
 */

const ParticipantDashboard = (() => {
  // Mock member profile data with persistent voting and booking history
  const defaultProfile = {
    name: 'Sarah Al-Mansouri',
    level: 'Advanced Conversationalist',
    memberSince: 'October 2025',
    speakingHours: 19.5,
    sessionsAttended: 6,
    activeStreak: 4, // 4 weeks in a row
    xpPoints: 850,
    fluencyScores: {
      confidence: 88,
      spontaneity: 82,
      vocabulary: 76,
      activeListening: 92
    },
    badges: [
      { id: 'icebreaker', title: 'Icebreaker Pro', icon: '❄️', desc: 'Introduced 3 spontaneous topics without pausing', unlocked: true },
      { id: 'debater', title: 'Debate Maestro', icon: '⚖️', desc: 'Successfully defended an opposing viewpoint in Fishbowl', unlocked: true },
      { id: 'story', title: 'Story Architect', icon: '📖', desc: 'Crafted a 3-minute captivating impromptu tale', unlocked: true },
      { id: 'vocab', title: 'Word Ban Slayer', icon: '🎯', desc: 'Won 5 consecutive Taboo sprint rounds', unlocked: true },
      { id: 'streak5', title: 'Loyal Speaker', icon: '🔥', desc: 'Attend 5 consecutive weekly sessions', unlocked: false },
      { id: 'mentor', title: 'Community Spark', icon: '🌟', desc: 'Helped a newcomer feel comfortable speaking', unlocked: false }
    ]
  };

  // Community Topic Poll State
  const defaultPoll = {
    question: 'What topic should we debate this upcoming Saturday?',
    hasVoted: false,
    votedOptionId: null,
    options: [
      { id: 1, title: 'Artificial Intelligence & The Future of Human Jobs', votes: 24 },
      { id: 2, title: 'Is Remote Work Making Us Less Socially Capable?', votes: 19 },
      { id: 3, title: 'The Psychology of Habits: Motivation vs Pure Discipline', votes: 16 },
      { id: 4, title: 'Should Society Ban Algorithmic Feeds for Teenagers?', votes: 21 }
    ]
  };

  function loadPoll() {
    const saved = localStorage.getItem('talklab_community_poll');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultPoll;
  }

  const pollState = loadPoll();

  function savePoll() {
    localStorage.setItem('talklab_community_poll', JSON.stringify(pollState));
  }

  // Render Fluency Metrics
  function renderFluencyMetrics() {
    const grid = document.getElementById('dash-fluency-grid');
    if (!grid) return;

    const scores = defaultProfile.fluencyScores;
    const items = [
      { name: 'Social Confidence', score: scores.confidence, class: 'blue', sub: 'Calculated from speaking turns & body language ease' },
      { name: 'Spontaneous Response', score: scores.spontaneity, class: 'gold', sub: 'Speed of answering unexpected conversational prompts' },
      { name: 'Active Listening & Flow', score: scores.activeListening, class: 'periwinkle', sub: 'Ability to piggyback smoothly on peer points' },
      { name: 'Vocabulary Diversity', score: scores.vocabulary, class: 'terracotta', sub: 'Use of nuanced idioms and varied adjectives' }
    ];

    grid.innerHTML = items.map(item => `
      <div class="metric-card">
        <div class="metric-header">
          <span>${item.name}</span>
          <span style="font-weight:800;">${item.score}%</span>
        </div>
        <div class="metric-bar-bg">
          <div class="metric-bar-fill ${item.class}" style="width: ${item.score}%;"></div>
        </div>
        <div class="metric-sub">${item.sub}</div>
      </div>
    `).join('');
  }

  // Render Badges
  function renderBadges() {
    const container = document.getElementById('dash-badges-grid');
    if (!container) return;

    container.innerHTML = defaultProfile.badges.map(b => `
      <div class="badge-item-card" style="${b.unlocked ? '' : 'opacity: 0.5; filter: grayscale(1);'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.title}</div>
        <div class="badge-desc">${b.desc}</div>
        <div style="font-size:0.65rem; margin-top:0.4rem; font-weight:700; color:${b.unlocked ? 'var(--brand-blue)' : 'var(--text-muted)'};">
          ${b.unlocked ? '✓ UNLOCKED' : '🔒 IN PROGRESS'}
        </div>
      </div>
    `).join('');
  }

  // Render Passes in Wallet
  function renderTicketWallet() {
    const listEl = document.getElementById('dash-passes-list');
    if (!listEl) return;

    const bookingState = BookingSystem.getState();
    const bookings = bookingState.userBookings || [];

    if (bookings.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:2.5rem 1rem; background-color:var(--bg-surface-elevated); border-radius:var(--radius-md); border:1px dashed var(--border-medium);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🎟️</div>
          <h4 style="font-size:1.1rem; margin-bottom:0.3rem;">No active session pass</h4>
          <p style="font-size:0.88rem; margin-bottom:1.25rem;">Reserve a seat for the next Saturday or Tuesday session.</p>
          <button class="btn btn-primary btn-sm" onclick="BookingSystem.openBookingModal()">Book Session (30 LYD)</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = bookings.map(b => `
      <div class="digital-ticket-wrap" style="margin-bottom:1.25rem;">
        <div class="ticket-header">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Ticket Pass</span>
            <div class="ticket-code">${b.id}</div>
          </div>
          <div class="ticket-price-highlight">${b.price}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
          <div>
            <h4 style="font-size:1.15rem; color:var(--brand-blue); margin-bottom:0.2rem;">${b.sessionName}</h4>
            <p style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin-bottom:0.5rem;">${b.day} • ${b.time}</p>
            <div style="font-size:0.82rem; color:var(--text-secondary);">
              <span>Guest: <strong>${b.name}</strong></span> • 
              <span>Seat: <strong>#${b.seatNumber}</strong></span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="BookingSystem.downloadCalendarInvite('${b.id}', '${b.sessionName}', '${b.day}', '${b.time}')">
            📅 Calendar (.ics)
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Community Topic Poll
  function renderPoll() {
    const pollContainer = document.getElementById('community-poll-container');
    if (!pollContainer) return;

    const totalVotes = pollState.options.reduce((sum, opt) => sum + opt.votes, 0);

    pollContainer.innerHTML = `
      <div class="poll-header">
        <span class="section-tag terracotta" style="margin-bottom:0.5rem;">Community Voice</span>
        <h4 class="poll-title">${pollState.question}</h4>
        <p style="font-size:0.85rem; color:var(--text-muted);">
          ${totalVotes} community members voted • ${pollState.hasVoted ? 'Your vote is recorded!' : 'Click any option to cast your vote'}
        </p>
      </div>

      <div class="poll-options-list">
        ${pollState.options.map(opt => {
          const percent = Math.round((opt.votes / totalVotes) * 100);
          const isVoted = pollState.votedOptionId === opt.id;
          return `
            <button class="poll-option-btn ${isVoted ? 'voted' : ''}" onclick="ParticipantDashboard.castVote(${opt.id})">
              <div class="poll-progress-bg" style="width: ${percent}%;"></div>
              <div class="poll-option-content">
                <span>${isVoted ? '✓ ' : ''}${opt.title}</span>
                <span style="color:var(--brand-blue);">${percent}% (${opt.votes})</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function castVote(optionId) {
    if (pollState.hasVoted && pollState.votedOptionId === optionId) return;

    // Undo previous vote if exists
    if (pollState.hasVoted) {
      const prevOpt = pollState.options.find(o => o.id === pollState.votedOptionId);
      if (prevOpt) prevOpt.votes--;
    }

    const opt = pollState.options.find(o => o.id === optionId);
    if (opt) {
      opt.votes++;
      pollState.hasVoted = true;
      pollState.votedOptionId = optionId;
      savePoll();
      renderPoll();
      if (window.TalkLabApp) {
        window.TalkLabApp.showToast('🗳️ Your vote was recorded! Thank you for shaping TalkLab topics.');
      }
    }
  }

  function switchDashTab(tabName) {
    document.querySelectorAll('.dash-tab-link').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    const panels = {
      growth: document.getElementById('dash-panel-growth'),
      passes: document.getElementById('dash-panel-passes'),
      community: document.getElementById('dash-panel-community')
    };

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].style.display = key === tabName ? 'block' : 'none';
      }
    });
  }

  function init() {
    renderFluencyMetrics();
    renderBadges();
    renderTicketWallet();
    renderPoll();

    // Listen to custom booking event to update passes instantly
    window.addEventListener('talklab:booked', () => {
      renderTicketWallet();
    });

    // Tab buttons in dashboard
    document.querySelectorAll('.dash-tab-link').forEach(btn => {
      btn.addEventListener('click', () => {
        switchDashTab(btn.getAttribute('data-tab'));
      });
    });
  }

  return {
    init,
    castVote,
    switchDashTab,
    renderTicketWallet
  };
})();
