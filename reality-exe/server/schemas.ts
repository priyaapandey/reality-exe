import { z } from "zod";

export const ObservationSchema = z.object({
  text: z.string().describe("A specific factual observation grounded directly in the visible evidence."),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level based on visual clarity and direct visibility."),
  category: z.enum(["fact", "inference"]).describe("Whether this is a direct visible fact or an inference.")
});

export const ActionCardSchema = z.object({
  id: z.enum(["quick-win", "high-impact", "long-term"]).describe("Unique identifier matching the category."),
  category: z.enum(["quick-win", "high-impact", "long-term"]),
  title: z.string().describe("Concise, inspiring action title with an action verb."),
  reason: z.string().describe("Clear explanation of why this action helps in the current scenario."),
  estimatedMinutes: z.number().int().positive().describe("Realistic estimated time in minutes."),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Perceived effort level."),
  expectedBenefit: z.string().describe("Tangible visual or productivity payoff."),
  steps: z.array(z.string()).min(3).max(6).describe("3 to 6 concrete, sequential, non-destructive checklist steps.")
});

export const FutureVisionSchema = z.object({
  headline: z.string().describe("Inspiring title of the future transformed state."),
  description: z.string().describe("Vivid, grounded description of how the physical space will look and feel once actions are completed."),
  expectedOrderScore: z.number().int().min(80).max(100).describe("Projected order & clarity score upon completion (80-100)."),
  visualDifferences: z.array(z.string()).min(3).max(5).describe("Key visible changes that will be evident in the after state.")
});

export const RealityAnalysisResponseSchema = z.object({
  summary: z.string().describe("A concise 1-2 sentence summary of the visible situation and environmental state."),
  currentClarityScore: z.number().int().min(10).max(80).default(35).describe("Current visual clarity score (10-80)."),
  observations: z.array(ObservationSchema).min(3).max(5).describe("3 to 5 grounded observations."),
  primaryOpportunity: z.string().describe("The single most impactful immediate improvement opportunity."),
  futureVision: FutureVisionSchema.describe("Projected after state of the space."),
  actions: z.array(ActionCardSchema).length(3).describe("Exactly three prioritized actions: quick-win, high-impact, long-term.")
});

export type Observation = z.infer<typeof ObservationSchema>;
export type ActionCard = z.infer<typeof ActionCardSchema>;
export type FutureVision = z.infer<typeof FutureVisionSchema>;
export type RealityAnalysisResponse = z.infer<typeof RealityAnalysisResponseSchema>;

export const AnalyzeRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/, "Unsupported image format"),
  scenario: z.enum(["workspace", "study", "room", "general"]).default("workspace"),
  goal: z.string().optional().default(""),
  timeBudget: z.number().optional().default(30)
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// Verification Schema for Proof of Work
export const VerifyRequestSchema = z.object({
  beforeImage: z.string().min(1, "Before image data is required"),
  beforeMimeType: z.string().default("image/jpeg"),
  afterImage: z.string().min(1, "After image data is required"),
  afterMimeType: z.string().default("image/jpeg"),
  missionTitle: z.string(),
  stepsCompleted: z.number().int()
});

export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;

export const VerifyResponseSchema = z.object({
  status: z.enum(["PASSED", "NEEDS_WORK"]),
  clarityScoreBefore: z.number().int().min(0).max(100),
  clarityScoreAfter: z.number().int().min(0).max(100),
  deltaPercentage: z.number().int().min(0).max(100),
  achievements: z.array(z.string()).min(2).max(5),
  remainingTips: z.array(z.string()).max(3),
  verdict: z.string()
});

export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
