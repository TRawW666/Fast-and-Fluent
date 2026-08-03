import React from 'react';
import { FEATURES } from '../data/content';
import { Feature } from '../types';
import { Users, Mic, Compass, Clock, BookMarked, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

export const WhyUs: React.FC = () => {
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
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-blue-100">
            Why Fast & Fluent
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
            Why Students & Professionals Choose Us
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Unlike static pre-recorded courses, we focus on real-time interactive speaking practice that transforms your confidence from day one.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-blue-100/80 shadow-xs hover:shadow-xl transition-all duration-300"
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
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
