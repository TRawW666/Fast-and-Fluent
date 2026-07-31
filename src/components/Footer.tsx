import React from 'react';
import { GraduationCap, Phone, Mail, MapPin, MessageSquare, Heart } from 'lucide-react';

interface FooterProps {
  onNavClick: (href: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const navLinks = [
    { name: 'Home', href: 'hero' },
    { name: 'About Coach Sheetal', href: 'about' },
    { name: 'Courses', href: 'courses' },
    { name: 'Why Choose Us', href: 'why-us' },
    { name: 'Testimonials', href: 'testimonials' },
    { name: 'FAQ', href: 'faq' },
    { name: 'Book Free Demo', href: 'booking' }
  ];

  return (
    <footer className="bg-blue-950 text-white pt-16 pb-12 border-t border-blue-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-blue-900">
          
          {/* Brand & Tagline */}
          <div className="lg:col-span-5 space-y-4">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                onNavClick('hero');
              }}
              className="inline-flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-yellow-400 flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Fast & Fluent <span className="text-yellow-400">English</span>
              </span>
            </a>

            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Empowering students, job seekers, and working professionals to speak English naturally, fluently, and confidently without fear or hesitation.
            </p>

            {/* Social Icons with Yellow Hover */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { name: 'WhatsApp', href: 'https://wa.me/919607405256' },
                { name: 'YouTube', href: '#' },
                { name: 'Instagram', href: '#' },
                { name: 'LinkedIn', href: '#' }
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center hover:bg-yellow-400 hover:text-blue-950 transition-all duration-200 shadow-sm"
                  aria-label={s.name}
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={`#${link.href}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavClick(link.href);
                    }}
                    className="text-sm text-blue-200 hover:text-yellow-400 transition-colors font-medium inline-block py-0.5"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
              Direct Contact
            </h3>
            <div className="space-y-3.5 text-sm text-blue-200">
              <a
                href="https://wa.me/919607405256"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-yellow-400 transition-colors"
              >
                <Phone className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">+91 96074 05256</div>
                  <div className="text-xs text-blue-300">WhatsApp & Direct Call</div>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">sheetal@fastandfluentenglish.com</div>
                  <div className="text-xs text-blue-300">Course Queries & Enquiries</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-200">Online Live Classes Globally</div>
                  <div className="text-xs text-blue-300">Interactive Google Meet / Zoom Sessions</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <div>
            © {new Date().getFullYear()} Fast and Fluent English. All rights reserved.
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span>Designed for English Fluency with</span>
            <Heart className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>by Sheetal Chauhan</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
