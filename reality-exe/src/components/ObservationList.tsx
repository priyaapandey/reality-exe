import React from 'react';
import type { Observation } from '../types/reality';
import { CheckCircle2, Eye, Lightbulb } from 'lucide-react';

interface ObservationListProps {
  observations: Observation[];
}

export const ObservationList: React.FC<ObservationListProps> = ({ observations }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          Grounded Visual Observations ({observations.length})
        </h4>
        <span className="text-[11px] text-zinc-500 font-mono">
          Facts vs Inferences
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {observations.map((obs, idx) => {
          const isFact = obs.category === 'fact';
          const isHighConfidence = obs.confidence === 'high';

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex items-start gap-3"
            >
              <div className="mt-0.5">
                {isFact ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                  {obs.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                      isFact
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                    }`}
                  >
                    {isFact ? 'Visible Fact' : 'Inference'}
                  </span>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isHighConfidence
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-zinc-800/60 text-zinc-400'
                    }`}
                  >
                    {obs.confidence} confidence
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
