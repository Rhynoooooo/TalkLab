'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  LogOut,
  PhoneCall
} from 'lucide-react';
import { SoundFX } from '@/lib/soundFx';

interface MemberAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MemberAuthModal({ isOpen: propIsOpen, onClose: propOnClose }: MemberAuthModalProps = {}) {
  const { userBookings, currentUser, refreshSession, logout, isMemberModalOpen, closeMemberModal } = useApp();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isMemberModalOpen;
  const onClose = propOnClose || closeMemberModal;

  const [step, setStep] = useState<'phone' | 'otp' | 'pass'>(() =>
    currentUser?.role === 'member' ? 'pass' : 'phone'
  );
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync step when authentication state changes
  useEffect(() => {
    queueMicrotask(() => {
      if (currentUser?.role === 'member') {
        setStep('pass');
      }
    });
  }, [currentUser]);

  // Resend countdown timer
  useEffect(() => {
    if (step !== 'otp' || canResend) return;

    const timer = setInterval(() => {
      setResendSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, canResend]);

  if (!isOpen) return null;

  // Find user's booking if authenticated or matched by phone
  const activeBooking =
    userBookings.find(b => currentUser?.phone && b.normPhone === currentUser.phone) ||
    userBookings[0];

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || isSubmitting) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json().catch(() => ({}));
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setFormattedPhone(data.formattedPhone || phone);
        setStep('otp');
        setResendSeconds(60);
        setCanResend(false);
        SoundFX.playPop(580);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch verification code');
        SoundFX.playBuzzer();
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Network error connecting to verification service');
      SoundFX.playBuzzer();
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6 || isSubmitting) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: fullCode })
      });

      const data = await res.json().catch(() => ({}));
      setIsSubmitting(false);

      if (res.ok && data.success) {
        SoundFX.playFanfare();
        await refreshSession();
        setStep('pass');
      } else {
        setErrorMsg(data.error || 'Invalid verification passcode');
        SoundFX.playBuzzer();
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Network error during verification');
      SoundFX.playBuzzer();
    }
  };

  const handleMemberLogout = async () => {
    await logout();
    setStep('phone');
    setPhone('');
    setOtpDigits(['', '', '', '', '', '']);
    SoundFX.playPop(420);
  };

  const downloadCalendarFile = () => {
    if (!activeBooking) return;
    SoundFX.playPop(620);
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalkLab//English Conversation Club//EN
BEGIN:VEVENT
SUMMARY:TalkLab - ${activeBooking.sessionName} (Seat #${activeBooking.seatNumber})
DESCRIPTION:Tripoli's English Conversation Club at People & Spaces (مركز سفراء العلم). Fee: 30 LYD at door.
LOCATION:مركز سفراء العلم (People & Spaces), Hay Al-Andalus, Tripoli, Libya
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TalkLab-Pass-${activeBooking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_var(--shadow-color)]">
              🎟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                  {step === 'pass' ? 'Digital Boarding Pass' : 'Attendee Verification'}
                </h3>
              </div>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                TalkLab 2.0 • People &amp; Spaces Venue Access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 'phone' && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)]">
              <PhoneCall className="w-7 h-7 text-[var(--color-primary)]" />
            </div>

            <div>
              <h4 className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
                Access Your Reserved Seat
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                Enter your WhatsApp mobile number to verify your identity and view your active boardroom pass.
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--text-muted)] uppercase mb-1">
                  Libyan Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[var(--text-muted)]">
                    🇱🇾 +218
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="91 234 5678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-20 pr-3 py-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-mono font-extrabold text-base text-[var(--text-main)] shadow-[3px_3px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <span className="font-mono text-[0.68rem] text-[var(--text-muted)] mt-1 block">
                  Accepted prefixes: 091, 092, 093, 094, 095
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !phone.trim()}
                className="pop-btn pop-btn-primary pop-btn-md w-full justify-center shadow-[3px_3px_0px_var(--shadow-color)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code via WhatsApp...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Send Verification Passcode</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)]">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
                Enter WhatsApp Passcode
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                We sent a 6-digit code to <strong className="text-[var(--text-main)]">{formattedPhone}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpInputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center font-['Space_Grotesk'] font-black text-2xl rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                className="pop-btn pop-btn-primary pop-btn-md w-full justify-center shadow-[3px_3px_0px_var(--shadow-color)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </span>
                ) : (
                  <span>Verify &amp; Unlock Boarding Pass</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] pt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 hover:text-[var(--text-main)]"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Number</span>
                </button>

                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleRequestOtp}
                  className="disabled:opacity-50 hover:text-[var(--text-main)]"
                >
                  {canResend ? 'Resend Passcode' : `Resend in ${resendSeconds}s`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: DIGITAL BOARDING PASS CARD */}
        {step === 'pass' && (
          <div className="space-y-5 relative">
            <div className="washi-tape washi-tape-yellow -top-3.5 right-10 w-28 -rotate-2 hidden sm:block" />

            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="pop-badge mint text-[0.62rem] py-0.5">
                      ✓ Verified Attendee
                    </span>
                    <span className="ink-stamp text-[0.58rem] py-0.2">
                      ★ ADMISSION PASS • 30 LYD
                    </span>
                  </div>
                  <div className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
                    {activeBooking?.name || currentUser?.name || 'TalkLab Conversationalist'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">
                    Assigned Seat
                  </div>
                  <div className="font-['Outfit'] font-black text-2xl text-[var(--color-primary)]">
                    #{activeBooking?.seatNumber || currentUser?.seatNumber || 18}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-mono text-[0.65rem] text-[var(--text-muted)] uppercase block">
                    Session
                  </span>
                  <strong className="text-[var(--text-main)] font-extrabold">
                    {activeBooking?.sessionName || 'Saturday Immersion Lab'}
                  </strong>
                </div>

                <div>
                  <span className="font-mono text-[0.65rem] text-[var(--text-muted)] uppercase block">
                    Time &amp; Schedule
                  </span>
                  <strong className="text-[var(--text-main)] font-extrabold">
                    {activeBooking?.day || 'Every Saturday'} • {activeBooking?.time || '12:00 PM – 4:00 PM'}
                  </strong>
                </div>

                <div>
                  <span className="font-mono text-[0.65rem] text-[var(--text-muted)] uppercase block">
                    Fee at Door
                  </span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    30 LYD (Pay on Arrival)
                  </strong>
                </div>

                <div>
                  <span className="font-mono text-[0.65rem] text-[var(--text-muted)] uppercase block">
                    Verified Phone
                  </span>
                  <strong className="font-mono text-[var(--text-main)]">
                    {currentUser?.phone ? `+${currentUser.phone}` : activeBooking?.phone}
                  </strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[0.7rem] font-mono text-[var(--text-muted)]">
                📍 <strong>Venue:</strong> مركز سفراء العلم (People &amp; Spaces) • حي الأندلس، شارع البريد، طرابلس
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={downloadCalendarFile}
                  className="pop-btn pop-btn-surface pop-btn-sm flex-1 justify-center flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={handleMemberLogout}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-1"
                  title="Sign out of this device"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { MemberAuthModal };
