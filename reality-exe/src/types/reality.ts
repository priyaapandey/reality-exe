export type ObservationCategory = 'fact' | 'inference';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ActionCategory = 'quick-win' | 'high-impact' | 'long-term';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Observation {
  text: string;
  confidence: ConfidenceLevel;
  category: ObservationCategory;
}

export interface ActionCard {
  id: ActionCategory;
  category: ActionCategory;
  title: string;
  reason: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  expectedBenefit: string;
  steps: string[];
}

export interface FutureVision {
  headline: string;
  description: string;
  expectedOrderScore: number;
  visualDifferences: string[];
}

export interface RealityAnalysisResponse {
  summary: string;
  currentClarityScore: number;
  observations: Observation[];
  primaryOpportunity: string;
  futureVision: FutureVision;
  actions: ActionCard[];
}

export type ScenarioType = 'workspace' | 'study' | 'room' | 'general';

export interface AnalysisPayload {
  image: string; // base64
  mimeType: string;
  scenario: ScenarioType;
  goal?: string;
  timeBudget?: number;
}

export interface VerificationResult {
  status: 'PASSED' | 'NEEDS_WORK';
  clarityScoreBefore: number;
  clarityScoreAfter: number;
  deltaPercentage: number;
  achievements: string[];
  remainingTips: string[];
  verdict: string;
}
