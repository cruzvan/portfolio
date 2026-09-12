
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ExternalLink, Maximize2, Users, Calendar, ChevronDown, Cpu, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjectContent, TagContentSection, ProjectCardData } from '../data/projectData';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsTouchDevice } from '../hooks/useDeviceProfile';
import { getVideoPoster, isVideoUrl } from '../utils/media';

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
                <span className="text-xs uppercase tracking-widest text-[color:var(--highlight-color)] font-bold">Log {String(index + 1).padStart(2, '0')}</span>
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
                        <div className="relative z-10 w-16 h-16 rounded-full border border-[color:var(--highlight-color)] flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover/btn:scale-110 transition-transform">
                            <Play fill="white" className="text-white ml-1" />
                        </div>
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[color:var(--highlight-color)]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[color:var(--highlight-color)]" />
                    </button>
                ) : (
                    <iframe
                        className="w-full h-full"
                        src={videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : src}
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

// --- INLINE MEDIA SLIDER (CAROUSEL) ---
const InlineMediaSlider: React.FC<{ items: string[], setLightboxImage: (img: string) => void, className?: string, hideUIForSingle?: boolean }> = ({ items, setLightboxImage, className = "", hideUIForSingle = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragged, setDragged] = useState(false);
    // On touch devices, videos show a still poster until the user taps play
    const isTouchDevice = useIsTouchDevice();
    const [playingMedia, setPlayingMedia] = useState<string | null>(null);

    const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setDragged(false);
        if ('touches' in e) {
            setTouchStartX(e.touches[0].clientX);
        } else {
            setTouchStartX(e.clientX);
            setIsDragging(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (touchStartX === null) return;
        if (!('touches' in e) && !isDragging) return;

        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = touchStartX - currentX;

        if (Math.abs(diff) > 10) setDragged(true); // movement threshold detected

        if (diff > 50) {
            handleNext();
            setTouchStartX(null);
            setIsDragging(false);
        } else if (diff < -50) {
            handlePrev();
            setTouchStartX(null);
            setIsDragging(false);
        }
    };

    const handleTouchEnd = () => {
        setTouchStartX(null);
        setIsDragging(false);
    };

    const handleClickOverlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!dragged) {
            setLightboxImage(currentMedia);
        }
    };

    if (!items || items.length === 0) return null;
    const currentMedia = items[currentIndex];

    const showUI = items.length > 1 && (!hideUIForSingle || items.length > 1);

    return (
        <div
            className={`overflow-hidden w-full h-full relative group/slider ${className} select-none`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
            {isVideoUrl(currentMedia) ? (
                isTouchDevice && playingMedia !== currentMedia ? (
                    <button
                        key={`poster-${currentMedia}`}
                        className="absolute inset-0 w-full h-full z-20 group/play"
                        onClick={(e) => { e.stopPropagation(); if (!dragged) setPlayingMedia(currentMedia); }}
                        aria-label="Play video"
                    >
                        {getVideoPoster(currentMedia) ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${getVideoPoster(currentMedia)})` }}
                            />
                        ) : (
                            <video
                                src={currentMedia}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-12 h-12 rounded-full border border-[color:var(--highlight-color)] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-transform group-hover/play:scale-110">
                                <Play fill="white" className="text-white ml-0.5" size={20} />
                            </div>
                        </div>
                    </button>
                ) : (
                    <video
                        key={currentMedia}
                        src={currentMedia}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover/slider:scale-105 pointer-events-none"
                        muted
                        loop
                        autoPlay
                        playsInline
                    />
                )
            ) : (
                <div
                    key={currentMedia}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 md:group-hover/slider:scale-105 pointer-events-none"
                    style={{ backgroundImage: `url(${currentMedia})` }}
                />
            )}

            {/* Click/Drag overlay */}
            <div
                className={`absolute inset-0 z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-zoom-in'}`}
                onClick={handleClickOverlay}
            />

            {showUI && (
                <>
                    {/* Mobile Arrows: Always slightly visible, minimal. Desktop: Opacity 0 to 100 on hover */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setDragged(false); handlePrev(e); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 z-20 transition-all border border-white/10 rounded-full
                                   bg-black/40 text-white/70 hover:bg-[color:var(--highlight-color)] hover:text-white
                                   opacity-60 md:opacity-0 md:group-hover/slider:opacity-100 backdrop-blur-md"
                    >
                        <ChevronLeft size={16} className="md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setDragged(false); handleNext(e); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 z-20 transition-all border border-white/10 rounded-full
                                   bg-black/40 text-white/70 hover:bg-[color:var(--highlight-color)] hover:text-white
                                   opacity-60 md:opacity-0 md:group-hover/slider:opacity-100 backdrop-blur-md"
                    >
                        <ChevronRight size={16} className="md:w-5 md:h-5" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 transition-all bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md
                                  opacity-80 md:opacity-0 md:group-hover/slider:opacity-100 pointer-events-none">
                        {items.map((_, i) => (
                            <div key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-[color:var(--highlight-color)] scale-125' : 'bg-white/50'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- GALLERY MEDIA (still first frame on touch, tap to play) ---
const GalleryMedia: React.FC<{ src: string, index: number }> = ({ src, index }) => {
    const isTouchDevice = useIsTouchDevice();
    const [playing, setPlaying] = useState(false);
    const isVideo = isVideoUrl(src);

    if (!isVideo) {
        return (
            <img
                src={src}
                alt={`Gallery ${index}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
        );
    }

    if (isTouchDevice && !playing) {
        const poster = getVideoPoster(src);

        // Without a usable poster we cannot show a meaningful still, so let the
        // browser fetch just metadata (no playback) instead of a blank box.
        return (
            <button
                className="relative w-full h-full group/play"
                onClick={(e) => { e.stopPropagation(); setPlaying(true); }}
                aria-label="Play video"
            >
                {poster ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${poster})` }}
                    />
                ) : (
                    <video
                        src={src}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className={index === 0 ? "text-white w-12 h-12" : "text-white w-8 h-8"} fill="white" />
                </div>
            </button>
        );
    }

    return (
        <video
            src={src}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            muted
            loop
            autoPlay
            playsInline
        />
    );
};

const ProjectDetailView: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
    const { language, t } = useLanguage();
    const isTouchDevice = useIsTouchDevice();

    // Fetch content from data file based on project title AND language
    const projectContent = useMemo(() => getProjectContent(project.title, language), [project.title, language]);

    const combinedGallery = useMemo(() => {
        const baseGallery = projectContent.gallery || [];
        const additionalMedia: string[] = [];

        if (projectContent.tagContent) {
            Object.values(projectContent.tagContent).forEach(content => {
                if (content.media1) additionalMedia.push(...content.media1);
                if (content.media2) additionalMedia.push(...content.media2);
                if (content.media3) additionalMedia.push(...content.media3);
            });
        }

        // Deduplicate the combined gallery
        return Array.from(new Set([...baseGallery, ...additionalMedia]));
    }, [projectContent]);

    // Generate dynamic sections based on tags
    const dynamicSections = useMemo(() => {
        let sections = [
            { id: 'overview', label: t('overview'), type: 'intro', tagName: '' },
            ...(project.tags || []).map((tag: string) => ({
                id: `content-${tag.toLowerCase().replace(/\s+/g, '-')}`,
                label: tag,
                type: 'content',
                tagName: tag
            })),
            { id: 'gallery', label: t('gallery'), type: 'gallery', tagName: '' },
            { id: 'videos', label: t('videos'), type: 'videos', tagName: '' },
        ];

        // Specific hiding if needed
        if (project.title === "HOLLOW FLOWERS") {
            sections = sections.filter(sec => sec.tagName !== "LEVEL DESIGN");
        }

        return sections;
    }, [project.tags, project.title, t]);

    const [activeSection, setActiveSection] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // --- LIGHTBOX NAVIGATION & SWIPE ---
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleLightboxNavigation = useCallback((direction: 'next' | 'prev') => {
        if (!lightboxImage) return;
        const gallery = combinedGallery;
        const currentIndex = gallery.indexOf(lightboxImage);

        if (currentIndex === -1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % gallery.length;
        } else {
            newIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        }
        setLightboxImage(gallery[newIndex]);
    }, [lightboxImage, combinedGallery]);

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

        // Scroll-jacking is a pointer-device interaction; on touch devices the
        // native momentum scrolling drives section tracking through onScroll.
        if (activeEl && !isTouchDevice) {
            activeEl.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (activeEl) {
                activeEl.removeEventListener('wheel', handleWheel);
            }
        };
    }, [activeSection, isScrolling, dynamicSections, scrollToSection, isTouchDevice]);

    // --- SCROLL HANDLER (throttled with rAF) ---
    // Tracks native scroll position to update activeSection and trigger background blur
    const scrollRafRef = useRef<number | null>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Only process if not currently auto-scrolling (prevents jitter)
        if (isScrolling) return;

        const container = e.currentTarget;
        if (scrollRafRef.current !== null) return;

        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;

            // Trigger point is 1/3 down the screen to feel responsive
            const scrollPosition = container.scrollTop + (container.clientHeight / 3);

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
        });
    };

    useEffect(() => {
        return () => {
            if (scrollRafRef.current !== null) {
                cancelAnimationFrame(scrollRafRef.current);
            }
        };
    }, []);

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
        <div 
            style={{ "--highlight-color": project.highlightColor || "#FE4403", overscrollBehavior: 'none' } as React.CSSProperties} 
            className="fixed inset-0 z-50 bg-black text-white font-sans animate-fade-in-fast"
        >

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
                        className="absolute left-2 md:left-8 p-4 text-white/50 hover:text-[color:var(--highlight-color)] hover:scale-110 transition-all z-[110]"
                        onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('prev'); }}
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div
                        className="relative w-auto h-auto max-w-[75vw] max-h-[75vh] flex items-center justify-center select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isVideoUrl(lightboxImage) ? (
                            <video
                                src={lightboxImage}
                                className="w-full h-full object-contain shadow-2xl border border-white/10 bg-black"
                                controls
                                autoPlay
                                loop
                            />
                        ) : (
                            <img
                                src={lightboxImage}
                                alt="Fullscreen"
                                className="w-full h-full object-contain shadow-2xl border border-white/10 bg-black"
                            />
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        className="absolute right-2 md:right-8 p-4 text-white/50 hover:text-[color:var(--highlight-color)] hover:scale-110 transition-all z-[110]"
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

            {/* --- FLOATING NAVIGATION (LEFT) - DESKTOP POINTER DEVICES ONLY --- */}
            <div className={`fixed left-8 top-1/2 -translate-y-1/2 z-50 ${isTouchDevice ? 'hidden' : 'hidden md:flex'} flex-col gap-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
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
                        <span className={`absolute -left-4 top-1/2 -translate-y-1/2 h-[2px] bg-[color:var(--highlight-color)] transition-all duration-300 ${activeSection === sec.id ? 'w-3' : 'w-0'}`} />
                    </button>
                ))}
            </div>

            {/* --- MOBILE/TABLET SECTION NAV (scrollable chips) --- */}
            <div className={`${isTouchDevice ? 'block' : 'md:hidden'} fixed top-0 left-0 w-full z-[60] bg-gradient-to-b from-black/90 to-transparent pt-hud-2 short:pt-1 pb-4 short:pb-2 px-4 short:px-3`}>
                <div className="flex gap-2 short:gap-1 overflow-x-auto scrollbar-hide touch-scroll-x">
                    {dynamicSections.map((sec) => (
                        <button
                            key={sec.id}
                            onClick={() => scrollToSection(sec.id)}
                            className={`flex-shrink-0 px-3 short:px-2 py-1.5 short:py-1 text-[10px] short:text-[9px] font-bold uppercase tracking-widest border transition-colors duration-300 ${
                                activeSection === sec.id
                                    ? 'bg-[color:var(--highlight-color)] border-[color:var(--highlight-color)] text-black'
                                    : 'bg-black/50 border-white/20 text-white/70'
                            }`}
                            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- FLOATING ACTIONS (BOTTOM RIGHT) --- */}
            <div className={`fixed bottom-4 md:bottom-8 hud-bottom-safe right-4 md:right-12 short:right-3 z-50 flex gap-4 short:gap-2 items-end transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Functional External Files Button */}
                {projectContent.externalLink && projectContent.externalLink.trim() !== "" && projectContent.externalLink.trim() !== "#" && (
                    <a
                        href={projectContent.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 md:h-12 short:h-9 items-center gap-2 px-6 md:px-12 short:px-4 bg-white/5 border border-white/10 hover:bg-[color:var(--highlight-color)] hover:border-[color:var(--highlight-color)] backdrop-blur-md transition-all duration-300 group"
                    >
                        <span className="text-xs short:text-[10px] font-bold uppercase tracking-widest text-white">{t('external_files')}</span>
                        <ExternalLink size={14} className="text-white group-hover:rotate-45 transition-transform" />
                    </a>
                )}

                {/* Back button hidden on touch (browser/Android back handles it) to reclaim vertical space */}
                {!isTouchDevice && (
                    <button
                        onClick={onClose}
                        className="flex h-12 items-center gap-3 px-8 bg-white hover:bg-[color:var(--highlight-color)] text-black hover:text-white transition-colors duration-300 shadow-xl"
                    >
                        <span className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>{t('back')}</span>
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* --- MAIN SCROLL CONTAINER --- */}
            {/* 
          MOBILE FIX: Changed overflow-hidden to overflow-y-auto on parent to allow native scrolling.
          Desktop retains md:overflow-hidden for the scroll-jack effect.
          Added onScroll handler to track sections on mobile/tablet native scrolling.
      */}
            <div
                className={`relative w-full h-full overflow-y-auto scroll-smooth ${isTouchDevice ? '' : 'md:overflow-hidden'}`}
                onScroll={handleScroll}
            >

                {/* === SECTION 1: OVERVIEW === */}
                {/* 
            MOBILE FIX: Changed h-screen to min-h-dvh and overflow-visible. 
            This allows sections to stack naturally on mobile.
        */}
                <section
                    id="overview"
                    ref={(el) => { if (el) sectionRefs.current['overview'] = el; }}
                    className={`relative w-full min-h-dvh overflow-visible ${isTouchDevice ? '' : 'md:h-dvh md:overflow-y-auto'}`}
                >
                    <div className="relative z-10 w-full min-h-dvh px-4 md:px-8 flex flex-col items-center justify-center text-center py-20">
                        <div className="animate-slide-up-fade-in flex flex-col items-center" style={{ animationDelay: '0.1s' }}>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-tighter text-white mb-8 md:mb-12 leading-[0.9] drop-shadow-[0_0_30px_rgba(0,0,0,1)] break-words max-w-full" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
                                {project.title}
                            </h1>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/20 pt-8 mt-4 w-full max-w-4xl bg-black/80 backdrop-blur-md p-6 md:p-8 rounded-sm">
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[color:var(--highlight-color)] tracking-widest flex items-center gap-2 font-bold"><Users size={12} /> {t('responsibilities')}</span>
                                    <div className="flex flex-col gap-1">
                                        {project.tags.map((tag: string, i: number) => (
                                            <span key={i} className="text-[13px] md:text-[15px] font-semibold tracking-wide text-white/90">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[color:var(--highlight-color)] tracking-widest flex items-center gap-2 font-bold"><Cpu size={12} /> {t('software')}</span>
                                    <div className="flex flex-col gap-1">
                                        {projectContent.software.map((sw: string, i: number) => (
                                            <span key={i} className="text-[13px] md:text-[15px] font-semibold tracking-wide text-white/90">{sw}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-[11px] uppercase text-[color:var(--highlight-color)] tracking-widest flex items-center gap-2 font-bold"><Calendar size={12} /> {t('duration')}</span>
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
                    const gallery = combinedGallery;

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
                            className={`relative w-full min-h-dvh overflow-visible ${isTouchDevice ? '' : 'md:h-dvh md:overflow-y-auto'}`}
                        >
                            <div className="min-h-dvh flex flex-col items-center py-16 md:py-20 px-4 md:px-8 md:pl-48">

                                <div className="w-full max-w-7xl space-y-8 md:space-y-12 mb-20">

                                    {/* --- HEADER --- */}
                                    <div className="border-b border-white/10 pb-8 flex flex-col gap-4">
                                        <div>
                                            <h2 className="text-3xl md:text-6xl font-bold uppercase tracking-tight text-white mb-2" style={{ fontFamily: "'UniversNextW04-620CondBold', sans-serif" }}>
                                                {sec.label}
                                            </h2>
                                            <div className="w-16 md:w-24 h-1 bg-[color:var(--highlight-color)]" />
                                        </div>
                                        <h3 className="text-lg md:text-2xl text-white/90 font-bold tracking-wide" style={{ fontFamily: "'ITC Avant Garde Gothic Pro', sans-serif" }} >{content.headline}</h3>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 relative z-10 w-full">
                                            {content.bullets.map((bullet, i) => (
                                                <div key={i} className="bullet-card" style={{ '--anim-offset': `-${i * 1.5}s` } as React.CSSProperties}>
                                                    <div className="content">
                                                        <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold text-white relative z-10">{bullet}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- LAYOUT BLOCKS --- */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* TEXT BLOCK 1: Space Grotesk, White, No Opacity */}
                                        <div className="flex items-center text-base md:text-lg text-white leading-relaxed font-normal text-justify whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock1}
                                        </div>
                                        <div className="relative aspect-video border border-white/10 bg-white/5 p-1">
                                            <InlineMediaSlider items={content.media1 && content.media1.length > 0 ? content.media1 : [sectionImage1]} setLightboxImage={setLightboxImage} />
                                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[color:var(--highlight-color)] pointer-events-none z-30" />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[color:var(--highlight-color)] pointer-events-none z-30" />
                                        </div>
                                    </div>

                                    <div className="w-full bg-black/40 border-l-2 border-[color:var(--highlight-color)] p-4 md:p-8 backdrop-blur-md">
                                        {/* TEXT BLOCK 2: Space Grotesk, White, No Opacity */}
                                        <div className="text-lg md:text-xl text-white leading-relaxed font-normal whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock2}
                                        </div>
                                    </div>

                                    <div className="w-full aspect-video relative border-y border-white/20">
                                        <InlineMediaSlider items={content.media2 && content.media2.length > 0 ? content.media2 : [sectionImage2]} setLightboxImage={setLightboxImage} />
                                    </div>

                                    <div className="w-full bg-black/40 border-l-2 border-[color:var(--highlight-color)] p-4 md:p-8 backdrop-blur-md">
                                        {/* TEXT BLOCK 3: Space Grotesk, White, No Opacity */}
                                        <div className="text-base md:text-lg text-white leading-relaxed font-normal text-justify whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock3}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="relative aspect-video border border-white/10 bg-white/5 p-1 order-2 md:order-1">
                                            <InlineMediaSlider items={content.media3 && content.media3.length > 0 ? content.media3 : [sectionImage3]} setLightboxImage={setLightboxImage} />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[color:var(--highlight-color)] pointer-events-none z-30" />
                                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[color:var(--highlight-color)] pointer-events-none z-30" />
                                        </div>
                                        {/* TEXT BLOCK 4: Space Grotesk, White, No Opacity */}
                                        <div className="flex items-center text-base md:text-lg text-white leading-relaxed font-normal text-justify order-1 md:order-2 whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {content.textBlock4}
                                        </div>
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
                    className={`relative w-full min-h-dvh overflow-visible ${isTouchDevice ? '' : 'md:h-dvh md:overflow-y-auto'}`}
                >
                    <div className="min-h-dvh flex flex-col items-center justify-center w-full px-4 md:pl-48 py-20 md:py-24">
                        <div className="w-full max-w-7xl">
                            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8 md:mb-12 text-white/90 border-b border-white/10 pb-6 flex justify-between items-end">
                                {t('gallery')}
                                <span className="text-xs tracking-normal text-white/40 font-normal normal-case">{combinedGallery.length} {t('assets_count')}</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
                                {combinedGallery.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`relative group overflow-hidden border border-white/10 cursor-zoom-in bg-[#050505] ${i === 0 ? 'md:col-span-2 md:row-span-2 md:h-[616px]' : 'h-full'}`}
                                        onClick={() => setLightboxImage(img)}
                                    >
                                        <div className="w-full h-full overflow-hidden">
                                            <GalleryMedia src={img} index={i} />
                                        </div>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            {isVideoUrl(img) ? (
                                                <Play className={i === 0 ? "text-white w-12 h-12" : "text-white w-8 h-8"} fill="white" />
                                            ) : (
                                                <Maximize2 className={i === 0 ? "text-white w-12 h-12" : "text-white w-8 h-8"} />
                                            )}
                                        </div>
                                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[color:var(--highlight-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[color:var(--highlight-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    className={`relative w-full min-h-dvh overflow-visible ${isTouchDevice ? '' : 'md:h-dvh md:overflow-y-auto'}`}
                >
                    <div className="min-h-dvh flex flex-col items-center w-full px-4 md:px-8 md:pl-48 py-20 md:py-24">
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
