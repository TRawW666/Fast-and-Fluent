import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  X,
  Layers,
  Link,
  Send,
  FileCheck,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Student, Booking, ClassItem, HomeworkSubmission } from '../types';

interface AdminPanelProps {
  onGoHome: () => void;
}

const COURSES = [
  'English for Kids',
  'Beginner Course',
  'Intermediate Course',
  'Power Vocabulary Course',
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onGoHome }) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'curriculum' | 'homework'>('students');

  // Students & Bookings State
  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Message State
  const [messagingStudent, setMessagingStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState<string>('');

  // Homework Submissions State
  const [allHomework, setAllHomework] = useState<HomeworkSubmission[]>([]);
  const [loadingHomework, setLoadingHomework] = useState<boolean>(false);
  const [homeworkSearchQuery, setHomeworkSearchQuery] = useState<string>('');
  const [homeworkCourseFilter, setHomeworkCourseFilter] = useState<string>('All');

  // Curriculum State
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSES[0]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Modal State for Add/Edit Class
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal State for Delete Confirmation
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form Fields
  const [formClassNumber, setFormClassNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formZoomLink, setFormZoomLink] = useState<string>('');
  const [formPptLink, setFormPptLink] = useState<string>('');
  const [formClassDate, setFormClassDate] = useState<string>('');
  const [formClassTime, setFormClassTime] = useState<string>('10:00');
  const [formDuration, setFormDuration] = useState<string>('60 mins');

  // Time conversion helpers
  const to24HourTime = (timeStr?: string): string => {
    if (!timeStr) return '10:00';
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [h, m] = timeStr.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return '10:00';
  };

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

  // Fetch Students & Bookings
  const fetchStudentsAndBookings = async () => {
    setLoadingStudents(true);
    setStudentsError(null);

    try {
      const { data: studentsData, error: studentsErr } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsErr) {
        console.error('Error fetching students:', studentsErr);
        setStudentsError('Failed to fetch student records.');
      } else {
        setStudents(studentsData || []);
      }

      const { data: bookingsData, error: bookingsErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsErr) {
        console.error('Error fetching bookings:', bookingsErr);
      } else {
        setBookings(bookingsData || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching admin data:', err);
      setStudentsError('An error occurred while loading admin data.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch Classes for Selected Course
  const fetchClasses = async (courseName: string) => {
    setLoadingClasses(true);
    setClassesError(null);

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('course_name', courseName)
        .order('class_number', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        setClassesError('Failed to load curriculum classes.');
      } else {
        setClassesList(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching classes:', err);
      setClassesError('An error occurred while loading classes.');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch Homework Submissions Across All Students
  const fetchHomeworkSubmissions = async () => {
    setLoadingHomework(true);
    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching homework submissions:', error);
      } else {
        setAllHomework(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading homework submissions:', err);
    } finally {
      setLoadingHomework(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndBookings();
    fetchClasses(selectedCourse);
    fetchHomeworkSubmissions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin_panel_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchStudentsAndBookings()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => fetchStudentsAndBookings()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        () => fetchClasses(selectedCourse)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homework_submissions' },
        () => fetchHomeworkSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Quick Message Handler
  const handleOpenMessageModal = (student: Student) => {
    setMessagingStudent(student);
    setMessageText(`Hi ${student.full_name || 'Student'}, `);
  };

  const handleApplyMessageTemplate = (templateType: 'zoom' | 'time' | 'homework') => {
    if (!messagingStudent) return;
    const studentName = messagingStudent.full_name || 'Student';
    switch (templateType) {
      case 'zoom':
        setMessageText(
          `Hi ${studentName}, your Zoom session link has been updated in your Student Portal. Please log in to view your class link!`
        );
        break;
      case 'time':
        setMessageText(
          `Hi ${studentName}, please note that your upcoming class timing has been updated. Check your Student Portal for the new schedule.`
        );
        break;
      case 'homework':
        setMessageText(
          `Hi ${studentName}, a quick reminder to upload your homework assignment in your Student Portal before our next session!`
        );
        break;
    }
  };

  const handleSendQuickMessage = (channel: 'email' | 'whatsapp' | 'both') => {
    if (!messagingStudent) return;

    // NOTE: The admin still manually taps "send" in each application (Email client or WhatsApp Web/app).
    // This dialog acts as a convenience shortcut to pre-fill both communication channels simultaneously.

    const text = messageText.trim();
    if (!text) return;

    const email = messagingStudent.email;
    const rawPhone = messagingStudent.phone ? messagingStudent.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    if (channel === 'email' || channel === 'both') {
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent('Update from English Language Coach')}&body=${encodeURIComponent(text)}`;
      window.open(mailtoUrl, '_blank');
    }

    if (channel === 'whatsapp' || channel === 'both') {
      if (cleanPhone) {
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
      } else {
        alert('Student does not have a valid phone number recorded for WhatsApp.');
      }
    }

    setMessagingStudent(null);
    setMessageText('');
  };

  const handleAdminOpenHomework = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('homework')
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        console.error('Error generating signed URL:', error);
        alert('Failed to generate secure link for file preview.');
        return;
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Unexpected error viewing homework file:', err);
      alert('An error occurred while opening the file.');
    }
  };


  useEffect(() => {
    fetchClasses(selectedCourse);
  }, [selectedCourse]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingClass(null);
    // Auto-suggest next class number
    const nextNumber = classesList.length > 0
      ? Math.max(...classesList.map((c) => c.class_number || 0)) + 1
      : 1;
    setFormClassNumber(nextNumber);
    setFormTitle('');
    setFormDescription('');
    setFormZoomLink('');
    setFormPptLink('');
    setFormClassDate('');
    setFormClassTime('10:00');
    setFormDuration('60 mins');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormClassNumber(cls.class_number);
    setFormTitle(cls.title || '');
    setFormDescription(cls.description || '');
    setFormZoomLink(cls.zoom_link || '');
    setFormPptLink(cls.ppt_link || '');
    setFormClassDate(cls.class_date || '');
    setFormClassTime(to24HourTime(cls.class_time));
    setFormDuration(cls.duration || '60 mins');
    setIsModalOpen(true);
  };

  // Handle Save Class (Insert or Update)
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSaving(true);
    try {
      if (editingClass) {
        // Update
        const { error } = await supabase
          .from('classes')
          .update({
            course_name: selectedCourse,
            class_number: Number(formClassNumber),
            title: formTitle.trim(),
            description: formDescription.trim() || null,
            zoom_link: formZoomLink.trim() || null,
            ppt_link: formPptLink.trim() || null,
            class_date: formClassDate || null,
            class_time: formClassTime.trim() || null,
            duration: formDuration.trim() || null,
          })
          .eq('id', editingClass.id);

        if (error) {
          console.error('Error updating class:', error);
          alert('Failed to update class: ' + error.message);
        } else {
          setIsModalOpen(false);
          fetchClasses(selectedCourse);
        }
      } else {
        // Insert
        const { error } = await supabase.from('classes').insert([
          {
            course_name: selectedCourse,
            class_number: Number(formClassNumber),
            title: formTitle.trim(),
            description: formDescription.trim() || null,
            zoom_link: formZoomLink.trim() || null,
            ppt_link: formPptLink.trim() || null,
            class_date: formClassDate || null,
            class_time: formClassTime.trim() || null,
            duration: formDuration.trim() || null,
          },
        ]);

        if (error) {
          console.error('Error adding class:', error);
          alert('Failed to add class: ' + error.message);
        } else {
          setIsModalOpen(false);
          fetchClasses(selectedCourse);
        }
      }
    } catch (err) {
      console.error('Unexpected error saving class:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Class Prompt
  const handlePromptDeleteClass = (cls: ClassItem) => {
    setClassToDelete(cls);
    setDeleteError(null);
    setIsDeleting(false);
  };

  // Handle Confirm Delete Class
  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { error } = await supabase.from('classes').delete().eq('id', classToDelete.id);
      if (error) {
        console.error('Error deleting class:', error);
        setDeleteError(error.message || 'Failed to delete class.');
        setIsDeleting(false);
      } else {
        setClassesList((prev) => prev.filter((c) => c.id !== classToDelete.id));
        await fetchClasses(selectedCourse);
        setClassToDelete(null);
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Unexpected error deleting class:', err);
      setDeleteError('An unexpected error occurred while deleting the class.');
      setIsDeleting(false);
    }
  };

  // Helper for student bookings
  const getStudentBookings = (studentId: string) => {
    return bookings.filter((b) => b.student_id === studentId);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E40AF] via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-300/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-yellow-300" />
                <span>Coach Dashboard & Management</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Admin Control Center
              </h1>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl font-medium">
                Manage registered students, view demo session bookings, and create or edit course curriculum modules.
              </p>
            </div>

            <button
              onClick={() => {
                fetchStudentsAndBookings();
                fetchClasses(selectedCourse);
                fetchHomeworkSubmissions();
              }}
              disabled={loadingStudents || loadingClasses || loadingHomework}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
              id="admin-refresh-button"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingStudents || loadingClasses || loadingHomework) ? 'animate-spin' : ''}`} />
              <span>Refresh All</span>
            </button>
          </div>
        </div>

        {/* Top View Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-200/60 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'students'
                ? 'bg-white text-[#1E40AF] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-tab-students"
          >
            <Users className="w-4 h-4" />
            <span>Students Directory ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'curriculum'
                ? 'bg-white text-[#1E40AF] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-tab-curriculum"
          >
            <Layers className="w-4 h-4" />
            <span>Curriculum Management</span>
          </button>

          <button
            onClick={() => setActiveTab('homework')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'homework'
                ? 'bg-white text-[#1E40AF] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-tab-homework"
          >
            <FileCheck className="w-4 h-4" />
            <span>Homework ({allHomework.length})</span>
          </button>
        </div>

        {/* TAB 1: STUDENTS & BOOKINGS */}
        {activeTab === 'students' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Students</p>
                  <p className="text-2xl font-black text-[#1E40AF]">{students.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Demo Bookings</p>
                  <p className="text-2xl font-black text-amber-700">{bookings.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</p>
                  <p className="text-base font-bold text-emerald-700">Realtime Connected</p>
                </div>
              </div>
            </div>

            {/* Students List Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E40AF]">
                    Students Directory & Bookings
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Overview of enrolled student accounts and their scheduled demo sessions
                  </p>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
              </div>

              {studentsError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                  {studentsError}
                </div>
              )}

              {loadingStudents ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Loading student directory...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-50 text-[#1E40AF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-2">
                    {searchQuery ? 'No matching students found' : 'No registered students yet!'}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {searchQuery
                      ? 'Try searching with a different name or phone number.'
                      : 'Student profiles will appear here as soon as they sign up.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredStudents.map((student) => {
                    const studentBookings = getStudentBookings(student.id);

                    return (
                      <div
                        key={student.id}
                        className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 sm:p-6 transition-all hover:border-blue-300 hover:shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                              {(student.full_name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                                <span>{student.full_name || 'Unnamed Student'}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-[#1E40AF] rounded-full uppercase">
                                  Student ID: {student.id.slice(0, 8)}...
                                </span>
                              </h3>

                              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs font-semibold text-slate-600">
                                <span className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-[#1E40AF]" />
                                  {student.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-[#1E40AF]" />
                                  {student.phone || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Joined{' '}
                                  {new Date(student.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenMessageModal(student)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                              id={`message-student-${student.id}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-yellow-300" />
                              <span>Message</span>
                            </button>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#1E40AF] text-xs font-extrabold">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{studentBookings.length} Booking{studentBookings.length === 1 ? '' : 's'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-2">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
                            <span>Recorded Bookings:</span>
                          </h4>

                          {studentBookings.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium italic bg-white p-3 rounded-xl border border-slate-100">
                              No demo or course bookings recorded yet for this student.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {studentBookings.map((b) => (
                                <div
                                  key={b.id}
                                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-[#1E40AF]" />
                                      {b.course_name}
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-extrabold">
                                      {b.status}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-[#1E40AF]" />
                                      {b.preferred_date || 'No date set'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#1E40AF]" />
                                      {b.preferred_time || 'No time slot set'}
                                    </span>
                                  </div>

                                  {b.message && (
                                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5 mt-1">
                                      <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                      <span className="italic">"{b.message}"</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM MANAGEMENT */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Course Selector Cards/Tabs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                Select Course to Manage Curriculum:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {COURSES.map((course) => {
                  const isSelected = selectedCourse === course;

                  return (
                    <button
                      key={course}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50/80 text-[#1E40AF] shadow-xs font-black'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{course}</span>
                      <BookOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Course Classes Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Managing Curriculum For</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {selectedCourse}
                  </h2>
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="px-5 py-3 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
                  id="admin-add-class-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Class</span>
                </button>
              </div>

              {classesError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                  {classesError}
                </div>
              )}

              {loadingClasses ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Loading curriculum classes...</p>
                </div>
              ) : classesList.length === 0 ? (
                <div className="py-12 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-50 text-[#1E40AF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-2">
                    No classes added yet for {selectedCourse}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Start creating structured class modules, Zoom session links, and study presentations for this course.
                  </p>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Class</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {classesList.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 transition-all hover:border-blue-300 hover:shadow-xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-[#1E40AF] text-white font-black text-xs rounded-lg shrink-0">
                            Class #{cls.class_number}
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                              {cls.title}
                            </h3>
                            {cls.description && (
                              <p className="text-xs text-slate-600 font-medium mt-1 max-w-2xl">
                                {cls.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Edit and Delete Action Buttons */}
                        <div className="flex items-center gap-2 self-start md:self-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cls)}
                            className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1E40AF] border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                            title="Edit Class"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePromptDeleteClass(cls)}
                            className="p-2 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Class Details Footer Bar */}
                      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200/80 text-xs font-semibold text-slate-600">
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
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span>Duration: {cls.duration}</span>
                          </div>
                        )}

                        {cls.zoom_link && (
                          <a
                            href={cls.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-100 text-[#1E40AF] hover:underline font-bold text-[11px]"
                          >
                            <Video className="w-3 h-3" />
                            <span>Zoom Link</span>
                          </a>
                        )}

                        {cls.ppt_link && (
                          <a
                            href={cls.ppt_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 hover:underline font-bold text-[11px]"
                          >
                            <FileText className="w-3 h-3 text-amber-700" />
                            <span>PPT / Presentation</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HOMEWORK SUBMISSIONS */}
        {activeTab === 'homework' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E40AF] flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-[#1E40AF]" />
                  <span>Student Homework Submissions</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Review student-uploaded practice sheets, exercise documents, and PDFs across all courses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Course Filter */}
                <select
                  value={homeworkCourseFilter}
                  onChange={(e) => setHomeworkCourseFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                >
                  <option value="All">All Courses</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search file or student..."
                    value={homeworkSearchQuery}
                    onChange={(e) => setHomeworkSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
              </div>
            </div>

            {/* Submissions List Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {loadingHomework ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Loading homework submissions...</p>
                </div>
              ) : (() => {
                const filtered = allHomework.filter((item) => {
                  const student = students.find((s) => s.id === item.student_id);
                  const studentName = student?.full_name || '';
                  const studentEmail = student?.email || '';

                  const matchesSearch =
                    item.file_name.toLowerCase().includes(homeworkSearchQuery.toLowerCase()) ||
                    item.course_name.toLowerCase().includes(homeworkSearchQuery.toLowerCase()) ||
                    studentName.toLowerCase().includes(homeworkSearchQuery.toLowerCase()) ||
                    studentEmail.toLowerCase().includes(homeworkSearchQuery.toLowerCase());

                  const matchesCourse =
                    homeworkCourseFilter === 'All' || item.course_name === homeworkCourseFilter;

                  return matchesSearch && matchesCourse;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-50 text-[#1E40AF] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Paperclip className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-800 mb-2">
                        No homework submissions found
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {homeworkSearchQuery || homeworkCourseFilter !== 'All'
                          ? 'Try adjusting your search or course filter.'
                          : 'Uploaded student homework files will appear here.'}
                      </p>
                    </div>
                  );
                }

                // Group filtered homework submissions by student_id
                const groupedByStudent = filtered.reduce((acc, item) => {
                  if (!acc[item.student_id]) {
                    acc[item.student_id] = [];
                  }
                  acc[item.student_id].push(item);
                  return acc;
                }, {} as Record<string, HomeworkSubmission[]>);

                return (
                  <div className="space-y-6">
                    {Object.entries(groupedByStudent).map(([studentId, rawSubmissions]) => {
                      const studentSubmissions = rawSubmissions as HomeworkSubmission[];
                      const student = students.find((s) => s.id === studentId);

                      // Group student's submissions by course_name
                      const courseGroups = studentSubmissions.reduce((acc, item) => {
                        if (!acc[item.course_name]) {
                          acc[item.course_name] = [];
                        }
                        acc[item.course_name].push(item);
                        return acc;
                      }, {} as Record<string, HomeworkSubmission[]>);

                      return (
                        <div
                          key={studentId}
                          className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
                        >
                          {/* Student Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-[#1E40AF] text-white font-black text-base flex items-center justify-center shrink-0">
                                {(student?.full_name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-base text-slate-900">
                                  {student?.full_name || 'Student ID: ' + studentId.slice(0, 8)}
                                </h4>
                                <p className="text-xs font-medium text-slate-500">
                                  {student?.email || 'Registered Student'}
                                  {student?.phone ? ` • ${student.phone}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              {student && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenMessageModal(student)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E40AF] font-bold text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-yellow-500" />
                                  <span>Message</span>
                                </button>
                              )}
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-[#1E40AF] font-black text-xs">
                                {studentSubmissions.length} File{studentSubmissions.length === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>

                          {/* Courses & Files under this Student */}
                          <div className="space-y-4">
                            {Object.entries(courseGroups).map(([cName, rawFiles]) => {
                              const cFiles = rawFiles as HomeworkSubmission[];
                              return (
                                <div key={cName} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#1E40AF] text-[11px] font-black uppercase">
                                      {cName}
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium">
                                      ({cFiles.length} file{cFiles.length === 1 ? '' : 's'})
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {cFiles.map((file) => {
                                      const isImage =
                                        file.file_type?.startsWith('image/') ||
                                        /\.(jpg|jpeg|png)$/i.test(file.file_name);

                                      return (
                                        <div
                                          key={file.id}
                                          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex items-center justify-between gap-3"
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                                              {isImage ? (
                                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                              ) : (
                                                <FileText className="w-4 h-4 text-red-600" />
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <p
                                                className="text-xs font-bold text-slate-800 truncate"
                                                title={file.file_name}
                                              >
                                                {file.file_name}
                                              </p>
                                              <p className="text-[10px] text-slate-400 font-medium">
                                                Submitted{' '}
                                                {new Date(file.uploaded_at).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </p>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleAdminOpenHomework(file.file_path)}
                                            className="px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5 text-yellow-300" />
                                            <span>View File</span>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* QUICK MESSAGE MODAL */}
      {messagingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-[#1E40AF] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Quick Message Student</h3>
                  <p className="text-xs text-blue-100 font-medium">
                    {messagingStudent.full_name || 'Student'} • {messagingStudent.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMessagingStudent(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyMessageTemplate('zoom')}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E40AF] font-bold text-xs border border-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Zoom link updated</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyMessageTemplate('time')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Class time changed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyMessageTemplate('homework')}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Homework reminder</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type message for student..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                💡 Note: Opens pre-filled application links. The admin still manually taps "send" inside Email or WhatsApp.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMessagingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickMessage('email')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email (Mailto)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickMessage('whatsapp')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp (wa.me)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickMessage('both')}
                  className="px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Send Both</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CLASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-[#1E40AF] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Layers className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {editingClass ? 'Edit Class Module' : 'Add New Class Module'}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    {selectedCourse}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveClass} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formClassNumber}
                    onChange={(e) => setFormClassNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Nouns & Pronouns"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of topics covered in this class session..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zoom Meeting Link
                  </label>
                  <div className="relative">
                    <Video className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/..."
                      value={formZoomLink}
                      onChange={(e) => setFormZoomLink(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PPT / Canva Slides Link
                  </label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://canva.com/design/..."
                      value={formPptLink}
                      onChange={(e) => setFormPptLink(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Date
                  </label>
                  <input
                    type="date"
                    value={formClassDate}
                    onChange={(e) => setFormClassDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Time
                  </label>
                  <input
                    type="time"
                    value={formClassTime}
                    onChange={(e) => setFormClassTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="60 mins"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  {isSaving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingClass ? 'Save Changes' : 'Add Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE CLASS CONFIRMATION MODAL */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Delete This Class?</h3>
                  <p className="text-xs text-red-100 font-medium">{classToDelete.course_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                disabled={isDeleting}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                  {deleteError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Class #{classToDelete.class_number}
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {classToDelete.title}
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to delete this class? This action cannot be undone.
              </p>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteClass}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{isDeleting ? 'Deleting...' : 'Delete Class'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
