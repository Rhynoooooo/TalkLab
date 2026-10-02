'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SESSIONS } from '@/lib/constants';
import { normalizePhone, formatPhoneDisplay, isValidPhone, dispatchOtpPasscode, dispatchBookingConfirmation } from '@/lib/openwa';
import { SoundFX } from '@/lib/soundFx';
import { X, AlertCircle, MessageSquare, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function BookingModal() {
  const {
    isBookingOpen,
    closeBooking,
    activeSession,
    setActiveSession,
    selectedSeat,
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

  const handleClose = () => {
    closeBooking();
    setStep('form');
    setFormError('');
    setOtpError('');
    setOtpDigits(['', '', '', '', '', '']);
  };

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

  const resolveSeatNumber = (): number | null => {
    if (selectedSeat && !currentRoster[selectedSeat]) return selectedSeat;
    for (let i = 1; i <= 25; i++) {
      if (i === 13) continue;
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

    SoundFX.playPop(620);
    setStep('otp');

    // Focus first OTP field
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);

    // Dispatch WhatsApp OTP
    dispatchOtpPasscode({
      name,
      phone,
      sessionName: currentSessionConfig.name,
      seatNumber: selectedSeat,
      otpCode: code
    }).catch(() => {});
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);
    setOtpError('');

    if (clean && index < 5) {
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
    setOtpError('');
    SoundFX.playPop(520);

    dispatchOtpPasscode({
      name,
      phone,
      sessionName: currentSessionConfig.name,
      seatNumber: selectedSeat,
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
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-canvas)] border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 font-mono text-[0.68rem] font-black uppercase text-[var(--text-muted)]">
          <span className={`px-2 py-0.5 rounded-full ${step === 'form' ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
            1. Details
          </span>
          <span>→</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 'otp' ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
            2. Verify
          </span>
          <span>→</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 'ticket' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
            3. Boarding Pass
          </span>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <div className="space-y-5">
            <div>
              <span className="pop-badge blue mb-2">Fast Reservation</span>
              <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                Claim Your Seat at the Table
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Flat fee: <strong className="text-[var(--color-primary)]">30 LYD</strong> paid upon arrival at People &amp; Spaces.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Session Picker */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)]">
                  Weekly Session
                </label>
                <select
                  value={activeSession}
                  onChange={e => setActiveSession(e.target.value as 'saturday' | 'tuesday')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 font-bold text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15 transition-all"
                >
                  <option value="saturday">Saturday Immersion (12:00 PM – 4:00 PM) — 30 LYD</option>
                  <option value="tuesday">Tuesday Twilight (4:00 PM – 7:00 PM) — 30 LYD</option>
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)]">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mansour"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 font-bold text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15 transition-all"
                />
              </div>

              {/* WhatsApp Phone */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)]">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +218 91 234 5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 font-bold text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15 transition-all"
                />
              </div>

              {/* Speaking Level */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)]">
                  Speaking Comfort Level
                </label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15 transition-all"
                >
                  <option value="Explorer (A2-B1)">Explorer — Good understanding, looking for speaking courage</option>
                  <option value="Conversationalist (B1-B2)">Conversationalist — Can chat, looking for speed &amp; fluid confidence</option>
                  <option value="Fluent Speaker (B2-C1)">Fluent — Looking for intellectual debate &amp; sophisticated vocabulary</option>
                </select>
              </div>

              {/* Assigned Chair Info Box */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="text-[var(--text-muted)]">Assigned Roundtable Seat:</span>
                <span className="font-mono text-[var(--color-primary)] text-sm font-black bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-full">
                  {selectedSeat ? `Seat #${selectedSeat}` : 'Next Free Seat'}
                </span>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center btn-shimmer"
              >
                <span>Verify via WhatsApp OTP (30 LYD) 💬</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: WHATSAPP OTP */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-mono font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Authentication</span>
              </div>
              <span className="pop-badge mint text-xs">⚡ Code Sent</span>
            </div>

            <div>
              <h3 className="font-['Outfit'] font-black text-2xl text-[var(--text-main)]">
                Enter 6-Digit Passcode
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                We sent a 6-digit confirmation code to your WhatsApp application.
              </p>
            </div>

            {/* Target Phone */}
            <div className="p-3 rounded-2xl bg-[var(--bg-canvas)] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[0.62rem] uppercase text-[var(--text-muted)] font-black block">
                  Target Number
                </span>
                <span className="font-mono text-sm font-bold text-[var(--text-main)]">
                  {formatPhoneDisplay(phone)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* 6 Digit Input Cells */}
            <div className={`space-y-2.5 ${isOtpShaking ? 'otp-shake' : ''}`}>
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
                    className="w-full h-12 text-center font-['Space_Grotesk'] font-black text-xl rounded-xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/15 text-[var(--text-main)] transition-all"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-center font-bold text-xs text-rose-500">
                  {otpError}
                </div>
              )}
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[var(--text-muted)]">
              <span>Code expires in: {formatTime(otpSecondsLeft)}</span>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResend}
                className="text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline font-bold cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>

            {/* Submit Verification */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center btn-shimmer"
              >
                <ShieldCheck className="w-4 h-4 mr-1" />
                <span>Confirm &amp; Lock In Seat (30 LYD)</span>
              </button>

              <a
                href={`https://wa.me/218920920230?text=${encodeURIComponent(`Hi TalkLab! I am reserving a seat for ${name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full pop-btn pop-btn-surface pop-btn-sm justify-center text-center"
              >
                <span>Direct WhatsApp Contact ↗</span>
              </a>
            </div>
          </div>
        )}

        {/* STEP 3: DIGITAL BOARDING PASS */}
        {step === 'ticket' && confirmedBooking && (
          <div className="text-center space-y-6">
            <div className="text-5xl animate-bounce">🎟️</div>
            <div>
              <span className="pop-badge mint mb-2">Confirmed Member Pass</span>
              <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                You&apos;re on the Guestlist!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Your seat has been reserved at مركز سفراء العلم for the session.
              </p>
            </div>

            {/* Boarding Pass Ticket */}
            <div className="p-6 rounded-3xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-lg text-left space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 dark:border-slate-700 pb-3">
                <div>
                  <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--text-muted)]">
                    Boarding Pass ID
                  </span>
                  <div className="font-['Space_Grotesk'] font-black text-lg text-[var(--color-primary)]">
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

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.65rem] uppercase block">Member</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.name}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.65rem] uppercase block">Weekly Session</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.sessionName}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.65rem] uppercase block">Schedule</span>
                  <strong className="text-[var(--text-main)] font-extrabold">{confirmedBooking.day} • {confirmedBooking.time}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-mono text-[0.65rem] uppercase block">Admission Fee</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">30 LYD (Pay at Door)</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[0.68rem] font-mono text-[var(--text-muted)]">
                📍 Location: مركز سفراء العلم (People &amp; Spaces) • حي الأندلس، طرابلس
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full pop-btn pop-btn-surface pop-btn-md justify-center"
            >
              <span>Done &amp; Explore More</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
