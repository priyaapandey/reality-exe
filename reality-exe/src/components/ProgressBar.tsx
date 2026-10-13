import React from 'react';

interface ProgressBarProps {
  progressPercentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressPercentage }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
        <span className="flex items-center gap-1.5">
          Mission Execution Status
        </span>
        <span className="font-bold text-cyan-400">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
