import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Mascot } from 'page-mascot';

interface HeroProps {
  onBookClick: (courseName?: string) => void;
  onViewCoursesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onViewCoursesClick }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white"
    >
      {/* Background Decorative Circles */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.5, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-100 mb-6 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase">
              Expert 1-on-1 & Small Group Coaching
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E40AF] tracking-tight leading-[1.1] mb-6"
          >
            Speak English with <span className="text-yellow-500 underline decoration-[#FACC15] decoration-4 underline-offset-8">Absolute</span> Confidence.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-8 max-w-2xl mx-auto"
          >
            Tailored coaching by <span className="font-bold text-[#1E40AF]">Sheetal Chauhan</span> to help you master fluency, grammar, and pronunciation in record time.
          </motion.p>

          {/* Feature Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-2xl mb-8"
          >
            {[
              'Zero-Fear Speaking Practice',
              'Personalized Accent & Grammar',
              '100% Practical Conversational Drills'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1E40AF] shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* Animated Mascot Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            className="hidden sm:flex justify-center mb-6"
          >
            <Mascot
              directions="/mascots/glasses-directions.webp"
              reactions="/mascots/glasses-reactions.webp"
              size={140}
              label="Fast and Fluent mascot"
            />
          </motion.div>

          {/* Primary & Secondary Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-3 w-full"
          >
            <button
              onClick={() => onBookClick('Free Demo Class')}
              id="hero-primary-cta"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-bold text-lg shadow-lg shadow-yellow-100 hover:scale-[1.02] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300 cursor-pointer"
            >
              <span>Book Free Demo Class</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onViewCoursesClick}
              id="hero-secondary-cta"
              className="group inline-flex items-center justify-center gap-1.5 text-sm sm:text-base font-bold text-[#1E40AF] hover:text-blue-800 hover:underline underline-offset-4 transition-all cursor-pointer"
            >
              <span>View Courses</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
