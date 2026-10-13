import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisPanel } from './components/AnalysisPanel';
import { MissionView } from './components/MissionView';
import type { RealityAnalysisResponse, ActionCard, AnalysisPayload } from './types/reality';
import { Sparkles, AlertTriangle } from 'lucide-react';

export function App() {
  const [apiStatus, setApiStatus] = useState<'online' | 'checking' | 'error'>('checking');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [sampleAfterSrc, setSampleAfterSrc] = useState<string | undefined>(undefined);
  const [analysis, setAnalysis] = useState<RealityAnalysisResponse | null>(null);
  const [activeMission, setActiveMission] = useState<ActionCard | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setApiStatus('checking');
      const res = await fetch('/api/health');
      if (res.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
    }
  };

  const handleAnalyze = async (payload: AnalysisPayload, sampleAfterUrl?: string) => {
    setIsLoading(true);
    setError(null);
    setActiveImage(payload.image);
    setSampleAfterSrc(sampleAfterUrl);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: RealityAnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image with Gemini. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMission = (action: ActionCard) => {
    setActiveMission(action);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnalysis(null);
    setActiveMission(null);
    setActiveImage(null);
    setSampleAfterSrc(undefined);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-zinc-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        apiStatus={apiStatus}
        onReset={handleReset}
        hasAnalysis={Boolean(analysis || activeMission)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start justify-between gap-3 text-rose-300 text-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Analysis Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs uppercase font-mono text-rose-400 hover:text-rose-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Router */}
        {activeMission && analysis && activeImage ? (
          <MissionView
            mission={activeMission}
            allActions={analysis.actions}
            beforeImageSrc={activeImage}
            sampleAfterSrc={sampleAfterSrc}
            onBackToActions={() => setActiveMission(null)}
            onSwitchMission={(newMission) => setActiveMission(newMission)}
          />
        ) : analysis && activeImage ? (
          <AnalysisPanel
            analysis={analysis}
            imageSrc={activeImage}
            sampleAfterSrc={sampleAfterSrc}
            onStartMission={handleStartMission}
          />
        ) : (
          <div className="space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono text-cyan-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Vision to Action Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Turn What You See Into <span className="cyan-gradient-text">Immediate Action</span>
              </h1>
              <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Upload a photo of your desk, study space, or room. Reality.exe analyzes visual disorder with Gemini 2.5, projects what it will look like when finished, and verifies your actual physical transformation.
              </p>
            </div>

            <ImageUploader
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 font-mono">
        <p>Reality.exe • Built with Gemini • See it. Understand it. Do it.</p>
      </footer>
    </div>
  );
}

export default App;
