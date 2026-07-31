export interface Course {
  id: string;
  name: string;
  levelTag: string;
  description: string;
  iconName: 'Baby' | 'BookOpen' | 'TrendingUp' | 'Zap';
  highlights: string[];
  price: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: 'Users' | 'Mic' | 'Compass' | 'Clock' | 'BookMarked' | 'HeartHandshake';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  course: string;
  avatarText: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  preferredCourse: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export interface Booking {
  id: string;
  student_id: string;
  course_name: string;
  status: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
  created_at: string;
  is_paid?: boolean;
  payment_id?: string;
  amount_paid?: number;
  price?: number;
}

export interface Student {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface ClassItem {
  id: string;
  course_name: string;
  class_number: number;
  title: string;
  description?: string;
  zoom_link?: string;
  ppt_link?: string;
  class_date?: string;
  class_time?: string;
  duration?: string;
  created_at: string;
}
