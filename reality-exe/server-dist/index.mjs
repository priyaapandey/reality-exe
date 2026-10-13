// server/index.ts
import express from "express";
import cors from "cors";
import path from "path";
import dotenv2 from "dotenv";

// server/schemas.ts
import { z } from "zod";
var ObservationSchema = z.object({
  text: z.string().describe("A specific factual observation grounded directly in the visible evidence."),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level based on visual clarity and direct visibility."),
  category: z.enum(["fact", "inference"]).describe("Whether this is a direct visible fact or an inference.")
});
var ActionCardSchema = z.object({
  id: z.enum(["quick-win", "high-impact", "long-term"]).describe("Unique identifier matching the category."),
  category: z.enum(["quick-win", "high-impact", "long-term"]),
  title: z.string().describe("Concise, inspiring action title with an action verb."),
  reason: z.string().describe("Clear explanation of why this action helps in the current scenario."),
  estimatedMinutes: z.number().int().positive().describe("Realistic estimated time in minutes."),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Perceived effort level."),
  expectedBenefit: z.string().describe("Tangible visual or productivity payoff."),
  steps: z.array(z.string()).min(3).max(6).describe("3 to 6 concrete, sequential, non-destructive checklist steps.")
});
var FutureVisionSchema = z.object({
  headline: z.string().describe("Inspiring title of the future transformed state."),
  description: z.string().describe("Vivid, grounded description of how the physical space will look and feel once actions are completed."),
  expectedOrderScore: z.number().int().min(80).max(100).describe("Projected order & clarity score upon completion (80-100)."),
  visualDifferences: z.array(z.string()).min(3).max(5).describe("Key visible changes that will be evident in the after state.")
});
var RealityAnalysisResponseSchema = z.object({
  summary: z.string().describe("A concise 1-2 sentence summary of the visible situation and environmental state."),
  currentClarityScore: z.number().int().min(10).max(80).default(35).describe("Current visual clarity score (10-80)."),
  observations: z.array(ObservationSchema).min(3).max(5).describe("3 to 5 grounded observations."),
  primaryOpportunity: z.string().describe("The single most impactful immediate improvement opportunity."),
  futureVision: FutureVisionSchema.describe("Projected after state of the space."),
  actions: z.array(ActionCardSchema).length(3).describe("Exactly three prioritized actions: quick-win, high-impact, long-term.")
});
var AnalyzeRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/, "Unsupported image format"),
  scenario: z.enum(["workspace", "study", "room", "general"]).default("workspace"),
  goal: z.string().optional().default(""),
  timeBudget: z.number().optional().default(30)
});
var VerifyRequestSchema = z.object({
  beforeImage: z.string().min(1, "Before image data is required"),
  beforeMimeType: z.string().default("image/jpeg"),
  afterImage: z.string().min(1, "After image data is required"),
  afterMimeType: z.string().default("image/jpeg"),
  missionTitle: z.string(),
  stepsCompleted: z.number().int()
});
var VerifyResponseSchema = z.object({
  status: z.enum(["PASSED", "NEEDS_WORK"]),
  clarityScoreBefore: z.number().int().min(0).max(100),
  clarityScoreAfter: z.number().int().min(0).max(100),
  deltaPercentage: z.number().int().min(0).max(100),
  achievements: z.array(z.string()).min(2).max(5),
  remainingTips: z.array(z.string()).max(3),
  verdict: z.string()
});

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  const project = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-239fa08b92f8";
  const location = process.env.GOOGLE_CLOUD_LOCATION === "global" ? "us-central1" : process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  if (apiKey) {
    return {
      ai: new GoogleGenAI({ apiKey }),
      modelName: "gemini-2.5-flash"
    };
  }
  return {
    ai: new GoogleGenAI({
      vertexai: true,
      project,
      location
    }),
    modelName: "gemini-2.5-flash"
  };
}
var SYSTEM_INSTRUCTION = `You are Reality.exe, a premier visual action planner with the tagline "See it. Understand it. Do it."
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
async function analyzeReality(req) {
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
    throw new Error(`Invalid response structure: ${validationResult.error.issues.map((i) => i.message).join(", ")}`);
  }
  return validationResult.data;
}
async function verifyReality(req) {
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
    throw new Error(`Invalid verification structure: ${validated.error.issues.map((i) => i.message).join(", ")}`);
  }
  return validated.data;
}

// server/index.ts
dotenv2.config();
var app = express();
var PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
var distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
var publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));
app.get("/api/health", (req, res) => {
  try {
    const { modelName } = getGeminiClient();
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    const hasGcp = Boolean(process.env.GOOGLE_CLOUD_PROJECT);
    res.json({
      status: "online",
      service: "Reality.exe Analysis & Verification Engine",
      model: modelName,
      authMode: hasApiKey ? "Gemini API Key" : hasGcp ? "Vertex AI ADC" : "Unknown",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "degraded",
      error: error.message
    });
  }
});
app.post("/api/analyze", async (req, res) => {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request payload",
        details: parseResult.error.issues
      });
    }
    const analysis = await analyzeReality(parseResult.data);
    return res.json(analysis);
  } catch (error) {
    console.error("Server API Error during analysis:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze image"
    });
  }
});
app.post("/api/verify", async (req, res) => {
  try {
    const parseResult = VerifyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid verification payload",
        details: parseResult.error.issues
      });
    }
    const verification = await verifyReality(parseResult.data);
    return res.json(verification);
  } catch (error) {
    console.error("Server API Error during verification:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify completion"
    });
  }
});
app.get("/{*splat}", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Not found");
    }
  });
});
app.listen(PORT, () => {
  console.log(`\u26A1 Reality.exe Server running on port ${PORT}`);
  console.log(`\u{1F916} AI Engine initialized with model gemini-2.5-flash`);
});
