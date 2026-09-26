import React, { useState } from 'react';
import { COURSES } from '../data/content';
import { Course } from '../types';
import { Baby, BookOpen, TrendingUp, Zap, ArrowRight, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface CoursesProps {
  onBookCourse: (courseName: string) => void;
}

interface SyllabusClass {
  id: string;
  class_number: number;
  title: string;
  description?: string;
}

export const Courses: React.FC<CoursesProps> = ({ onBookCourse }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<SyllabusClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenSyllabus = async (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    setLoading(true);
    setError(null);
    setClasses([]);

    try {
      const { data, error: fetchErr } = await supabase
        .from('classes')
        .select('id, class_number, title, description')
        .eq('course_name', course.name)
        .order('class_number', { ascending: true });

      if (fetchErr) {
        console.error('Error fetching syllabus:', fetchErr);
        setError('Failed to load syllabus. Please try again.');
      } else {
        setClasses(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching syllabus:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSyllabus = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setClasses([]);
    setError(null);
  };
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

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Book Now Button */}
                <button
                  onClick={() => onBookCourse(course.name)}
                  id={`book-course-${course.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </button>

                {/* View Syllabus Button */}
                <button
                  type="button"
                  onClick={() => handleOpenSyllabus(course)}
                  id={`view-syllabus-${course.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-blue-800 text-blue-800 hover:bg-blue-50/70 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-800" />
                  <span>View Syllabus</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Syllabus Modal */}
      {isModalOpen && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseSyllabus}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="syllabus-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseSyllabus}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full inline-block mb-2 border border-blue-200">
                Course Syllabus
              </span>
              <h3 id="syllabus-modal-title" className="text-2xl font-extrabold text-[#1E40AF]">
                {selectedCourse.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {selectedCourse.levelTag} • Full Curriculum
              </p>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 pr-1 -mr-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-600">Loading syllabus...</p>
                </div>
              ) : error ? (
                <div className="py-8 px-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                  <button
                    onClick={() => handleOpenSyllabus(selectedCourse)}
                    className="mt-3 text-xs font-bold text-blue-800 hover:underline inline-flex items-center gap-1"
                  >
                    Retry loading
                  </button>
                </div>
              ) : classes.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-700 mb-1">
                    Syllabus coming soon — check back shortly!
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    The class syllabus for {selectedCourse.name} is currently being prepared. Check back shortly!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-100 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-bold text-sm flex items-center justify-center shadow-xs">
                          {cls.class_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-blue-950 text-base leading-snug">
                            {cls.title}
                          </h4>
                          {cls.description && (
                            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                              {cls.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseSyllabus}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const courseName = selectedCourse.name;
                  handleCloseSyllabus();
                  onBookCourse(courseName);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-xs hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Book This Course</span>
                <ArrowRight className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
