import React from 'react';
import { FEATURES } from '../data/content';
import { Feature } from '../types';
import { useInView } from '../hooks/useInView';
import { Users, Mic, Compass, Clock, BookMarked, HeartHandshake } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  const getFeatureIcon = (iconName: Feature['iconName']) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-7 h-7 text-blue-800" />;
      case 'Mic':
        return <Mic className="w-7 h-7 text-yellow-500" />;
      case 'Compass':
        return <Compass className="w-7 h-7 text-blue-800" />;
      case 'Clock':
        return <Clock className="w-7 h-7 text-yellow-500" />;
      case 'BookMarked':
        return <BookMarked className="w-7 h-7 text-blue-800" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-7 h-7 text-yellow-500" />;
      default:
        return <Users className="w-7 h-7 text-blue-800" />;
    }
  };

  return (
    <section id="why-us" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-blue-100">
            Why Fast & Fluent
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
            Why Students & Professionals Choose Us
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Unlike static pre-recorded courses, we focus on real-time interactive speaking practice that transforms your confidence from day one.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className={`bg-white rounded-3xl p-8 border border-blue-100/80 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-6 shadow-xs">
                {getFeatureIcon(feature.iconName)}
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
