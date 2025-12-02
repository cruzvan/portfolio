
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();
  const [isExiting, setIsExiting] = useState(false);

  const handleStartInteraction = () => {
    if (isExiting) return;
    
    // Activa la animación de salida
    setIsExiting(true);

    // Espera 1 segundo (duración de la transición) antes de ejecutar la acción de inicio
    setTimeout(() => {
      onStart();
    }, 1000);
  };

  return (
    <div 
      className="w-full h-full cursor-pointer"
      onClick={handleStartInteraction}
    >
      {/* Contenedor con transición de estado para el desvanecimiento */}
      <div className={`flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ease-in-out transform ${
        isExiting ? 'opacity-0 blur-lg scale-95' : 'opacity-100 blur-0 scale-100'
      }`}>
        
        {/* Main Title Container */}
        <div className="relative mb-12 md:mb-16 text-center group px-4">
          
          {/* The Title - Responsive Text Sizes */}
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-normal text-white">
            
            <span className="font-bold block md:inline" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>ANGELO CRUZ</span>
            
            <span className="block text-2xl sm:text-4xl md:text-6xl tracking-[0.1em] font-normal mt-4 md:mt-20 opacity-80 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 bg-clip-text text-transparent animate-text-shimmer" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
              PORTFOLIO
            </span>
          </h1>

        </div>

        {/* Press Start Prompt - Updated Layout */}
        <div className="absolute bottom-16 md:bottom-24 flex flex-col items-center w-full">
          <div className="flex items-center gap-3 animate-soft-pulse text-white/90 scale-90 md:scale-100">
              
            {/* Using the translation key for the text */}
            <span className="text-xl md:text-2xl font-semibold tracking-widest uppercase" style={{ fontFamily: "'ITC Avant Garde Gothic Pro XLt'" }}>
              {t('pressStart')}
            </span>

            {/* Mouse Icon with Left Click Highlighted */}
            <div className="opacity-90">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Active Left Button Fill (Cyan with Glow) */}
                <path d="M6 10V9C6 5.68629 8.68629 3 12 3V10H6Z" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.6))' }} /> 
                
                {/* Mouse Body Outline & Details - Thinner strokes (1.2) */}
                <rect x="6" y="3" width="12" height="18" rx="6" stroke="white" strokeWidth="1.2" />
                <line x1="12" y1="3" x2="12" y2="10" stroke="white" strokeWidth="1.2" />
                <line x1="6" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.2" />
              </svg>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;
