import { GoogleGenAI } from "@google/genai";
import {
  AnalyzeRequest,
  RealityAnalysisResponse,
  RealityAnalysisResponseSchema,
  VerifyRequest,
  VerifyResponse,
  VerifyResponseSchema
} from "./schemas";
import dotenv from "dotenv";

dotenv.config();

export function getGeminiClient(): { ai: GoogleGenAI; modelName: string } {
  const apiKey = process.env.GEMINI_API_KEY;
  const project = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-239fa08b92f8";
  const location = process.env.GOOGLE_CLOUD_LOCATION === "global" ? "us-central1" : (process.env.GOOGLE_CLOUD_LOCATION || "us-central1");

  if (apiKey) {
    return {
      ai: new GoogleGenAI({ apiKey }),
      modelName: "gemini-2.5-flash"
    };
  }

  return {
    ai: new GoogleGenAI({
      vertexai: true,
      project: project,
      location: location
    }),
    modelName: "gemini-2.5-flash"
  };
}

const SYSTEM_INSTRUCTION = `You are Reality.exe, a premier visual action planner with the tagline "See it. Understand it. Do it."
Your mission is to convert real-world photos into clear, prioritized, executable action plans and project what the transformed physical space will look like once steps are executed.

Core Operating Rules:
1. Ground every observation strictly in visible evidence. Never invent objects, brands, or clutter that are not clearly visible.
2. Clearly categorize each observation as either a direct visible 'fact' or an educated 'inference'.
3. Assign a realistic current clarity score (10 to 80) reflecting visual tidiness and ease of focus.
4. Project a vivid, exciting "futureVision":
   - Headline of the transformed state
   - Detailed description of how the physical area will look and feel once the actions are done
   - Expected clarity score (80 to 100)
   - 3 to 5 key visible differences in the after state
5. Return EXACTLY THREE distinct action plans:
   - "quick-win": A 2-10 minute low-friction momentum builder.
   - "high-impact": The highest payoff transformation that solves the main bottleneck.
   - "long-term": A lasting organization system, habit, or prevention strategy.
6. Every action must contain between 3 and 6 concrete, sequential checklist steps starting with strong action verbs.
7. Return strictly valid JSON adhering to the schema.`;

export async function analyzeReality(req: AnalyzeRequest): Promise<RealityAnalysisResponse> {
  const { ai, modelName } = getGeminiClient();

  let base64Data = req.image;
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }

  const userPrompt = `Analyze this image in detail.
Scenario Context: ${req.scenario.toUpperCase()}
User Goal: ${req.goal || "Organize, declutter, and optimize this space for high clarity and focus"}
Time Budget: ${req.timeBudget} minutes

Generate:
1. A concise scene summary.
2. Current visual clarity score (10-80).
3. 3 to 5 grounded observations, with factual accuracy and confidence ratings.
4. The single primary opportunity.
5. "futureVision" projection: what the space looks like after executing the actions.
6. Exactly 3 prioritized actions: 'quick-win', 'high-impact', and 'long-term', each with 3 to 6 actionable checklist steps.

Return strictly JSON matching this structure:
{
  "summary": "string",
  "currentClarityScore": 30,
  "observations": [
    { "text": "string", "confidence": "high"|"medium"|"low", "category": "fact"|"inference" }
  ],
  "primaryOpportunity": "string",
  "futureVision": {
    "headline": "string",
    "description": "string",
    "expectedOrderScore": 95,
    "visualDifferences": ["difference 1", "difference 2", "difference 3"]
  },
  "actions": [
    {
      "id": "quick-win",
      "category": "quick-win",
      "title": "string",
      "reason": "string",
      "estimatedMinutes": number,
      "difficulty": "easy"|"medium"|"hard",
      "expectedBenefit": "string",
      "steps": ["step 1", "step 2", "step 3"]
    },
    {
      "id": "high-impact",
      "category": "high-impact",
      "title": "string",
      "reason": "string",
      "estimatedMinutes": number,
      "difficulty": "easy"|"medium"|"hard",
      "expectedBenefit": "string",
      "steps": ["step 1", "step 2", "step 3"]
    },
    {
      "id": "long-term",
      "category": "long-term",
      "title": "string",
      "reason": "string",
      "estimatedMinutes": number,
      "difficulty": "easy"|"medium"|"hard",
      "expectedBenefit": "string",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: req.mimeType,
              data: base64Data
            }
          },
          {
            text: userPrompt
          }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.2
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(responseText);
  const validationResult = RealityAnalysisResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error("Zod Schema Validation Failure:", validationResult.error.format());
    throw new Error(`Invalid response structure: ${validationResult.error.issues.map(i => i.message).join(", ")}`);
  }

  return validationResult.data;
}

// Verification function comparing Before and After photos with Gemini Vision
export async function verifyReality(req: VerifyRequest): Promise<VerifyResponse> {
  const { ai, modelName } = getGeminiClient();

  let beforeB64 = req.beforeImage;
  if (beforeB64.includes(",")) beforeB64 = beforeB64.split(",")[1];

  let afterB64 = req.afterImage;
  if (afterB64.includes(",")) afterB64 = afterB64.split(",")[1];

  const verifyPrompt = `You are the Reality.exe Visual Auditor.
The user just completed the mission: "${req.missionTitle}" (${req.stepsCompleted} steps verified).

You are given two images:
IMAGE 1: The original BEFORE state.
IMAGE 2: The current AFTER state submitted by the user as Proof of Work.

Conduct a rigorous visual audit:
1. Identify all tangible physical changes between BEFORE and AFTER.
2. Evaluate clarityScoreBefore (0-100) and clarityScoreAfter (0-100).
3. Compute the deltaPercentage improvement (0-100).
4. Decide if the mission passed audit: "PASSED" if noticeable tidying, clearing, or organizing occurred, otherwise "NEEDS_WORK".
5. List 2 to 4 tangible achievements observed.
6. Provide up to 2 helpful remaining tips to maintain or improve further.
7. Write a 1-2 sentence encouraging verdict.

Return strictly JSON matching this structure:
{
  "status": "PASSED" | "NEEDS_WORK",
  "clarityScoreBefore": number,
  "clarityScoreAfter": number,
  "deltaPercentage": number,
  "achievements": ["achievement 1", "achievement 2"],
  "remainingTips": ["tip 1"],
  "verdict": "string"
}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          { text: "=== ORIGINAL BEFORE PHOTO ===" },
          {
            inlineData: {
              mimeType: req.beforeMimeType,
              data: beforeB64
            }
          },
          { text: "=== SUBMITTED AFTER PHOTO (PROOF OF WORK) ===" },
          {
            inlineData: {
              mimeType: req.afterMimeType,
              data: afterB64
            }
          },
          { text: verifyPrompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty verification response from Gemini");

  const parsed = JSON.parse(text);
  const validated = VerifyResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Verification Schema Error:", validated.error.format());
    throw new Error(`Invalid verification structure: ${validated.error.issues.map(i => i.message).join(", ")}`);
  }

  return validated.data;
}
