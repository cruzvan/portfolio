
import React, { useEffect, useState } from 'react';

interface TransitionLayerProps {
  state: string;
}

const TransitionLayer: React.FC<TransitionLayerProps> = ({ state }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Trigger transition when state changes, except initial load
    if (state !== 'loading' && state !== 'start') {
        setIsActive(true);
        const timer = setTimeout(() => setIsActive(false), 1000); // Duration matches animation
        return () => clearTimeout(timer);
    }
  }, [state]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between items-center overflow-hidden">
      
      {/* 1. Grid Flash Effect (Transparent Overlay) */}
      <div 
        className="absolute inset-0 opacity-0"
        style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            animation: 'grid-flash 0.8s ease-out forwards'
        }}
      />

      {/* 2. The Scanner Bar (Horizontal Light Beam moving down) */}
      <div 
        className="absolute left-0 w-full h-[15vh] bg-gradient-to-b from-transparent via-[#FE4403]/20 to-transparent blur-xl" 
        style={{ animation: 'scan-down 0.8s ease-in-out forwards', top: '-20%' }}
      />
      <div 
        className="absolute left-0 w-full h-[2px] bg-[#FE4403]/80 shadow-[0_0_25px_#FE4403]" 
        style={{ animation: 'scan-down 0.8s ease-in-out forwards', top: '-20%' }}
      />

      {/* 3. System Status Text (Flickering) */}
      <div 
        className="absolute bottom-8 right-8 flex items-center gap-2"
        style={{ animation: 'text-flicker 0.8s steps(4) forwards' }}
      >
         <span className="w-2 h-2 bg-[#FE4403] rounded-full animate-ping" />
         <span className="text-[#FE4403] font-mono text-xs tracking-[0.2em] uppercase">
            REROUTING // {state.replace('-', '_').toUpperCase()}
         </span>
      </div>

      <style>{`
        @keyframes scan-down {
          0% { top: -20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 120%; opacity: 0; }
        }
        @keyframes grid-flash {
          0% { opacity: 0; transform: scale(1.05); }
          20% { opacity: 1; } 
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes text-flicker {
            0% { opacity: 0; }
            10% { opacity: 1; }
            30% { opacity: 0; }
            50% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TransitionLayer;