import React from 'react';
import { ArrowRight, Sparkles, Clock, CalendarCheck2, ShieldCheck } from 'lucide-react';

interface DemoBannerProps {
  onBookClick: (courseName?: string) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onBookClick }) => {
  return (
    <section className="py-12 bg-blue-900 text-white relative overflow-hidden">
      {/* Yellow Decorative Accents */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 rounded-3xl p-8 sm:p-12 border-2 border-yellow-400/40 shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400 text-blue-950 font-extrabold text-xs uppercase tracking-wider mb-4 shadow-sm">
                <Sparkles className="w-4 h-4 fill-blue-950" />
                <span>100% Free Live Session</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                Experience 1-on-1 English Coaching with a <span className="text-yellow-400">Free 30-Minute Demo</span>
              </h2>

              <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
                Get an instant diagnosis of your speaking hesitation, mother-tongue influence, and vocabulary range. Experience Sheetal Chauhan's interactive teaching style before making any commitment.
              </p>

              {/* Feature Points */}
              <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-yellow-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>30-Minute Live 1-on-1</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-yellow-400" />
                  <span>Personalized Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span>No Payment / No Strings Attached</span>
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={() => onBookClick('Free Demo Class')}
                id="demo-banner-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-extrabold text-base shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
              >
                <span>Claim Free Demo Slot</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
