/**
 * TALKLAB 2.0 - "WHAT'S YOUR ENGLISH VIBE?" PERSONA QUIZ
 * 60-Second relatable quiz that diagnoses speaking style and gives a fun custom card.
 */

const VibeQuiz = (() => {
  const QUESTIONS = [
    {
      title: 'When someone suddenly asks you an English question in public, what happens?',
      options: [
        { icon: '🥶', text: 'My brain buffers for 4 seconds like dial-up internet', vibe: 'overthinker' },
        { icon: '📜', text: 'In my head: pure poetry. Out loud: toddler sentences', vibe: 'overthinker' },
        { icon: '👋', text: 'Heavy hand gestures, big smile, and zero shame', vibe: 'yapper' },
        { icon: '🚀', text: 'I launch into a full speech before they can finish', vibe: 'debater' }
      ]
    },
    {
      title: 'What kind of conversation makes you lose track of time?',
      options: [
        { icon: '🍕', text: 'Defending ridiculous opinions (like pineapple pizza)', vibe: 'debater' },
        { icon: '🌌', text: 'Deep midnight chats about philosophy, AI, and life', vibe: 'observer' },
        { icon: '🎲', text: 'High-speed party games like Taboo where everyone laughs', vibe: 'yapper' },
        { icon: '🎬', text: 'Dissecting movies, plots, and character flaws', vibe: 'observer' }
      ]
    },
    {
      title: 'What is your biggest roadblock to speaking 100% fluently?',
      options: [
        { icon: '😬', text: 'Fear of grammar mistakes or sounding silly', vibe: 'overthinker' },
        { icon: '⏳', text: 'Searching for the exact word and losing my momentum', vibe: 'overthinker' },
        { icon: '🥱', text: 'Traditional classes are boring and feel like chores', vibe: 'yapper' },
        { icon: '👥', text: 'Just need a cool group of people to practice with weekly', vibe: 'observer' }
      ]
    },
    {
      title: 'Pick your signature superpower at the TalkLab table:',
      options: [
        { icon: '🔥', text: 'Injecting high energy and making everyone laugh', vibe: 'yapper' },
        { icon: '💡', text: 'Dropping one clever thought that changes the whole debate', vibe: 'observer' },
        { icon: '⚔️', text: 'Never backing down from a friendly intellectual clash', vibe: 'debater' },
        { icon: '🌱', text: 'Asking the questions that make quiet people open up', vibe: 'observer' }
      ]
    }
  ];

  const PERSONAS = {
    yapper: {
      name: 'The Spontaneous Yap Master',
      avatar: '🗣️✨',
      badge: 'Certified High-Energy Conversationalist',
      desc: 'You speak with heart, humor, and velocity! You don\'t let grammar anxiety slow you down. At TalkLab, our gamified word-ban sprints and improv labs will turn your natural energy into sharp, articulate eloquence.',
      recommended: 'Saturday Immersion (12:00 PM – 4:00 PM)',
      tag: 'Best Match: Gamified Improv & Speed Sprints'
    },
    overthinker: {
      name: 'The Overthinking Genius',
      avatar: '🧠⚡',
      badge: 'Brilliant Mind in Draft Mode',
      desc: 'Your passive vocabulary is huge, but your inner editor checks every sentence five times before letting you speak! TalkLab\'s judgment-free fishbowl warmups will train your spontaneous speaking reflexes so you speak as fast as you think.',
      recommended: 'Tuesday Twilight (4:00 PM – 7:00 PM)',
      tag: 'Best Match: 1-on-1 Dilemma Sparks & Flow Labs'
    },
    debater: {
      name: 'The Chaotic Debater',
      avatar: '⚖️🔥',
      badge: 'Chief Defense of Spicy Takes',
      desc: 'You thrive when there is intellectual friction! You love taking unexpected stances, arguing against the consensus, and testing rhetoric. The TalkLab Fishbowl Debate table is practically built for you.',
      recommended: 'Saturday Immersion (Oxford Fishbowl Arena)',
      tag: 'Best Match: Fishbowl Debates & Hot Takes'
    },
    observer: {
      name: 'The Chill Coffee Philosopher',
      avatar: '☕🌱',
      badge: 'Master of Nuance & Connection',
      desc: 'You listen deeply, spot patterns others miss, and speak when you have something meaningful to say. You love our relaxed sofa breaks, deep moral dilemmas, and thoughtful discussions over warm coffee.',
      recommended: 'Saturday or Tuesday Lounge Track',
      tag: 'Best Match: Moral Dilemmas & Lounge Networking'
    }
  };

  let currentStep = 0;
  let scores = { yapper: 0, overthinker: 0, debater: 0, observer: 0 };

  function renderQuestion() {
    const q = QUESTIONS[currentStep];
    const titleEl = document.getElementById('quiz-title');
    const optionsGrid = document.getElementById('quiz-options-container');
    const progressFill = document.getElementById('quiz-progress-fill');
    const stepLabel = document.getElementById('quiz-step-label');

    if (!titleEl || !optionsGrid) return;

    if (stepLabel) stepLabel.textContent = `Question ${currentStep + 1} of ${QUESTIONS.length}`;
    if (progressFill) progressFill.style.width = `${((currentStep + 1) / QUESTIONS.length) * 100}%`;

    titleEl.textContent = q.title;
    optionsGrid.innerHTML = q.options.map((opt, idx) => `
      <div class="quiz-option-card" onclick="VibeQuiz.pickOption('${opt.vibe}')">
        <span class="quiz-option-icon">${opt.icon}</span>
        <span class="quiz-option-text">${opt.text}</span>
      </div>
    `).join('');
  }

  function pickOption(vibe) {
    if (window.SoundFX) SoundFX.playPop(500 + currentStep * 80);
    scores[vibe] = (scores[vibe] || 0) + 1;

    currentStep++;
    if (currentStep < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const questionCard = document.getElementById('quiz-question-card');
    const resultCard = document.getElementById('quiz-result-card');

    // Find highest scoring vibe
    let winningVibe = 'yapper';
    let max = -1;
    Object.keys(scores).forEach(key => {
      if (scores[key] > max) {
        max = scores[key];
        winningVibe = key;
      }
    });

    const persona = PERSONAS[winningVibe];

    if (questionCard) questionCard.style.display = 'none';
    if (resultCard) {
      resultCard.style.display = 'block';
      resultCard.innerHTML = `
        <div class="persona-result-card">
          <div class="persona-avatar-icon">${persona.avatar}</div>
          <span class="pop-badge coral">${persona.badge}</span>
          <h3 class="persona-name">${persona.name}</h3>
          <p class="persona-desc">${persona.desc}</p>

          <div style="background-color:var(--bg-surface-elevated); border:var(--border-width) solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem; max-width:480px; margin:0 auto 2rem auto; text-align:left;">
            <span style="font-family:var(--font-mono); font-size:0.75rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Recommended Next Step:</span>
            <div style="font-family:var(--font-display); font-size:1.25rem; font-weight:900; color:var(--color-primary); margin:0.3rem 0;">${persona.recommended}</div>
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-main);">${persona.tag}</div>
          </div>

          <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
            <button class="pop-btn pop-btn-primary pop-btn-lg" onclick="BookingSystem.openBookingModal()">
              <span>Book Your Session Pass (30 LYD)</span>
            </button>
            <button class="pop-btn pop-btn-surface pop-btn-lg" onclick="VibeQuiz.restart()">
              <span>Retake Quiz 🔄</span>
            </button>
          </div>
        </div>
      `;
    }

    if (window.ConfettiFX) ConfettiFX.blast(0.5, 0.45, 100);
  }

  function restart() {
    currentStep = 0;
    scores = { yapper: 0, overthinker: 0, debater: 0, observer: 0 };
    const questionCard = document.getElementById('quiz-question-card');
    const resultCard = document.getElementById('quiz-result-card');
    if (questionCard) questionCard.style.display = 'block';
    if (resultCard) resultCard.style.display = 'none';
    renderQuestion();
  }

  function init() {
    renderQuestion();
  }

  return {
    init,
    pickOption,
    restart
  };
})();

window.VibeQuiz = VibeQuiz;
