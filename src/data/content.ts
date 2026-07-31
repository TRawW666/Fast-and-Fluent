import { Course, Feature, Testimonial, FAQItem } from '../types';

export const INSTRUCTOR_INFO = {
  name: 'Sheetal Chauhan',
  role: 'Founder & Head Language Coach',
  title: 'Certified TESOL/TEFL English Fluency Specialist',
  experience: '10+ Years Experience',
  studentsTaught: '1,500+ Professionals & Students',
  bio: `Sheetal Chauhan is an internationally certified English communication coach dedicated to transforming hesitant speakers into fluent, confident communicators. With over a decade of hands-on coaching experience across corporate clients, working professionals, and young learners, Sheetal combines practical conversational psychology with structured grammar and accent refinement.`,
  highlights: [
    'Certified TESOL/TEFL English Language Trainer',
    'Specialized in Conversational Psychology & Hesitation Removal',
    'Personalized 1-on-1 Feedback & Speech Correction',
    'Proven Track Record with 1,500+ Successful Learners'
  ]
};

export const COURSES: Course[] = [
  {
    id: 'english-for-kids',
    name: 'English for Kids',
    levelTag: 'Ages 6 - 14 | Beginner to Intermediate',
    description: 'A fun, engaging program designed to build strong English fundamentals, phonics, story-based speaking skills, and natural confidence early in life.',
    iconName: 'Baby',
    price: 199,
    highlights: [
      'Interactive storytelling & vocabulary games',
      'Phonics & accurate pronunciation foundations',
      'Public speaking & school presentation practice',
      'Patient & encouraging environment'
    ]
  },
  {
    id: 'beginner-course',
    name: 'Beginner Course',
    levelTag: 'Level A1 - A2 | Foundational English',
    description: 'Master everyday sentence formation, essential grammar rules, and basic conversational fluency to eliminate fear and start speaking without hesitation.',
    iconName: 'BookOpen',
    price: 399,
    highlights: [
      'Daily conversational sentence building',
      'Practical, non-intimidating grammar lessons',
      'Overcoming stage fear & translation hesitation',
      'Guided daily speaking drills'
    ]
  },
  {
    id: 'intermediate-course',
    name: 'Intermediate Course',
    levelTag: 'Level B1 - B2 | Fluency & Confidence',
    description: 'Refine your accent, expand your expressive vocabulary, master complex sentence structures, and handle workplace or social discussions smoothly.',
    iconName: 'TrendingUp',
    price: 599,
    highlights: [
      'Accent refinement & rhythm training',
      'Workplace meetings, interviews & presentations',
      'Idiomatic expressions & natural phrasing',
      'Debates & live group discussions'
    ]
  },
  {
    id: 'power-vocabulary',
    name: 'Power Vocabulary Course',
    levelTag: 'All Levels | Advanced Communication',
    description: 'Elevate your vocabulary with high-impact words, professional jargon, persuasive speech techniques, and impactful articulation for leadership.',
    iconName: 'Zap',
    price: 799,
    highlights: [
      '300+ high-frequency professional words',
      'Persuasive speaking & business communication',
      'E-mail writing & formal conversation etiquette',
      'Instant word retrieval techniques'
    ]
  }
];

export const FEATURES: Feature[] = [
  {
    id: 'personalized-focus',
    title: 'Personalized 1-on-1 Attention',
    description: 'Every student receives customized speech feedback tailored to their specific mother-tongue influence and speaking goals.',
    iconName: 'Users'
  },
  {
    id: 'realtime-feedback',
    title: 'Real-time Speaking Practice',
    description: 'Learn by speaking from Day 1 with live corrections, constructive feedback, and interactive roleplay scenarios.',
    iconName: 'Mic'
  },
  {
    id: 'custom-roadmap',
    title: 'Customized Learning Roadmap',
    description: 'Targeted modules crafted specifically around your individual level, career requirements, or academic goals.',
    iconName: 'Compass'
  },
  {
    id: 'flexible-timings',
    title: 'Flexible Class Schedules',
    description: 'Morning, evening, and weekend slots designed to fit seamlessly into busy professional and student routines.',
    iconName: 'Clock'
  },
  {
    id: 'practical-vocab',
    title: 'Practical Grammar & Vocab',
    description: 'No boring textbook memorization—learn functional grammar and daily vocabulary that you can use immediately.',
    iconName: 'BookMarked'
  },
  {
    id: 'supportive-env',
    title: 'Supportive & Safe Environment',
    description: 'Friendly, non-judgmental atmosphere designed to boost your confidence and eliminate hesitation.',
    iconName: 'HeartHandshake'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Priya Sharma',
    role: 'IT Project Manager',
    rating: 5,
    comment: 'Before joining Sheetal’s Intermediate course, I used to hesitate during client calls with US stakeholders. Within 6 weeks, my speaking speed improved and my fear vanished completely. Highly recommended!',
    course: 'Intermediate Course',
    avatarText: 'PS'
  },
  {
    id: 't2',
    name: 'Rajesh Kulkarni',
    role: 'Software Engineer',
    rating: 5,
    comment: 'The Power Vocabulary course gave me the exact confidence boost I needed for senior leadership interviews. Sheetal’s personalized feedback on my pronunciation was game-changing.',
    course: 'Power Vocabulary Course',
    avatarText: 'RK'
  },
  {
    id: 't3',
    name: 'Ananya Verma',
    role: 'Parent of Aarav (Age 9)',
    rating: 5,
    comment: 'Aarav used to be very shy in school English presentations. Sheetal ma’am made learning so fun and interactive that he now voluntarily participates in story sessions!',
    course: 'English for Kids',
    avatarText: 'AV'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How are the live online classes conducted?',
    answer: 'Classes are conducted live over Google Meet or Zoom. You receive direct interaction with Sheetal Chauhan, instant speech corrections, and live roleplay exercises tailored to your speed.'
  },
  {
    id: 'faq-2',
    question: 'What happens during the Free 30-Minute Demo Class?',
    answer: 'The free demo is a 1-on-1 interaction where Sheetal assesses your current speaking level, identifies key areas of hesitation or grammar gaps, and outlines a personalized learning plan for you—with zero obligation.'
  },
  {
    id: 'faq-3',
    question: 'Are classes held 1-on-1 or in group batches?',
    answer: 'We offer both 1-on-1 personalized sessions for maximum focus, as well as ultra-small batches (maximum 4-5 students) for interactive group discussions and roleplays.'
  },
  {
    id: 'faq-4',
    question: 'What if I need to reschedule a class due to work?',
    answer: 'We understand busy schedules! Simply inform us 2 hours prior to your scheduled class time, and we will gladly reschedule your session to a convenient alternative slot.'
  },
  {
    id: 'faq-5',
    question: 'How long will it take for me to speak English fluently?',
    answer: 'Most of our students notice a dramatic reduction in hesitation within the first 2-3 weeks. Noticeable conversational fluency is typically achieved within 8 to 12 weeks of consistent practice.'
  }
];
