import { SessionConfig, BookedSeat, QuizQuestion, PersonaInfo, TabooCard, SlangCard, DebateTopic, PollOption, ThemePalette } from './types';

export const THEMES: { id: ThemePalette; name: string; icon: string; sub: string; logo: string; bg: string; boxBorder: string; soundPitch: number }[] = [
  {
    id: 'notebook',
    name: 'Notebook',
    icon: '📓',
    sub: 'Field Notes & Ink',
    logo: '/assets/logo-blue.png',
    bg: '#FAF7F0',
    boxBorder: '#2D3142',
    soundPitch: 680
  },
  {
    id: 'pop',
    name: 'Pop',
    icon: '⚡',
    sub: 'Electric Day',
    logo: '/assets/logo-cream.png',
    bg: '#FFF8EE',
    boxBorder: '#13172E',
    soundPitch: 640
  },
  {
    id: 'cyber',
    name: 'Cyber',
    icon: '🌌',
    sub: 'Midnight Neon',
    logo: '/assets/logo-blue.png',
    bg: '#3D46A5',
    boxBorder: '#5965F3',
    soundPitch: 520
  },
  {
    id: 'ember',
    name: 'Ember',
    icon: '🔥',
    sub: 'Sunset Warmth',
    logo: '/assets/logo-red.png',
    bg: '#AB3731',
    boxBorder: '#F5C266',
    soundPitch: 760
  }
];

export const SESSIONS: Record<'saturday' | 'tuesday', SessionConfig> = {
  saturday: {
    id: 'saturday',
    name: 'Saturday Immersion Lab',
    shortName: 'Saturday Lab',
    tag: 'Weekend 4-Hour Deep Dive',
    day: 'Every Saturday',
    time: '12:00 PM – 4:00 PM',
    duration: '4 Hours',
    price: '30 LYD',
    priceNumber: 30,
    capacity: 25,
    venue: 'People & Spaces (مركز سفراء العلم) • Tripoli, Libya',
    venuePerk: 'Exclusive TalkLab Member Discount at People & Spaces Cafe',
    focus: 'Oxford Fishbowl Debates, Improv Challenges, Cafe Break & Word Games',
    agenda: [
      { time: '12:00 – 12:45 PM', title: 'Spontaneous Icebreakers', desc: 'Fast-fire speaking sparks & spicy dilemmas' },
      { time: '12:45 – 02:00 PM', title: 'The Fishbowl Debate Arena', desc: 'Rotated speaker hot-seats on controversial takes' },
      { time: '02:00 – 02:30 PM', title: 'People & Spaces Cafe Break', desc: 'Exclusive member cafe discounts & 1-on-1 casual networking' },
      { time: '02:30 – 04:00 PM', title: 'Gamified Word Labs', desc: 'Taboo sprints, roleplay challenges & wrap-up ceremony' }
    ]
  },
  tuesday: {
    id: 'tuesday',
    name: 'Tuesday Twilight Lab',
    shortName: 'Tuesday Lab',
    tag: 'Midweek 3-Hour Fluency Sprint',
    day: 'Every Tuesday',
    time: '4:00 PM – 7:00 PM',
    duration: '3 Hours',
    price: '30 LYD',
    priceNumber: 30,
    capacity: 25,
    venue: 'People & Spaces (مركز سفراء العلم) • Tripoli, Libya',
    venuePerk: 'Exclusive TalkLab Member Discount at People & Spaces Cafe',
    focus: 'Speed Networking, Moral Dilemma Defense, Slang & Cafe Discount',
    agenda: [
      { time: '04:00 – 04:30 PM', title: 'Speed Networking Sparks', desc: 'Pair rotations every 4 minutes with topic cards' },
      { time: '04:30 – 05:45 PM', title: 'Moral Dilemmas Faceoff', desc: 'Defending unexpected hypothetical choices' },
      { time: '05:45 – 06:15 PM', title: 'Cafe & Nuance Lab', desc: 'Member cafe discounts, modern phrasing & accent flow' },
      { time: '06:15 – 07:00 PM', title: 'Pitching & Persuasion Arcade', desc: 'Fun persuasive games and peer feedback' }
    ]
  }
};

export const DEFAULT_SATURDAY_BOOKINGS: Record<number, BookedSeat> = {
  1: { initial: 'O', name: 'Omar K.' },
  2: { initial: 'S', name: 'Sara M.' },
  3: { initial: 'T', name: 'Tariq A.' },
  4: { initial: 'L', name: 'Layla B.' },
  5: { initial: 'S', name: 'Sami D.' },
  6: { initial: 'O', name: 'Osama F.' },
  7: { initial: 'S', name: 'Salma T.' },
  8: { initial: 'T', name: 'Taha H.' },
  9: { initial: 'L', name: 'Lina G.' },
  10: { initial: 'S', name: 'Sufian N.' },
  11: { initial: 'O', name: 'Ola W.' },
  12: { initial: 'S', name: 'Samir J.' },
  14: { initial: 'T', name: 'Tamer R.' },
  15: { initial: 'L', name: 'Loubna Z.' },
  16: { initial: 'S', name: 'Siraj C.' },
  17: { initial: 'O', name: 'Othman K.' }
};

export const DEFAULT_TUESDAY_BOOKINGS: Record<number, BookedSeat> = {
  1: { initial: 'A', name: 'Ahmed Q.' },
  2: { initial: 'M', name: 'Mona E.' },
  3: { initial: 'K', name: 'Karim S.' },
  4: { initial: 'H', name: 'Hoda R.' },
  6: { initial: 'N', name: 'Nour T.' },
  7: { initial: 'F', name: 'Farah B.' },
  10: { initial: 'Z', name: 'Ziad M.' },
  12: { initial: 'R', name: 'Rania L.' },
  14: { initial: 'Y', name: 'Youssef K.' },
  15: { initial: 'M', name: 'Malak D.' },
  20: { initial: 'W', name: 'Walid N.' }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
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

export const PERSONAS: Record<string, PersonaInfo> = {
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

export const REEL_TOPICS = [
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

export const REEL_TWISTS = [
  '🏛️ Argue like an overconfident lawyer',
  '🕵️ Whisper like an MI6 secret agent',
  '🎭 Use at least 2 fancy Shakespearean words',
  '👿 Defend the most chaotic viewpoint',
  '🎤 Pitch it like a billionaire Tech CEO',
  '🚫 Speak without saying "like" or "um"',
  '👶 Explain it to a 5-year-old',
  '🤝 Convince your opponent to switch sides'
];

export const REEL_TIMES = [
  '⚡ 30s Rapid Blitz',
  '🔥 45s Spicy Sprint',
  '⏱️ 60s Full Pitch',
  '🎯 90s Showdown'
];

export const TABOO_DECK: TabooCard[] = [
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

export const SLANG_CARDS: SlangCard[] = [
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

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    topic: 'Should AI completely replace traditional high school teachers by 2030?',
    category: 'Tech & Future',
    proArguments: [
      '“AI provides infinite patience, 24/7 personalization, and adapts instantaneously to every student’s learning pace.”',
      '“It eliminates human grading bias, fatigue, and geographic disparities in educational quality.”',
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

export const DEFAULT_POLL_OPTIONS: PollOption[] = [
  { id: 1, text: 'Is social media ruining Gen-Z conversational skills?', votes: 42 },
  { id: 2, text: 'Will AI make human essay writing completely obsolete?', votes: 38 },
  { id: 3, text: 'Should homework be banned by international law?', votes: 55 },
  { id: 4, text: 'Would you rather speak 10 languages or talk to animals?', votes: 49 }
];
