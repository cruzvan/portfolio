
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-[#FE4403] font-mono p-8 relative overflow-hidden">
            {/* Background Glitch Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FE4403] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FE4403] animate-pulse" />
            
            <div className="z-10 flex flex-col items-center max-w-lg text-center border border-[#FE4403]/30 bg-black/80 p-10 backdrop-blur-md shadow-[0_0_50px_rgba(254,68,3,0.2)]">
                <AlertTriangle size={64} className="mb-6 animate-bounce" />
                
                <h1 className="text-4xl font-bold tracking-widest mb-2 uppercase">System Failure</h1>
                <div className="h-px w-full bg-[#FE4403]/50 my-4" />
                
                <p className="text-white/80 mb-6 text-sm tracking-wide">
                    A critical runtime error has occurred. The interface has been suspended to prevent further data corruption.
                </p>
                
                {this.state.error && (
                    <div className="w-full bg-[#FE4403]/10 border border-[#FE4403]/20 p-4 mb-8 text-left overflow-auto max-h-32 text-xs text-[#FE4403]">
                        <p className="font-bold mb-1">ERROR_LOG:</p>
                        <code className="break-all">{this.state.error.toString()}</code>
                    </div>
                )}

                <button 
                    onClick={this.handleReload}
                    className="flex items-center gap-2 bg-[#FE4403] text-black px-6 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors duration-200"
                >
                    <RefreshCw size={18} />
                    Reboot System
                </button>
            </div>

            <div className="absolute bottom-8 text-[#FE4403]/40 text-xs tracking-[0.5em]">
                FATAL_EXCEPTION_0x000000
            </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}

export default ErrorBoundary;