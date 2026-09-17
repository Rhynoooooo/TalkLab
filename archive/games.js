/**
 * TALKLAB - GAMIFIED ACTIVITIES & MINI-GAME MODULE
 * Interactive Taboo card deck, conversation dilemma generator, and audio cues.
 */

const GamesHub = (() => {
  // Curated Taboo Cards Deck
  const TABOO_CARDS = [
    {
      word: 'COFFEE',
      forbidden: ['DRINK', 'CAFE', 'CUP', 'MORNING']
    },
    {
      word: 'VACATION',
      forbidden: ['BEACH', 'TRAVEL', 'HOTEL', 'SUMMER']
    },
    {
      word: 'SMARTPHONE',
      forbidden: ['SCREEN', 'CALL', 'APP', 'APPLE']
    },
    {
      word: 'REMOTE WORK',
      forbidden: ['HOME', 'OFFICE', 'ZOOM', 'PAJAMAS']
    },
    {
      word: 'PROCRASTINATION',
      forbidden: ['DELAY', 'LATER', 'LAZY', 'TOMORROW']
    },
    {
      word: 'SUPERPOWER',
      forbidden: ['FLY', 'HERO', 'COMIC', 'MAGIC']
    },
    {
      word: 'CONFIDENCE',
      forbidden: ['SHY', 'SPEAK', 'BRAVE', 'FEAR']
    },
    {
      word: 'CINEMA',
      forbidden: ['MOVIE', 'POPCORN', 'THEATER', 'FILM']
    },
    {
      word: 'MEDITATION',
      forbidden: ['BREATHE', 'PEACE', 'MIND', 'YOGA']
    },
    {
      word: 'STREET FOOD',
      forbidden: ['DELICIOUS', 'FAST', 'CART', 'CHEAP']
    }
  ];

  // Curated Debate Dilemmas
  const DILEMMAS = [
    {
      category: 'Ethical & Future Tech',
      prompt: 'If a machine could predict your exact future career success with 99% accuracy at age 18, would you choose to look at the result?'
    },
    {
      category: 'Social & Lifestyle',
      prompt: 'Would you rather have all your personal conversations recorded and public, or never be allowed to speak to anyone outside your immediate family again?'
    },
    {
      category: 'Work & Human Nature',
      prompt: 'Should companies switch to a mandatory 4-day workweek even if it requires slightly longer daily hours and 10% lower top-tier executive bonuses?'
    },
    {
      category: 'Communication & Culture',
      prompt: 'Is it better to speak English with imperfect grammar but high confidence and emotional expressiveness, or flawless grammar with slow hesitations?'
    },
    {
      category: 'Mind & Philosophy',
      prompt: 'If you had to choose between being remembered for 500 years for something you didn’t actually do, or doing something heroic that nobody ever knows about, which would you pick?'
    }
  ];

  let currentCardIndex = 0;
  let currentDilemmaIndex = 0;
  let timerInterval = null;
  let timeLeft = 45;
  let isTimerRunning = false;
  let wordsGuessed = 0;

  // Soft sound generator using Web Audio API (gentle chime on click/score)
  function playChime(freq = 520, type = 'sine') {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio not supported or blocked, fail gracefully
    }
  }

  function renderCurrentTabooCard() {
    const card = TABOO_CARDS[currentCardIndex];
    const cardEl = document.getElementById('taboo-sim-card');
    const wordEl = document.getElementById('taboo-target-word');
    const forbiddenListEl = document.getElementById('taboo-forbidden-items');

    if (!wordEl || !forbiddenListEl) return;

    // Flip animation trigger
    if (cardEl) {
      cardEl.classList.add('flipped');
      setTimeout(() => cardEl.classList.remove('flipped'), 300);
    }

    wordEl.textContent = card.word;
    forbiddenListEl.innerHTML = card.forbidden
      .map(item => `<li>🚫 ${item}</li>`)
      .join('');
  }

  function nextTabooCard(isCorrect = false) {
    if (isCorrect) {
      wordsGuessed++;
      const scoreEl = document.getElementById('taboo-score-val');
      if (scoreEl) scoreEl.textContent = wordsGuessed;
      playChime(660);
    } else {
      playChime(440);
    }

    currentCardIndex = (currentCardIndex + 1) % TABOO_CARDS.length;
    renderCurrentTabooCard();
  }

  function toggleTimer() {
    const btn = document.getElementById('taboo-timer-toggle');
    const timerDisplay = document.getElementById('taboo-timer-seconds');

    if (isTimerRunning) {
      // Pause
      clearInterval(timerInterval);
      isTimerRunning = false;
      if (btn) btn.innerHTML = '▶ Start Timer';
    } else {
      // Start
      isTimerRunning = true;
      if (btn) btn.innerHTML = '⏸ Pause';
      playChime(580);

      timerInterval = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          isTimerRunning = false;
          timeLeft = 45;
          if (btn) btn.innerHTML = '🔄 New Round';
          if (timerDisplay) timerDisplay.textContent = '0s';
          playChime(320);
          alert(`⏰ Time is up! You explained ${wordsGuessed} words without using forbidden vocabulary!`);
        }
      }, 1000);
    }
  }

  function resetGame() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 45;
    wordsGuessed = 0;
    const scoreEl = document.getElementById('taboo-score-val');
    const timerDisplay = document.getElementById('taboo-timer-seconds');
    const btn = document.getElementById('taboo-timer-toggle');

    if (scoreEl) scoreEl.textContent = '0';
    if (timerDisplay) timerDisplay.textContent = '45s';
    if (btn) btn.innerHTML = '▶ Start Timer';
  }

  // Dilemmas
  function renderCurrentDilemma() {
    const dilemma = DILEMMAS[currentDilemmaIndex];
    const catEl = document.getElementById('dilemma-cat-text');
    const promptEl = document.getElementById('dilemma-prompt-text');

    if (catEl) catEl.textContent = dilemma.category;
    if (promptEl) promptEl.textContent = `“${dilemma.prompt}”`;
  }

  function nextDilemma() {
    currentDilemmaIndex = (currentDilemmaIndex + 1) % DILEMMAS.length;
    playChime(490);
    renderCurrentDilemma();
  }

  function switchMode(mode) {
    const tabooContainer = document.getElementById('taboo-game-container');
    const dilemmaContainer = document.getElementById('dilemma-game-container');

    document.querySelectorAll('.game-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    if (mode === 'taboo') {
      if (tabooContainer) tabooContainer.style.display = 'grid';
      if (dilemmaContainer) dilemmaContainer.style.display = 'none';
    } else {
      if (tabooContainer) tabooContainer.style.display = 'none';
      if (dilemmaContainer) dilemmaContainer.style.display = 'block';
    }
  }

  function init() {
    renderCurrentTabooCard();
    renderCurrentDilemma();

    const nextCardBtn = document.getElementById('taboo-next-btn');
    if (nextCardBtn) nextCardBtn.addEventListener('click', () => nextTabooCard(false));

    const gotItBtn = document.getElementById('taboo-success-btn');
    if (gotItBtn) gotItBtn.addEventListener('click', () => nextTabooCard(true));

    const timerBtn = document.getElementById('taboo-timer-toggle');
    if (timerBtn) timerBtn.addEventListener('click', toggleTimer);

    const rollDilemmaBtn = document.getElementById('roll-dilemma-btn');
    if (rollDilemmaBtn) rollDilemmaBtn.addEventListener('click', nextDilemma);

    document.querySelectorAll('.game-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.getAttribute('data-mode')));
    });
  }

  return {
    init,
    nextTabooCard,
    toggleTimer,
    nextDilemma,
    switchMode
  };
})();
