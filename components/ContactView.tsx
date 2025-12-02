
import React from 'react';
import { Mail, Linkedin, Github, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactViewProps {
  onClose: () => void;
}

// FIX: Define a type for social links to improve type safety.
interface SocialLink {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  href: string;
}

const ContactView: React.FC<ContactViewProps> = ({ onClose }) => {
  const { t } = useLanguage();

  const socialLinks: SocialLink[] = [
    { icon: <Mail />, label: 'Email', href: 'mailto:angelo.cruz.gamedev@email.com' },
    { icon: <Linkedin />, label: 'LinkedIn', href: 'https://www.linkedin.com/in/angelocruz' },
    { icon: <Github />, label: 'GitHub', href: 'https://github.com/angelocruzdev' },
    { icon: <BrainCircuit />, label: 'Company Webpage', href: 'https://www.my-company-website.com' } // Added new icon with a placeholder URL
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/0 backdrop-blur-sm animate-fade-in-fast p-4">
      {/* Wrapper for positioning the modal and the external button */}
      <div className="relative w-full max-w-lg animate-modal-in">
        
        {/* Main modal box with sharp corners, no border */}
        <div 
          className="w-full bg-[#0d1b3e]/80 shadow-2xl p-6 md:p-8"
          style={{fontFamily: "'Rajdhani', sans-serif"}}
        >
          
          {/* Header */}
          <div className="text-left mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wider" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
              {t('get_in_touch')}
            </h2>
            <p className="text-white/60 mt-1 text-xs md:text-sm">{t('autosave_msg')}</p>
          </div>

          {/* Content */}
          <div className="text-left text-white/90 mb-8 space-y-3 text-sm md:text-base">
            <p>
              {t('saving_notification')}
            </p>
            <p>
              {t('dont_close')}
            </p>
          </div>

          {/* Social Links with larger, square icons */}
          <div className="flex justify-center items-center gap-4 md:gap-8 my-8">
            {socialLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={link.label}
                className="group flex flex-col items-center text-white/70 hover:text-[#FE4403] transition-colors duration-300"
              >
                <div className="p-4 md:p-5 border border-white/20 group-hover:border-[#FE4403] group-hover:bg-white/5 transition-all duration-300">
                  {React.cloneElement(link.icon, { size: 32 })}
                </div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Back Button, positioned outside, flush with the bottom-right of the modal */}
        <div className="absolute right-0 top-full">
            <button
                onClick={onClose}
                className="bg-gray-300/80 text-black px-8 md:px-12 py-2 md:py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-200 text-base md:text-lg"
                style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
            >
                {t('back')}
            </button>
        </div>
      </div>

      {/* --- HUD FOOTER --- */}
      <div className="absolute bottom-4 md:bottom-8 left-0 w-full px-6 md:px-12 flex justify-between items-end pointer-events-none z-50">
        <div className="flex items-center gap-3 text-white/50">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="3" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="3" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="6 9C6 5.68629 8.68629 3 12 3V10H6V9Z" fill="currentColor" />
           </svg>
           <span className="text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase pt-1" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
             {t('hud_select')}
           </span>
        </div>
      </div>

    </div>
  );
};

export default ContactView;
