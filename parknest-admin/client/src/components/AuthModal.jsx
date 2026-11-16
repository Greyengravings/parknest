import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { CheckCircle2, KeyRound, LoaderCircle, Phone, ShieldCheck, X } from 'lucide-react';

const DEMO_OTP = '1234';

const AuthModal = ({ onClose, required = false }) => {
  const { loginWithPhone, updateProfile } = useUser();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setPhone(digits);
    setError('');
    setStep('otp');
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (otp !== DEMO_OTP) {
      setError('That code is not correct. Use the demo code shown below.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const account = await loginWithPhone(`+91 ${phone}`);
      if (account.needsName || !account.name.trim()) {
        setStep('name');
      } else {
        setStep('success');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveName = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter your name to continue.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await updateProfile({ name: trimmedName });
      setStep('success');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 ${required ? 'bg-slate-50' : 'bg-slate-950/70 backdrop-blur-sm'}`}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        {!required && <button type="button" onClick={onClose} aria-label="Close sign in" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>}
        {required && (
          <div className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-slate-900">
            <span className="rounded-lg bg-blue-600 p-2 text-white"><Phone size={17} /></span>
            ParkNest
          </div>
        )}
        {step === 'phone' && (
          <form onSubmit={sendOtp} className="space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Phone size={22} /></div>
            <div className="text-center">
              <h2 id="auth-title" className="text-xl font-bold text-slate-900">Welcome to ParkNest</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in with your phone to reserve parking.</p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Mobile number
              <div className="mt-1.5 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">+91</span>
                <input autoFocus type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="9876543210" className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">Continue</button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500"><ShieldCheck size={14} className="text-emerald-600" /> Demo OTP sign-in; no SMS is sent.</p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><KeyRound size={22} /></div>
            <div className="text-center">
              <h2 id="auth-title" className="text-xl font-bold text-slate-900">Verify your number</h2>
              <p className="mt-1 text-sm text-slate-500">Demo verification for +91 {phone}</p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              One-time password
              <input autoFocus required inputMode="numeric" maxLength={4} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="4-digit code" className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">Demo OTP: <strong className="font-mono">1234</strong></p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Change number</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? <LoaderCircle size={16} className="mx-auto animate-spin" /> : 'Verify & sign in'}
              </button>
            </div>
          </form>
        )}

        {step === 'name' && (
          <form onSubmit={saveName} className="space-y-5">
            <div className="text-center">
              <h2 id="auth-title" className="text-xl font-bold text-slate-900">What should we call you?</h2>
              <p className="mt-1 text-sm text-slate-500">Your name will appear with your booking in the admin panel.</p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Full name
              <input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? <LoaderCircle size={16} className="animate-spin" /> : 'Save and continue'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-3 py-5 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
            <h2 id="auth-title" className="text-xl font-bold text-slate-900">Signed in successfully</h2>
            <p className="text-sm text-slate-500">Add or manage your vehicle from your profile.</p>
            <button type="button" onClick={onClose} className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">Continue to ParkNest</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
