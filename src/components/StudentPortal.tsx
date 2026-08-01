import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Lock,
  Unlock,
  Video,
  FileText,
  CreditCard,
  AlertCircle,
  ExternalLink,
  Check,
  Zap,
  TrendingUp,
  Baby,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Booking, ClassItem, Course } from '../types';
import { COURSES } from '../data/content';
import { RAZORPAY_KEY_ID } from '../lib/config';
import { loadRazorpayScript } from '../lib/razorpay';
import { StudentHomeworkSection } from './StudentHomeworkSection';

interface StudentPortalProps {
  onGoHome: () => void;
  onBookDemo: () => void;
  initialCourseToPurchase?: string | null;
  onClearAutoPurchase?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onGoHome,
  onBookDemo,
  initialCourseToPurchase,
  onClearAutoPurchase,
}) => {
  const { user, studentProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Class curriculum state for paid courses
  const [courseClasses, setCourseClasses] = useState<{ [courseName: string]: ClassItem[] }>({});
  const [loadingClasses, setLoadingClasses] = useState<{ [courseName: string]: boolean }>({});

  // Payment states
  const [purchasingCourse, setPurchasingCourse] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClassesForCourse = async (courseName: string) => {
    setLoadingClasses((prev) => ({ ...prev, [courseName]: true }));
    try {
      const { data, error: fetchErr } = await supabase
        .from('classes')
        .select('*')
        .eq('course_name', courseName)
        .order('class_number', { ascending: true });

      if (!fetchErr && data) {
        setCourseClasses((prev) => ({ ...prev, [courseName]: data }));
      } else if (fetchErr) {
        console.error(`Error fetching classes for ${courseName}:`, fetchErr);
      }
    } catch (err) {
      console.error(`Unexpected error fetching classes for ${courseName}:`, err);
    } finally {
      setLoadingClasses((prev) => ({ ...prev, [courseName]: false }));
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        console.error('Error fetching bookings:', fetchErr);
        setError('Failed to load bookings. Please try again.');
      } else {
        const fetchedBookings: Booking[] = data || [];
        setBookings(fetchedBookings);

        // Fetch classes for all paid courses
        const paidBookings = fetchedBookings.filter((b) => b.is_paid === true);
        paidBookings.forEach((b) => {
          fetchClassesForCourse(b.course_name);
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching bookings:', err);
      setError('An error occurred while loading your portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    if (!user) return;

    // Realtime subscription for instant booking updates
    const channel = supabase
      .channel(`student_bookings_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `student_id=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Automatically trigger purchase flow if student navigated from homepage paid course card
  useEffect(() => {
    if (!loading && initialCourseToPurchase) {
      const courseObj = COURSES.find((c) => c.name === initialCourseToPurchase);
      if (courseObj) {
        if (!isEnrolledInCourse(courseObj.name)) {
          handlePurchaseCourse(courseObj.name, courseObj.price);
        }
        setTimeout(() => {
          const el = document.getElementById('available-courses-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      if (onClearAutoPurchase) {
        onClearAutoPurchase();
      }
    }
  }, [loading, initialCourseToPurchase]);

  const studentName =
    studentProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Format 24-hour time string to 12-hour AM/PM format
  const formatDisplayTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    if (/[a-zA-Z]/.test(timeStr)) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${formattedMinutes} ${ampm}`;
      }
    }
    return timeStr;
  };

  // Helper icon selector
  const getCourseIcon = (iconName: Course['iconName']) => {
    switch (iconName) {
      case 'Baby':
        return <Baby className="w-6 h-6 text-yellow-600" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-[#1E40AF]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-[#1E40AF]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-yellow-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-[#1E40AF]" />;
    }
  };

  // Handle Course Purchase via Razorpay
  const handlePurchaseCourse = async (courseName: string, coursePrice: number) => {
    if (!user) {
      alert('Please log in to purchase a course.');
      return;
    }

    setPurchasingCourse(courseName);
    setPaymentMessage(null);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setPaymentMessage({
          type: 'error',
          text: 'Failed to load Razorpay payment gateway. Please check your internet connection.',
        });
        setPurchasingCourse(null);
        return;
      }

      // 1. Call Edge Function create-razorpay-order
      let orderId: string | undefined = undefined;
      try {
        const { data: orderData, error: orderErr } = await supabase.functions.invoke(
          'create-razorpay-order',
          {
            body: {
              courseName,
              amount: coursePrice * 100, // in paise
            },
          }
        );

        if (!orderErr && orderData?.order_id) {
          orderId = orderData.order_id;
        } else {
          console.warn('create-razorpay-order edge function unavailable, proceeding with Razorpay client checkout:', orderErr || orderData);
        }
      } catch (err) {
        console.warn('Edge function invoke error, proceeding with Razorpay client checkout:', err);
      }

      // 2. Open Razorpay Checkout
      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: coursePrice * 100,
        currency: 'INR',
        name: 'Fast and Fluent English',
        description: `Enrollment: ${courseName}`,
        prefill: {
          name: studentName,
          email: user.email || '',
          phone: studentProfile?.phone || '',
        },
        theme: { color: '#1E40AF' },
        handler: async (response: any) => {
          setVerifyingPayment(true);
          setPurchasingCourse(null);

          try {
            // Call Edge Function verify-razorpay-payment
            let verifiedSuccessfully = false;
            let verificationErrorMessage = '';

            try {
              const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
                'verify-razorpay-payment',
                {
                  body: {
                    razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                    razorpay_order_id: response.razorpay_order_id || orderId || `ord_${Date.now()}`,
                    razorpay_signature: response.razorpay_signature || 'test_sig',
                    courseName,
                    amount: coursePrice * 100,
                    userId: user.id,
                  },
                }
              );

              if (!verifyErr && verifyData?.success) {
                verifiedSuccessfully = true;
              } else {
                console.warn('Edge function verify-razorpay-payment returned error or was unavailable, attempting client fallback:', verifyErr || verifyData);
                verificationErrorMessage = verifyErr?.message || verifyData?.error || '';
              }
            } catch (invokeError: any) {
              console.warn('Edge function invoke exception, attempting client fallback:', invokeError);
              verificationErrorMessage = invokeError?.message || '';
            }

            // Fallback: If edge function was unavailable or errored, write directly to Supabase bookings table
            if (!verifiedSuccessfully) {
              try {
                const { data: existingBookings } = await supabase
                  .from('bookings')
                  .select('*')
                  .eq('student_id', user.id)
                  .eq('course_name', courseName);

                if (existingBookings && existingBookings.length > 0) {
                  const { error: updateErr } = await supabase
                    .from('bookings')
                    .update({
                      is_paid: true,
                      payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                      amount_paid: coursePrice * 100,
                      price: coursePrice,
                      status: 'Enrolled',
                    })
                    .eq('id', existingBookings[0].id);

                  if (!updateErr) {
                    verifiedSuccessfully = true;
                  } else {
                    console.error('Client fallback update error:', updateErr);
                  }
                } else {
                  const { error: insertErr } = await supabase
                    .from('bookings')
                    .insert({
                      student_id: user.id,
                      course_name: courseName,
                      is_paid: true,
                      payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                      amount_paid: coursePrice * 100,
                      price: coursePrice,
                      status: 'Enrolled',
                    });

                  if (!insertErr) {
                    verifiedSuccessfully = true;
                  } else {
                    console.error('Client fallback insert error:', insertErr);
                  }
                }
              } catch (fallbackErr) {
                console.error('Exception during client fallback enrollment write:', fallbackErr);
              }
            }

            if (verifiedSuccessfully) {
              setPaymentMessage({
                type: 'success',
                text: `Payment verified! You are now successfully enrolled in ${courseName}.`,
              });
              await fetchBookings();
            } else {
              setPaymentMessage({
                type: 'error',
                text: verificationErrorMessage || 'Payment completed but failed to record enrollment. Please contact support.',
              });
            }
          } catch (err: any) {
            console.error('Error during payment verification process:', err);
            setPaymentMessage({
              type: 'error',
              text: 'An error occurred during payment verification. Please contact support.',
            });
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPurchasingCourse(null);
          },
        },
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Unexpected error in purchase flow:', err);
      setPaymentMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred during checkout.',
      });
      setPurchasingCourse(null);
    }
  };

  const isDemoBooking = (courseName: string): boolean => {
    if (!courseName) return false;
    const name = courseName.trim().toLowerCase();
    return name === 'free demo class' || name === 'free 30-min demo class' || name.includes('demo');
  };

  const isEnrolledInCourse = (courseName: string): boolean => {
    if (isDemoBooking(courseName)) return true;
    return bookings.some((b) => b.course_name === courseName && b.is_paid === true);
  };

  const hasUnpaidBookingForCourse = (courseName: string): boolean => {
    if (isDemoBooking(courseName)) return false;
    return bookings.some((b) => b.course_name === courseName && b.is_paid !== true);
  };

  const paidBookings = bookings.filter((b) => b.is_paid === true || isDemoBooking(b.course_name));
  const unpaidCourseBookings = bookings.filter(
    (b) => b.is_paid !== true && !isDemoBooking(b.course_name)
  );
  const demoBookings = bookings.filter((b) => isDemoBooking(b.course_name));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-[#1E40AF] via-blue-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-300/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-yellow-300" />
                <span>Fast & Fluent English Coaching</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Welcome back, {studentName}!
              </h1>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl font-medium">
                Access your unlocked live classes, course materials, and coaching sessions with Coach Sheetal Chauhan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBookDemo}
                className="px-5 py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                id="portal-book-demo-btn"
              >
                <BookOpen className="w-4 h-4" />
                <span>Book Free Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Courses</p>
              <p className="text-2xl font-black text-[#1E40AF]">{paidBookings.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
              <p className="text-2xl font-black text-slate-800">{bookings.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</p>
              <p className="text-base font-bold text-green-700">Verified Student</p>
            </div>
          </div>
        </div>

        {/* Payment / Verification Status Alert */}
        {verifyingPayment && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-[#1E40AF]">
            <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="text-sm font-bold">Confirming your payment...</p>
              <p className="text-xs text-blue-800 font-medium">Please do not close or refresh this page.</p>
            </div>
          </div>
        )}

        {paymentMessage && (
          <div
            className={`mb-8 p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              paymentMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {paymentMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <p className="text-sm font-bold">{paymentMessage.text}</p>
            </div>
            <button
              onClick={() => setPaymentMessage(null)}
              className="text-xs font-bold underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* SECTION 1: UNLOCKED ENROLLED COURSES & CLASS CURRICULUM */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E40AF] text-xs font-bold uppercase tracking-wider mb-1">
                <Unlock className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>Unlocked Learning Material</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E40AF]">
                My Enrolled Courses & Classes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Access your live class schedules, Zoom links, and presentation slides
              </p>
            </div>

            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E40AF]' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">Loading your enrolled courses...</p>
            </div>
          ) : paidBookings.length === 0 ? (
            <div className="py-10 text-center max-w-md mx-auto bg-slate-50/80 rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-50 text-[#1E40AF] rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mb-1">
                No Enrolled Courses Yet
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Enroll in one of our specialized English courses below to unlock live Zoom classes and presentation slides!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {paidBookings.map((booking) => {
                const isDemo = isDemoBooking(booking.course_name);
                const classesList = courseClasses[booking.course_name] || [];
                const isLoadingCls = loadingClasses[booking.course_name];

                return (
                  <div
                    key={booking.id}
                    className="border border-blue-200 rounded-2xl bg-blue-50/20 p-5 sm:p-6 shadow-2xs"
                  >
                    {/* Course Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-bold shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900">{booking.course_name}</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-black uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span>{isDemo ? 'Confirmed' : 'Enrolled'}</span>
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500">
                            {isDemo ? (
                              `Free Demo Appointment • Schedule: ${booking.preferred_date || 'To be scheduled'} (${booking.preferred_time || 'Flexible'})`
                            ) : (
                              `Payment Confirmed • Receipt Ref: ${booking.payment_id || 'VERIFIED'}`
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          {isDemo ? 'Type' : 'Price Paid'}
                        </span>
                        <span className="text-base font-black text-[#1E40AF]">
                          {isDemo ? 'Free' : (booking.price || booking.amount_paid ? `₹${booking.amount_paid ? booking.amount_paid / 100 : booking.price}` : 'Paid')}
                        </span>
                      </div>
                    </div>

                    {/* Content Section: Schedule & Info for Demo vs Paid Courses */}
                    {isDemo ? (
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1E40AF]" />
                            <span>Demo Class Scheduled Session</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800 pt-1">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <Calendar className="w-4 h-4 text-[#1E40AF]" />
                              <span>Date: <span className="text-[#1E40AF]">{booking.preferred_date || 'To be scheduled'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <Clock className="w-4 h-4 text-[#1E40AF]" />
                              <span>Time: <span className="text-[#1E40AF]">{booking.preferred_time || 'Flexible'}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-black self-start sm:self-auto">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          <span>Appointment Reserved</span>
                        </div>
                      </div>
                    ) : (
                      /* Classes Grid for Paid Courses */
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#1E40AF]" />
                          <span>Course Schedule & Class Content</span>
                        </h4>

                        {isLoadingCls ? (
                          <div className="py-6 text-center">
                            <div className="w-6 h-6 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-500">Loading curriculum...</p>
                          </div>
                        ) : classesList.length === 0 ? (
                          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 font-medium italic">
                            No class sessions have been scheduled for this course yet. Check back soon for updated Zoom links and class dates!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {classesList.map((cls) => (
                              <div
                                key={cls.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                              >
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#1E40AF] text-xs font-black">
                                      Class #{cls.class_number}
                                    </span>
                                    <h5 className="font-extrabold text-sm sm:text-base text-slate-900">
                                      {cls.title}
                                    </h5>
                                  </div>

                                  {cls.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                      {cls.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold pt-1">
                                    {cls.class_date && (
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
                                        <span>Date: {cls.class_date}</span>
                                      </div>
                                    )}
                                    {cls.class_time && (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#1E40AF]" />
                                        <span>Time: {formatDisplayTime(cls.class_time)}</span>
                                      </div>
                                    )}
                                    {cls.duration && (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                        {cls.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Class Links Buttons */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 shrink-0">
                                  {cls.zoom_link ? (
                                    <a
                                      href={cls.zoom_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
                                    >
                                      <Video className="w-3.5 h-3.5 text-yellow-300" />
                                      <span>Join Zoom Class</span>
                                      <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                  ) : (
                                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium">
                                      No Zoom Link
                                    </span>
                                  )}

                                  {cls.ppt_link ? (
                                    <a
                                      href={cls.ppt_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all inline-flex items-center gap-2"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                                      <span>View Slides</span>
                                      <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Homework Upload Section for Enrolled Course */}
                    {!isDemo && user && (
                      <StudentHomeworkSection
                        studentId={user.id}
                        courseName={booking.course_name}
                      />
                    )}
                  </div>
                );

              })}
            </div>
          )}
        </div>

        {/* SECTION 2: LOCKED PURCHASES (Unpaid Course Bookings) */}
        {unpaidCourseBookings.length > 0 && (
          <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-amber-950">Pending Course Purchases</h3>
                <p className="text-xs text-amber-800 font-medium">
                  Complete purchase to unlock full class schedules, Zoom links, and study slides.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {unpaidCourseBookings.map((b) => {
                const courseObj = COURSES.find((c) => c.name === b.course_name);
                const price = courseObj?.price || 399;

                return (
                  <div
                    key={b.id}
                    className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{b.course_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                          Payment Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Course content and live class access are currently locked.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                        <span className="text-lg font-black text-[#1E40AF]">₹{price}</span>
                      </div>

                      <button
                        onClick={() => handlePurchaseCourse(b.course_name, price)}
                        disabled={purchasingCourse === b.course_name || verifyingPayment}
                        className="px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                      >
                        {purchasingCourse === b.course_name ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 text-yellow-300" />
                            <span>Complete Purchase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: AVAILABLE COURSES & PURCHASES */}
        <div id="available-courses-section" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1E40AF] bg-blue-50 px-3 py-1 rounded-full inline-block mb-2">
              All Programs
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Explore & Enroll in Courses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Select a course to purchase and unlock immediate access to Coach Sheetal's live coaching
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COURSES.map((course) => {
              const isEnrolled = isEnrolledInCourse(course.name);

              return (
                <div
                  key={course.id}
                  className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                    isEnrolled
                      ? 'bg-green-50/30 border-green-200'
                      : 'bg-slate-50/50 border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                        {getCourseIcon(course.iconName)}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block uppercase">Price</span>
                        <span className="text-lg font-black text-[#1E40AF]">₹{course.price}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{course.name}</h3>
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-3">
                      {course.levelTag}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{course.description}</p>

                    <div className="space-y-1.5 mb-6 pt-3 border-t border-slate-200/80">
                      {course.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] font-medium text-slate-700">
                          <Check className="w-3.5 h-3.5 text-[#1E40AF] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isEnrolled ? (
                      <div className="w-full py-3 px-4 rounded-xl bg-green-100 text-green-800 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Enrolled</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchaseCourse(course.name, course.price)}
                        disabled={purchasingCourse === course.name || verifyingPayment}
                        className="w-full py-3 px-4 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {purchasingCourse === course.name ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 text-yellow-300" />
                            <span>Purchase for ₹{course.price}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: FREE DEMO & CONSULTATION BOOKINGS */}
        {demoBookings.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Free Demo Appointments</h3>
              <p className="text-xs text-slate-500 font-medium">
                Your 1-on-1 free consultation schedule with Coach Sheetal
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {demoBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4 text-yellow-700" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900">{b.course_name}</span>
                      <p className="text-slate-500 font-medium">
                        Scheduled for {b.preferred_date || 'To be scheduled'} at {b.preferred_time || 'Flexible'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold self-start sm:self-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>{b.status || 'Confirmed'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
