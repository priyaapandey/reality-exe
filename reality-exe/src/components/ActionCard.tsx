import React from 'react';
import type { ActionCard as ActionCardType } from '../types/reality';
import { Zap, Target, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface ActionCardProps {
  action: ActionCardType;
  onStartMission: (action: ActionCardType) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onStartMission }) => {
  const isQuickWin = action.category === 'quick-win';
  const isHighImpact = action.category === 'high-impact';

  const badgeConfig = isQuickWin
    ? {
        label: 'QUICK WIN',
        icon: Zap,
        badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        borderStyle: 'border-emerald-500/30 hover:border-emerald-400/60',
        buttonStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
      }
    : isHighImpact
    ? {
        label: 'HIGH IMPACT',
        icon: Target,
        badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        borderStyle: 'border-cyan-500/40 hover:border-cyan-400/80',
        buttonStyle: 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
      }
    : {
        label: 'LONG-TERM',
        icon: ShieldCheck,
        badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
        borderStyle: 'border-purple-500/30 hover:border-purple-400/60',
        buttonStyle: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
      };

  const BadgeIcon = badgeConfig.icon;

  return (
    <div
      className={`relative flex flex-col justify-between p-6 rounded-2xl glass-panel-interactive border ${badgeConfig.borderStyle} transition-all duration-300 group`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${badgeConfig.badgeStyle}`}
          >
            <BadgeIcon className="w-3 h-3" />
            {badgeConfig.label}
          </span>

          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {action.estimatedMinutes}m
            </span>
            <span className="text-zinc-600">•</span>
            <span className="capitalize">{action.difficulty}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
          {action.title}
        </h3>
        <p className="text-xs text-zinc-300 mb-4 leading-relaxed font-normal">
          {action.reason}
        </p>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-5">
          <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">
            Expected Payoff
          </span>
          <p className="text-xs text-cyan-300 font-medium">
            {action.expectedBenefit}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Action Steps ({action.steps.length})
          </span>
          <ul className="space-y-1.5">
            {action.steps.slice(0, 3).map((step, idx) => (
              <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="line-clamp-1">{step}</span>
              </li>
            ))}
            {action.steps.length > 3 && (
              <li className="text-[11px] text-zinc-500 pl-6 italic">
                +{action.steps.length - 3} more steps in mission...
              </li>
            )}
          </ul>
        </div>
      </div>

      <button
        onClick={() => onStartMission(action)}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg group-hover:scale-[1.02] active:scale-[0.98] ${badgeConfig.buttonStyle}`}
      >
        <span>Start Mission</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
