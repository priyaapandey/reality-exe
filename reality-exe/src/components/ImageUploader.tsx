import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Clock, Target, AlertCircle, ArrowRight } from 'lucide-react';
import type { ScenarioType } from '../types/reality';

interface ImageUploaderProps {
  onAnalyze: (
    payload: {
      image: string;
      mimeType: string;
      scenario: ScenarioType;
      goal: string;
      timeBudget: number;
    },
    sampleAfterUrl?: string
  ) => void;
  isLoading: boolean;
}

const SAMPLE_IMAGES = [
  {
    id: 'sample-desk',
    name: 'Messy Desk',
    scenario: 'workspace' as ScenarioType,
    url: '/samples/messy-desk.jpg',
    afterUrl: '/samples/messy-desk-after.jpg',
    goal: 'Clear desk surface and organize messy cables'
  },
  {
    id: 'sample-study',
    name: 'Study Setup',
    scenario: 'study' as ScenarioType,
    url: '/samples/study-setup.jpg',
    afterUrl: '/samples/study-setup-after.jpg',
    goal: 'Optimize layout for distraction-free exam prep'
  },
  {
    id: 'sample-room',
    name: 'Room Clutter',
    scenario: 'room' as ScenarioType,
    url: '/samples/cluttered-room.jpg',
    afterUrl: '/samples/cluttered-room-after.jpg',
    goal: 'Declutter shelves and sort storage boxes'
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sampleAfterUrl, setSampleAfterUrl] = useState<string | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [scenario, setScenario] = useState<ScenarioType>('workspace');
  const [goal, setGoal] = useState<string>('');
  const [timeBudget, setTimeBudget] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setSampleAfterUrl(undefined);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Image size exceeds 15MB. Please choose a smaller image.');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    setError(null);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      setScenario(sample.scenario);
      setGoal(sample.goal);
      setSampleAfterUrl(sample.afterUrl);
      setMimeType(blob.type || 'image/jpeg');

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      setError('Could not load sample image.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setError('Please upload an image or select a sample image first.');
      return;
    }

    onAnalyze(
      {
        image: imagePreview,
        mimeType,
        scenario,
        goal,
        timeBudget
      },
      sampleAfterUrl
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
              : imagePreview
              ? 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-600'
              : 'border-zinc-800 bg-zinc-900/30 hover:border-cyan-500/40 hover:bg-zinc-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative group max-w-md mx-auto">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-64 object-cover rounded-xl border border-zinc-700 shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 text-sm text-cyan-300 font-medium">
                <Upload className="w-4 h-4" /> Click or drag to replace image
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-zinc-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-medium text-zinc-200 mb-1">
                Drag and drop your reality photo here, or <span className="text-cyan-400 underline underline-offset-4">browse</span>
              </p>
              <p className="text-xs text-zinc-500">
                Supports JPEG, PNG, WebP up to 15MB
              </p>
            </div>
          )}
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            Quick Demo Samples (With Paired After Previews):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl glass-panel">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Scenario Type
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as ScenarioType)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="workspace">Workspace Organization</option>
              <option value="study">Study Setup & Focus</option>
              <option value="room">Room & Storage Clutter</option>
              <option value="general">Everyday Environment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Primary Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Free desk space, clean cables"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Time Budget: {timeBudget} mins
            </label>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="range"
                min={5}
                max={90}
                step={5}
                value={timeBudget}
                onChange={(e) => setTimeBudget(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !imagePreview}
          className={`w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl ${
            isLoading || !imagePreview
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.008] active:scale-[0.995]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Reality with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Analyze My Reality</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
