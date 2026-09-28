'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SESSIONS } from '@/lib/constants';
import { normalizePhone, formatPhoneDisplay, isValidPhone, dispatchOtpPasscode, dispatchBookingConfirmation } from '@/lib/openwa';
import { SoundFX } from '@/lib/soundFx';
import { CheckCircle2, AlertCircle, RefreshCw, X, MessageSquare, ArrowLeft } from 'lucide-react';

export default function BookingModal() {
  const {
    isBookingOpen,
    closeBooking,
    activeSession,
    setActiveSession,
    selectedSeat,
    setSelectedSeat,
    bookedSeats,
    userBookings,
    addBooking,
    fireConfetti
  } = useApp();

  const [step, setStep] = useState<'form' | 'otp' | 'ticket'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('Conversationalist (B1-B2)');
  const [formError, setFormError] = useState('');

  // OTP Fields
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isOtpShaking, setIsOtpShaking] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(180);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    name: string;
    seatNumber: number;
    sessionName: string;
    day: string;
    time: string;
  } | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when modal opens
  useEffect(() => {
    if (isBookingOpen) {
      setStep('form');
      setFormError('');
      setOtpError('');
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isBookingOpen]);

  // OTP countdown & Resend ticker
  useEffect(() => {
    if (step !== 'otp') return;

    const timer = setInterval(() => {
      setOtpSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  if (!isBookingOpen) return null;

  const currentSessionConfig = SESSIONS[activeSession];
  const currentRoster = bookedSeats[activeSession];

  // Helper to find next available seat if none selected
  const resolveSeatNumber = (): number | null => {
    if (selectedSeat && !currentRoster[selectedSeat]) return selectedSeat;
    for (let i = 1; i <= 25; i++) {
      if (i === 13) continue; // skip 13 if skipping
      if (!currentRoster[i]) return i;
    }
    return 1;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const norm = normalizePhone(phone);
    if (!isValidPhone(norm)) {
      setFormError('Please enter a valid phone or WhatsApp number (e.g. +218 91 234 5678).');
      return;
    }

    // 1-Seat-Per-Phone Enforcement
    const existing = userBookings.find(
      b => b.normPhone === norm && b.session === activeSession
    );
    if (existing) {
      setFormError(`This phone number already has a confirmed seat (#${existing.seatNumber}) for the ${currentSessionConfig.name}.`);
      SoundFX.playBuzzer();
      return;
    }

    const targetSeat = resolveSeatNumber();
    if (!targetSeat) {
      setFormError('Sorry, this session is completely full!');
      return;
    }

    // Generate random 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSecondsLeft(180);
    setResendCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);

    // Advance to OTP step
    setStep('otp');
    SoundFX.playPop(640);

    // Auto focus first OTP cell
    setTimeout(() => {
      if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
    }, 150);

    // Dispatch real/simulated WhatsApp message via Next.js proxy
    dispatchOtpPasscode({
      name,
      phone: norm,
      sessionName: currentSessionConfig.name,
      seatNumber: targetSeat,
      otpCode: code
    }).catch(err => {
      console.warn('WhatsApp OTP dispatch notice:', err);
    });
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setOtpError('');

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSecondsLeft(180);
    setResendCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('New 6-digit WhatsApp code dispatched!');
    SoundFX.playPop(720);

    const norm = normalizePhone(phone);
    dispatchOtpPasscode({
      name,
      phone: norm,
      sessionName: currentSessionConfig.name,
      seatNumber: resolveSeatNumber(),
      otpCode: code
    }).catch(() => {});
  };

  const handleVerifyOtp = async () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of your WhatsApp passcode.');
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 450);
      SoundFX.playBuzzer();
      return;
    }

    if (otpSecondsLeft <= 0) {
      setOtpError('This passcode has expired. Please click "Resend Code".');
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 450);
      SoundFX.playBuzzer();
      return;
    }

    if (entered === generatedOtp) {
      // SUCCESS!
      const seat = resolveSeatNumber() || 1;
      const passId = `TL-${activeSession === 'saturday' ? 'SAT' : 'TUE'}-${seat}-${Math.floor(1000 + Math.random() * 9000)}`;

      const bookingRecord = {
        id: passId,
        name,
        phone,
        normPhone: normalizePhone(phone),
        session: activeSession,
        sessionName: currentSessionConfig.name,
        day: currentSessionConfig.day,
        time: currentSessionConfig.time,
        seatNumber: seat,
        level,
        bookedAt: new Date().toISOString()
      };

      addBooking(bookingRecord);
      setConfirmedBooking({
        id: passId,
        name,
        seatNumber: seat,
        sessionName: currentSessionConfig.name,
        day: currentSessionConfig.day,
        time: currentSessionConfig.time
      });

      // Dispatch booking confirmation ticket to WhatsApp
      dispatchBookingConfirmation(bookingRecord).catch(() => {});

      SoundFX.playFanfare();
      fireConfetti();
      setStep('ticket');
    } else {
      setOtpError('Incorrect passcode. Please check your WhatsApp application.');
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 450);
      SoundFX.playBuzzer();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeBooking}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeBooking}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
          aria-label="Close booking modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <div className="space-y-5">
            <div>
              <span className="pop-badge blue mb-2">Fast Registration</span>
              <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                Reserve Your Roundtable Seat
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Flat Fee: <strong className="text-[var(--color-primary)]">30 LYD</strong> paid upon arrival at the venue. Strictly limited member seating.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Session Picker */}
              <div>
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                  Select Weekly Session
                </label>
                <select
                  value={activeSession}
                  onChange={e => setActiveSession(e.target.value as 'saturday' | 'tuesday')}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="saturday">Saturday Immersion (12:00 PM – 4:00 PM) — 30 LYD</option>
                  <option value="tuesday">Tuesday Twilight (4:00 PM – 7:00 PM) — 30 LYD</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mansour"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +218 91 234 5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Speaking Level */}
              <div>
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                  Speaking Level &amp; Comfort
                </label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-xs sm:text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="Explorer (A2-B1)">Explorer — Good passive understanding, looking for speaking courage</option>
                  <option value="Conversationalist (B1-B2)">Conversationalist — Can chat, looking for speed &amp; fluid confidence</option>
                  <option value="Fluent Speaker (B2-C1)">Fluent — Looking for intellectual debate &amp; sophisticated vocabulary</option>
                </select>
              </div>

              {/* Assigned Chair Info Box */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] flex items-center justify-between text-xs sm:text-sm font-bold">
                <span>Assigned Chair:</span>
                <span className="font-mono text-[var(--color-primary)] text-sm font-black">
                  {selectedSeat ? `Seat #${selectedSeat}` : 'Any Available Seat'}
                </span>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/40 border-2 border-red-500 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center shadow-[4px_4px_0px_var(--shadow-color)]"
              >
                <span>Verify via WhatsApp OTP (30 LYD) 💬</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: WHATSAPP OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-mono font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Verification</span>
              </div>
              <span className="pop-badge mint text-xs">⚡ Active Passcode</span>
            </div>

            <div>
              <h3 className="font-['Outfit'] font-black text-2xl text-[var(--text-main)]">
                Enter 6-Digit Passcode
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                We dispatched an authentication code to your WhatsApp application.
              </p>
            </div>

            {/* Recipient Phone Target with Back to Edit */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="font-mono text-[0.65rem] uppercase text-[var(--text-muted)] font-black block">
                  Recipient WhatsApp
                </span>
                <span className="font-mono text-sm font-bold text-[var(--text-main)]">
                  {formatPhoneDisplay(phone)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* WhatsApp App Notice Tip */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>💬</span>
                <span>Dispatched via WhatsApp</span>
              </div>
              <p className="text-[0.72rem] leading-relaxed opacity-90">
                Please check your WhatsApp application on your phone. We have dispatched a 6-digit confirmation code.
              </p>
            </div>

            {/* 6 Digit Input Cells */}
            <div className={`space-y-2 ${isOtpShaking ? 'otp-shake' : ''}`}>
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-full h-12 text-center font-['Outfit'] font-black text-xl rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--text-main)]"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-center font-bold text-xs text-[var(--color-accent-coral)]">
                  {otpError}
                </div>
              )}
            </div>

            {/* Meta Row: Timer + Resend */}
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[var(--text-muted)]">
              <span>Code expires: {formatTime(otpSecondsLeft)}</span>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResend}
                className="text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline font-bold"
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>

            {/* Submit Verification */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center shadow-[4px_4px_0px_var(--shadow-color)]"
              >
                <span>✓ Verify OTP &amp; Confirm Seat (30 LYD)</span>
              </button>

              <a
                href={`https://wa.me/218920920230?text=${encodeURIComponent(`Hi TalkLab! I am reserving a seat for ${name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full pop-btn pop-btn-surface pop-btn-sm justify-center text-center"
              >
                <span>Open TalkLab on WhatsApp Directly ↗</span>
              </a>
            </div>
          </div>
        )}

        {/* STEP 3: DIGITAL BOARDING PASS */}
        {step === 'ticket' && confirmedBooking && (
          <div className="text-center space-y-5">
            <div className="text-5xl animate-bounce">🎉</div>
            <div>
              <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                You&apos;re on the Guestlist!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Your seat at the roundtable has been locked in real-time.
              </p>
            </div>

            {/* Boarding Pass Ticket */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border-[2.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] text-left space-y-4">
              <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--border-color)] pb-3">
                <div>
                  <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--text-muted)]">
                    Boarding Pass
                  </span>
                  <div className="font-['Outfit'] font-black text-lg text-[var(--color-primary)]">
                    {confirmedBooking.id}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--text-muted)]">
                    Assigned Chair
                  </span>
                  <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-coral)]">
                    #{confirmedBooking.seatNumber}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm">
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.7rem] uppercase block">Member Name</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.name}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.7rem] uppercase block">Weekly Session</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.sessionName}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.7rem] uppercase block">Schedule</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.day} • {confirmedBooking.time}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.7rem] uppercase block">Host Venue</span>
                  <strong className="text-[var(--text-main)] font-extrabold">مركز سفراء العلم (People &amp; Spaces) • حي الأندلس، طرابلس</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.7rem] uppercase block">Admission Fee</span>
                  <strong className="text-[var(--color-accent-mint)] font-extrabold">30 LYD (Pay at Door)</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeBooking}
              className="w-full pop-btn pop-btn-surface pop-btn-md justify-center"
            >
              <span>Done &amp; Back to Games</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
