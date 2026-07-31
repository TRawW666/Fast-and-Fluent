import React, { useState } from 'react';
import { FAQS } from '../data/content';
import { useInView } from '../hooks/useInView';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [ref, isInView] = useInView({ threshold: 0.15 });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50/70 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-800 bg-blue-100/80 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-blue-200">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Everything you need to know about our online coaching process, demo classes, and class schedules.
          </p>
        </div>

        {/* Accordion Container */}
        <div
          ref={ref}
          className={`space-y-4 transition-all duration-700 transform ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-blue-100 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  id={`faq-toggle-${item.id}`}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none focus:bg-blue-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <HelpCircle className="w-5 h-5 text-blue-800 shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-blue-950">
                      {item.question}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-blue-800 text-yellow-400' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/60 mt-1">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
