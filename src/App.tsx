import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Courses } from './components/Courses';
import { DemoBanner } from './components/DemoBanner';
import { WhyUs } from './components/WhyUs';
import { Testimonials } from './components/Testimonials';
import { BookingForm } from './components/BookingForm';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { StudentPortal } from './components/StudentPortal';
import { AdminPanel } from './components/AdminPanel';
import { ADMIN_EMAIL } from './lib/config';

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'portal' | 'admin'>('home');
  const [selectedCourse, setSelectedCourse] = useState<string>('Free Demo Class');
  const { user, isAuthModalOpen, closeAuthModal, authModalMode, requireAuthForDemo } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Reset to home view if user logs out while on portal or admin page
  useEffect(() => {
    if (!user && currentView !== 'home') {
      setCurrentView('home');
    }
  }, [user, currentView]);

  const handleOpenPortalOrAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('portal');
    }
  };

  const handleBookCourse = (courseName?: string) => {
    const course = courseName || 'Free Demo Class';

    const scrollToBooking = () => {
      setSelectedCourse(course);
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById('booking');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    };

    if (course === 'Free Demo Class') {
      // Require auth for Free Demo
      requireAuthForDemo(() => {
        scrollToBooking();
      });
    } else {
      // Paid course booking opens form directly
      scrollToBooking();
    }
  };

  const handleNavClick = (sectionId: string) => {
    setCurrentView('home');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-yellow-300 selection:text-blue-950">
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />

      {/* 1. Navbar */}
      <Navbar
        onBookClick={handleBookCourse}
        onOpenPortal={handleOpenPortalOrAdmin}
        onGoHome={() => setCurrentView('home')}
        currentView={currentView}
      />

      {/* Main Page Content */}
      {currentView === 'admin' ? (
        <div className="pt-20">
          <AdminPanel onGoHome={() => setCurrentView('home')} />
        </div>
      ) : currentView === 'portal' ? (
        <div className="pt-20">
          <StudentPortal
            onGoHome={() => setCurrentView('home')}
            onBookDemo={() => handleBookCourse('Free Demo Class')}
          />
        </div>
      ) : (
        <>
          <main>
            {/* 2. Hero Section */}
            <Hero
              onBookClick={handleBookCourse}
              onViewCoursesClick={() => handleNavClick('courses')}
            />

            {/* 3. About Section */}
            <About />

            {/* 4. Courses Section */}
            <Courses onBookCourse={handleBookCourse} />

            {/* 5. Free Demo Class Banner */}
            <DemoBanner onBookClick={handleBookCourse} />

            {/* 6. Why Choose Us Section */}
            <WhyUs />

            {/* 7. Testimonials Section */}
            <Testimonials />

            {/* 8. WhatsApp Booking Form Section */}
            <BookingForm
              selectedCourse={selectedCourse}
              onOpenPortal={handleOpenPortalOrAdmin}
            />

            {/* 9. FAQ Section */}
            <FAQ />
          </main>

          {/* 10. Footer */}
          <Footer onNavClick={handleNavClick} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

