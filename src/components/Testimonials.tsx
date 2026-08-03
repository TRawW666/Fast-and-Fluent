import React from 'react';
import { TESTIMONIALS } from '../data/content';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-800 bg-blue-100/80 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-blue-200">
            Real Transformations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
            What Our Students Say
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Read how Sheetal Chauhan's personalized coaching helped working professionals and students gain English speaking confidence.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Quote Icon & Rating */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex text-yellow-400 gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-200" />
                </div>

                {/* Comment Text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-8">
                  "{t.comment}"
                </p>
              </div>

              {/* Student Profile Footer */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-800 text-yellow-400 font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                  {t.avatarText}
                </div>
                <div>
                  <h3 className="font-bold text-blue-950 text-base">{t.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                  <span className="inline-block text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mt-1">
                    {t.course}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
