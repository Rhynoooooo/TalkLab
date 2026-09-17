/**
 * TALKLAB 2.0 - CONVERSATION SLOT MACHINE
 * Mechanical arcade roller for hilarious, spontaneous debate challenges.
 */

const ConversationSlotMachine = (() => {
  const REEL_TOPICS = [
    '🍕 Pineapple Pizza is an Act of War',
    '🤖 Would You Date an AI Robot?',
    '👻 Superstitions You Secretly Obey',
    '📱 Delete All Social Media for 1 Year?',
    '🛸 Aliens Land in Tripoli Tomorrow',
    '💸 Sell a Broken Pen for 500 LYD',
    '🧟 3 People for Your Zombie Apocalypse Squad',
    '😴 Sleeping 12 Hours vs Never Sleeping',
    '🚗 Tripoli Traffic is an Olympic Sport',
    '☕ Instant Coffee Should Be Illegal'
  ];

  const REEL_TWISTS = [
    '🏛️ Argue like an overconfident lawyer',
    '🕵️ Whisper like an MI6 secret agent',
    '🎭 Use at least 2 fancy Shakespearean words',
    '👿 Defend the most chaotic viewpoint',
    '🎤 Pitch it like a billionaire Tech CEO',
    '🚫 Speak without saying "like" or "um"',
    '👶 Explain it to a 5-year-old',
    '🤝 Convince your opponent to switch sides'
  ];

  const REEL_TIMES = [
    '⚡ 30s Rapid Blitz',
    '🔥 45s Spicy Sprint',
    '⏱️ 60s Full Pitch',
    '🎯 90s Showdown'
  ];

  let isSpinning = false;

  function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const reel1 = document.getElementById('slot-reel-1');
    const reel2 = document.getElementById('slot-reel-2');
    const reel3 = document.getElementById('slot-reel-3');
    const spinBtn = document.getElementById('slot-spin-btn');

    if (spinBtn) spinBtn.disabled = true;

    // Start audio ticks
    const tickInterval = setInterval(() => {
      if (window.SoundFX) SoundFX.playSlotTick();
    }, 90);

    // Apply spinning animation class
    [reel1, reel2, reel3].forEach(el => {
      if (el) el.classList.add('spinning');
    });

    // Animate randomized text rapidly
    let count = 0;
    const shuffleInterval = setInterval(() => {
      if (reel1) reel1.textContent = REEL_TOPICS[Math.floor(Math.random() * REEL_TOPICS.length)];
      if (reel2) reel2.textContent = REEL_TWISTS[Math.floor(Math.random() * REEL_TWISTS.length)];
      if (reel3) reel3.textContent = REEL_TIMES[Math.floor(Math.random() * REEL_TIMES.length)];
      count++;
      if (count > 18) clearInterval(shuffleInterval);
    }, 70);

    // Stop reel 1 after 1.2s
    setTimeout(() => {
      if (reel1) {
        reel1.classList.remove('spinning');
        reel1.textContent = REEL_TOPICS[Math.floor(Math.random() * REEL_TOPICS.length)];
        if (window.SoundFX) SoundFX.playPop(520);
      }
    }, 1200);

    // Stop reel 2 after 1.7s
    setTimeout(() => {
      if (reel2) {
        reel2.classList.remove('spinning');
        reel2.textContent = REEL_TWISTS[Math.floor(Math.random() * REEL_TWISTS.length)];
        if (window.SoundFX) SoundFX.playPop(650);
      }
    }, 1700);

    // Stop reel 3 & finalize after 2.2s
    setTimeout(() => {
      clearInterval(tickInterval);
      if (reel3) {
        reel3.classList.remove('spinning');
        reel3.textContent = REEL_TIMES[Math.floor(Math.random() * REEL_TIMES.length)];
      }

      isSpinning = false;
      if (spinBtn) spinBtn.disabled = false;

      // Celebrate
      if (window.ConfettiFX) ConfettiFX.blast(0.5, 0.5, 60);

      const challengeSummary = document.getElementById('slot-challenge-summary');
      if (challengeSummary && reel1 && reel2 && reel3) {
        challengeSummary.innerHTML = `
          <strong>Your Turn:</strong> ${reel1.textContent} • <em>${reel2.textContent}</em> • <strong>${reel3.textContent}</strong>
        `;
      }
    }, 2200);
  }

  function init() {
    const spinBtn = document.getElementById('slot-spin-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        spin();
      });
    }

    // Also allow tapping/clicking directly on reels container to spin
    const reelsContainer = document.querySelector('.slot-reels-container');
    if (reelsContainer) {
      reelsContainer.style.cursor = 'pointer';
      reelsContainer.setAttribute('title', 'Click or tap to spin!');
      reelsContainer.addEventListener('click', (e) => {
        spin();
      });
    }

    // Initial default values
    const reel1 = document.getElementById('slot-reel-1');
    const reel2 = document.getElementById('slot-reel-2');
    const reel3 = document.getElementById('slot-reel-3');

    if (reel1) reel1.textContent = REEL_TOPICS[0];
    if (reel2) reel2.textContent = REEL_TWISTS[0];
    if (reel3) reel3.textContent = REEL_TIMES[1];
  }

  return {
    init,
    spin
  };
})();

window.ConversationSlotMachine = ConversationSlotMachine;
