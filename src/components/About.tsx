import React from 'react';
import { INSTRUCTOR_INFO } from '../data/content';
import { useInView } from '../hooks/useInView';
import { Award, BookOpen, CheckCircle, Sparkles, UserCheck, Star } from 'lucide-react';

export const About: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section id="about" className="pt-28 pb-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-700 transform ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-blue-100">
              Meet Your Lead Coach
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
              Learn Directly from <span className="text-blue-800">Sheetal Chauhan</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Dedicated to helping learners speak English naturally, break communication barriers, and accelerate their career growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Avatar & Credentials Profile Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                
                {/* Decorative Backdrops */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 to-blue-600 rounded-3xl transform rotate-3 scale-105 opacity-10" />
                
                {/* Main Profile Frame */}
                <div className="relative bg-white border border-blue-100 shadow-xl rounded-3xl p-8 text-center flex flex-col items-center">
                  
                  {/* Circular Avatar Placeholder */}
                  <div className="relative mb-6">
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 flex items-center justify-center text-yellow-400 font-extrabold text-4xl shadow-lg ring-4 ring-yellow-400 ring-offset-4 ring-offset-white">
                      <span>SC</span>
                    </div>
                    {/* Certified Badge Overlay */}
                    <div className="absolute bottom-0 right-0 bg-yellow-400 text-blue-950 p-2 rounded-full shadow-md border-2 border-white">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Name & Title */}
                  <h3 className="text-2xl font-bold text-blue-950 mb-1">{INSTRUCTOR_INFO.name}</h3>
                  <p className="text-sm font-bold text-blue-800 mb-3">{INSTRUCTOR_INFO.role}</p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-blue-950 rounded-full text-xs font-semibold mb-6">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-600" />
                    <span>Certified English Language Trainer</span>
                  </div>



                </div>

              </div>
            </div>

            {/* Right Column: Detailed Bio & Teaching Philosophy */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-extrabold text-blue-950 tracking-wide uppercase">
                  Proven Coaching Methodology
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mb-6 leading-tight">
                "Fluency isn't about memorizing rules—it's about building the courage to express yourself freely."
              </h3>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
                {INSTRUCTOR_INFO.bio}
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Whether you are a professional struggling with English presentation anxiety, an adult learner overcoming mother-tongue influence, or a parent looking for structured English guidance for your child, Sheetal provides tailored, practical solutions that yield quick, visible results.
              </p>

              {/* Highlights Checklist */}
              <div className="space-y-3.5 bg-blue-50/60 p-6 rounded-2xl border border-blue-100 mb-8">
                <h4 className="font-bold text-blue-950 text-base mb-3">Key Highlights of Sheetal's Coaching:</h4>
                {INSTRUCTOR_INFO.highlights.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-slate-800 font-medium">{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <UserCheck className="w-4 h-4 text-yellow-500" /> 1-on-1 Mentorship
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-blue-900">
                  <BookOpen className="w-4 h-4 text-yellow-500" /> Practical Worksheets
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
