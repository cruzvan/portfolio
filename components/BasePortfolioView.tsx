
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import ProjectDetailView from './ProjectDetailView';
import { ProjectCardData, slugify } from '../data/projectData';
import { useLanguage } from '../contexts/LanguageContext';

// --- TYPES ---
export interface BasePortfolioViewProps {
  title: string;
  projects: ProjectCardData[];
  categories: string[];
  onClose: () => void;
  baseRoute?: string; // e.g. "#game-design"
}

// --- CARD COMPONENT (With 3D Tilt) ---
interface ProjectCardProps {
  project: ProjectCardData;
  index: number;
  onClick: (project: ProjectCardData) => void;
  language: 'en' | 'es';
  t: (key: any) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick, language, t }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [isHovered, setIsHovered] = useState(false);
  
  // Ref for throttling
  const rafRef = useRef<number | null>(null);

  // 3D Tilt Logic - Throttled
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable heavy tilt on mobile touch via check if hover triggered naturally
    if (project.locked || !cardRef.current || rafRef.current) return;

    const x = e.clientX;
    const y = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const mouseX = x - rect.left;
        const mouseY = y - rect.top;
        
        // Calculate relative position (0 to 1)
        const xPct = (mouseX / rect.width) - 0.5;
        const yPct = (mouseY / rect.height) - 0.5;
        
        const maxRotate = 5; // Reduced rotation for tighter spacing
        // Rotate calculation
        const xRot = yPct * -maxRotate; 
        const yRot = xPct * maxRotate;

        setTransform(`perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.02, 1.02, 1.02)`);
        rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }
    setIsHovered(false);
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  const isLocked = project.locked;

  return (
    <div 
      ref={cardRef}
      // UPDATED DIMENSIONS: Using VH units for desktop (md) to scale with screen height.
      // Mobile: Fixed pixel size.
      // Desktop (md): Height 55vh, Width 32vh (maintains aspect ratio based on height).
      className={`relative flex-shrink-0 w-[160px] h-[260px] md:w-[32vh] md:h-[55vh] group select-none transition-all duration-300 ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => !isLocked && onClick(project)}
      style={{
        transform: isHovered && !isLocked ? transform : undefined,
        zIndex: isHovered ? 10 : 1, // Bring to front on hover
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        animation: `slide-up-fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Container Content */}
      <div className="w-full h-full relative overflow-hidden bg-[#0a0a0a]/80 border border-white/10 shadow-2xl backdrop-blur-sm">
        
        {/* --- Image & Shader Layer --- */}
        <div className="absolute inset-0 w-full h-full bg-black">
           {isLocked ? (
             <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${isHovered ? 'grayscale blur-sm' : 'grayscale-0 blur-0'}`}
                style={{ backgroundImage: `url(${project.image})` }}
             />
           ) : (
            <>
              {/* Main Image - Full Color, Fades out on hover to show glitches */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-200 ${isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                style={{ backgroundImage: `url(${project.image})` }}
              />
              
              {/* Glitch Overlay on Hover */}
              <div className={`absolute inset-0 w-full h-full bg-black transition-opacity duration-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`absolute inset-0 w-full h-full bg-cover bg-center bg-red-600 bg-blend-multiply mix-blend-screen contrast-125 brightness-150 ${isHovered ? 'animate-glitch-1' : ''}`} 
                      style={{ backgroundImage: `url(${project.image})` }} />
                  <div className={`absolute inset-0 w-full h-full bg-cover bg-center bg-blue-600 bg-blend-multiply mix-blend-screen contrast-125 brightness-150 ${isHovered ? 'animate-glitch-2' : ''}`} 
                      style={{ backgroundImage: `url(${project.image})` }} />
              </div>
            </>
           )}

           {/* Vignette & Gradient */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        </div>

        {/* --- Top Status Bar --- */}
        <div className="absolute top-0 left-0 w-full p-3 md:p-4 flex justify-between items-start z-20">
            <div 
                className={`bg-white/10 backdrop-blur-md px-2 py-1 text-[9px] md:text-[1.2vh] font-bold uppercase tracking-widest border-l-2 ${isHovered && !isLocked ? 'border-[#FE4403] text-white' : 'border-white text-white'}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                {project.status}
            </div>
        </div>

        {/* --- Bottom Content --- */}
        <div className="absolute bottom-0 left-0 w-full z-20">
            
            {/* Hover Action Bar */}
            <div className={`w-full h-1 bg-[#FE4403] transform origin-left transition-transform duration-300 ${isHovered && !isLocked ? 'scale-x-100' : 'scale-x-0'}`} />
            
            <div className={`p-4 md:p-5 2xl:p-6 transition-all duration-300 ${isHovered && !isLocked ? 'bg-[#FE4403] translate-y-0' : 'bg-transparent translate-y-0'}`}>
                
                {/* Title */}
                <h3 className="text-lg md:text-2xl 2xl:text-3xl font-bold uppercase leading-none tracking-tight mb-2 md:mb-3 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {project.title}
                </h3>

                {/* Sub-Location/Detail - Updated to Multi-Tags */}
                <div className="flex flex-col gap-1 border-t border-white/20 pt-2 md:pt-3 mt-2">
                    {isHovered && isLocked ? (
                        <div className="flex items-center justify-between">
                            <span className={`text-[8px] md:text-[1.1vh] uppercase tracking-widest font-medium text-white`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {t('in_progress')}
                            </span>
                            <Lock size={24} className="text-[#FE4403]" />
                        </div>
                    ) : (
                        project.tags.slice(0, 3).map((tag, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className={`text-[8px] md:text-[1.1vh] uppercase tracking-widest font-medium ${isHovered && !isLocked ? 'text-black font-bold' : 'text-white'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    {tag}
                                </span>
                                {isHovered && !isLocked && i === 2 && <ArrowRight size={24} className="text-black" />}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* --- Selection Border --- */}
        <div className={`absolute inset-0 border-[3px] transition-colors duration-200 pointer-events-none z-30 ${isHovered && !isLocked ? 'border-[#FE4403]' : 'border-transparent'}`} />

      </div>
    </div>
  );
};


// --- MAIN VIEW COMPONENT ---
const BasePortfolioView: React.FC<BasePortfolioViewProps> = ({ title, projects, categories, onClose, baseRoute }) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectCardData | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs for custom smooth scrolling physics
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationFrameRef = useRef<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  // --- ROUTING / DEEP LINKING HANDLER ---
  useEffect(() => {
    if (!baseRoute) return;

    const handleHashChange = () => {
        const hash = window.location.hash.toLowerCase();
        
        // Exact match with base route -> Close detail
        if (hash === baseRoute) {
            setSelectedProject(null);
        } 
        // Sub-route match -> Open detail
        else if (hash.startsWith(baseRoute + '/')) {
            const slug = hash.split('/')[1];
            if (slug) {
                const project = projects.find(p => slugify(p.title) === slug);
                if (project && !project.locked) {
                    setSelectedProject(project);
                }
            }
        }
    };

    // Run on mount to check initial URL
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [baseRoute, projects]);


  // Filter projects based on TAGS
  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => {
        const categoryUpper = activeCategory.toUpperCase();
        return p.tags.includes(categoryUpper) || p.category === activeCategory;
    });

  // --- SMOOTH SCROLL LOOP ---
  const smoothScrollLoop = () => {
    if (!scrollContainerRef.current) return;

    // Linear Interpolation (Lerp) for smoothness
    const factor = 0.1; 
    const diff = targetScrollRef.current - currentScrollRef.current;

    if (Math.abs(diff) > 0.5) {
      currentScrollRef.current += diff * factor;
      scrollContainerRef.current.scrollLeft = currentScrollRef.current;
      animationFrameRef.current = requestAnimationFrame(smoothScrollLoop);
    } else {
      currentScrollRef.current = targetScrollRef.current;
      scrollContainerRef.current.scrollLeft = targetScrollRef.current;
      isAnimatingRef.current = false;
    }
  };

  const startSmoothScroll = (delta: number) => {
    if (!scrollContainerRef.current) return;

    if (!isAnimatingRef.current) {
        currentScrollRef.current = scrollContainerRef.current.scrollLeft;
        targetScrollRef.current = scrollContainerRef.current.scrollLeft;
        isAnimatingRef.current = true;
        
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(smoothScrollLoop);
    }

    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
    targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetScrollRef.current + delta));
  };

  const handleWheel = (e: React.WheelEvent) => {
    const multiplier = 3; 
    startSmoothScroll(e.deltaY * multiplier);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);


  // --- DRAG TO SCROLL LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    cancelAnimationFrame(animationFrameRef.current);
    isAnimatingRef.current = false;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = startScrollLeft - walk;
    
    currentScrollRef.current = scrollContainerRef.current.scrollLeft;
    targetScrollRef.current = scrollContainerRef.current.scrollLeft;
  };

  // Handle opening a project
  const handleProjectClick = (project: ProjectCardData) => {
    if (!isDragging && !project.locked) {
        if (baseRoute) {
            // Update URL to enable deep linking / history
            window.location.hash = `${baseRoute}/${slugify(project.title)}`;
        } else {
            // Fallback if no routing enabled
            setSelectedProject(project);
        }
    }
  };

  const handleCloseDetail = () => {
      if (baseRoute) {
          // Go back to base route URL
          window.location.hash = baseRoute;
      } else {
          setSelectedProject(null);
      }
  };

  return (
    <div className="relative flex flex-col w-full h-full animate-fade-in-fast">
      
      {/* SHOW DETAIL VIEW OVERLAY IF SELECTED */}
      {selectedProject && (
        <ProjectDetailView project={selectedProject} onClose={handleCloseDetail} />
      )}

      {/* 
          PERFORMANCE OPTIMIZATION: 
          Only render the List View if NO project is selected.
          This prevents the background scene (with all its shaders/images) from 
          consuming resources while the Detail View is active.
      */}
      {!selectedProject && (
        <>
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="absolute top-0 left-0 w-full z-40 bg-gradient-to-b from-black via-black/80 to-transparent pt-4 md:pt-8 pb-4 md:pb-12 px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/20 pb-2">
                    <h1 className="text-xl md:text-2xl 2xl:text-3xl font-bold tracking-tighter text-white mb-2 md:mb-0" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
                        {title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-1 md:gap-4 2xl:gap-8 mt-2 md:mt-0">
                        <button 
                            onClick={() => setActiveCategory('All')}
                            className={`text-[9px] md:text-xs 2xl:text-base uppercase tracking-widest pb-2 transition-all duration-300 font-bold ${activeCategory === 'All' ? 'text-white border-b-4 border-[#FE4403]' : 'text-white/40 hover:text-white border-b-4 border-transparent'}`}
                            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                        >
                            {t('all_targets')}
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex items-center gap-1 md:gap-2 text-[9px] md:text-xs 2xl:text-base uppercase tracking-widest pb-2 transition-all duration-300 font-bold ${activeCategory === cat ? 'text-white border-b-4 border-[#FE4403]' : 'text-white/40 hover:text-white border-b-4 border-transparent'}`}
                                style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            {/* UPDATED: Increased top padding for better breathing room on FHD */}
            <div className="flex-grow flex items-center justify-center w-full h-full pt-16 md:pt-24 2xl:pt-28 pb-8 px-0 md:px-12">
                {/* UPDATED: Container height based on VH (65vh) to accommodate 55vh cards + scrollbar */}
                <div className="relative w-full h-[60vh] md:h-[65vh] bg-black/20 border-y border-white/10 backdrop-blur-sm group">
                    <div 
                        ref={scrollContainerRef}
                        className="w-full h-full overflow-x-auto flex items-center gap-4 md:gap-4 2xl:gap-6 px-8 md:px-12 cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel} 
                        style={{ scrollBehavior: 'auto' }} 
                    >
                        {filteredProjects.map((project, index) => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                index={index} 
                                onClick={handleProjectClick}
                                language={language}
                                t={t}
                            />
                        ))}
                    </div>

                    {/* Back Button - Positioned absolutely below the container on Mobile, and relatively/absolutely on Desktop */}
                    <div className="absolute right-4 top-full mt-4 md:right-0 md:mt-4 pointer-events-auto z-50">
                        <button
                            onClick={onClose}
                            className="bg-gray-300/80 text-black px-8 py-2 md:px-12 md:py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-200 text-sm md:text-lg shadow-lg"
                            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                        >
                            {t('back')}
                        </button>
                    </div>
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
        </>
      )}

    </div>
  );
};

export default BasePortfolioView;
