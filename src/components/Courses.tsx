import React from 'react';
import { COURSES } from '../data/content';
import { Course } from '../types';
import { Baby, BookOpen, TrendingUp, Zap, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CoursesProps {
  onBookCourse: (courseName: string) => void;
}

export const Courses: React.FC<CoursesProps> = ({ onBookCourse }) => {
  const getCourseIcon = (iconName: Course['iconName']) => {
    switch (iconName) {
      case 'Baby':
        return <Baby className="w-7 h-7 text-yellow-500" />;
      case 'BookOpen':
        return <BookOpen className="w-7 h-7 text-blue-800" />;
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-blue-800" />;
      case 'Zap':
        return <Zap className="w-7 h-7 text-yellow-500" />;
      default:
        return <BookOpen className="w-7 h-7 text-blue-800" />;
    }
  };

  return (
    <section id="courses" className="py-20 bg-slate-50/70 relative">
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
            Tailored Learning Paths
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 tracking-tight">
            Explore Our Specialized Courses
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Designed for learners at every stage of their English fluency journey. Select a course to book your free consultation.
          </p>
        </motion.div>

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {COURSES.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-7 shadow-md hover:shadow-xl border border-blue-100 flex flex-col justify-between transition-all duration-300"
            >
              <div>
                {/* Icon & Level Tag & Price */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                    {getCourseIcon(course.iconName)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-blue-900 bg-yellow-300 px-3 py-1 rounded-full">
                      {course.levelTag.split('|')[0]}
                    </span>
                    <span className="text-lg font-black text-[#1E40AF]">
                      ₹{course.price}
                    </span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-xl font-bold text-blue-950 mb-2">
                  {course.name}
                </h3>

                {/* Sub-tag */}
                <p className="text-xs font-semibold text-blue-700 mb-4 uppercase tracking-wider">
                  {course.levelTag}
                </p>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 mb-8 pt-4 border-t border-slate-100">
                  {course.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <Check className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => onBookCourse(course.name)}
                id={`book-course-${course.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 text-yellow-400" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
