
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Box, Music, FolderOpen, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

import { useHoverVideo } from '../hooks/useHoverVideo';

// FIX: Define a type for menu items to improve type safety and avoid using `any`.
interface MenuItem {
  id: number;
  category: string;
  title: string;
  image: string;
  icon: React.ReactElement<{ className?: string }>;
}

// Sub-component for individual cards to keep code clean and reusable
interface MenuCardProps {
  item: MenuItem;
  isHovered: boolean;
  isSiblingHovered: boolean; // New prop to know if the OTHER card in the stack is active
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCardClick: (id: number) => void; // Handler for click events
  className?: string;
  isStacked?: boolean;
  flexClass?: string; // Allow passing dynamic flex classes
  style?: React.CSSProperties; // For animation delay
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  isHovered,
  isSiblingHovered,
  onMouseEnter,
  onMouseLeave,
  onCardClick,
  className = "",
  isStacked = false,
  flexClass = "flex-1",
  style
}) => {

  const isCompressed = isStacked && isSiblingHovered;
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { videoRef, onHoverPlay, onHoverPause } = useHoverVideo();
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");

  // PERFORMANCE OPTIMIZATION: Ref for requestAnimationFrame throttling
  const rafRef = useRef<number | null>(null);

  const isVideo = item.image.endsWith('.webm');

  // --- 3D TILT & HOLOGRAPHIC LIGHTING LOGIC (THROTTLED) ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable tilt on mobile/touch devices implicitly by checking hover state interactions usually
    if (!cardRef.current || isCompressed) return;

    // PERFORMANCE: Disable effect on tablets and mobile devices (< 1024px) to save resources
    const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = typeof window !== 'undefined' && window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileUA || isSmallScreen) return;

    const x = e.clientX;
    const y = e.clientY;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    // Calculate position relative to card (0.0 to 1.0) for Holographic Effect
    // This drives the "tilt" of the colors
    const xPct = mouseX / rect.width;
    const yPct = mouseY / rect.height;

    // Update Holographic Coordinates on the Bar
    if (barRef.current) {
      // We inverse the movement slightly to make it feel like reflection
      // Range 0% to 100%
      barRef.current.style.setProperty('--holo-x', `${(1 - xPct) * 100}%`);
      barRef.current.style.setProperty('--holo-y', `${(1 - yPct) * 100}%`);
    }

    // Throttle the 3D rotation calculation
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      // Calculate position relative to center (percentage -0.5 to 0.5)
      const xCenterPct = xPct - 0.5;
      const yCenterPct = yPct - 0.5;

      // Max rotation in degrees
      const maxRotate = 12;

      // Invert Y axis for natural feel (mouse up = tilt up)
      const xRot = yCenterPct * -maxRotate;
      const yRot = xCenterPct * maxRotate;

      setTransform(`perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.05, 1.05, 1.05)`);
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (isVideo) {
      onHoverPause();
    }
    onMouseLeave();
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  const handleMouseEnter = () => {
    // Legacy hover logic reserved if needed, but useEffect handles playback now for compatibility
    onMouseEnter();
  };

  // REACTIVE VIDEO LOGIC: Ensure video plays when isHovered is true (Mobile Tap / Desktop Hover)
  useEffect(() => {
    if (!isVideo) return;

    if (isHovered) {
      onHoverPlay();
    } else {
      onHoverPause();
    }
  }, [isHovered, isVideo, onHoverPlay, onHoverPause]);

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer transition-all duration-500 ease-out ${flexClass} ${className} ${isHovered ? 'z-50' : 'z-10'}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(item.id)}
      style={{
        // We apply the transform here directly for performance
        transform: isHovered ? transform : undefined,
        transition: isHovered ? 'transform 0.1s ease-out, flex 0.5s ease-in-out' : 'transform 0.5s ease-out, flex 0.5s ease-in-out'
      }}
    >
      {/* Wrapper for entrance animation to isolate it from flex transitions */}
      <div className={`w-full h-full opacity-0 animate-slide-up-fade-in overflow-hidden transition-shadow duration-300 ${isHovered ? 'shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)]' : 'shadow-2xl'}`} style={style}>
        {/* --- IMAGE SECTION (Shader Emulation) --- */}
        <div className="absolute inset-0 w-full h-full bg-black">
          <div className={`absolute inset-0 z-30 pointer-events-none transition-all duration-300 border-[4px] ${isHovered ? 'border-[#FE4403]' : 'border-transparent'
            }`} />

          {isVideo ? (
            <video
              ref={videoRef}
              src={item.image}
              loop
              muted
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-60'}`}
            />
          ) : (
            <>
              <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center md:bg-center transition-all duration-300 ${isHovered ? 'opacity-100 contrast-[1.2] scale-105' : 'opacity-60 contrast-100 scale-100'
                  }`}
                style={{ backgroundImage: `url(${item.image})`, backgroundPosition: 'center 20%' }}
              />
            </>
          )}

          <div className={`absolute inset-0 bg-black/0 transition-opacity duration-300 ${isHovered ? 'opacity-0' : (isCompressed ? 'opacity-100' : 'opacity-100')
            }`} />

          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 mix-blend-overlay pointer-events-none z-10" />
        </div>

        {/* --- INFO OVERLAY SECTION (Bottom Absolute) --- */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-300 flex flex-col justify-end z-20 ${isCompressed ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}>

          {/* UPDATED: Holographic Roughness Effect */}
          <div
            ref={barRef}
            className={`
                w-full px-4 md:px-6 py-4 md:py-5 flex flex-row items-center gap-4 relative overflow-hidden transition-all duration-300
                ${isHovered ? 'bg-[#FE4403]' : 'bg-[#09080b]/90 backdrop-blur-sm'}
            `}
          >
            {/* --- HOLOGRAPHIC LAYERS (Only visible on hover AND large screens) --- */}
            {isHovered && (
              <div className="hidden lg:block absolute inset-0 pointer-events-none">
                {/* 1. Subtle Grit Texture (Multiply) 
                        Reduced opacity (10%) provides a faint physical texture without muddying the orange base.
                    */}
                <div
                  className="absolute inset-0 opacity-10 mix-blend-multiply"
                  style={{
                    backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                    backgroundSize: '120px',
                    filter: 'contrast(150%)'
                  }}
                />

                {/* 2. Soft Holographic Spectrum (Color Dodge)
                        Rainbow gradient driven by tilt. 
                        Opacity (50%) and brightness (0.7) are tuned for a gentle, non-blinding iridescence.
                    */}
                <div
                  className="absolute inset-0 mix-blend-color-dodge opacity-10 transition-none"
                  style={{
                    background: `
                                linear-gradient(
                                    115deg, 
                                    transparent 20%, 
                                    #00E0FF 40%, 
                                    #FF0099 50%, 
                                    #E0FF00 60%, 
                                    transparent 80%
                                )
                            `,
                    backgroundSize: '200% 200%',
                    // Position tracks the "tilt" (inverse mouse pos)
                    backgroundPosition: 'var(--holo-x, 50%) var(--holo-y, 50%)',
                    filter: 'blur(1px) brightness(0.7)'
                  }}
                />

                {/* 3. Sharp Sparkle/Foil Texture (Overlay)
                        High contrast noise (brightness 2.5) remains strong to simulate metallic flakes
                        catching light, even with the softer spectrum.
                    */}
                <div
                  className="absolute inset-0 mix-blend-overlay opacity-100"
                  style={{
                    backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                    backgroundSize: '100px',
                    filter: 'brightness(2.5) contrast(2)'
                  }}
                />

                {/* 4. Edge Highlight */}
                <div className="absolute inset-0 border-t border-white/40 mix-blend-overlay" />
              </div>
            )}

            {/* Icon Container */}
            <div className={`h-10 w-10 md:h-14 md:w-14 flex-shrink-0 flex items-center justify-center transition-all duration-300 relative z-10 ${isHovered ? 'bg-white text-[#FE4403] shadow-lg scale-110' : 'border border-white/20 bg-white/5 text-white/70'
              }`}>
              {React.cloneElement(item.icon, { className: "w-5 h-5 md:w-7 md:h-7" })}
            </div>

            {/* Text Container */}
            <div className="flex flex-col justify-center h-full relative z-10 pointer-events-none">
              <h3 className={`text-[9px] md:text-sm uppercase tracking-widest transition-colors duration-300 font-bold mb-1 ${isHovered ? 'text-black/60' : 'text-gray-400'
                }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {item.category}
              </h3>
              <h2 className={`font-bold uppercase leading-none tracking-tighter transition-all duration-300 ${isHovered ? 'text-white text-lg md:text-2xl text-shadow-sm' : 'text-white/90 text-base md:text-xl'
                }`}
                style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
                {item.title}
              </h2>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

interface MainMenuProps {
  onCardClick: (id: number) => void;
  onHeaderClick?: () => void;
  score: number;
  onAddScore: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onCardClick, onHeaderClick, score, onAddScore }) => {
  const { language, setLanguage, t } = useLanguage();

  // Updated Menu Data with translation hook
  const menuItems: MenuItem[] = [
    { id: 1, category: t('menu_about_cat'), title: t('menu_about'), image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop", icon: <User /> },
    { id: 2, category: t('menu_gd_cat'), title: t('menu_gd'), image: "https://res.cloudinary.com/dseaazn5s/video/upload/v1766778096/Hollow_Flowers_-_Gameplay_Trailer_-_Hollow_Flowers_1080p_h264__3_p2h0ax.webm", icon: <Gamepad2 /> },
    { id: 3, category: t('menu_ta_cat'), title: t('menu_ta'), image: "https://res.cloudinary.com/dseaazn5s/video/upload/v1765420594/PF_MainMenu_3DTech_cetqxy.webm", icon: <Box /> },
    { id: 4, category: t('menu_music_cat'), title: t('menu_music'), image: "https://res.cloudinary.com/dseaazn5s/video/upload/v1765001081/SB_Menu_Music_a39iu8.webm", icon: <Music /> },
    { id: 5, category: t('menu_extras_cat'), title: t('menu_extras'), image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop", icon: <FolderOpen /> },
  ];

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null, y: number | null }>({ x: null, y: null });
  const onAddScoreRef = useRef(onAddScore);

  useEffect(() => {
    onAddScoreRef.current = onAddScore;
  }, [onAddScore]);

  // --- INTERACTIVE CONSTELLATION EFFECT (Modified to "Bubble") ---
  useEffect(() => {
    // PERFORMANCE: Disable particles on mobile/tablet
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileUA || isSmallScreen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Throttle Resize
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationFrameId: number;

    const particles: Particle[] = [];
    // UPDATED: Increased density (Dividing by smaller number = more particles)
    const particleCount = Math.floor((width * height) / 7500);

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      baseSize: number;
      speedX: number;
      speedY: number;
      type: 'cross' | 'dot';
      isInteracting: boolean = false; // Track interaction status
      colorR: number;
      colorG: number;
      colorB: number;
      targetColorR: number;
      targetColorG: number;
      targetColorB: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.baseSize = Math.random() * 1.5 + 0.5; // Base size
        this.size = this.baseSize;
        this.speedX = (Math.random() * 0.5) - 0.25;
        this.speedY = (Math.random() * 0.5) - 0.25;
        this.type = Math.random() > 0.5 ? 'cross' : 'dot';
        this.colorR = 255;
        this.colorG = 255;
        this.colorB = 255;
        this.targetColorR = 255;
        this.targetColorG = 255;
        this.targetColorB = 255;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Drift logic
        const drift = 50;
        if (this.x > this.baseX + drift || this.x < this.baseX - drift) this.speedX *= -1;
        if (this.y > this.baseY + drift || this.y < this.baseY - drift) this.speedY *= -1;

        // Interaction with mouse - Bubble Effect
        let scale = 1;
        if (mouseRef.current.x != null && mouseRef.current.y != null) {
          let dx = mouseRef.current.x - this.x;
          let dy = mouseRef.current.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          if (distance < maxDistance) {
            // Calculate scale based on proximity (closer = bigger)
            const proximity = 1 - (distance / maxDistance);
            scale = 1 + (proximity * 10); // Max 4x size

            this.isInteracting = true;

            // Set target color to orange
            this.targetColorR = 254;
            this.targetColorG = 68;
            this.targetColorB = 3;

          } else {
            this.isInteracting = false;
            // Set target color to white
            this.targetColorR = 255;
            this.targetColorG = 255;
            this.targetColorB = 255;
          }
        } else {
          this.isInteracting = false;
          // Set target color to white
          this.targetColorR = 255;
          this.targetColorG = 255;
          this.targetColorB = 255;
        }

        // Smoothly interpolate size and color
        const interpolationFactor = 0.1;
        this.size = this.size + (this.baseSize * scale - this.size) * interpolationFactor;

        this.colorR = this.colorR + (this.targetColorR - this.colorR) * interpolationFactor;
        this.colorG = this.colorG + (this.targetColorG - this.colorG) * interpolationFactor;
        this.colorB = this.colorB + (this.targetColorB - this.colorB) * interpolationFactor;

        return this.size;
      }

      draw(currentSize: number) {
        if (!ctx) return;
        // Reduced Opacity for elements
        ctx.fillStyle = `rgba(${this.colorR}, ${this.colorG}, ${this.colorB}, 0.35)`;
        ctx.strokeStyle = `rgba(${this.colorR}, ${this.colorG}, ${this.colorB}, 0.15)`;

        if (this.type === 'dot') {
          // UPDATED: Replaced rect with arc to make them round
          ctx.beginPath();
          ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw a cross
          const s = currentSize * 1.2; // Slightly smaller multiplier
          ctx.beginPath();
          ctx.moveTo(this.x - s, this.y);
          ctx.lineTo(this.x + s, this.y);
          ctx.moveTo(this.x, this.y - s);
          ctx.lineTo(this.x, this.y + s);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        const currentSize = p.update();
        p.draw(currentSize);
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.x;
      mouseRef.current.y = e.y;
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);


  const getHoveredColumnIndex = (id: number | null) => {
    if (!id) return -1;
    if (id === 1) return 0; // About Me
    if (id === 2) return 1; // Game Design
    if (id === 3) return 2; // Tech Art
    if (id === 4 || id === 5) return 3; // Music & Others
    return -1;
  };

  const hoveredColumnIndex = getHoveredColumnIndex(hoveredId);

  // Updated Column Structure: About, GD, TA are singles. Music/Others stacked.
  const columns = [
    { type: 'single', items: [menuItems[0]] }, // About
    { type: 'single', items: [menuItems[1]] }, // Game Design
    { type: 'single', items: [menuItems[2]] }, // Tech Art
    { type: 'stacked', items: [menuItems[3], menuItems[4]] }, // Music & Others
  ];

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full animate-fade-in-fast">

      {/* --- INTERACTIVE BACKGROUND LAYER (Canvas) --- */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* --- STATIC DECORATIVE ELEMENTS (Hide on small mobile to reduce clutter) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">

        {/* Horizontal Lines - Top & Bottom framing the grid */}
        <div className="absolute top-[12vh] left-0 w-full flex justify-center opacity-20">
          <div className="w-[94%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
        <div className="absolute bottom-[12vh] left-0 w-full flex justify-center opacity-20">
          <div className="w-[94%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>

        {/* Flavor Text Vertical */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.3em] text-white/30 font-light whitespace-nowrap" style={{ fontFamily: "'ITC Avant Garde Gothic Pro XLt', sans-serif" }}>
          MAIN_SEQUENCE // A-01
        </div>

        {/* Asymmetrical Orbit Rings (Breaking symmetry) */}
        <div className="absolute top-1/4 left-[10%] w-[40vh] h-[40vh] border border-white/5 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[60vh] h-[60vh] border border-white/5 rounded-full opacity-20 pointer-events-none border-dashed" />

        {/* Corner Elements (SVG Brackets) */}
        <svg className="absolute top-6 left-6 w-12 h-12 opacity-30 pointer-events-none" viewBox="0 0 100 100">
          <path d="M0 30 V0 H30" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <svg className="absolute top-6 right-6 w-12 h-12 opacity-30 pointer-events-none rotate-90" viewBox="0 0 100 100">
          <path d="M0 30 V0 H30" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <svg className="absolute bottom-6 left-6 w-12 h-12 opacity-30 pointer-events-none -rotate-90" viewBox="0 0 100 100">
          <path d="M0 30 V0 H30" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <svg className="absolute bottom-6 right-6 w-12 h-12 opacity-30 pointer-events-none rotate-180" viewBox="0 0 100 100">
          <path d="M0 30 V0 H30" fill="none" stroke="white" strokeWidth="2" />
        </svg>

      </div>

      {/* --- HUD HEADER --- */}
      <div className="absolute top-4 md:top-8 left-0 w-full px-6 md:px-12 flex justify-between items-start z-50">

        {/* Left: Branding */}
        <button
          onClick={onHeaderClick}
          className="flex flex-col text-left group focus:outline-none pointer-events-auto cursor-pointer"
        >
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white leading-none group-hover:text-white/80 transition-colors" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
            ANGELO CRUZ
          </h1>
          <span className="text-[9px] md:text-xs tracking-[0.2em] text-[#FE4403] font-bold uppercase mt-1" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
            Game Designer Portfolio
          </span>
        </button>

        {/* Right: Responsive Content Swap (Score vs Language) */}
        <div className="flex items-center gap-3">

          {/* DESKTOP: SCORE (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3 pointer-events-none">
            <span className="text-white/60 text-[10px] md:text-xs tracking-widest uppercase font-medium" style={{ fontFamily: "'ITC Avant Garde Gothic Pro XLt', sans-serif" }}>
              {t('hud_score')}: {score.toString().padStart(6, '0')}
            </span>
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
          </div>

          {/* MOBILE: LANGUAGE TOGGLE (Hidden on Desktop) */}
          <div className="md:hidden pointer-events-auto">
            <div className="flex items-center bg-black/40 border border-white/20 backdrop-blur-md p-1 gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`
                            relative px-3 py-1 text-[10px] font-bold tracking-widest transition-all duration-300
                            ${language === 'en'
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                    : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                EN
                {/* Active Indicator Line */}
                {language === 'en' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FE4403]" />
                )}
              </button>

              <div className="w-[1px] h-3 bg-white/10" />

              <button
                onClick={() => setLanguage('es')}
                className={`
                            relative px-3 py-1 text-[10px] font-bold tracking-widest transition-all duration-300
                            ${language === 'es'
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                    : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ES
                {/* Active Indicator Line */}
                {language === 'es' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FE4403]" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>


      {/* --- MAIN MENU GRID --- */}
      {/* 
          Mobile: flex-col with overflow-auto to allow scrolling if screen is too short. 
          Desktop: flex-row with fixed height. 
      */}
      {/* --- DESKTOP MENU (Flex Row / Accordion) --- */}
      <div className="hidden md:flex flex-row items-stretch justify-center z-10 w-full px-12 h-[70vh] gap-0">
        {columns.map((col, colIndex) => {
          const isColumnActive = hoveredColumnIndex === colIndex;
          const isStacked = col.type === 'stacked';

          let columnFlexClass = 'flex-1';
          if (isColumnActive) {
            columnFlexClass = isStacked ? 'flex-[1.5]' : 'flex-[4]';
          }

          const maxWidthClass = isStacked
            ? 'md:max-w-[45vh] lg:md:max-w-[52vh]'
            : 'md:max-w-[60vh] lg:max-w-[70vh]';

          return (
            <div
              key={colIndex}
              className={`${columnFlexClass} flex flex-col transition-all duration-500 ease-out border-r border-white/10 last:border-r-0 ${maxWidthClass} w-full`}
            >
              {col.items.map((item, itemIndex) => {
                const isItemHovered = hoveredId === item.id;
                let rowFlexClass = 'flex-1';
                let isSiblingHovered = false;

                if (isStacked && isColumnActive) {
                  if (isItemHovered) {
                    rowFlexClass = 'flex-[3]';
                  } else {
                    rowFlexClass = 'flex-[1]';
                    isSiblingHovered = true;
                  }
                }

                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    isHovered={isItemHovered}
                    isSiblingHovered={isSiblingHovered}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onCardClick={onCardClick}
                    isStacked={isStacked}
                    flexClass={rowFlexClass}
                    className={`
                        ${isStacked && itemIndex === 0 ? 'border-b border-white/10' : ''} 
                        w-full h-full min-h-0
                    `}
                    style={{ animationDelay: `${(item.id - 1) * 100}ms` }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* --- MOBILE MENU (Grid) --- */}
      <div className="grid md:hidden grid-cols-2 gap-2 p-4 w-full z-10 mt-16 pb-20 overflow-y-auto">
        {menuItems.map((item) => {
          const isItemHovered = hoveredId === item.id;
          return (
            <MenuCard
              key={item.id}
              item={item}
              isHovered={isItemHovered}
              isSiblingHovered={false}
              // For mobile grid, logic: Tap 1 -> Expand/Hover, Tap 2 -> Go
              onMouseEnter={() => { }} // Disable hover on mobile
              onMouseLeave={() => { }}
              onCardClick={(id) => {
                if (hoveredId !== id) {
                  setHoveredId(id);
                } else {
                  onCardClick(id);
                }
              }}
              isStacked={false}
              flexClass=""
              className={`
                        aspect-square w-full shadow-lg border border-white/10 transition-all duration-300
                        ${isItemHovered ? 'col-span-2' : 'col-span-1'}
                      `}
              style={{ animationDelay: `${(item.id - 1) * 100}ms` }}
            />
          );
        })}
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

        {/* Right: Responsive Content Swap (Language vs Score) */}
        <div className="flex items-center justify-end">

          {/* DESKTOP: LANGUAGE TOGGLE (Hidden on Mobile) */}
          <div className="hidden md:block pointer-events-auto">
            <div className="flex items-center bg-black/40 border border-white/20 backdrop-blur-md p-1 gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`
                            relative px-4 py-1 text-xs font-bold tracking-widest transition-all duration-300
                            ${language === 'en'
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                    : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                EN
                {/* Active Indicator Line */}
                {language === 'en' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FE4403]" />
                )}
              </button>

              <div className="w-[1px] h-3 bg-white/10" />

              <button
                onClick={() => setLanguage('es')}
                className={`
                            relative px-4 py-1 text-xs font-bold tracking-widest transition-all duration-300
                            ${language === 'es'
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                    : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ES
                {/* Active Indicator Line */}
                {language === 'es' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FE4403]" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE: SCORE (Hidden on Desktop) */}
          <div className="flex md:hidden items-center gap-3 pointer-events-none">
            <span className="text-white/60 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: "'ITC Avant Garde Gothic Pro XLt', sans-serif" }}>
              {t('hud_score')}: {score.toString().padStart(6, '0')}
            </span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainMenu;
