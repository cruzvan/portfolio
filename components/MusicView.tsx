import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../data/translations';

interface MusicTrack {
  id: string;
  title: string;
  projectName: string;
  description: TranslationKey;
  coverUrl: string;
  soundcloudId: string;
}

interface MusicViewProps {
  onClose: () => void;
}

const MusicView: React.FC<MusicViewProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(12).fill(5));
  
  // Ref for the animation loop
  const requestRef = useRef<number>(0);

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

  // Visualizer Loop - Always running in "Standby/Monitoring" mode
  const animateVisualizer = () => {
    setVisualizerData(prev => prev.map(() => Math.random() * 40 + 10)); // Low activity simulation
    // Slow down the update rate slightly for a "tech" feel
    setTimeout(() => {
      requestRef.current = requestAnimationFrame(animateVisualizer);
    }, 100); 
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateVisualizer);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full animate-fade-in-fast">
      
      {/* --- Header --- */}
      <div className="absolute top-4 md:top-8 left-0 w-full px-6 md:px-12 pointer-events-none z-50 flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold tracking-tighter text-white" style={{ fontFamily: "'Dazzle Unicase', sans-serif" }}>
          AUDIO LOGS
        </h1>
        {/* Responsive Visualizer */}
        <div className="flex gap-1 h-6 md:h-8 items-end opacity-90">
            {visualizerData.map((height, i) => (
                <div 
                  key={i} 
                  className="w-1 md:w-1.5 bg-[#FE4403] transition-all duration-100 ease-linear" 
                  style={{ 
                    height: `${Math.max(5, height)}%`,
                    opacity: 0.8
                  }} 
                />
            ))}
        </div>
      </div>

      {/* --- Main Content Container (Visible Box) --- */}
      <div className="relative w-full max-w-6xl h-[70vh] md:h-[77vh] bg-black/40 border border-white/10 backdrop-blur-sm mt-12 md:mt-0">
        
        {/* Scrollable List with padding inside the visible box */}
        <div className="w-full h-full overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-20 md:pb-6">
          
          {tracks.map((track, index) => (
            <div 
                key={track.id} 
                className="group relative bg-black/40 border border-white/10 hover:border-[#FE4403]/50 transition-all duration-300 p-4 md:p-6 flex flex-col md:flex-row gap-6 animate-slide-up-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
            >
                {/* --- Cover Art Area (With Glitch Effect) --- */}
                <div className="relative w-full h-48 md:w-48 md:h-48 flex-shrink-0 overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                    
                    {track.coverUrl.endsWith('.webm') ? (
                        <video
                            src={track.coverUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
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
                        <iframe 
                            width="100%" 
                            height="100%" 
                            scrolling="no" 
                            frameBorder="no" 
                            allow="autoplay" 
                            src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%3Atracks%3A${track.soundcloudId}&color=%23fe4403&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=false`}
                            className="opacity-100"
                        />
                    </div>
                </div>
            </div>
          ))}

        </div>

        {/* Back Button positioned FIXED on mobile/landscape to ensure visibility, Absolute on desktop */}
        <div className="fixed bottom-6 right-6 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-4 pointer-events-auto z-50">
          <button
            onClick={onClose}
            className="bg-gray-300/80 text-black px-12 py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-200 text-lg border-2 border-black/20 shadow-lg"
            style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
          >
            Back
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
             Select
           </span>
        </div>
      </div>

    </div>
  );
};

export default MusicView;