import React, { useState, useEffect } from 'react';
import { BookingFormData } from '../types';
import { Send, CheckCircle2, MessageCircle, Calendar, Clock, User, Phone, BookOpen, AlertCircle, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface BookingFormProps {
  selectedCourse?: string;
  onOpenPortal?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onOpenPortal }) => {
  const { user, studentProfile, requireAuthForDemo } = useAuth();

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: studentProfile?.full_name || '',
    phoneNumber: studentProfile?.phone || '',
    preferredCourse: 'Free Demo Class',
    preferredDate: '',
    preferredTime: '10:00 AM - 11:00 AM',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill student details whenever studentProfile changes
  useEffect(() => {
    if (studentProfile) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || studentProfile.full_name || '',
        phoneNumber: prev.phoneNumber || studentProfile.phone || '',
      }));
    }
  }, [studentProfile]);

  const timeSlotOptions = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '02:00 PM - 03:00 PM',
    '05:00 PM - 06:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (formData.phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a preferred date.';
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select a time slot.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const proceedWithSubmission = async () => {
    // Open blank window synchronously in response to user click to prevent popup blocking
    const waWindow = window.open('about:blank', '_blank');

    // Insert Free Demo Class booking into database if user is logged in
    if (user) {
      try {
        const { error: insertErr } = await supabase.from('bookings').insert([
          {
            student_id: user.id,
            course_name: 'Free Demo Class',
            status: 'Demo Booked',
            preferred_date: formData.preferredDate || null,
            preferred_time: formData.preferredTime || null,
            message: formData.message.trim() || null,
          },
        ]);

        if (insertErr) {
          console.error('Failed to insert booking into database:', insertErr);
        }
      } catch (err) {
        console.error('Unexpected error inserting booking:', err);
      }
    }

    // Construct formatted WhatsApp message
    const waText = `*Free Demo Class Booking Request - Fast & Fluent English*\n\n` +
      `*Full Name:* ${formData.fullName.trim()}\n` +
      `*Phone:* ${formData.phoneNumber.trim()}\n` +
      `*Session:* Free Demo Class\n` +
      `*Preferred Date:* ${formData.preferredDate}\n` +
      `*Preferred Time:* ${formData.preferredTime}\n` +
      (formData.message.trim() ? `*Additional Message:* ${formData.message.trim()}\n` : '');

    const encodedText = encodeURIComponent(waText);
    const whatsappUrl = `https://wa.me/919607405256?text=${encodedText}`;

    if (waWindow) {
      waWindow.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank');
    }

    // Show success confirmation state
    setIsSubmitted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Free Demo Class requires authentication
    if (!user) {
      requireAuthForDemo(() => {
        proceedWithSubmission();
      });
      return;
    }

    proceedWithSubmission();
  };

  const handleReset = () => {
    setFormData({
      fullName: studentProfile?.full_name || '',
      phoneNumber: studentProfile?.phone || '',
      preferredCourse: 'Free Demo Class',
      preferredDate: '',
      preferredTime: '10:00 AM - 11:00 AM',
      message: ''
    });
    setErrors({});
    setIsSubmitted(false);
  };

  // Get tomorrow's date string formatted YYYY-MM-DD for min date attribute
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <section id="booking" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-blue-900/10 border-2 border-slate-100 relative overflow-hidden">
          
          {/* Subtle Yellow Ambient Accent */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-[#FACC15]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-100 text-[#1E40AF] font-extrabold text-xs uppercase tracking-wider mb-3 shadow-xs">
              <MessageCircle className="w-4 h-4 text-yellow-600" />
              <span>Book Free Demo Class</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E40AF] tracking-tight">
              Book Your Session with <span className="text-yellow-500">Sheetal Chauhan</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
              Fill in your details below to schedule your 1-on-1 Free Demo Class. You will be redirected directly to WhatsApp to confirm your preferred time slot with Coach Sheetal.
            </p>
          </div>

          {/* Success Confirmation Card */}
          {isSubmitted ? (
            <div className="bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl p-8 sm:p-10 text-center shadow-lg animate-fade-slide" id="booking-success-message">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1E40AF] mb-2">
                Demo Booking Request Sent!
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Thank you, <strong className="text-[#1E40AF]">{formData.fullName}</strong>! We've opened WhatsApp so you can send your demo booking details directly to Sheetal (+91 96074 05256).
              </p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-xs sm:text-sm space-y-1.5 mb-6 text-slate-700 max-w-md mx-auto shadow-xs">
                <div><strong className="text-[#1E40AF]">Session Type:</strong> Free Demo Class</div>
                <div><strong className="text-[#1E40AF]">Preferred Date:</strong> {formData.preferredDate}</div>
                <div><strong className="text-[#1E40AF]">Preferred Time:</strong> {formData.preferredTime}</div>
              </div>
              {user && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3.5 mb-6 text-xs sm:text-sm font-semibold max-w-md mx-auto flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5 text-[#1E40AF] shrink-0" />
                    <span>You're booked! You can view your demo session in <strong>My Portal</strong>.</span>
                  </div>
                  {onOpenPortal && (
                    <button
                      onClick={onOpenPortal}
                      className="px-3 py-1.5 bg-[#1E40AF] text-white rounded-lg text-xs font-bold hover:bg-blue-900 shrink-0 transition-colors shadow-xs"
                    >
                      View Portal
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-all"
              >
                Book Another Demo Session
              </button>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-yellow-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                        errors.fullName ? 'ring-2 ring-red-400 border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number (WhatsApp) <span className="text-yellow-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                        errors.phoneNumber ? 'ring-2 ring-red-400 border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Session Type (Non-editable Label) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Session Type
                  </label>
                  <div className="relative">
                    <BookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <div className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100/90 text-slate-800 text-sm font-extrabold border border-slate-200 flex items-center justify-between">
                      <span>Free Demo Class</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-200 text-[#1E40AF] text-xs font-extrabold uppercase tracking-wide">
                        100% Free
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label htmlFor="preferredDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Date <span className="text-yellow-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      min={tomorrowStr}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all ${
                        errors.preferredDate ? 'ring-2 ring-red-400 border-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors.preferredDate && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.preferredDate}
                    </p>
                  )}
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label htmlFor="preferredTime" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Time Slot <span className="text-yellow-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white appearance-none cursor-pointer transition-all"
                    >
                      {timeSlotOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Message (Optional) */}
                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Additional Message / Goals (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell Sheetal about your specific English goals, job interview prep, or hesitation areas..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:bg-white transition-all"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  id="submit-booking-button"
                  className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-black text-base sm:text-lg shadow-lg shadow-yellow-100 transition-all duration-200 transform hover:scale-[1.01] active:scale-100 focus:outline-none focus:ring-4 focus:ring-yellow-300 uppercase tracking-wide"
                >
                  <Send className="w-5 h-5" />
                  <span>CONFIRM VIA WHATSAPP</span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                  Direct connection to Sheetal Chauhan (+91 96074 05256) via official WhatsApp API.
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
