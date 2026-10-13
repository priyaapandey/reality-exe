import React, { useState } from 'react';
import type { RealityAnalysisResponse, ActionCard as ActionCardType } from '../types/reality';
import { ObservationList } from './ObservationList';
import { ActionCard } from './ActionCard';
import { FutureVisionModal } from './FutureVisionModal';
import { Sparkles, Compass, Lightbulb, Image as ImageIcon, Wand2 } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: RealityAnalysisResponse;
  imageSrc: string;
  sampleAfterSrc?: string;
  onStartMission: (action: ActionCardType) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  imageSrc,
  sampleAfterSrc,
  onStartMission
}) => {
  const [showFutureModal, setShowFutureModal] = useState<boolean>(false);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Top Overview: Image + Scene Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Reference Card */}
        <div className="lg:col-span-5 p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              Analyzed Visual Source
            </span>
            <span className="text-zinc-400 font-mono">
              Clarity: <span className="text-amber-400 font-bold">{analysis.currentClarityScore}%</span>
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-zinc-700/60 shadow-xl group">
            <img
              src={imageSrc}
              alt="Analyzed scene"
              className="w-full h-72 object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-[11px] font-mono text-zinc-300">
                Processed with Gemini 2.5 Vision
              </span>
            </div>
          </div>

          {/* Quick Future Preview Trigger */}
          <button
            onClick={() => setShowFutureModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <Wand2 className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Preview Transformed Reality (After State)</span>
          </button>
        </div>

        {/* Scene Intelligence Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {/* Executive Summary */}
          <div className="p-6 rounded-2xl glass-panel space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Scene Intelligence Summary
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400">
                Est. Payoff: +{analysis.futureVision.expectedOrderScore - analysis.currentClarityScore}%
              </span>
            </div>

            <p className="text-base text-zinc-100 font-medium leading-relaxed">
              {analysis.summary}
            </p>

            {/* Primary Opportunity Banner */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">
                  Primary Transformation Opportunity
                </span>
                <p className="text-xs text-zinc-300 leading-normal mt-0.5">
                  {analysis.primaryOpportunity}
                </p>
              </div>
            </div>
          </div>

          {/* Observations List */}
          <ObservationList observations={analysis.observations} />
        </div>
      </div>

      {/* Action Recommendation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Prioritized Action Blueprints
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an action below to convert visual understanding into an interactive mission.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            3 Categories Generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onStartMission={onStartMission}
            />
          ))}
        </div>
      </div>

      {/* Future Vision Modal */}
      <FutureVisionModal
        futureVision={analysis.futureVision}
        beforeImageSrc={imageSrc}
        sampleAfterSrc={sampleAfterSrc}
        currentScore={analysis.currentClarityScore}
        isOpen={showFutureModal}
        onClose={() => setShowFutureModal(false)}
      />
    </div>
  );
};
