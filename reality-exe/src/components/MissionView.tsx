import React, { useState, useRef } from 'react';
import type { ActionCard, VerificationResult } from '../types/reality';
import { ProgressBar } from './ProgressBar';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Clock,
  Check,
  ChevronRight,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface MissionViewProps {
  mission: ActionCard;
  allActions: ActionCard[];
  beforeImageSrc: string;
  sampleAfterSrc?: string;
  onBackToActions: () => void;
  onSwitchMission: (action: ActionCard) => void;
}

export const MissionView: React.FC<MissionViewProps> = ({
  mission,
  allActions,
  beforeImageSrc,
  sampleAfterSrc,
  onBackToActions,
  onSwitchMission
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [afterMimeType, setAfterMimeType] = useState<string>('image/jpeg');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    setVerifyResult(null);
    setAfterImagePreview(null);
  };

  const progressPercentage = (completedSteps.length / mission.steps.length) * 100;
  const isMissionComplete = completedSteps.length === mission.steps.length;

  const nextRecommendedAction = allActions.find((a) => a.id !== mission.id);

  const handleAfterFile = (file: File) => {
    setVerifyError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setVerifyError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setAfterMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAfterImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const loadSampleAfterProof = async () => {
    if (!sampleAfterSrc) return;
    try {
      const res = await fetch(sampleAfterSrc);
      const blob = await res.blob();
      setAfterMimeType(blob.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = (e) => {
        setAfterImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      setVerifyError('Could not load sample proof.');
    }
  };

  const runProofOfWorkAudit = async () => {
    if (!afterImagePreview) {
      setVerifyError('Please upload or select an After photo first.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beforeImage: beforeImageSrc,
          beforeMimeType: 'image/jpeg',
          afterImage: afterImagePreview,
          afterMimeType: afterMimeType,
          missionTitle: mission.title,
          stepsCompleted: completedSteps.length
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Verification audit failed.');
      }

      const data: VerificationResult = await res.json();
      setVerifyResult(data);
    } catch (err: any) {
      setVerifyError(err.message || 'Verification audit failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToActions}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recommendations</span>
        </button>

        <button
          onClick={resetProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Reset checklist"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Mission</span>
        </button>
      </div>

      {/* Mission Header Card */}
      <div className="p-8 rounded-2xl glass-panel border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-950/90 text-cyan-400 border border-cyan-800/60">
              Active Mission Mode
            </span>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Est. {mission.estimatedMinutes} mins
            </span>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            {completedSteps.length} of {mission.steps.length} Steps Complete
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          {mission.title}
        </h1>

        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed mb-6">
          {mission.reason}
        </p>

        {/* Live Progress Bar */}
        <ProgressBar progressPercentage={progressPercentage} />
      </div>

      {/* Step Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Executable Action Steps Checklist
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            Check off tasks as you physically complete them
          </span>
        </div>

        <div className="space-y-3">
          {mission.steps.map((step, idx) => {
            const isChecked = completedSteps.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-900/90'
                }`}
              >
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-zinc-700 bg-zinc-800/60 hover:border-cyan-400'
                  }`}
                >
                  {isChecked && <Check className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed transition-colors ${
                      isChecked
                        ? 'line-through text-zinc-500'
                        : 'text-zinc-200 font-normal'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof of Work & Verification Section */}
      <div className="p-8 rounded-2xl glass-panel border border-indigo-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Proof of Work: Vision Audit
              </h3>
              <p className="text-xs text-zinc-400">
                Submit an "After" photo to have Gemini Vision verify physical transformation.
              </p>
            </div>
          </div>

          {sampleAfterSrc && (
            <button
              onClick={loadSampleAfterProof}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Use Sample "After" Proof
            </button>
          )}
        </div>

        {/* After Image Upload / Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Reference */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-2">
              Original Before Photo
            </span>
            <img
              src={beforeImageSrc}
              alt="Before state"
              className="w-full h-44 object-cover rounded-lg border border-zinc-700/80"
            />
          </div>

          {/* After Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-cyan-400 transition-colors text-center cursor-pointer flex flex-col justify-center items-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleAfterFile(e.target.files[0])}
              className="hidden"
            />

            {afterImagePreview ? (
              <div className="w-full">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-2">
                  Submitted After Photo
                </span>
                <img
                  src={afterImagePreview}
                  alt="After proof"
                  className="w-full h-44 object-cover rounded-lg border border-emerald-500/50"
                />
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center">
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-xs text-zinc-300 font-medium">
                  Upload "After" Reality Photo
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">
                  Click or drag your transformed photo
                </span>
              </div>
            )}
          </div>
        </div>

        {verifyError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{verifyError}</span>
          </div>
        )}

        <button
          onClick={runProofOfWorkAudit}
          disabled={isVerifying || !afterImagePreview}
          className={`w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
            isVerifying || !afterImagePreview
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/20'
          }`}
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Auditing Physical Transformation with Gemini Vision...</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4" />
              <span>Verify Transformation & Issue Audit</span>
            </>
          )}
        </button>

        {/* Audit Results Card */}
        {verifyResult && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-600">
                  Audit {verifyResult.status}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Clarity: {verifyResult.clarityScoreBefore}% → {verifyResult.clarityScoreAfter}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>+{verifyResult.deltaPercentage}% Improvement</span>
              </div>
            </div>

            <p className="text-sm text-zinc-200 font-medium leading-relaxed">
              "{verifyResult.verdict}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block mb-1.5">
                  Verified Physical Achievements
                </span>
                <ul className="space-y-1">
                  {verifyResult.achievements.map((ach, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {verifyResult.remainingTips.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1.5">
                    Continuous Maintenance Tips
                  </span>
                  <ul className="space-y-1">
                    {verifyResult.remainingTips.map((tip, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion Celebration Footer */}
      {isMissionComplete && (
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/40 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Mission Accomplished! 100% Checklist Complete
            </h2>
            <p className="text-sm text-zinc-300 max-w-lg mx-auto">
              You turned visual understanding into actual physical order. Great momentum!
            </p>
          </div>

          {nextRecommendedAction && (
            <div className="pt-4 border-t border-zinc-800/80 max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                  Next Suggested Mission
                </span>
                <span className="text-xs font-semibold text-zinc-200">
                  {nextRecommendedAction.title}
                </span>
              </div>
              <button
                onClick={() => onSwitchMission(nextRecommendedAction)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Take Next Mission</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
