
import React from 'react';
import { Download, Mail, Linkedin, Github, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutViewProps {
  onClose: () => void;
  onNavigate?: (view: 'cv-gd' | 'cv-ta') => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onClose }) => {
  const { t } = useLanguage();
  
  // Flattened skills for the "Tag" layout style
  const topSkills = [
    "Game Design", "Unreal Engine 5", "Mechanics & Gameplay",  
    "Technical Art", "Blueprints", "Unreal Materials", "ShaderGraph",
    "Unity", "C#",  "Systems Design"
  ];

  const socialLinks = [
    { icon: <Mail size={24} />, label: 'Email', href: 'mailto:angelo.cruz.gamedev@email.com' },
    { icon: <Linkedin size={24} />, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ancrva/' },
    { icon: <Github size={24} />, label: 'GitHub', href: 'https://github.com/cruzvan' },
    { icon: <BrainCircuit size={24} />, label: 'Web', href: 'https://cruzvan.github.io/SeBra/' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-8 animate-fade-in-fast">
      
      {/* --- Main Layout Container (Constrained Height with Flex Column) --- */}
      {/* This ensures the entire assembly (Card + Button) fits within 85vh */}
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col animate-modal-in">
        
        {/* Scrollable Content Card */}
        {/* flex-1 and min-h-0 allows this area to shrink and scroll if the screen is too short */}
        <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-[#0F0F0F]/85 backdrop-blur-md border border-white/10 shadow-2xl min-h-0 rounded-sm">
            
            {/* --- 1. Header Section (Name + Roles + Photo) --- */}
            <div className="px-6 md:px-12 pt-8 md:pt-10 pb-6">
                <div className="flex flex-col-reverse md:flex-row justify-between items-center md:items-start gap-6">
                    
                    {/* Left: Text Info (Name & Split Roles) */}
                    <div className="flex flex-col justify-center gap-2 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none" style={{ fontFamily: "'UniversNextW04-620CondBold', sans-serif" }}>
                            Angelo Cruz
                        </h1>
                        <div className="flex flex-col gap-1 mt-2">
                            <h2 className="text-[#FE4403] text-sm md:text-lg uppercase tracking-[0.2em] font-medium leading-tight" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
                                {t('about_role_gd')}
                            </h2>
                            <h2 className="text-[#FE4403] text-sm md:text-lg uppercase tracking-[0.2em] font-medium leading-tight" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
                                {t('about_role_ta')}
                            </h2>
                        </div>
                    </div>

                    {/* Right: Profile Image (Square, Color) */}
                    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-sm overflow-hidden border border-white/10 shadow-lg bg-black">
                        <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" 
                            alt="Angelo Cruz" 
                            className="w-full h-full object-cover opacity-100 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* --- Separator Line --- */}
            <div className="w-full px-6 md:px-12">
                <div className="w-full h-px bg-white/10" />
            </div>

            {/* --- 2. Body Section (Bio + Competencies) --- */}
            <div className="p-6 md:p-12 space-y-8">
                
                {/* Biography - Updated Font to 'Space Grotesk' as requested (closest match to "Special Gothic") */}
                <div className="text-white/80 text-sm md:text-lg leading-relaxed space-y-6 font-normal text-justify" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <p>{t('about_bio_p1')}</p>
                    <p>{t('about_bio_p2')}</p>
                </div>

                {/* Skills: Centered, Uppercase, Orange Border */}
                <div className="flex flex-wrap justify-center gap-3 pb-4">
                    {topSkills.map((skill, index) => (
                        <span 
                            key={index}
                            className="bg-[#FE4403]/10 border border-[#FE4403] text-white/90 px-3 py-2 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider cursor-default whitespace-nowrap"
                            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* --- 3. Footer Section (Socials + Downloads) --- */}
            <div className="bg-[#050505]/60 p-6 md:px-12 py-8 border-t border-white/10 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    
                    {/* Left: Social Icons */}
                    <div className="flex items-center gap-8">
                        {socialLinks.map((link, index) => (
                            <a 
                                key={index} 
                                href={link.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={link.label}
                                className="text-white/40 hover:text-[#FE4403] transition-colors duration-300 transform hover:scale-110"
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>

                    {/* Right: Horizontal CV Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <a 
                            href="#" 
                            className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-white/5 hover:bg-[#FE4403] border border-white/10 hover:border-[#FE4403] px-6 py-4 transition-all duration-200 group"
                        >
                            <span className="text-white text-xs md:text-sm font-bold uppercase tracking-widest group-hover:text-black">{t('download_cv_gd')}</span>
                            <Download size={16} className="text-white/40 group-hover:text-black transition-colors" />
                        </a>

                        <a 
                            href="#" 
                            className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-white/5 hover:bg-[#FE4403] border border-white/10 hover:border-[#FE4403] px-6 py-4 transition-all duration-200 group"
                        >
                            <span className="text-white text-xs md:text-sm font-bold uppercase tracking-widest group-hover:text-black">{t('download_cv_ta')}</span>
                            <Download size={16} className="text-white/40 group-hover:text-black transition-colors" />
                        </a>
                    </div>

                </div>
            </div>
        </div>

        {/* Back Button (Inside Flex Container) */}
        {/* shrink-0 prevents it from being crushed, ensures it's always below the content and visible */}
        <div className="shrink-0 w-full flex justify-end pt-4 pointer-events-auto z-50">
            <button
                onClick={onClose}
                className="bg-gray-300/80 text-black px-12 py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-200 text-lg shadow-lg border-2 border-transparent"
                style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
            >
                {t('back')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AboutView;
