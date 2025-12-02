
import React, { useState, useEffect, Suspense } from 'react';
import StartScreen from './components/StartScreen';
import MainMenu from './components/MainMenu';
import SciFiBackground from './components/SciFiBackground';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import './indexFonts.css';

// Lazy Load Components for Code Splitting
const ContactView = React.lazy(() => import('./components/ContactView'));
const AboutView = React.lazy(() => import('./components/AboutView'));
const MusicView = React.lazy(() => import('./components/MusicView'));
const CvGameDesignerView = React.lazy(() => import('./components/CvGameDesignerView'));
const CvTechArtistView = React.lazy(() => import('./components/CvTechArtistView'));
const GameDesignPortfolioView = React.lazy(() => import('./components/GameDesignPortfolioView'));
const TechArt3DPortfolioView = React.lazy(() => import('./components/TechArt3DPortfolioView'));
const OthersPortfolioView = React.lazy(() => import('./components/OthersPortfolioView'));

// Estado de la aplicación: 'start', 'loading', 'menu', o una sección específica
type AppState = 'start' | 'loading' | 'menu' | 'contact' | 'about' | 'music' | 'cv-gd' | 'cv-ta' | 'portfolio-gd' | 'portfolio-ta' | 'portfolio-others';

function PortfolioApp() {
  const { t } = useLanguage();
  
  // --- ROUTING LOGIC START ---
  
  // Función para obtener el estado basado en el Hash de la URL actual
  const getStateFromHash = (): AppState => {
    const hash = window.location.hash.toLowerCase();
    
    // Si no hay hash, o es solo '#', o es '#start', mostramos la pantalla de inicio
    if (!hash || hash === '' || hash === '#' || hash === '#start') {
      return 'start';
    }

    // Handle Sub-routes by checking prefix
    if (hash.startsWith('#game-design')) return 'portfolio-gd';
    if (hash.startsWith('#3d-tech-art')) return 'portfolio-ta';
    if (hash.startsWith('#others')) return 'portfolio-others';

    switch (hash) {
      case '#mainmenu': return 'menu';
      case '#menu': return 'menu'; // Fallback
      case '#music': return 'music';
      case '#about': return 'about';
      case '#contact': return 'contact';
      case '#cv-game-designer': return 'cv-gd';
      case '#cv-tech-artist': return 'cv-ta';
      default: return 'start';
    }
  };

  // Inicializar estado basado en la URL
  const [appState, setAppState] = useState<AppState>(getStateFromHash);
  
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Score State (Persistent XP)
  const [score, setScore] = useState(0);

  // Efecto para sincronizar el Hash cuando cambia el estado (Navegación interna)
  // Nota: Para los portafolios, SOLO cambiamos el hash si NO estamos ya en un sub-hash de ese portafolio.
  useEffect(() => {
    const currentHash = window.location.hash.toLowerCase();
    let targetBaseHash = '';

    switch (appState) {
      case 'menu': targetBaseHash = '#mainmenu'; break;
      case 'portfolio-gd': targetBaseHash = '#game-design'; break;
      case 'portfolio-ta': targetBaseHash = '#3d-tech-art'; break;
      case 'portfolio-others': targetBaseHash = '#others'; break;
      case 'music': targetBaseHash = '#music'; break;
      case 'about': targetBaseHash = '#about'; break;
      case 'contact': targetBaseHash = '#contact'; break;
      case 'cv-gd': targetBaseHash = '#cv-game-designer'; break;
      case 'cv-ta': targetBaseHash = '#cv-tech-artist'; break;
      case 'start': targetBaseHash = '#start'; break;
      case 'loading': targetBaseHash = '#start'; break; 
    }

    // Only update hash if we aren't already on a deeper route of the same section
    if (targetBaseHash) {
        const isSubRoute = currentHash.startsWith(targetBaseHash + '/');
        if (!isSubRoute && currentHash !== targetBaseHash) {
             if (targetBaseHash === '#start' && (currentHash === '' || currentHash === '#')) {
                 history.replaceState(null, '', window.location.pathname + targetBaseHash);
             } else {
                 window.location.hash = targetBaseHash;
             }
        }
    }

  }, [appState]);

  // Efecto para escuchar cambios en el Hash (Botones Atrás/Adelante del navegador)
  useEffect(() => {
    const handleHashChange = () => {
      const newState = getStateFromHash();
      if (appState !== 'loading') {
         if (newState !== appState) {
            setAppState(newState);
         }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [appState]);

  // Score Calculation based on Visits
  useEffect(() => {
    // When entering a substantive section from menu, award XP
    // We check if the state is NOT start/loading/menu
    const contentStates = ['contact', 'about', 'music', 'cv-gd', 'cv-ta', 'portfolio-gd', 'portfolio-ta', 'portfolio-others'];
    if (contentStates.includes(appState)) {
        // Add significant XP for exploring a section
        setScore(prev => prev + 500);
    }
  }, [appState]);

  const handleInteractionScore = () => {
      setScore(prev => prev + 25);
  };

  // --- ROUTING LOGIC END ---

  // Manejador para iniciar la experiencia desde la StartScreen
  const handleStart = () => {
    setAppState('loading');
  };

  // Manejador para volver al inicio desde el menú (click en el nombre)
  const handleGoToStart = () => {
    setAppState('start');
  };

  // Manejador para los clics en las tarjetas del menú
  // IDs Updated to reflect MainMenu changes
  const handleCardClick = (id: number) => {
    if (id === 1) { 
      setAppState('about');
    } else if (id === 2) { 
      setAppState('portfolio-gd');
    } else if (id === 3) { 
      setAppState('portfolio-ta');
    } else if (id === 4) { 
      setAppState('music');
    } else if (id === 5) { 
      setAppState('portfolio-others');
    }
  };

  // Manejador para cerrar una vista de sección y volver al menú
  const handleGoToMenu = () => {
    setAppState('menu');
  };
  
  // Manejador para volver al submenú 'About' desde una vista de CV
  const handleBackToAbout = () => {
    setAppState('about');
  };

  // Manejador para navegar a las vistas de CV desde 'About'
  const handleNavigate = (view: 'cv-gd' | 'cv-ta') => {
    setAppState(view);
  };

  // Listener global para teclas (solo activo en la pantalla de inicio)
  useEffect(() => {
    const handleKeyDown = () => {
      if (appState === 'start') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState]);

  // Lógica de la barra de carga
  useEffect(() => {
    if (appState === 'loading') {
      const duration = 1500; // Duración de la carga en ms
      const startTime = Date.now();
      let animationFrameId: number;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setLoadingProgress(progress);

        if (progress < 100) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            setAppState('menu');
          }, 300);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [appState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      
      {/* Background Layer - Always active, now receives appState for color shifting */}
      <div className="absolute inset-0 z-0">
        <SciFiBackground appState={appState} />
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 ring-1 ring-white/10 shadow-[inset_0_0_100px_rgba(255,255,255,0.05)] rounded-lg" />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        {appState === 'start' && (
          <StartScreen onStart={handleStart} />
        )}

        {appState === 'loading' && (
          <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 pb-12 md:pb-20 flex flex-col z-20">
            <div className="flex justify-start items-end mb-3">
              <h2 
                className="text-xl md:text-3xl font-bold tracking-widest text-white uppercase" 
                style={{ fontFamily: "'ITC Avant Garde Gothic Pro Md', sans-serif" }}
              >
                {t('loading')}
              </h2>
            </div>
            <div className="w-full h-[3px] bg-gray-700/30">
              <div 
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {appState === 'menu' && (
          <MainMenu 
            onCardClick={handleCardClick} 
            onHeaderClick={handleGoToStart}
            score={score}
            onAddScore={handleInteractionScore}
          />
        )}

        {/* Suspense wrapper for lazy loaded components */}
        <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-8 h-8 border-2 border-[#FE4403] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            {appState === 'contact' && (
              <ContactView onClose={handleGoToMenu} />
            )}

            {appState === 'about' && (
              <AboutView onClose={handleGoToMenu} onNavigate={handleNavigate} />
            )}

            {appState === 'music' && (
              <MusicView onClose={handleGoToMenu} />
            )}

            {appState === 'cv-gd' && (
                <CvGameDesignerView onClose={handleBackToAbout} />
            )}

            {appState === 'cv-ta' && (
                <CvTechArtistView onClose={handleBackToAbout} />
            )}

            {appState === 'portfolio-gd' && (
                <GameDesignPortfolioView onClose={handleGoToMenu} />
            )}

            {appState === 'portfolio-ta' && (
                <TechArt3DPortfolioView onClose={handleGoToMenu} />
            )}

            {appState === 'portfolio-others' && (
                <OthersPortfolioView onClose={handleGoToMenu} />
            )}
        </Suspense>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PortfolioApp />
    </LanguageProvider>
  );
}
