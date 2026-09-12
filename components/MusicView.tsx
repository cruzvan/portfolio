import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../data/translations';
import { useHoverVideo } from '../hooks/useHoverVideo';
import { useIsTouchDevice } from '../hooks/useDeviceProfile';
import { isVideoUrl } from '../utils/media';

interface MusicTrack {
  id: string;
  title: string;
  projectName: string;
  description: TranslationKey;
  coverUrl: string;
  soundcloudId: string;
}

/**
 * Visualizer is intentionally its own component: it updates ~10x/second and
 * previously lived in MusicView's state, re-rendering all 12 track cards and
 * their SoundCloud iframes on every tick during module playback.
 */
const Visualizer: React.FC<{ bars?: number }> = ({ bars = 12 }) => {
    const [data, setData] = useState<number[]>(() => new Array(bars).fill(5));
    const rafRef = useRef<number>(0);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const animate = () => {
            setData(prev => prev.map(() => Math.random() * 40 + 10));
            timeoutRef.current = window.setTimeout(() => {
                rafRef.current = requestAnimationFrame(animate);
            }, 100);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(rafRef.current);
            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="flex gap-1 h-6 md:h-8 items-end opacity-90" aria-hidden="true">
            {data.map((height, i) => (
                <div
                    key={i}
                    className="w-1 md:w-1.5 bg-[#FE4403] transition-all duration-100 ease-linear"
                    style={{ height: `${Math.max(5, height)}%`, opacity: 0.8 }}
                />
            ))}
        </div>
    );
};

/**
 * Defers mounting the heavy third-party SoundCloud iframe until the track
 * scrolls near the viewport. Keeps the initial render light on phones.
 */
const LazySoundCloudEmbed: React.FC<{ soundcloudId: string }> = ({ soundcloudId }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || visible) return;

        if (!('IntersectionObserver' in window)) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div ref={containerRef} className="w-full h-full">
            {visible ? (
                <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    title="SoundCloud player"
                    src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%3Atracks%3A${soundcloudId}&color=%23fe4403&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=false`}
                    className="opacity-100"
                />
            ) : (
                <div className="w-full h-full bg-black/30 border border-white/5" />
            )}
        </div>
    );
};

const MusicTrackItem: React.FC<{ track: MusicTrack; index: number }> = ({ track, index }) => {
    const { t } = useLanguage();
    const { videoRef, onHoverPlay, onHoverPause } = useHoverVideo();
    const isTouchDevice = useIsTouchDevice();
    const isVideo = isVideoUrl(track.coverUrl);

    return (
        <div 
            key={track.id} 
            className="group relative bg-black/40 border border-white/10 hover:border-[#FE4403]/50 transition-all duration-300 p-4 md:p-6 flex flex-col md:flex-row gap-6 animate-slide-up-fade-in"
            style={{ animationDelay: `${index * 150}ms` }}
            onMouseEnter={onHoverPlay}
            onMouseLeave={onHoverPause}
        >
            {/* --- Cover Art Area (With Glitch Effect) --- */}
            <div className="relative w-full h-48 md:w-48 md:h-48 flex-shrink-0 overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={track.coverUrl}
                        loop
                        muted
                        playsInline
                        preload={isTouchDevice ? 'none' : 'metadata'}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <>
                        {/* Base Image (Color, no grayscale as requested) */}
                        <div 
                          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-200 group-hover:opacity-0 opacity-100"
                          style={{ backgroundImage: `url(${track.coverUrl})` }}
                        />

                        {/* Glitch Effect Layers (Visible on Hover) */}
                        <div className="absolute inset-0 w-full h-full bg-black transition-opacity duration-0 opacity-0 group-hover:opacity-100">
                            <div 
                                className="absolute inset-0 w-full h-full bg-cover bg-center bg-red-600 bg-blend-multiply mix-blend-screen contrast-125 brightness-150 animate-glitch-1"
                                style={{ backgroundImage: `url(${track.coverUrl})` }}
                            />
                            <div 
                                className="absolute inset-0 w-full h-full bg-cover bg-center bg-green-600 bg-blend-multiply mix-blend-screen contrast-125 brightness-150"
                                style={{ backgroundImage: `url(${track.coverUrl})` }}
                            />
                            <div 
                                className="absolute inset-0 w-full h-full bg-cover bg-center bg-blue-600 bg-blend-multiply mix-blend-screen contrast-125 brightness-150 animate-glitch-2"
                                style={{ backgroundImage: `url(${track.coverUrl})` }}
                            />
                        </div>
                    </>
                )}

                {/* Overlay Scanline */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            </div>

            {/* --- Info & Player Area --- */}
            <div className="flex flex-col flex-grow justify-between">
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        {/* Track Title */}
                        <h2 className="text-xl md:text-2xl text-white font-bold tracking-wide leading-none" style={{ fontFamily: "'UniversNextW04-620CondBold', sans-serif" }}>
                            {track.title}
                        </h2>
                        {/* Project Name Label (Boxed) */}
                        <div className="bg-[#FE4403] text-black text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-widest" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
                            {track.projectName}
                        </div>
                    </div>
                    <p className="text-white/70 text-[13px] md:text-[15px] leading-relaxed text-justify" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {t(track.description)}
                    </p>
                </div>

                {/* --- Player Section --- */}
                <div className="w-full h-[120px] md:h-[120px] border-t border-white/5 pt-4 relative bg-black/20">
                    <LazySoundCloudEmbed soundcloudId={track.soundcloudId} />
                </div>
            </div>
        </div>
      );
}

interface MusicViewProps {
  onClose: () => void;
}

const MusicView: React.FC<MusicViewProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const isTouchDevice = useIsTouchDevice();

  // Datos actualizados sin el prefijo "PROJECT:" y con IDs de SoundCloud
  // Images updated to w=1200
  const tracks: MusicTrack[] = [
    {
      id: "track-01",
      title: "ROTARY PONG MAIN THEME",
      projectName: "Rotary Pong",
      description: "music_desc_01",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/video/upload/v1764986395/ezgif-7e40e50aec655835_ma8mzf.webm",
      soundcloudId: "1533636247"
    },
    {
      id: "track-02",
      title: "ROTARY PONG GAMEPLAY THEME",
      projectName: "ROTARY PONG",
      description: "music_desc_02",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/video/upload/v1764986395/ezgif-7e40e50aec655835_ma8mzf.webm",
      soundcloudId: "1533636958"
    },
    {
      id: "track-03",
      title: "BRAIN WASHER GAMEPLAY THEME",
      projectName: "BRAIN WASHER",
      description: "music_desc_03",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992856/SB_AUDIO_BRAINWASHER_gmevyu.jpg",
      soundcloudId: "1561491655"
    },
    {
      id: "track-04",
      title: "BRAIN WASHER MAIN THEME",
      projectName: "BRAIN WASHER",
      description: "music_desc_04",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992856/SB_AUDIO_BRAINWASHER_gmevyu.jpg",
      soundcloudId: "1561491235"
    },
    {
      id: "track-05",
      title: "COMET RUSH",
      projectName: "COMET RUSH",
      description: "music_desc_05",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992926/SB_AUDIO_CometRush_pp5q7z.jpg",
      soundcloudId: "1561490245"
    },
    {
      id: "track-06",
      title: "NEON FLY",
      projectName: "",
      description: "music_desc_06",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764994194/SB_AC_Logo_1k_navox5.webp",
      soundcloudId: "1561480960"
    },
    {
      id: "track-07",
      title: "CONSTRUYENDO LA SALIDA",
      projectName: "",
      description: "music_desc_07",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992982/SB_Audio_ConstruyendoLaSalida_edytgk.jpg",
      soundcloudId: "1561489477"
    },
    {
      id: "track-08",
      title: "CORAZÓN DE RATÓN",
      projectName: "",
      description: "music_desc_08",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764993228/SB_AUDIO_CorazonDeRaton_rp6nfd.jpg",
      soundcloudId: "1561487938"
    },
    {
      id: "track-09",
      title: "A FORGOTTEN KING'S ANCESTRY CUTSCENE",
      projectName: "AFKA",
      description: "music_desc_09",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992819/SB_AUDIO_AFKA_czqbem.jpg",
      soundcloudId: "1561492783"
    },
    {
      id: "track-10",
      title: "IT WAS SOMETHING LIKE THIS",
      projectName: "FADING MEMORIES",
      description: "music_desc_10",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992685/SB_AUDIO_FadingMemories_idit8b.jpg",
      soundcloudId: "1573567399"
    },
    {
      id: "track-11",
      title: "BY YOUR SIDE",
      projectName: "FADING MEMORIES",
      description: "music_desc_11",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764992685/SB_AUDIO_FadingMemories_idit8b.jpg",
      soundcloudId: "1658312175" 
    },
    {
      id: "track-12",
      title: "SLIPSTREAMING",
      projectName: "",
      description: "music_desc_12",
      coverUrl: "https://res.cloudinary.com/dseaazn5s/image/upload/v1764994194/SB_AC_Logo_1k_navox5.webp",
      soundcloudId: "2224913903" 
    }
  ];

  // Visualizer updates internally (isolated component) to avoid re-rendering
  // the whole track list and its iframes on every tick.

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full animate-fade-in-fast">
      
      {/* --- Header --- */}
      <div className="absolute top-4 md:top-8 hud-top-safe left-0 w-full px-6 md:px-12 pointer-events-none z-50 flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold tracking-tighter text-white" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
          AUDIO LOGS
        </h1>
        {/* Responsive Visualizer */}
        <Visualizer />
      </div>

      {/* --- Main Content Container (Visible Box) --- */}
      <div className={`relative w-full max-w-6xl h-[78dvh] short:h-[70dvh] bg-black/40 border border-white/10 backdrop-blur-sm mt-12 short:mt-6 ${isTouchDevice ? '' : 'md:h-[77dvh] md:mt-0'}`}>

        {/* Scrollable List with padding inside the visible box */}
        <div className="w-full h-full overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-6">
          
          {tracks.map((track, index) => (
            <MusicTrackItem key={track.id} track={track} index={index} />
          ))}

        </div>

        {/* Back Button: hidden on touch (browser/Android back handles it) to reclaim vertical space; below the rail on desktop */}
        {!isTouchDevice && (
          <div className="fixed bottom-6 right-6 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-4 pointer-events-auto z-50">
            <button
              onClick={onClose}
              className="bg-gray-300/80 text-black px-12 py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-200 text-lg border-2 border-black/20 shadow-lg"
              style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
            >
              {t('back')}
            </button>
          </div>
        )}

      </div>

      {/* --- HUD FOOTER (desktop only; hidden on touch to free vertical space) --- */}
      {!isTouchDevice && (
        <div className="absolute bottom-4 md:bottom-8 hud-bottom-safe left-0 w-full px-6 md:px-12 flex justify-between items-end pointer-events-none z-50">
          <div className="flex items-center gap-3 text-white/50">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="3" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="3" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 9C6 5.68629 8.68629 3 12 3V10H6V9Z" fill="currentColor" />
             </svg>
             <span className="text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase pt-1" style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}>
               {t('hud_select')}
             </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default MusicView;