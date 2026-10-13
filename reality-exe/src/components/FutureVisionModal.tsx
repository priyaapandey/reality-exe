import React, { useState } from 'react';
import type { FutureVision } from '../types/reality';
import { Sparkles, X, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react';

interface FutureVisionModalProps {
  futureVision: FutureVision;
  beforeImageSrc: string;
  sampleAfterSrc?: string;
  currentScore: number;
  isOpen: boolean;
  onClose: () => void;
}

export const FutureVisionModal: React.FC<FutureVisionModalProps> = ({
  futureVision,
  beforeImageSrc,
  sampleAfterSrc,
  currentScore,
  isOpen,
  onClose
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  if (!isOpen) return null;

  const afterImage = sampleAfterSrc || beforeImageSrc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-panel rounded-3xl border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                AI Vision Projection
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Projected Order: {futureVision.expectedOrderScore}%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {futureVision.headline}
            </h2>
          </div>
        </div>

        {/* Interactive Before vs Projected After View */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-amber-400 flex items-center gap-1.5">
              Current Reality ({currentScore}%)
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              Projected Transformation ({futureVision.expectedOrderScore}%)
            </span>
          </div>

          {/* Interactive Split / Slider View */}
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-700 select-none">
            {/* Background Image (Projected After) */}
            <img
              src={afterImage}
              alt="Projected transformed space"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-semibold backdrop-blur-md">
              ✨ PROJECTED AFTER
            </div>

            {/* Foreground Image (Original Before) with clip-path based on slider */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeImageSrc}
                alt="Current reality before"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-700 text-zinc-300 text-xs font-mono font-semibold backdrop-blur-md">
                📸 BEFORE
              </div>
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-xs shadow-lg">
                ↔
              </div>
            </div>

            {/* Invisible Slider Input for Dragging */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
            />
          </div>

          <p className="text-center text-[11px] text-zinc-500 font-mono">
            Drag the slider horizontally to compare current state with the projected after state
          </p>
        </div>

        {/* Narrative & Visual Difference Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Transformed Atmosphere
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {futureVision.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tangible Visual Milestones
            </h4>
            <ul className="space-y-1.5">
              {futureVision.visualDifferences.map((diff, idx) => (
                <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Let's Build This Reality</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
