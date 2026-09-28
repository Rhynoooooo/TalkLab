/**
 * TALKLAB 2.0 - TABOO / WORD-BAN ARCADE
 * Gamified vocabulary sprint with combo multipliers, sound effects, and XP rewards.
 */

const TabooArcade = (() => {
  const DECK = [
    { target: 'INSTAGRAM', forbidden: ['PHOTO', 'LIKE', 'STORY', 'APP'] },
    { target: 'ESPRESSO', forbidden: ['COFFEE', 'CUP', 'DRINK', 'MORNING'] },
    { target: 'AIRPORT', forbidden: ['PLANE', 'FLIGHT', 'LUGGAGE', 'GATE'] },
    { target: 'NETFLIX', forbidden: ['MOVIE', 'WATCH', 'SHOW', 'POPCORN'] },
    { target: 'OVERTHINKING', forbidden: ['BRAIN', 'WORRY', 'THOUGHT', 'STRESS'] },
    { target: 'SUPERHERO', forbidden: ['CAPE', 'POWER', 'MARVEL', 'FLY'] },
    { target: 'HOMEWORK', forbidden: ['SCHOOL', 'TEACHER', 'CHORE', 'MATH'] },
    { target: 'TRIPOLI', forbidden: ['CITY', 'CAPITAL', 'LIBYA', 'BEACH'] },
    { target: 'ZOMBIE', forbidden: ['DEAD', 'BITE', 'WALKING', 'MONSTER'] },
    { target: 'PROCRASTINATION', forbidden: ['LATER', 'TOMORROW', 'DELAY', 'LAZY'] }
  ];

  let cardIndex = 0;
  let score = 0;
  let combo = 1;
  let timerSeconds = 45;
  let timerId = null;
  let isRunning = false;

  function renderCard() {
    const card = DECK[cardIndex];
    const targetEl = document.getElementById('arcade-target-word');
    const forbiddenList = document.getElementById('arcade-forbidden-list');

    if (!targetEl || !forbiddenList) return;

    targetEl.textContent = card.target;
    forbiddenList.innerHTML = card.forbidden.map(word => `
      <span class="forbidden-word-tag">🚫 ${word}</span>
    `).join('');
  }

  function handleCorrect() {
    if (window.SoundFX) SoundFX.playPop(620 + combo * 40);
    score += 100 * combo;
    combo++;

    updateStats();
    cardIndex = (cardIndex + 1) % DECK.length;
    renderCard();

    if (combo >= 3 && window.ConfettiFX) {
      ConfettiFX.blast(0.5, 0.4, 40);
    }
  }

  function handlePass() {
    if (window.SoundFX) SoundFX.playBuzzer();
    combo = 1; // Reset combo
    updateStats();
    cardIndex = (cardIndex + 1) % DECK.length;
    renderCard();
  }

  function updateStats() {
    const scoreEl = document.getElementById('arcade-score-val');
    const comboEl = document.getElementById('arcade-combo-val');
    if (scoreEl) scoreEl.textContent = score;
    if (comboEl) comboEl.textContent = `${combo}x`;
  }

  function toggleTimer() {
    const timerBtn = document.getElementById('arcade-timer-btn');
    const timerDisplay = document.getElementById('arcade-timer-display');

    if (isRunning) {
      clearInterval(timerId);
      isRunning = false;
      if (timerBtn) timerBtn.innerHTML = '▶ Resume Timer';
    } else {
      isRunning = true;
      if (timerBtn) timerBtn.innerHTML = '⏸ Pause';
      if (window.SoundFX) SoundFX.playPop(700);

      timerId = setInterval(() => {
        timerSeconds--;
        if (timerDisplay) timerDisplay.textContent = `${timerSeconds}s`;

        if (timerSeconds <= 0) {
          clearInterval(timerId);
          isRunning = false;
          timerSeconds = 45;
          if (timerBtn) timerBtn.innerHTML = '🔄 New Round';
          if (window.SoundFX) SoundFX.playBuzzer();
          const msg = `⏰ Arcade Round Over! Final Score: ${score} XP with peak combo!`;
          if (window.TalkLabApp && typeof window.TalkLabApp.showToast === 'function') {
            window.TalkLabApp.showToast(msg);
          } else {
            console.log(msg);
          }
          score = 0;
          combo = 1;
          updateStats();
        }
      }, 1000);
    }
  }

  function init() {
    renderCard();
    const correctBtn = document.getElementById('arcade-btn-correct');
    const passBtn = document.getElementById('arcade-btn-pass');
    const timerBtn = document.getElementById('arcade-timer-btn');

    if (correctBtn) correctBtn.addEventListener('click', handleCorrect);
    if (passBtn) passBtn.addEventListener('click', handlePass);
    if (timerBtn) timerBtn.addEventListener('click', toggleTimer);
  }

  return {
    init,
    handleCorrect,
    handlePass,
    toggleTimer
  };
})();

window.TabooArcade = TabooArcade;
