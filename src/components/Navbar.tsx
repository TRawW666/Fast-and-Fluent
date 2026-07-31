import React, { useState, useEffect } from 'react';
import { GraduationCap, Menu, X, ArrowRight, User, LogOut, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../lib/config';

interface NavbarProps {
  onBookClick: (courseName?: string) => void;
  onOpenPortal?: () => void;
  onGoHome?: () => void;
  currentView?: 'home' | 'portal' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookClick,
  onOpenPortal,
  onGoHome,
  currentView = 'home',
}) => {
  const { user, studentProfile, openAuthModal, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Detect active section
      const sections = ['hero', 'about', 'courses', 'why-us', 'testimonials', 'faq', 'booking'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Single-row header for Admin Panel and Student Portal
  if (currentView === 'admin' || currentView === 'portal') {
    const displayName = isAdmin
      ? 'Admin'
      : studentProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xs py-3 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo + Back to Homepage link/button */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => onGoHome && onGoHome()}
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#1E40AF] rounded-lg p-1 text-left"
              id="nav-logo-portal"
              title="Return to Homepage"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1E40AF] text-[#FACC15] flex items-center justify-center shadow-md group-hover:bg-blue-900 transition-colors">
                <span className="font-black text-lg sm:text-xl italic leading-none">F</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-[#1E40AF] tracking-tight leading-none">
                  Fast and Fluent English
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                  Coaching with Sheetal Chauhan
                </span>
              </div>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={() => onGoHome && onGoHome()}
              className="inline-flex items-center gap-2 text-[#1E40AF] hover:text-blue-900 font-bold text-xs sm:text-sm group p-1.5 rounded-xl hover:bg-blue-50 transition-colors"
              id="navbar-back-to-home"
            >
              <div className="p-1 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <ArrowLeft className="w-4 h-4 text-[#1E40AF]" />
              </div>
              <span>Back to Homepage</span>
            </button>
          </div>

          {/* Right: User's name/avatar + Log Out button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-xs font-bold">
                {isAdmin ? 'A' : displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] sm:max-w-[160px] truncate">
                {displayName}
              </span>
              {isAdmin && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Admin</span>
                </span>
              )}
            </div>

            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm font-bold transition-all shadow-2xs"
              id="navbar-logout-button"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { name: 'Home', href: 'hero' },
    { name: 'About', href: 'about' },
    { name: 'Courses', href: 'courses' },
    { name: 'Why Us', href: 'why-us' },
    { name: 'Testimonials', href: 'testimonials' },
    { name: 'FAQ', href: 'faq' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (currentView === 'portal') {
      if (onGoHome) onGoHome();
      setTimeout(() => {
        const element = document.getElementById(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
          : 'bg-white/80 backdrop-blur-sm py-4 border-b border-blue-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, 'hero')}
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#1E40AF] rounded-lg p-1"
            id="nav-logo"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1E40AF] text-[#FACC15] flex items-center justify-center shadow-md group-hover:bg-blue-900 transition-colors">
              <span className="font-black text-xl italic leading-none">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-[#1E40AF] tracking-tight leading-none">
                Fast and Fluent English
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                Coaching with Sheetal Chauhan
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  id={`nav-link-${link.href}`}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#1E40AF] font-bold bg-blue-50/80'
                      : 'text-slate-600 hover:text-[#1E40AF] hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Yellow CTA Button & Auth Controls & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Auth Button or User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* My Portal or Admin Panel Button */}
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onOpenPortal) onOpenPortal();
                  }}
                  id={isAdmin ? "navbar-admin-panel-button" : "navbar-my-portal-button"}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    (isAdmin && currentView === 'admin') || (!isAdmin && currentView === 'portal')
                      ? 'bg-[#1E40AF] text-white shadow-sm'
                      : 'bg-blue-50 text-[#1E40AF] hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-500 fill-amber-100" /> : <GraduationCap className="w-4 h-4" />}
                  <span>{isAdmin ? 'Admin Panel' : 'My Portal'}</span>
                </button>

                {/* Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all"
                    id="navbar-user-profile-button"
                    title={isAdmin ? 'Admin Profile' : (studentProfile?.full_name || 'User Profile')}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-xs font-bold">
                      {isAdmin ? 'A' : (studentProfile?.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline max-w-[100px] truncate">
                      {isAdmin ? 'Admin' : (studentProfile?.full_name || 'Student')}
                    </span>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-[#1E40AF] truncate">
                          {isAdmin ? 'Admin (Sheetal Chauhan)' : (studentProfile?.full_name || 'Student')}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {studentProfile?.email || user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (onOpenPortal) onOpenPortal();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#1E40AF] hover:bg-blue-50 font-bold transition-colors"
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-600" /> : <GraduationCap className="w-4 h-4" />}
                        <span>{isAdmin ? 'Admin Panel' : 'My Portal'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors border-t border-slate-100 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                id="navbar-signin-button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#1E40AF] text-[#1E40AF] hover:bg-blue-50 font-bold text-xs sm:text-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => {
                onBookClick('Free Demo Class');
                const element = document.getElementById('booking');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              id="navbar-cta-button"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FACC15] hover:bg-yellow-500 text-[#1E40AF] font-extrabold text-sm shadow-md shadow-yellow-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-blue-950 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden mt-3 pt-3 pb-4 border-t border-slate-100 bg-white rounded-2xl shadow-xl px-4 animate-fade-slide"
            id="mobile-menu-drawer"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-2 mt-1 border-t border-slate-100 space-y-2">
                {!user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E40AF] text-[#1E40AF] font-bold text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenPortal) onOpenPortal();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E40AF] text-white font-bold text-sm shadow-sm"
                    >
                      {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-300" /> : <GraduationCap className="w-4 h-4" />}
                      <span>{isAdmin ? 'Open Admin Panel' : 'Open My Portal'}</span>
                    </button>

                    <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#1E40AF]">
                          {isAdmin ? 'Admin (Sheetal)' : (studentProfile?.full_name || 'Student')}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {studentProfile?.email || user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut();
                        }}
                        className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onBookClick('Free Demo Class');
                    const element = document.getElementById('booking');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold text-base shadow-sm"
                >
                  <span>Book Free Demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
