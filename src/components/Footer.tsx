import React from 'react';
import { GraduationCap, Phone, Mail, MapPin, Heart, MessageCircle, Youtube, Instagram, Linkedin } from 'lucide-react';

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

  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/919607405256', icon: MessageCircle, hoverBg: 'hover:bg-[#25D366] hover:text-white hover:shadow-[#25D366]/30', color: 'text-[#25D366]' },
    { name: 'YouTube', href: 'https://www.youtube.com/@she_chauhan/', icon: Youtube, hoverBg: 'hover:bg-[#FF0000] hover:text-white hover:shadow-[#FF0000]/30', color: 'text-[#FF0000]' },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram, hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:shadow-[#dc2743]/30', color: 'text-[#E4405F]' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, hoverBg: 'hover:bg-[#0A66C2] hover:text-white hover:shadow-[#0A66C2]/30', color: 'text-[#0A66C2]' }
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

            {/* Social Icons with Brand Colors & Smooth Scale Effect */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((s) => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-blue-900/80 border border-blue-800 text-blue-100 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-sm hover:shadow-lg ${s.hoverBg}`}
                    aria-label={s.name}
                    title={s.name}
                  >
                    <IconComponent className="w-5 h-5 transition-transform duration-200" />
                  </a>
                );
              })}
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
