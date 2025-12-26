
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ExternalLink, Maximize2, Users, Calendar, ChevronDown, Cpu, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjectContent, TagContentSection, ProjectCardData } from '../data/projectData';
import { useLanguage } from '../contexts/LanguageContext';

// Re-exporting ProjectCardData as Project for backward compatibility if needed, 
// or using ProjectCardData directly.
export type Project = ProjectCardData;

interface ProjectDetailProps {
    project: Project;
    onClose: () => void;
}

// --- OPTIMIZED COMPONENT: LAZY VIDEO ---
const VideoCard: React.FC<{ src: string, index: number }> = ({ src, index }) => {
    const [play, setPlay] = useState(false);

    // Extract YouTube ID safely
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(src);
    const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-px bg-white/20 flex-grow" />
                <span className="text-xs uppercase tracking-widest text-[#FE4403] font-bold">Log {String(index + 1).padStart(2, '0')}</span>
            </div>

            <div className="aspect-video w-full border border-white/10 shadow-2xl shadow-black relative group bg-black overflow-hidden">
                {!play ? (
                    <button
                        onClick={() => setPlay(true)}
                        className="w-full h-full relative flex items-center justify-center group/btn"
                    >
                        {thumbnailUrl && (
                            <img
                                src={thumbnailUrl}
                                alt="Video thumbnail"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/btn:opacity-80 transition-opacity duration-500"
                                loading="lazy"
                            />
                        )}
                        <div className="relative z-10 w-16 h-16 rounded-full border border-[#FE4403] flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover/btn:scale-110 transition-transform">
                            <Play fill="white" className="text-white ml-1" />
                        </div>
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#FE4403]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#FE4403]" />
                    </button>
                ) : (
                    <iframe
                        className="w-full h-full"
                        src={src}
                        title={`Project Video ${index}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                )}
            </div>
        </div>
    );
};

const ProjectDetailView: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
    const { language, t } = useLanguage();

    // Fetch content from data file based on project title AND language
    const projectContent = useMemo(() => getProjectContent(project.title, language), [project.title, language]);

    // Generate dynamic sections based on tags
    const dynamicSections = useMemo(() => [
        { id: 'overview', label: t('overview'), type: 'intro', tagName: '' },
        ...(project.tags || []).map((tag: string) => ({
            id: `content-${tag.toLowerCase().replace(/\s+/g, '-')}`,
            label: tag,
            type: 'content',
            tagName: tag
        })),
        { id: 'gallery', label: t('gallery'), type: 'gallery', tagName: '' },
        { id: 'videos', label: t('videos'), type: 'videos', tagName: '' },
    ], [project.tags, t]);

    const [activeSection, setActiveSection] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // --- LIGHTBOX NAVIGATION & SWIPE ---
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleLightboxNavigation = useCallback((direction: 'next' | 'prev') => {
        if (!lightboxImage) return;
        const gallery = projectContent.gallery;
        const currentIndex = gallery.indexOf(lightboxImage);

        if (currentIndex === -1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % gallery.length;
        } else {
            newIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        }
        setLightboxImage(gallery[newIndex]);
    }, [lightboxImage, projectContent.gallery]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxImage) return;
            if (e.key === 'ArrowRight') handleLightboxNavigation('next');
            if (e.key === 'ArrowLeft') handleLightboxNavigation('prev');
            if (e.key === 'Escape') setLightboxImage(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage, handleLightboxNavigation]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) handleLightboxNavigation('next');
        if (isRightSwipe) handleLightboxNavigation('prev');

        setTouchStart(0);
        setTouchEnd(0);
    };

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // --- CUSTOM SCROLL PHYSICS ---
    const scrollToSection = useCallback((id: string) => {
        const el = sectionRefs.current[id];
        if (el) {
            el.scrollTop = 0;
            setActiveSection(id);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    useEffect(() => {
        const activeEl = sectionRefs.current[activeSection];

        const handleWheel = (e: WheelEvent) => {
            if (isScrolling) {
                e.preventDefault();
                return;
            }

            const currentSectionEl = sectionRefs.current[activeSection];
            if (!currentSectionEl) return;

            const isScrollable = currentSectionEl.scrollHeight > currentSectionEl.clientHeight;
            const isAtBottom = Math.abs((currentSectionEl.scrollTop + currentSectionEl.clientHeight) - currentSectionEl.scrollHeight) < 2;
            const isAtTop = currentSectionEl.scrollTop <= 0;

            const currentIndex = dynamicSections.findIndex(s => s.id === activeSection);
            if (currentIndex === -1) return;

            if (e.deltaY > 0) { // Scrolling Down
                if (isScrollable && !isAtBottom) {
                    return; // Natural internal scroll
                } else {
                    e.preventDefault(); // Hijack
                    const nextIndex = Math.min(currentIndex + 1, dynamicSections.length - 1);
                    if (nextIndex !== currentIndex) {
                        setIsScrolling(true);
                        scrollToSection(dynamicSections[nextIndex].id);
                        setTimeout(() => setIsScrolling(false), 800);
                    }
                }
            } else if (e.deltaY < 0) { // Scrolling Up
                if (isScrollable && !isAtTop) {
                    return; // Natural internal scroll
                } else {
                    e.preventDefault(); // Hijack
                    const nextIndex = Math.max(currentIndex - 1, 0);
                    if (nextIndex !== currentIndex) {
                        setIsScrolling(true);
                        scrollToSection(dynamicSections[nextIndex].id);
                        setTimeout(() => setIsScrolling(false), 800);
                    }
                }
            }
        };

        // On mobile, native scrolling doesn't use this wheel handler in the same way,
        // so we don't rely on it for mobile section tracking.
        if (activeEl && window.matchMedia("(min-width: 768px)").matches) {
            activeEl.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (activeEl) {
                activeEl.removeEventListener('wheel', handleWheel);
            }
        };
    }, [activeSection, isScrolling, dynamicSections, scrollToSection]);

    // --- MOBILE SCROLL HANDLER ---
    // Tracks native scroll position to update activeSection and trigger background blur
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Only process if not currently auto-scrolling (prevents jitter)
        if (isScrolling) return;

        const container = e.currentTarget;
        // Trigger point is 1/3 down the screen to feel responsive
        const scrollPosition = container.scrollTop + (window.innerHeight / 3);

        for (const section of dynamicSections) {
            const el = sectionRefs.current[section.id];
            if (el) {
                const { offsetTop, offsetHeight } = el;
                if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                    if (activeSection !== section.id) {
                        setActiveSection(section.id);
                    }
                    return;
                }
            }
        }
    };

    const getContentForTag = (tag: string): TagContentSection => {
        // Look up the tag in the specific project's content
        if (projectContent.tagContent && projectContent.tagContent[tag]) {
            return projectContent.tagContent[tag];
        }

        // Generic fallback if specific tag data is missing in data/projectData.ts
        return {
            headline: `${tag} Analysis`,
            textBlock1: language === 'es'
                ? `Desglose detallado de los flujos de trabajo y metodologías utilizadas en ${tag}. Los datos específicos se están compilando.`
                : `Detailed breakdown of the workflows, methodologies, and tools used to achieve excellent results in ${tag}. The specific data for this section is currently being compiled for the portfolio database.`,
            textBlock2: language === 'es'
                ? "Nos enfocamos en procesos iterativos, asegurando que cada mecánica fuera probada a fondo."
                : "We focused heavily on iterative processes, ensuring that each mechanic was playtested thoroughly.",
            textBlock3: language === 'es'
                ? "Las limitaciones técnicas nos obligaron a buscar soluciones creativas."
                : "Technical limitations forced us to come up with creative solutions, resulting in a more unique final product.",
            textBlock4: language === 'es'
                ? `En conclusión, la fase de ${tag} fue crítica para el éxito del proyecto.`
                : `In conclusion, the ${tag} phase was critical to the project's success.`,
            bullets: ["Research", "Implementation", "Polish", "Optimization", "Testing", "Documentation"]
        };
    };

    // Safe external link handler
    const externalLinkUrl = projectContent.externalLink || `https://www.google.com/search?q=${encodeURIComponent(project.title + " Game Development Project")}`;

    return (
        <div className="fixed inset-0 z-50 bg-black text-white font-sans animate-fade-in-fast" style={{ overscrollBehavior: 'none' }}>

            {/* --- BACKGROUND LAYER --- */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${projectContent.overviewImage || project.image})` }}
            />

            {/* --- OVERLAY LAYERS --- */}
            <div className={`absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-700 ${activeSection === 'overview' ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 z-0 backdrop-blur-md md:backdrop-blur-2xl bg-black/80 transition-opacity duration-700 ${activeSection !== 'overview' ? 'opacity-100' : 'opacity-0'}`} />

            {/* --- LIGHTBOX MODAL --- */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in-fast cursor-zoom-out backdrop-blur-sm"
                    onClick={() => setLightboxImage(null)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Prev Button */}
                    <button
                        className="absolute left-2 md:left-8 p-4 text-white/50 hover:text-[#FE4403] hover:scale-110 transition-all z-[110]"
                        onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('prev'); }}
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div
                        className="relative w-auto h-auto max-w-[75vw] max-h-[75vh] flex items-center justify-center select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={lightboxImage}
                            alt="Fullscreen"
                            className="w-full h-full object-contain shadow-2xl border border-white/10 bg-black"
                        />
                    </div>

                    {/* Next Button */}
                    <button
                        className="absolute right-2 md:right-8 p-4 text-white/50 hover:text-[#FE4403] hover:scale-110 transition-all z-[110]"
                        onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('next'); }}
                    >
                        <ChevronRight size={48} />
                    </button>

                    <button
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white p-2 transition-colors z-[110]"
                        onClick={() => setLightboxImage(null)}
                    >
                        <X size={48} />
                    </button>
                </div>
            )}

            {/* --- FLOATING NAVIGATION (LEFT) - HIDDEN ON MOBILE --- */}
            <div className={`fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                {dynamicSections.map((sec) => (
                    <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`text-left group relative py-1 transition-all duration-300`}
                    >
                        <span
                            className={`text-xs md:text-sm tracking-[0.2em] uppercase font-bold transition-all duration-300 drop-shadow-md ${activeSection === sec.id
                                    ? 'text-white text-shadow-glow scale-110 origin-left'
                                    : 'text-white/50 hover:text-white'
                                }`}
                            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                        >
                            {sec.label}
                        </span>
                        <span className={`absolute -left-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#FE4403] transition-all duration-300 ${activeSection === sec.id ? 'w-3' : 'w-0'}`} />
                    </button>
                ))}
            </div>

            {/* --- FLOATING ACTIONS (BOTTOM RIGHT) --- */}
            <div className={`fixed bottom-4 md:bottom-8 right-4 md:right-12 z-50 flex gap-4 items-end transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Functional External Files Button */}
                <a
                    href={externalLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 md:h-12 items-center gap-2 px-6 md:px-12 bg-white/5 border border-white/10 hover:bg-[#FE4403] hover:border-[#FE4403] backdrop-blur-md transition-all duration-300 group"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{t('external_files')}</span>
                    <ExternalLink size={14} className="text-white group-hover:rotate-45 transition-transform" />
                </a>

                <button
                    onClick={onClose}
                    className="flex h-10 md:h-12 items-center gap-3 px-6 md:px-8 bg-white hover:bg-[#FE4403] text-black hover:text-white transition-colors duration-300 shadow-xl"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>{t('back')}</span>
                    <X size={18} />
                </button>
            </div>

            {/* --- MAIN SCROLL CONTAINER --- */}
            {/* 
          MOBILE FIX: Changed overflow-hidden to overflow-y-auto on parent to allow native scrolling.
          Desktop retains md:overflow-hidden for the scroll-jack effect.
          Added onScroll handler to track sections on mobile/tablet native scrolling.
      */}
            <div
                className="relative w-full h-full overflow-y-auto md:overflow-hidden scroll-smooth"
                onScroll={handleScroll}
            >

                {/* === SECTION 1: OVERVIEW === */}
                {/* 
            MOBILE FIX: Changed h-screen to min-h-screen and overflow-visible. 
            This allows sections to stack naturally on mobile.
        */}
                <section
                    id="overview"
                    ref={(el) => { if (el) sectionRefs.current['overview'] = el; }}
                    className="relative w-full min-h-screen md:h-screen md:overflow-y-auto overflow-visible"
                >
                    <div className="relative z-10 w-full min-h-screen px-4 md:px-8 flex flex-col items-center justify-center text-center py-20">
                        <div className="animate-slide-up-fade-in flex flex-col items-center" style={{ animationDelay: '0.1s' }}>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-tighter text-white mb-8 md:mb-12 leading-[0.9] drop-shadow-[0_0_30px_rgba(0,0,0,1)] break-words max-w-full" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
                                {project.title}
                            </h1>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/20 pt-8 mt-4 w-full max-w-4xl bg-black/80 backdrop-blur-md p-6 md:p-8 rounded-sm">
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[#FE4403] tracking-widest flex items-center gap-2 font-bold"><Users size={12} /> {t('responsibilities')}</span>
                                    <div className="flex flex-col gap-1">
                                        {project.tags.map((tag: string, i: number) => (
                                            <span key={i} className="text-[13px] md:text-[15px] font-semibold tracking-wide text-white/90">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[#FE4403] tracking-widest flex items-center gap-2 font-bold"><Cpu size={12} /> {t('software')}</span>
                                    <div className="flex flex-col gap-1">
                                        {projectContent.software.map((sw: string, i: number) => (
                                            <span key={i} className="text-[13px] md:text-[15px] font-semibold tracking-wide text-white/90">{sw}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[#FE4403] tracking-widest flex items-center gap-2 font-bold"><Calendar size={12} /> {t('duration')}</span>
                                    <span className="text-[13px] md:text-[15px] font-semibold tracking-wide text-white/90">{projectContent.duration}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-80">
                            <span className="text-[10px] uppercase tracking-widest mb-2 text-white">Scroll</span>
                            <ChevronDown className="text-white" />
                        </div>
                    </div>
                </section>


                {/* === DYNAMIC CONTENT SECTIONS === */}
                {dynamicSections.filter(s => s.type === 'content').map((sec, index) => {
                    const content = getContentForTag(sec.tagName || "");
                    const gallery = projectContent.gallery;

                    // Logic: 3 Unique images per tag section
                    const baseImgIndex = index * 3;
                    const sectionImage1 = gallery[baseImgIndex] || project.image;
                    const sectionImage2 = gallery[baseImgIndex + 1] || project.image;
                    const sectionImage3 = gallery[baseImgIndex + 2] || project.image;

                    return (
                        <section
                            key={sec.id}
                            id={sec.id}
                            ref={(el) => { if (el) sectionRefs.current[sec.id] = el; }}
                            className="relative w-full min-h-screen md:h-screen md:overflow-y-auto overflow-visible"
                        >
                            <div className="min-h-screen flex flex-col items-center py-16 md:py-20 px-4 md:px-8 md:pl-48">

                                <div className="w-full max-w-7xl space-y-8 md:space-y-12 mb-20">

                                    {/* --- HEADER --- */}
                                    <div className="border-b border-white/10 pb-8 flex flex-col gap-4">
                                        <div>
                                            <h2 className="text-3xl md:text-6xl font-bold uppercase tracking-tight text-white mb-2" style={{ fontFamily: "'UniversNextW04-620CondBold', sans-serif" }}>
                                                {sec.label}
                                            </h2>
                                            <div className="w-16 md:w-24 h-1 bg-[#FE4403]" />
                                        </div>
                                        <h3 className="text-lg md:text-2xl text-white/90 font-bold tracking-wide" style={{ fontFamily: "'ITC Avant Garde Gothic Pro', sans-serif" }} >{content.headline}</h3>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
                                            {content.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-center justify-center text-center bg-white/10 border border-[#FE4403]/50 p-2 md:p-3 shadow-[0_0_10px_rgba(254,68,3,0.1)]">
                                                    <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold text-white">{bullet}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- LAYOUT BLOCKS --- */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* TEXT BLOCK 1: Space Grotesk, White, No Opacity */}
                                        <div className="flex items-center text-base md:text-lg text-white leading-relaxed font-normal text-justify" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock1}
                                        </div>
                                        <div className="relative group cursor-zoom-in aspect-video border border-white/10 bg-white/5 p-1" onClick={() => setLightboxImage(sectionImage1)}>
                                            <div className="overflow-hidden h-full w-full relative">
                                                <img
                                                    src={sectionImage1}
                                                    alt="Detail"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#FE4403]" />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#FE4403]" />
                                        </div>
                                    </div>

                                    <div className="w-full bg-black/40 border-l-2 border-[#FE4403] p-4 md:p-8 backdrop-blur-md">
                                        {/* TEXT BLOCK 2: Space Grotesk, White, No Opacity */}
                                        <div className="text-lg md:text-xl text-white leading-relaxed font-normal" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock2}
                                        </div>
                                    </div>

                                    <div
                                        className="w-full h-[30vh] md:h-[40vh] relative group cursor-zoom-in border-y border-white/20"
                                        onClick={() => setLightboxImage(sectionImage2)}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${sectionImage2})` }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                                        <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-widest border border-white/20 text-white/70">
                                            Fig 1.2 - System Architecture
                                        </div>
                                    </div>

                                    <div className="w-full bg-black/40 border-l-2 border-[#FE4403] p-4 md:p-8 backdrop-blur-md">
                                        {/* TEXT BLOCK 3: Space Grotesk, White, No Opacity */}
                                        <div className="text-base md:text-lg text-white leading-relaxed font-normal text-justify" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock3}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="relative group cursor-zoom-in aspect-video border border-white/10 bg-white/5 p-1 order-2 md:order-1" onClick={() => setLightboxImage(sectionImage3)}>
                                            <div className="overflow-hidden h-full w-full relative">
                                                <img
                                                    src={sectionImage3}
                                                    alt="Detail"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#FE4403]" />
                                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#FE4403]" />
                                        </div>
                                        {/* TEXT BLOCK 4: Space Grotesk, White, No Opacity */}
                                        <div className="flex items-center text-base md:text-lg text-white leading-relaxed font-normal text-justify order-1 md:order-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock4}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-8">
                                        <p className="text-base md:text-lg text-white/60 italic text-center max-w-3xl mx-auto">
                                            "Ultimately, this iterative loop allowed us to refine the mechanics to a polished state, ensuring player agency remained central to the experience."
                                        </p>
                                    </div>

                                </div>

                                <div className="h-24 md:h-32 w-full flex items-center justify-center opacity-30">
                                    <ChevronDown className="animate-bounce" />
                                </div>
                            </div>
                        </section>
                    );
                })}


                {/* === SECTION: GALLERY === */}
                <section
                    id="gallery"
                    ref={(el) => { if (el) sectionRefs.current['gallery'] = el; }}
                    className="relative w-full min-h-screen md:h-screen md:overflow-y-auto overflow-visible"
                >
                    <div className="min-h-screen flex flex-col items-center justify-center w-full px-4 md:pl-48 py-20 md:py-24">
                        <div className="w-full max-w-7xl">
                            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8 md:mb-12 text-white/90 border-b border-white/10 pb-6 flex justify-between items-end">
                                {t('gallery')}
                                <span className="text-xs tracking-normal text-white/40 font-normal normal-case">{projectContent.gallery.length} {t('assets_count')}</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
                                {projectContent.gallery.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`relative group overflow-hidden border border-white/10 cursor-zoom-in bg-[#050505] ${i === 0 ? 'md:col-span-2 md:row-span-2 md:h-[616px]' : 'h-full'}`}
                                        onClick={() => setLightboxImage(img)}
                                    >
                                        <div className="w-full h-full overflow-hidden">
                                            <img
                                                src={img}
                                                alt={`Gallery ${i}`}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Maximize2 className={i === 0 ? "text-white w-12 h-12" : "text-white w-8 h-8"} />
                                        </div>
                                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FE4403] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FE4403] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>


                {/* === SECTION: VIDEOS === */}
                <section
                    id="videos"
                    ref={(el) => { if (el) sectionRefs.current['videos'] = el; }}
                    className="relative w-full min-h-screen md:h-screen md:overflow-y-auto overflow-visible"
                >
                    <div className="min-h-screen flex flex-col items-center w-full px-4 md:px-8 md:pl-48 py-20 md:py-24">
                        <div className="w-full max-w-5xl">
                            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8 md:mb-12 text-white/90 border-b border-white/10 pb-6">
                                {t('videos')}
                            </h2>

                            <div className="space-y-16 pb-20">
                                {projectContent.videos.length > 0 ? projectContent.videos.map((vid, idx) => (
                                    <VideoCard key={idx} src={vid} index={idx} />
                                )) : (
                                    <div className="text-white/40 text-center py-12 italic border border-white/10">
                                        {t('no_videos')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ProjectDetailView;
