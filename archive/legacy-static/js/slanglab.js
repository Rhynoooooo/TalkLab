/**
 * TALKLAB 2.0 - GEN-Z SLANG LAB & FISHBOWL HOT SEAT GENERATOR
 * Alluring, interactive 3D flip flashcards and dynamic debate argument generator.
 */

const SlangAndDebateLab = (() => {
  // --------------------------------------------------------------------------
  // 1. Slang & Modern Idiom Deck
  // --------------------------------------------------------------------------
  const SLANG_CARDS = [
    {
      id: 1,
      category: 'internet',
      term: 'LET HIM COOK',
      pronunciation: '/lɛt hɪm kʊk/',
      type: 'Modern Slang • Verbal Expression',
      meaning: 'Allow someone to speak, perform, or develop their idea without interrupting, because they are on to something brilliant.',
      example: '“Don’t cut Tariq off yet—he’s making a crazy point about AI, let him cook!”',
      origin: 'Hip-hop & online gaming, popularized across TikTok & debates'
    },
    {
      id: 2,
      category: 'rhetoric',
      term: 'DEVIL\'S ADVOCATE',
      pronunciation: '/ˈdɛv.əlz ˈæd.və.kət/',
      type: 'Debate Idiom • Intellectual Tool',
      meaning: 'Taking an opposing viewpoint not because you believe it, but to test the strength of the argument and stimulate discussion.',
      example: '“Just to play devil’s advocate: what if banning smartphones actually makes students more anxious?”',
      origin: 'Classic Latin formal debate ("Advocatus Diaboli")'
    },
    {
      id: 3,
      category: 'social',
      term: 'LIVING RENT-FREE',
      pronunciation: '/ˈlɪv.ɪŋ rɛnt friː/',
      type: 'Casual Idiom • Psychology',
      meaning: 'When a thought, person, or argument occupies your mind constantly without your control.',
      example: '“That controversial debate topic about remote work has been living rent-free in my head all week.”',
      origin: 'Modern internet culture & sports psychology'
    },
    {
      id: 4,
      category: 'internet',
      term: 'MAIN CHARACTER ENERGY',
      pronunciation: '/meɪn ˈkær.ɪk.tər ˈɛn.ər.dʒi/',
      type: 'Pop Culture • Confidence',
      meaning: 'Exuding natural charisma, self-assurance, and speaking as if you are the protagonist of the room.',
      example: '“Sarah walked into the Fishbowl debate with total main character energy and persuaded everyone.”',
      origin: 'Cinema tropes & Gen-Z social media'
    },
    {
      id: 5,
      category: 'rhetoric',
      term: 'TOUCH GRASS',
      pronunciation: '/tʌtʃ ɡræs/',
      type: 'Modern Slang • Social Reality Check',
      meaning: 'A playful reminder to disconnect from the screen, step outside, and engage with real human beings in the physical world.',
      example: '“You’ve been arguing on Reddit for 6 hours straight. Put the phone down, touch grass, and come to TalkLab.”',
      origin: 'Online gaming culture'
    },
    {
      id: 6,
      category: 'social',
      term: 'READ THE ROOM',
      pronunciation: '/riːd ðə ruːm/',
      type: 'Conversation Idiom • Social IQ',
      meaning: 'To understand the emotions, mood, and listening readiness of the people around you before speaking.',
      example: '“He read the room, realized everyone was stressed, and cracked a funny joke in English to break the ice.”',
      origin: 'Stage theater & boardroom communication'
    },
    {
      id: 7,
      category: 'rhetoric',
      term: 'UNDERSTOOD THE ASSIGNMENT',
      pronunciation: '/ˌʌn.dərˈstʊd ðiː əˈsaɪn.mənt/',
      type: 'Modern Praise • High Performance',
      meaning: 'When someone executes their speaking turn, debate argument, or roleplay challenge flawlessly.',
      example: '“When Tariq was told to debate like a corrupt politician, he completely understood the assignment!”',
      origin: 'Pop culture & creative arts'
    },
    {
      id: 8,
      category: 'social',
      term: 'NO CAP',
      pronunciation: '/noʊ kæp/',
      type: 'Slang • Authenticity',
      meaning: 'No lie, for real, 100% genuine truth.',
      example: '“TalkLab is genuinely the most fun 4 hours of my week in Tripoli, no cap.”',
      origin: 'African American Vernacular English (AAVE)'
    }
  ];

  let activeFilter = 'all';

  function renderSlangDeck() {
    const container = document.getElementById('slang-cards-container');
    if (!container) return;

    const filtered = activeFilter === 'all' 
      ? SLANG_CARDS 
      : SLANG_CARDS.filter(c => c.category === activeFilter);

    container.innerHTML = filtered.map(c => `
      <div class="slang-flip-card" onclick="SlangAndDebateLab.flipCard(this)">
        <div class="slang-flip-inner">
          <!-- Front -->
          <div class="slang-card-front">
            <span class="pop-badge gold" style="font-size:0.75rem; margin-bottom:0.75rem;">${c.type}</span>
            <h4 class="slang-term-title">${c.term}</h4>
            <div class="slang-phonetic">${c.pronunciation}</div>
            <div class="slang-tap-cue">Tap to Flip 🔄</div>
          </div>

          <!-- Back -->
          <div class="slang-card-back">
            <span class="pop-badge coral" style="font-size:0.7rem; margin-bottom:0.5rem;">Real Context</span>
            <p class="slang-meaning-text">${c.meaning}</p>
            <div class="slang-example-quote">${c.example}</div>
            <div class="slang-tap-cue" style="color:#FFF;">Flip Back ↩</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function flipCard(cardEl) {
    if (window.SoundFX) SoundFX.playPop(580);
    cardEl.classList.toggle('flipped');
  }

  function filterSlang(category) {
    activeFilter = category;
    document.querySelectorAll('.slang-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
    });
    if (window.SoundFX) SoundFX.playPop(500);
    renderSlangDeck();
  }

  // --------------------------------------------------------------------------
  // 2. Fishbowl Hot Seat Argument Generator
  // --------------------------------------------------------------------------
  const DEBATE_TOPICS = [
    {
      topic: 'Should AI completely replace traditional high school teachers by 2030?',
      category: 'Tech & Future',
      proArguments: [
        '“AI provides personalized 1-on-1 pacing for every student that a single human teacher with 30 kids can never match.”',
        '“It never loses patience, works 24/7, and eliminates unconscious human teacher bias.”',
        '“Human teachers can transition into social mentors, while AI handles curriculum and grading.”'
      ],
      conArguments: [
        '“Education is 80% emotional mentorship and inspiration—a machine has zero empathy or lived human wisdom.”',
        '“Replacing teachers will lead to severe social isolation and screen-addicted generations.”',
        '“Who audits the biases and corporate interests coded into the AI curriculum?”'
      ]
    },
    {
      topic: 'Is a university degree officially a scam in 2026 for young creatives?',
      category: 'Careers & Hustle',
      proArguments: [
        '“A 4-year degree costs thousands, while practical portfolios and YouTube tutorials teach current skills in 6 months.”',
        '“Tech and creative industries prioritize proven projects and GitHub/Behance proof over outdated academic theory.”',
        '“Most university textbooks are already 5 years behind real-world market software.”'
      ],
      conArguments: [
        '“University is where you build lifelong high-value networks, critical thinking discipline, and peer friendships.”',
        '“Degrees still act as a verified social trust signal for international visas and high-tier career leadership.”',
        '“Self-learning requires exceptional self-discipline that 95% of 18-year-olds do not yet possess.”'
      ]
    },
    {
      topic: 'Should smartphones be strictly confiscated inside restaurants and cafés?',
      category: 'Lifestyle & Social',
      proArguments: [
        '“People are sitting across from their closest friends while scrolling silently on TikTok—it is destroying real conversation.”',
        '“Forcing phone-free dining restores ambient eye contact, deep listening, and presence.”',
        '“It creates a haven of peace away from work emails and notifications.”'
      ],
      conArguments: [
        '“Customers are paying adults, not children; businesses have no right to police personal property.”',
        '“Smartphones are essential for emergency contacts, digital payments, and sharing memories.”',
        '“If an in-person conversation is boring, taking away a phone won’t magically make it interesting!”'
      ]
    }
  ];

  let currentDebateIdx = 0;
  let activeStance = 'pro';

  function renderDebateGenerator() {
    const debate = DEBATE_TOPICS[currentDebateIdx];
    const topicEl = document.getElementById('hotseat-topic-title');
    const catEl = document.getElementById('hotseat-cat-badge');
    const bulletsList = document.getElementById('hotseat-bullets-list');

    if (!topicEl || !bulletsList) return;

    topicEl.textContent = `“${debate.topic}”`;
    if (catEl) catEl.textContent = debate.category;

    const bullets = activeStance === 'pro' ? debate.proArguments : debate.conArguments;

    bulletsList.innerHTML = bullets.map((b, i) => `
      <div class="hotseat-bullet-item">
        <div class="hotseat-bullet-num">${i + 1}</div>
        <div class="hotseat-bullet-text">${b}</div>
      </div>
    `).join('');
  }

  function setStance(stance) {
    activeStance = stance;
    document.querySelectorAll('.hotseat-stance-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-stance') === stance);
    });
    if (window.SoundFX) SoundFX.playPop(stance === 'pro' ? 660 : 440);
    renderDebateGenerator();
  }

  function nextDebateTopic() {
    currentDebateIdx = (currentDebateIdx + 1) % DEBATE_TOPICS.length;
    if (window.SoundFX) SoundFX.playPop(520);
    renderDebateGenerator();
  }

  // --------------------------------------------------------------------------
  // 3. Lounge Ambient Audio Synthesizer (Lofi Chill Beat simulation)
  // --------------------------------------------------------------------------
  let ambientAudioCtx = null;
  let isAmbientPlaying = false;
  let ambientInterval = null;

  function toggleLoungeAmbience() {
    const btn = document.getElementById('lounge-audio-toggle');
    const eq = document.getElementById('lounge-audio-eq');

    if (isAmbientPlaying) {
      isAmbientPlaying = false;
      clearInterval(ambientInterval);
      if (btn) btn.innerHTML = '▶ Play Lounge Ambience';
      if (eq) eq.classList.remove('playing');
    } else {
      isAmbientPlaying = true;
      if (btn) btn.innerHTML = '⏸ Pause Ambience';
      if (eq) eq.classList.add('playing');

      playLofiChord();
      ambientInterval = setInterval(() => {
        if (isAmbientPlaying) playLofiChord();
      }, 3200);
    }
  }

  function playLofiChord() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!ambientAudioCtx && AudioCtx) ambientAudioCtx = new AudioCtx();
      if (!ambientAudioCtx) return;

      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ];
      const chord = chords[Math.floor(Math.random() * chords.length)];

      chord.forEach(freq => {
        const osc = ambientAudioCtx.createOscillator();
        const gain = ambientAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ambientAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, ambientAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ambientAudioCtx.currentTime + 3.0);
        osc.connect(gain);
        gain.connect(ambientAudioCtx.destination);
        osc.start();
        osc.stop(ambientAudioCtx.currentTime + 3.0);
      });
    } catch (e) {}
  }

  function init() {
    renderSlangDeck();
    renderDebateGenerator();

    document.querySelectorAll('.slang-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterSlang(btn.getAttribute('data-filter'));
      });
    });

    document.querySelectorAll('.hotseat-stance-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setStance(btn.getAttribute('data-stance'));
      });
    });

    const nextDebateBtn = document.getElementById('hotseat-next-topic-btn');
    if (nextDebateBtn) nextDebateBtn.addEventListener('click', nextDebateTopic);

    const lofiBtn = document.getElementById('lounge-audio-toggle');
    if (lofiBtn) lofiBtn.addEventListener('click', toggleLoungeAmbience);
  }

  return {
    init,
    flipCard,
    filterSlang,
    setStance,
    nextDebateTopic,
    toggleLoungeAmbience
  };
})();

window.SlangAndDebateLab = SlangAndDebateLab;
