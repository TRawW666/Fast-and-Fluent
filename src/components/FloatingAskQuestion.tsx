import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle, User, Phone, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface FloatingAskQuestionProps {
  currentView?: 'home' | 'portal' | 'admin';
}

export const FloatingAskQuestion: React.FC<FloatingAskQuestionProps> = ({ currentView }) => {
  const { user, studentProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [question, setQuestion] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; question?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill user details when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      if (studentProfile) {
        if (!fullName) setFullName(studentProfile.full_name || '');
        if (!phone) setPhone(studentProfile.phone || '');
      } else if (user) {
        if (!fullName) setFullName(user.user_metadata?.full_name || '');
      }
    }
  }, [isOpen, studentProfile, user]);

  // Hide button on Admin Panel
  if (currentView === 'admin') {
    return null;
  }

  const validate = (): boolean => {
    const errs: { fullName?: string; phone?: string; question?: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }

    const cleanPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d+$/.test(cleanPhone)) {
      errs.phone = 'Phone number must contain digits only.';
    }

    if (!question.trim()) {
      errs.question = 'Please enter your question.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Insert row into questions table
      const { error } = await supabase.from('questions').insert([
        {
          student_id: user?.id || null,
          full_name: fullName.trim(),
          phone: phone.trim(),
          question: question.trim(),
        },
      ]);

      if (error) {
        console.error('Error inserting question into database:', error);
        setErrorMsg('Could not save your question. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Redirect to WhatsApp
      const waMessage = `Hi, I have a question: ${question.trim()} - ${fullName.trim()}, ${phone.trim()}`;
      const whatsappUrl = `https://wa.me/919607405256?text=${encodeURIComponent(waMessage)}`;
      window.open(whatsappUrl, '_blank');

      setIsSubmitted(true);
      setIsSubmitting(false);

      // Automatically close modal after brief delay
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error('Unexpected error submitting question:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setErrorMsg(null);
    setFieldErrors({});
    setQuestion('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask a Question"
          className="relative group flex items-center gap-2.5 px-4 py-3.5 sm:px-5 sm:py-4 rounded-full bg-[#FACC15] hover:bg-yellow-400 text-[#1E40AF] font-black shadow-2xl shadow-yellow-500/30 border-2 border-white transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          <span className="absolute -inset-1 rounded-full bg-yellow-400/40 animate-ping opacity-30 group-hover:opacity-60 pointer-events-none" />
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[#1E40AF]" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E40AF]">
            Ask a Question
          </span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative transition-all animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#1E40AF] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-400/20 text-yellow-300">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                    Ask Sheetal a Question
                  </h3>
                  <p className="text-xs text-blue-200 font-medium">
                    We'll answer you directly on WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-[#1E40AF]">
                    Question Sent!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                    Thanks! We've received your question and opened WhatsApp for you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label htmlFor="modalFullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-yellow-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="modalFullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                          fieldErrors.fullName ? 'ring-2 ring-red-400 border-red-400' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="modalPhone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-yellow-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        id="modalPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                          fieldErrors.phone ? 'ring-2 ring-red-400 border-red-400' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Question Textarea */}
                  <div>
                    <label htmlFor="modalQuestion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Question <span className="text-yellow-500">*</span>
                    </label>
                    <textarea
                      id="modalQuestion"
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question here..."
                      className={`w-full p-3 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                        fieldErrors.question ? 'ring-2 ring-red-400 border-red-400' : ''
                      }`}
                    />
                    {fieldErrors.question && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.question}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-black text-sm shadow-md shadow-yellow-100 transition-all uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
