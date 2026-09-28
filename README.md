# TalkLab 2.0 — Next.js & React Modern Migration

TalkLab is Tripoli's modern, gamified English conversation club for ambitious young minds, hosted weekly at **مركز سفراء العلم** (People & Spaces) in Hay Al-Andalus.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Neo-Pop Neobrutalist Design System
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Web Audio API Sound Synthesizer
- **Integrations**: OpenWA (WhatsApp API) for OTP & Digital Boarding Pass dispatch

## ⚡ Features & Modules

1. **Brand Identity & Multi-Palette Atmosphere**:
   - ⚡ **Pop Vibrance** (Electric Blue & Gold, `logo-cream.png`)
   - 🌌 **Cyber Night** (Neon Synthwave Dark Mode, `logo-blue.png`)
   - 🔥 **Ember Warmth** (Sunset Crimson & Terracotta, `logo-red.png`)
   - Instant live palette switching across navbar, cards, and emblems
   - Sound FX synthesized directly via Web Audio API (zero audio files needed for UI feedback)

2. **Top Notification Marquee & Mid-Page Accent Ribbon**:
   - Continuous marquee tracking upcoming Saturday (12–4 PM) & Tuesday (4–7 PM) sessions, 30 LYD fee, and People & Spaces cafe perks.

3. **Hero Section**:
   - Live countdown timer to Saturday Immersion (12:00 PM)
   - Real-time boardroom availability indicator
   - Interactive floating emoji reaction burst bar (🔥, 🗣️, 💯, ☕, 🚀, 💀)

4. **"What's Your English Vibe?" 60-Second Diagnostic Persona Quiz**:
   - 4 relatable dilemmas diagnosing speaking personalities:
     - *The Spontaneous Yap Master* (🗣️✨)
     - *The Overthinking Genius* (🧠⚡)
     - *The Chaotic Debater* (⚖️🔥)
     - *The Chill Coffee Philosopher* (☕🌱)
   - Custom playbook card & recommended session track

5. **Conversation Slot Machine**:
   - 3 mechanical arcade reels (Controversial Topic, Debate Twist, Time Limit)
   - Randomized rapid spin animation with slot machine audio ticks and fanfare

6. **Taboo Word-Ban Arcade**:
   - Target word circumlocution with 4 forbidden words
   - 45-second round clock
   - Combo multiplier streaks (1x, 2x, 3x...) with confetti celebration

7. **The TalkLab Slang & Idiom Lab**:
   - 8 modern expressions with category filtering (Internet & Pop Culture, Debate Rhetoric, Social IQ & Vibes)
   - 3D interactive flip flashcards with pronunciation, meaning, and authentic conversational examples

8. **Brand Spotlight & Standards**:
   - Floating official emblem, Tripoli club seal, and core values (Zero grammar drills, 30 LYD flat fee, Hay Al-Andalus hub)

9. **Tactical Boardroom Map & Seat Reservation**:
   - Saturday & Tuesday session toggle
   - Boardroom table arena matching conference layout (Screen, Entry Door, Moderator lead chair, 25 numbered desks)
   - 3-step booking flow:
     - **Step 1: Registration Form** (1-seat-per-phone verification)
     - **Step 2: WhatsApp OTP Verification** (6-digit passcode with countdown & resend cooldown)
     - **Step 3: Digital Boarding Pass Ticket** with pass ID, assigned seat, and venue details

10. **The Fishbowl Argument Generator (Hot Seat)**:
    - High-heat debate topics with PRO vs CON stance toggle and dynamic argument bullet points

11. **Venue & Host Partnership (مركز سفراء العلم / People & Spaces)**:
    - Official partnership showcase
    - 4 authentic venue photos (live discussion, conference screens, "Space to Breathe, Learn & Create" wall, training stage)
    - Amenities list & Google Maps directions embed
    - 4-step arrival guide

12. **Community Debate Topic Voting**:
    - Live poll on upcoming debate topics with percentage bars and anti-spam protection

13. **Floating Lo-Fi Music Player**:
    - Spinning vinyl record disc widget in bottom-right corner
    - Expanded controls: 0:00–4:00 loop controller with 5s smooth fadeout, EQ visualizer, volume slider

14. **Hidden Easter Eggs**:
    - Konami Code (`↑ ↑ ↓ ↓ ← → ← → B A`) activating 12-second 8-bit retro party mode & secret pass code (`TALKCHAMP-25`)
    - 5-click brand logo secret unlocking Founder's Notebook
    - Triple-click moderator chair triggering the gavel strike
    - Footer secret key 🗝️ unlocking the Tripoli slang archive

15. **Next.js OpenWA API Proxy**:
    - Native server route handler (`src/app/api/[...path]/route.ts`) forwarding WhatsApp API calls to OpenWA (port 2785) with fallback simulation

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```
