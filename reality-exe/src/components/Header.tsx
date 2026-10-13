import React from 'react';
import { Terminal, RefreshCw, Cpu } from 'lucide-react';

interface HeaderProps {
  apiStatus: 'online' | 'checking' | 'error';
  onReset: () => void;
  hasAnalysis: boolean;
}

export const Header: React.FC<HeaderProps> = ({ apiStatus, onReset, hasAnalysis }) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-[#0e111a]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 blur-sm -z-10" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
                Reality<span className="text-cyan-400">.exe</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                v1.0 • Gemini Vision
              </span>
            </div>
            <p className="text-xs text-zinc-400 tracking-wide">
              See it. Understand it. Do it.
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              {apiStatus === 'online' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiStatus === 'online'
                    ? 'bg-emerald-500'
                    : apiStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              {apiStatus === 'online'
                ? 'Gemini 2.5 Active'
                : apiStatus === 'checking'
                ? 'Connecting...'
                : 'Offline'}
            </span>
          </div>

          {hasAnalysis && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-all hover:text-white"
              title="Start a new analysis"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
