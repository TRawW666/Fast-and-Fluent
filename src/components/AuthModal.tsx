import React, { useState } from 'react';
import { X, Mail, Lock, Phone, User, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
}) => {
  const { pendingDemoBooking, handleAuthSuccess } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleToggleMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const parseErrorMessage = (error: any): string => {
    const message = error?.message || '';
    if (message.includes('User already registered') || message.includes('already exists')) {
      return 'That email is already registered. Please sign in instead.';
    }
    if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('Unable to validate email address') || message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    return message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validation
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setErrorMessage('Please enter your email address.');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMessage('Please enter your phone number.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        // Supabase Auth Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (error) {
          setErrorMessage(parseErrorMessage(error));
          setLoading(false);
          return;
        }

        if (data.user) {
          // Insert into students table
          const { error: dbError } = await supabase.from('students').insert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          });

          if (dbError && dbError.code !== '23505') {
            console.error('Students DB insert note:', dbError);
          }

          setSuccessMessage('Account created successfully!');
          setTimeout(() => {
            resetForm();
            if (onSuccess) onSuccess();
            handleAuthSuccess();
          }, 600);
        }
      } else {
        // Sign In
        if (!email.trim() || !password) {
          setErrorMessage('Please enter both email and password.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setErrorMessage(parseErrorMessage(error));
          setLoading(false);
          return;
        }

        if (data.user) {
          setSuccessMessage('Signed in successfully!');
          setTimeout(() => {
            resetForm();
            if (onSuccess) onSuccess();
            handleAuthSuccess();
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Demo Booking Banner Notice if triggered by Free Demo */}
        {pendingDemoBooking && (
          <div className="mb-6 p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#FACC15] shrink-0 fill-[#FACC15]" />
            <p className="text-xs sm:text-sm font-semibold text-[#1E40AF]">
              Please sign up or log in to lock in your <strong>Free 30-Min Demo Class</strong>!
            </p>
          </div>
        )}

        {/* Header Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-[#1E40AF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#1E40AF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-extrabold text-[#1E40AF]">
            {mode === 'signup' ? 'Join Fast & Fluent English' : 'Welcome Back'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {mode === 'signup'
              ? 'Create a student account to book free demo sessions and track courses.'
              : 'Sign in to access your coaching details and demo bookings.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-yellow-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-yellow-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Phone field (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (WhatsApp) <span className="text-yellow-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-yellow-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 mt-2 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 font-medium">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('signin')}
                  className="font-bold text-[#1E40AF] hover:underline"
                >
                  Sign In here
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('signup')}
                  className="font-bold text-[#1E40AF] hover:underline"
                >
                  Create one now
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
