import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { AnalyzeRequestSchema, VerifyRequestSchema } from "./schemas";
import { analyzeReality, verifyReality, getGeminiClient } from "./gemini";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Serve static frontend assets if built
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Also serve sample images from public/samples
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

app.get("/api/health", (req: Request, res: Response) => {
  try {
    const { modelName } = getGeminiClient();
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    const hasGcp = Boolean(process.env.GOOGLE_CLOUD_PROJECT);

    res.json({
      status: "online",
      service: "Reality.exe Analysis & Verification Engine",
      model: modelName,
      authMode: hasApiKey ? "Gemini API Key" : (hasGcp ? "Vertex AI ADC" : "Unknown"),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: "degraded",
      error: error.message
    });
  }
});

// Primary analysis endpoint
app.post("/api/analyze", async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Server API Error during analysis:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze image"
    });
  }
});

// Proof of Work Verification endpoint
app.post("/api/verify", async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Server API Error during verification:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify completion"
    });
  }
});

// SPA fallback for HTML5 routing
app.get("/{*splat}", (req: Request, res: Response) => {
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Not found");
    }
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Reality.exe Server running on port ${PORT}`);
  console.log(`🤖 AI Engine initialized with model gemini-2.5-flash`);
});
