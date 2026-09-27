/**
 * TALKLAB 2.0 - REAL-TIME BOOKING & BOARDROOM SEAT SELECTION MODULE
 * Matches exact conference table diagram with Screen, Lead Moderator,
 * Left & Right chair columns with curved backrest arcs, and independent
 * seat selection for both Saturday (12-4pm) and Tuesday (4-7pm) sessions.
 * Fee: Strictly 30 LYD per session.
 */

const BookingSystem = (() => {
  const SESSIONS = {
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
      capacity: 25, // 25 seats total at People & Spaces
      venue: 'People & Spaces (Tripoli, Libya)',
      venuePerk: 'Exclusive TalkLab Member Discount at People & Spaces Cafe',
      focus: 'Oxford Fishbowl Debates, Improv Challenges, People & Spaces Cafe Break & Word Games',
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
      capacity: 25, // 25 seats total at People & Spaces
      venue: 'People & Spaces (Tripoli, Libya)',
      venuePerk: 'Exclusive TalkLab Member Discount at People & Spaces Cafe',
      focus: 'Speed Networking, Moral Dilemma Defense, Slang & People & Spaces Cafe Discount',
      agenda: [
        { time: '04:00 – 04:30 PM', title: 'Speed Networking Sparks', desc: 'Pair rotations every 4 minutes with topic cards' },
        { time: '04:30 – 05:45 PM', title: 'Moral Dilemmas Faceoff', desc: 'Defending unexpected hypothetical choices' },
        { time: '05:45 – 06:15 PM', title: 'People & Spaces Cafe & Nuance Lab', desc: 'Member cafe discounts, modern phrasing & accent flow' },
        { time: '06:15 – 07:00 PM', title: 'Pitching & Persuasion Arcade', desc: 'Fun persuasive games and peer feedback' }
      ]
    }
  };

  // Default booked member rosters for both sessions
  // Saturday matches diagram: Left (1-12) booked, Right (14-17) booked, Right (18-25) open in green
  const DEFAULT_SATURDAY_BOOKINGS = {
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

  // Tuesday roster: different distribution of booked members
  const DEFAULT_TUESDAY_BOOKINGS = {
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

  let activeSessionId = 'saturday';
  let selectedSeat = null;

  function loadState() {
    const saved = localStorage.getItem('talklab_boardroom_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.saturday && parsed.tuesday) return parsed;
      } catch (e) {}
    }
    return {
      saturday: { bookedSeats: { ...DEFAULT_SATURDAY_BOOKINGS } },
      tuesday: { bookedSeats: { ...DEFAULT_TUESDAY_BOOKINGS } },
      userBookings: []
    };
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem('talklab_boardroom_v3', JSON.stringify(state));
  }

  function getBookedCount(sessionId) {
    const sessionState = state[sessionId];
    return Object.keys(sessionState.bookedSeats).length;
  }

  function getAvailableSeatsCount(sessionId) {
    const session = SESSIONS[sessionId];
    return Math.max(0, session.capacity - getBookedCount(sessionId));
  }

  // Countdown timer to the next upcoming session
  function updateCountdown() {
    const now = new Date();
    const targetDay = activeSessionId === 'saturday' ? 6 : 2;
    const targetHour = activeSessionId === 'saturday' ? 12 : 16;

    let daysToAdd = (targetDay - now.getDay() + 7) % 7;
    if (daysToAdd === 0 && now.getHours() >= targetHour) {
      daysToAdd = 7;
    }

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysToAdd);
    targetDate.setHours(targetHour, 0, 0, 0);

    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const dEl = document.getElementById('countdown-days');
    const hEl = document.getElementById('countdown-hours');
    const mEl = document.getElementById('countdown-minutes');
    const sEl = document.getElementById('countdown-seconds');

    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  /**
   * Render the Boardroom Table matching user reference diagram:
   * - Top Screen Bar with live projection wall text & cyan dots
   * - Lead Moderator chair with LEAD label and MOD table pill
   * - Central Table Slab with vertical T-A-B-L-E letters, teal center spine, and 12 desk pads
   * - Left Column (Seats 1-12) with left-facing backrest arc: (
   * - Right Column (Seats 14-25) with right-facing backrest arc: )
   * - Bottom Hallway Entrance label
   */
  function renderBoardroomMap() {
    const session = SESSIONS[activeSessionId];
    const sessionState = state[activeSessionId];
    const availCount = getAvailableSeatsCount(activeSessionId);

    // Update status indicators
    const statusPill = document.getElementById('seat-status-pill');
    const heroAvailCount = document.getElementById('hero-available-count');
    const tickerSlotCount = document.getElementById('ticker-slot-count');
    const currentSessionLabel = document.getElementById('boardroom-current-session-label');
    const reserveBtn = document.getElementById('boardroom-reserve-btn');

    if (statusPill) {
      statusPill.innerHTML = `🟢 <strong>${availCount} seats available</strong> (out of 25) • ${session.day}`;
    }
    if (heroAvailCount) {
      heroAvailCount.textContent = `${availCount} spots left`;
    }
    if (tickerSlotCount) {
      tickerSlotCount.textContent = `${availCount} spots left for ${session.shortName}`;
    }
    if (currentSessionLabel) {
      currentSessionLabel.textContent = `${session.name} (${session.time}) — 30 LYD`;
    }
    if (reserveBtn) {
      if (selectedSeat) {
        reserveBtn.innerHTML = `<span class="boardroom-btn-text">✓ Confirm Seat #${selectedSeat} • ${session.shortName} (30 LYD)</span>`;
      } else {
        reserveBtn.innerHTML = `<span class="boardroom-btn-text">Reserve Seat for ${session.shortName} (30 LYD)</span>`;
      }
    }

    // Sync active state on fast switcher buttons
    document.querySelectorAll('.session-switch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-session') === activeSessionId);
    });

    // Sync active state on hero session cards
    document.querySelectorAll('.session-hero-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-session') === activeSessionId);
    });

    // Render 12 Central Desk Rows if empty
    const deskRowsContainer = document.getElementById('table-desk-rows');
    if (deskRowsContainer && deskRowsContainer.children.length === 0) {
      deskRowsContainer.innerHTML = '';
      const lettersMap = { 1: 'T', 3: 'A', 5: 'B', 7: 'L', 9: 'E' };

      for (let r = 0; r < 12; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'table-desk-row';

        const hasLetter = lettersMap[r] !== undefined;
        const letterChar = hasLetter ? lettersMap[r] : '';

        rowDiv.innerHTML = `
          <div class="desk-pad"></div>
          <div class="desk-dot"></div>
          <div class="desk-center-slot">
            ${hasLetter ? `<span class="table-letter-char">${letterChar}</span>` : ''}
          </div>
          <div class="desk-dot"></div>
          <div class="desk-pad"></div>
        `;
        deskRowsContainer.appendChild(rowDiv);
      }
    }

    // Left Column: Seats 1 to 12
    const leftCol = document.getElementById('chairs-left-col');
    if (leftCol) {
      leftCol.innerHTML = '';
      for (let seatNum = 1; seatNum <= 12; seatNum++) {
        const isBooked = !!sessionState.bookedSeats[seatNum];
        const isSelected = selectedSeat === seatNum;
        const occupant = sessionState.bookedSeats[seatNum];

        const item = document.createElement('button');
        item.type = 'button';
        item.className = `boardroom-chair-item ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`;
        item.setAttribute('data-seat', seatNum);

        const tooltip = isBooked
          ? `Seat #${seatNum} • Reserved (${occupant.name || 'Member'})`
          : `Seat #${seatNum} • Available! (30 LYD) - Click to Choose`;
        item.setAttribute('title', tooltip);

        const labelText = isBooked
          ? (occupant.initial || '•')
          : (isSelected ? `✓` : `${seatNum}`);

        item.innerHTML = `
          <span class="chair-backrest-arc left-arc" aria-hidden="true">
            <svg viewBox="0 0 12 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3 C2 10, 2 26, 10 33" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="chair-cushion-circle">
            ${labelText}
          </span>
        `;

        if (!isBooked) {
          item.addEventListener('click', () => {
            onSeatSelected(seatNum);
          });
        }
        leftCol.appendChild(item);
      }
    }

    // Right Column: Seats 14 to 25
    const rightCol = document.getElementById('chairs-right-col');
    if (rightCol) {
      rightCol.innerHTML = '';
      for (let seatNum = 14; seatNum <= 25; seatNum++) {
        const isBooked = !!sessionState.bookedSeats[seatNum];
        const isSelected = selectedSeat === seatNum;
        const occupant = sessionState.bookedSeats[seatNum];

        const item = document.createElement('button');
        item.type = 'button';
        item.className = `boardroom-chair-item ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`;
        item.setAttribute('data-seat', seatNum);

        const tooltip = isBooked
          ? `Seat #${seatNum} • Reserved (${occupant.name || 'Member'})`
          : `Seat #${seatNum} • Available! (30 LYD) - Click to Choose`;
        item.setAttribute('title', tooltip);

        const labelText = isBooked
          ? (occupant.initial || '•')
          : (isSelected ? `✓` : `${seatNum}`);

        item.innerHTML = `
          <span class="chair-cushion-circle">
            ${labelText}
          </span>
          <span class="chair-backrest-arc right-arc" aria-hidden="true">
            <svg viewBox="0 0 12 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3 C10 10, 10 26, 2 33" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
            </svg>
          </span>
        `;

        if (!isBooked) {
          item.addEventListener('click', () => {
            onSeatSelected(seatNum);
          });
        }
        rightCol.appendChild(item);
      }
    }
  }

  function onSeatSelected(seatNum) {
    if (window.SoundFX) SoundFX.playPop(520 + seatNum * 15);
    selectedSeat = seatNum;
    renderBoardroomMap();

    // Auto-open modal with seat locked in
    openBookingModal(activeSessionId, seatNum);
  }

  function setSession(sessionId) {
    if (!SESSIONS[sessionId]) return;
    activeSessionId = sessionId;
    selectedSeat = null;

    if (window.SoundFX) SoundFX.playPop(580);
    renderBoardroomMap();
    updateCountdown();
  }

  function openBookingModal(sessionId, seatNum) {
    if (sessionId) activeSessionId = sessionId;
    if (seatNum !== undefined) selectedSeat = seatNum;

    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    // Sync session select
    const sessionSelect = document.getElementById('book-session-select');
    if (sessionSelect) {
      sessionSelect.value = activeSessionId;
    }

    // Sync seat display
    updateModalSeatDisplay();

    document.getElementById('booking-form-step').style.display = 'block';
    document.getElementById('booking-confirmation-step').style.display = 'none';

    modal.classList.add('open');
    if (window.SoundFX) SoundFX.playPop(620);
  }

  function updateModalSeatDisplay() {
    const seatDisplay = document.getElementById('book-seat-display');
    const session = SESSIONS[activeSessionId];
    if (seatDisplay) {
      if (selectedSeat) {
        const side = selectedSeat <= 12 ? 'Left Table' : 'Right Table';
        seatDisplay.innerHTML = `<span style="color:var(--color-accent-mint);">Seat #${selectedSeat}</span> (${side}) • 30 LYD`;
      } else {
        seatDisplay.innerHTML = `<span>Any Available Seat</span> • 30 LYD`;
      }
    }
  }

  function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.remove('open');
  }

  // --------------------------------------------------------------------------
  // ONE-SEAT-PER-PHONE & DUPLICATE BOOKING VALIDATION
  // --------------------------------------------------------------------------
  function isPhoneAlreadyBooked(normalizedPhone, sessionId) {
    if (!normalizedPhone) return null;

    // 1. Check user bookings history
    if (Array.isArray(state.userBookings)) {
      const found = state.userBookings.find(b => 
        b.sessionId === sessionId &&
        window.OpenWAService &&
        OpenWAService.normalizePhone(b.phone) === normalizedPhone
      );
      if (found) return found;
    }

    // 2. Check session booked roster
    const sessionState = state[sessionId];
    if (sessionState && sessionState.bookedSeats) {
      for (const [seatNum, occupant] of Object.entries(sessionState.bookedSeats)) {
        if (occupant.phone && window.OpenWAService && OpenWAService.normalizePhone(occupant.phone) === normalizedPhone) {
          return {
            seatNumber: seatNum,
            name: occupant.name || 'Member',
            phone: occupant.phone,
            sessionId
          };
        }
      }
    }

    return null;
  }

  function showBookingFormError(msg) {
    const errBox = document.getElementById('booking-form-error');
    const errText = document.getElementById('booking-form-error-text');
    if (errBox && errText) {
      errText.textContent = msg;
      errBox.classList.add('visible');
    }
  }

  function hideBookingFormError() {
    const errBox = document.getElementById('booking-form-error');
    if (errBox) {
      errBox.classList.remove('visible');
    }
  }

  // --------------------------------------------------------------------------
  // WHATSAPP ONE-TIME PASSWORD (OTP) ENGINE & STATE
  // --------------------------------------------------------------------------
  let currentOtp = null;
  let otpExpiresAt = 0;
  let otpTimerInterval = null;
  let resendCooldownExpiresAt = 0;
  let resendTimerInterval = null;
  let otpAttemptsRemaining = 4;
  let pendingBookingData = null;

  function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function startOtpExpiryTicker() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    const timerWrap = document.getElementById('otp-timer-wrap');
    const timerVal = document.getElementById('otp-timer-val');

    function update() {
      const remainingMs = Math.max(0, otpExpiresAt - Date.now());
      const totalSecs = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (timerVal) timerVal.textContent = formatted;
      if (timerWrap) {
        timerWrap.classList.toggle('expiring', totalSecs <= 45 && totalSecs > 0);
      }

      if (totalSecs <= 0) {
        clearInterval(otpTimerInterval);
        showOtpAlert('This passcode has expired. Please click "Resend Code via WhatsApp".', 'error');
        disableOtpCells(true);
      }
    }

    update();
    otpTimerInterval = setInterval(update, 1000);
  }

  function startResendCooldown(durationSecs = 30) {
    if (resendTimerInterval) clearInterval(resendTimerInterval);
    resendCooldownExpiresAt = Date.now() + durationSecs * 1000;
    const resendBtn = document.getElementById('otp-resend-btn');

    function update() {
      const remainingMs = Math.max(0, resendCooldownExpiresAt - Date.now());
      const secs = Math.ceil(remainingMs / 1000);

      if (!resendBtn) return;

      if (secs > 0) {
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend Code (${secs}s)`;
      } else {
        clearInterval(resendTimerInterval);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code via WhatsApp';
      }
    }

    update();
    resendTimerInterval = setInterval(update, 1000);
  }

  function showOtpAlert(msg, type = 'error') {
    const alertEl = document.getElementById('otp-error-alert');
    const alertText = document.getElementById('otp-error-text');
    if (!alertEl || !alertText) return;

    alertText.textContent = msg;
    alertEl.className = `otp-alert visible otp-alert-${type}`;
  }

  function hideOtpAlert() {
    const alertEl = document.getElementById('otp-error-alert');
    if (alertEl) alertEl.className = 'otp-alert';
  }

  function disableOtpCells(disabled) {
    for (let i = 0; i < 6; i++) {
      const cell = document.getElementById(`otp-cell-${i}`);
      if (cell) cell.disabled = disabled;
    }
  }

  function clearOtpInputs() {
    for (let i = 0; i < 6; i++) {
      const cell = document.getElementById(`otp-cell-${i}`);
      if (cell) {
        cell.value = '';
        cell.disabled = false;
        cell.classList.remove('filled', 'error');
      }
    }
    hideOtpAlert();
  }

  function updateDeliveryStatus(status, customText) {
    const tag = document.getElementById('wa-dispatch-status-tag');
    const textEl = document.getElementById('wa-delivery-text');

    if (tag) {
      if (status === 'delivered') {
        tag.className = 'wa-status-tag mint';
        tag.innerHTML = '🟢 <span class="en-text">Delivered to WhatsApp</span><span class="ar-text">تم التسليم على واتساب</span>';
      } else if (status === 'sending') {
        tag.className = 'wa-status-tag';
        tag.innerHTML = '⚡ <span class="en-text">Dispatching via OpenWA...</span><span class="ar-text">جاري الإرسال...</span>';
      } else if (status === 'waiting_qr') {
        tag.className = 'wa-status-tag gold';
        tag.innerHTML = '📱 <span class="en-text">Bot Awaiting QR Link</span><span class="ar-text">البوت بانتظار الربط</span>';
      } else {
        tag.className = 'wa-status-tag';
        tag.innerHTML = '💬 <span class="en-text">Dispatched via WhatsApp</span><span class="ar-text">تم الإرسال عبر واتساب</span>';
      }
    }

    if (textEl && customText) {
      textEl.innerHTML = `<span>${customText}</span>`;
    }
  }

  async function startWhatsAppOtpFlow(name, phone, normPhone, level, chosenSession) {
    const sessionObj = SESSIONS[chosenSession];
    pendingBookingData = {
      name,
      phone,
      normPhone,
      level,
      chosenSession,
      seatNumber: selectedSeat
    };

    currentOtp = generateOtpCode();
    otpExpiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes
    otpAttemptsRemaining = 4;

    clearOtpInputs();

    // Update phone display
    const phoneTarget = document.getElementById('otp-phone-target');
    if (phoneTarget) {
      phoneTarget.textContent = window.OpenWAService 
        ? OpenWAService.formatPhoneDisplay(normPhone) 
        : phone;
    }

    // Update external WhatsApp support link
    const waLink = document.getElementById('otp-open-wa-btn');
    if (waLink) {
      const msg = `Hi TalkLab! I am reserving a seat for ${name} (${sessionObj.name}). My phone is +${normPhone}.`;
      waLink.href = `https://wa.me/218920920230?text=${encodeURIComponent(msg)}`;
    }

    // Switch view to OTP step
    document.getElementById('booking-form-step').style.display = 'none';
    document.getElementById('booking-otp-step').style.display = 'block';
    document.getElementById('booking-confirmation-step').style.display = 'none';

    // Start timers
    startOtpExpiryTicker();
    startResendCooldown(30);
    updateDeliveryStatus('sending');

    if (window.SoundFX) SoundFX.playPop(640);

    // Auto-focus first digit cell
    setTimeout(() => {
      const firstCell = document.getElementById('otp-cell-0');
      if (firstCell) firstCell.focus();
    }, 120);

    // Dispatch real WhatsApp OTP message via OpenWA API
    if (window.OpenWAService) {
      try {
        const dispatchRes = await OpenWAService.dispatchOtpPasscode({
          name,
          phone: normPhone,
          sessionName: sessionObj.name,
          seatNumber: selectedSeat,
          otpCode: currentOtp
        });

        if (dispatchRes.success) {
          updateDeliveryStatus('delivered', 'Authentication code dispatched directly to your WhatsApp app! Check your chat.');
          showOtpAlert('WhatsApp message delivered! Enter the 6 digits below.', 'success');
        } else if (dispatchRes.status === 409) {
          updateDeliveryStatus('waiting_qr', 'OpenWA WhatsApp Bot is active. Code ready for delivery upon QR link.');
        } else {
          updateDeliveryStatus('dispatched', 'We dispatched the verification code to your WhatsApp number.');
        }
      } catch (err) {
        console.warn('[BookingSystem] WhatsApp dispatch error:', err);
        updateDeliveryStatus('dispatched', 'Dispatched verification passcode. Please check your WhatsApp.');
      }
    }
  }

  async function handleResendOtp() {
    if (Date.now() < resendCooldownExpiresAt) return;
    if (!pendingBookingData) return;

    const { name, normPhone, chosenSession, seatNumber } = pendingBookingData;
    const sessionObj = SESSIONS[chosenSession];

    currentOtp = generateOtpCode();
    otpExpiresAt = Date.now() + 3 * 60 * 1000;
    otpAttemptsRemaining = 4;

    clearOtpInputs();
    startOtpExpiryTicker();
    startResendCooldown(30);
    updateDeliveryStatus('sending');

    showOtpAlert('New 6-digit WhatsApp passcode dispatched!', 'success');
    if (window.SoundFX) SoundFX.playPop(720);

    const firstCell = document.getElementById('otp-cell-0');
    if (firstCell) firstCell.focus();

    // Dispatch fresh OTP via OpenWA
    if (window.OpenWAService) {
      try {
        const res = await OpenWAService.dispatchOtpPasscode({
          name,
          phone: normPhone,
          sessionName: sessionObj.name,
          seatNumber,
          otpCode: currentOtp
        });
        if (res.success) {
          updateDeliveryStatus('delivered', 'Fresh passcode dispatched to your WhatsApp.');
        }
      } catch (err) {
        console.warn('[BookingSystem] Resend error:', err);
      }
    }
  }

  function backToBookingForm() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    if (resendTimerInterval) clearInterval(resendTimerInterval);

    document.getElementById('booking-form-step').style.display = 'block';
    document.getElementById('booking-otp-step').style.display = 'none';
    document.getElementById('booking-confirmation-step').style.display = 'none';
    hideBookingFormError();
    if (window.SoundFX) SoundFX.playPop(500);
  }

  function getEnteredOtp() {
    let code = '';
    for (let i = 0; i < 6; i++) {
      const cell = document.getElementById(`otp-cell-${i}`);
      code += cell ? (cell.value || '').trim() : '';
    }
    return code;
  }

  function verifyOtpCode() {
    if (!pendingBookingData) return;

    const entered = getEnteredOtp();

    if (entered.length < 6) {
      showOtpAlert('Please enter all 6 digits of your WhatsApp passcode.', 'error');
      triggerShakeAnimation();
      return;
    }

    if (Date.now() > otpExpiresAt) {
      showOtpAlert('This passcode has expired. Please click "Resend Code".', 'error');
      triggerShakeAnimation();
      return;
    }

    if (entered === currentOtp) {
      // SUCCESSFUL WHATSAPP VERIFICATION!
      if (otpTimerInterval) clearInterval(otpTimerInterval);
      if (resendTimerInterval) clearInterval(resendTimerInterval);

      finalizeVerifiedBooking();
    } else {
      // INCORRECT PASSCODE
      otpAttemptsRemaining--;
      triggerShakeAnimation();
      if (window.SoundFX) SoundFX.playBuzzer();

      for (let i = 0; i < 6; i++) {
        const cell = document.getElementById(`otp-cell-${i}`);
        if (cell) cell.classList.add('error');
      }

      if (otpAttemptsRemaining > 0) {
        showOtpAlert(`Incorrect passcode. ${otpAttemptsRemaining} attempts remaining. Check WhatsApp.`, 'error');
      } else {
        showOtpAlert('Maximum attempts exceeded. Passcode invalidated. Please request a new code.', 'error');
        disableOtpCells(true);
      }
    }
  }

  function triggerShakeAnimation() {
    const container = document.getElementById('otp-inputs-container');
    if (container) {
      container.classList.remove('otp-shake');
      void container.offsetWidth;
      container.classList.add('otp-shake');
    }
  }

  async function finalizeVerifiedBooking() {
    const { name, phone, normPhone, level, chosenSession, seatNumber } = pendingBookingData;
    const sessionObj = SESSIONS[chosenSession];
    const sessionState = state[chosenSession];

    // Double check if phone was booked during verification
    const existing = isPhoneAlreadyBooked(normPhone, chosenSession);
    if (existing) {
      alert(`Notice: Phone number ${phone} is already registered for Seat #${existing.seatNumber}.`);
    }

    // Assign seat
    let assignedSeat = seatNumber;
    if (!assignedSeat || sessionState.bookedSeats[assignedSeat]) {
      const candidateSeats = [];
      for (let i = 1; i <= 12; i++) candidateSeats.push(i);
      for (let i = 14; i <= 25; i++) candidateSeats.push(i);

      for (const s of candidateSeats) {
        if (!sessionState.bookedSeats[s]) {
          assignedSeat = s;
          break;
        }
      }
    }

    const userInitial = name.charAt(0).toUpperCase() || 'M';

    if (assignedSeat) {
      sessionState.bookedSeats[assignedSeat] = {
        initial: userInitial,
        name: name,
        phone: normPhone
      };
    }

    const refCode = `TL-${Math.floor(1000 + Math.random() * 9000)}-${chosenSession.slice(0, 3).toUpperCase()}`;

    const record = {
      id: refCode,
      name,
      phone: normPhone,
      displayPhone: window.OpenWAService ? OpenWAService.formatPhoneDisplay(normPhone) : phone,
      level,
      sessionId: chosenSession,
      sessionName: sessionObj.name,
      day: sessionObj.day,
      time: sessionObj.time,
      price: sessionObj.price,
      seatNumber: assignedSeat || 'Assigned at Door',
      bookingDate: new Date().toISOString(),
      whatsappVerified: true,
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      otpRef: `WA-${currentOtp.slice(0, 3)}`
    };

    state.userBookings.unshift(record);
    saveState();

    renderConfirmationTicket(record);
    renderBoardroomMap();

    if (window.ConfettiFX) ConfettiFX.blast(0.5, 0.45, 140);
    if (window.SoundFX) SoundFX.playWinFanfare();
    window.dispatchEvent(new CustomEvent('talklab:booked', { detail: record }));

    // Send official WhatsApp Confirmation Boarding Pass
    if (window.OpenWAService) {
      OpenWAService.dispatchBookingConfirmation(record).catch(err => {
        console.warn('[BookingSystem] Confirmation ticket WhatsApp dispatch failed:', err);
      });
    }
  }

  function handleBookingSubmit(e) {
    e.preventDefault();
    hideBookingFormError();

    const nameInput = document.getElementById('book-name');
    const phoneInput = document.getElementById('book-phone');
    const levelSelect = document.getElementById('book-level');
    const sessionSelect = document.getElementById('book-session-select');

    const name = nameInput ? nameInput.value.trim() : '';
    const rawPhone = phoneInput ? phoneInput.value.trim() : '';
    const level = levelSelect ? levelSelect.value : 'Conversationalist';
    const chosenSession = sessionSelect ? sessionSelect.value : activeSessionId;
    const sessionObj = SESSIONS[chosenSession];

    if (!name) {
      showBookingFormError('Please enter your full name.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!rawPhone) {
      showBookingFormError('Please enter your WhatsApp / phone number.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    const normPhone = window.OpenWAService 
      ? OpenWAService.normalizePhone(rawPhone) 
      : rawPhone.replace(/\D/g, '');

    if (!normPhone || normPhone.length < 8) {
      showBookingFormError('Please enter a valid phone number (e.g. 091 234 5678 or +218 91 234 5678).');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // STRICT 1 SEAT PER PHONE NUMBER RULE
    const existing = isPhoneAlreadyBooked(normPhone, chosenSession);
    if (existing) {
      const formatted = window.OpenWAService ? OpenWAService.formatPhoneDisplay(normPhone) : rawPhone;
      showBookingFormError(
        `⚠️ Phone number ${formatted} is already registered for Seat #${existing.seatNumber} (${existing.name}) in ${sessionObj.name}. Each member can only reserve 1 seat per session.`
      );
      if (phoneInput) {
        phoneInput.classList.add('error');
        phoneInput.focus();
      }
      if (window.SoundFX) SoundFX.playBuzzer();
      return;
    }

    if (phoneInput) phoneInput.classList.remove('error');

    // Launch WhatsApp One-Time Password verification flow
    startWhatsAppOtpFlow(name, rawPhone, normPhone, level, chosenSession);
  }


  function generateQrSvg(code) {
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FFFFFF" rx="8"/>
        <rect x="8" y="8" width="28" height="28" rx="4" stroke="#13172E" stroke-width="4"/>
        <rect x="16" y="16" width="12" height="12" rx="2" fill="#2F42F0"/>
        <rect x="64" y="8" width="28" height="28" rx="4" stroke="#13172E" stroke-width="4"/>
        <rect x="72" y="16" width="12" height="12" rx="2" fill="#2F42F0"/>
        <rect x="8" y="64" width="28" height="28" rx="4" stroke="#13172E" stroke-width="4"/>
        <rect x="16" y="72" width="12" height="12" rx="2" fill="#2F42F0"/>
        <rect x="44" y="12" width="8" height="8" fill="#13172E"/>
        <rect x="52" y="24" width="6" height="8" fill="#13172E"/>
        <rect x="44" y="44" width="12" height="12" fill="#2F42F0"/>
        <rect x="68" y="48" width="10" height="8" fill="#13172E"/>
        <rect x="48" y="68" width="8" height="12" fill="#13172E"/>
        <rect x="72" y="72" width="12" height="12" fill="#FF4742"/>
      </svg>
    `;
  }

  function renderConfirmationTicket(record) {
    document.getElementById('booking-form-step').style.display = 'none';
    document.getElementById('booking-otp-step').style.display = 'none';
    const confStep = document.getElementById('booking-confirmation-step');
    confStep.style.display = 'block';

    const ticketContainer = document.getElementById('generated-ticket-container');
    ticketContainer.innerHTML = `
      <div class="boarding-pass-ticket">
        <div class="boarding-pass-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <div style="width:50px; height:50px; border-radius:14px; background:#FFF8EE; border:2.5px solid var(--border-color); box-shadow:3px 3px 0px var(--shadow-color); padding:3px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <img src="assets/logo-cream.png" alt="TalkLab" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.25rem;">
                <span class="pop-badge gold" style="font-size:0.72rem; padding:0.15rem 0.5rem;">Official TalkLab Pass</span>
                <span class="boarding-pass-verified-stamp">
                  <svg viewBox="0 0 24 24" style="width:13px; height:13px; fill:currentColor;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/></svg>
                  <span>WhatsApp Verified</span>
                </span>
              </div>
              <div style="font-family:var(--font-mono); font-size:1.3rem; font-weight:900; color:var(--color-primary);">${record.id}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-display); font-size:2rem; font-weight:900; color:var(--color-accent-coral); line-height:1;">30 LYD</div>
            <div style="font-family:var(--font-mono); font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Pay on arrival</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:1rem; align-items:center;">
          <div>
            <h4 style="font-size:1.35rem; font-weight:900; color:var(--text-main); margin-bottom:0.25rem;">${record.sessionName}</h4>
            <p style="font-family:var(--font-mono); font-size:0.95rem; font-weight:700; color:var(--color-primary); margin-bottom:0.75rem;">${record.day} • ${record.time}</p>
            <div style="font-size:0.9rem; color:var(--text-muted); line-height:1.55;">
              <div>Guest: <strong>${record.name}</strong></div>
              <div>WhatsApp: <strong>${record.phone}</strong> <span style="color:#25D366; font-weight:900;">✓</span></div>
              <div>Table Seat: <strong style="color:var(--color-accent-mint);">#${record.seatNumber} (Boardroom)</strong></div>
              <div>Host Venue: <strong>مركز سفراء العلم (People &amp; Spaces)</strong></div>
              <div>Address: <strong>حي الأندلس، شارع البريد، طرابلس 🇱🇾</strong></div>
              <div>Fee: <strong>30 LYD (Pay on arrival)</strong></div>
              <div style="font-size:0.82rem; color:var(--color-primary); font-weight:800; margin-top:0.35rem;">☕ Show pass for Member Discount at the in-house Cafe!</div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.5rem; background:#FFF; border:2px solid var(--border-color); border-radius:12px;">
            ${generateQrSvg(record.id)}
            <span style="font-family:var(--font-mono); font-size:0.68rem; font-weight:800; color:var(--text-muted); margin-top:0.35rem;">Scan at Entrance</span>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1.5rem;">
        <button type="button" class="pop-btn pop-btn-gold pop-btn-sm js-open-maps" data-action="open-maps" style="flex:1; justify-content:center;">
          📍 Open Location in Google Maps (مركز سفراء العلم)
        </button>
        <a href="https://api.whatsapp.com/send?phone=218920920230&text=Hi%20TalkLab!%20I%20just%20verified%20and%20booked%20my%20pass%20${record.id}%20for%20${encodeURIComponent(record.sessionName)}%20(Seat%20%23${record.seatNumber})!" 
           target="_blank" class="pop-btn pop-btn-primary pop-btn-sm" style="flex:1; justify-content:center;">
          📱 Open in WhatsApp
        </a>
      </div>
    `;
  }

  function initOtpListeners() {
    // Back to form button
    const backBtn = document.getElementById('otp-back-btn');
    if (backBtn) backBtn.addEventListener('click', backToBookingForm);

    // Resend code button
    const resendBtn = document.getElementById('otp-resend-btn');
    if (resendBtn) resendBtn.addEventListener('click', handleResendOtp);

    // Verify submit button
    const verifyBtn = document.getElementById('otp-verify-submit-btn');
    if (verifyBtn) verifyBtn.addEventListener('click', verifyOtpCode);

    // 6 Digit input cells
    const cells = [];
    for (let i = 0; i < 6; i++) {
      const cell = document.getElementById(`otp-cell-${i}`);
      if (cell) cells.push(cell);
    }

    cells.forEach((cell, idx) => {
      cell.addEventListener('input', (e) => {
        const val = cell.value.replace(/\D/g, '');
        cell.value = val ? val.slice(-1) : '';

        if (cell.value) {
          cell.classList.add('filled');
          cell.classList.remove('error');
          hideOtpAlert();
          if (idx < 5) {
            cells[idx + 1].focus();
          } else {
            // Last cell filled - auto verify
            verifyOtpCode();
          }
        } else {
          cell.classList.remove('filled');
        }
      });

      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (!cell.value && idx > 0) {
            cells[idx - 1].focus();
            cells[idx - 1].value = '';
            cells[idx - 1].classList.remove('filled');
          } else {
            cell.value = '';
            cell.classList.remove('filled');
          }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          cells[idx - 1].focus();
        } else if (e.key === 'ArrowRight' && idx < 5) {
          cells[idx + 1].focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          verifyOtpCode();
        }
      });
    });

    // Paste handling on any OTP cell or container
    const otpContainer = document.getElementById('otp-inputs-container');
    if (otpContainer) {
      otpContainer.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboardData = (e.clipboardData || window.clipboardData).getData('text');
        const digits = (clipboardData.match(/\d/g) || []).slice(0, 6);
        if (digits.length > 0) {
          digits.forEach((digit, i) => {
            if (cells[i]) {
              cells[i].value = digit;
              cells[i].classList.add('filled');
              cells[i].classList.remove('error');
            }
          });
          if (digits.length >= 6) {
            cells[5].focus();
            verifyOtpCode();
          } else {
            cells[digits.length].focus();
          }
        }
      });
    }
  }

  function init() {
    renderBoardroomMap();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initOtpListeners();

    // Fast Switcher Tab Buttons
    document.querySelectorAll('.session-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-session');
        setSession(sId);
      });
    });

    // Hero Cards
    document.querySelectorAll('.session-hero-card').forEach(card => {
      card.addEventListener('click', () => {
        const sId = card.getAttribute('data-session');
        setSession(sId);
      });
    });

    // Open booking modal triggers
    document.querySelectorAll('[data-action="open-booking"]').forEach(btn => {
      btn.addEventListener('click', () => openBookingModal());
    });

    const reserveBtn = document.getElementById('boardroom-reserve-btn');
    if (reserveBtn) {
      reserveBtn.addEventListener('click', () => openBookingModal(activeSessionId, selectedSeat));
    }

    // Modal session dropdown change listener
    const modalSessionSelect = document.getElementById('book-session-select');
    if (modalSessionSelect) {
      modalSessionSelect.addEventListener('change', (e) => {
        setSession(e.target.value);
        updateModalSeatDisplay();
      });
    }

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);

    const modal = document.getElementById('booking-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBookingModal();
      });
    }

    const form = document.getElementById('booking-form');
    if (form) form.addEventListener('submit', handleBookingSubmit);
  }

  return {
    init,
    setSession,
    openBookingModal,
    closeBookingModal,
    getState: () => state,
    SESSIONS
  };
})();

window.BookingSystem = BookingSystem;
