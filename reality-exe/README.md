# ⚡ Reality.exe — An AI That Turns What It Sees Into Action

> *"See it. Understand it. Do it."*

**Reality.exe** transforms messy, disorganized real-world situations (cluttered desks, study areas, unorganized rooms) into clear, prioritized, executable action plans — and visually verifies physical transformation.

Built for the **Build with Gemini** competition using Google Cloud, Vertex AI, and Gemini 2.5 Flash Vision.

---

## 🌟 Key Highlights & Features

- 👁️ **Multimodal Grounded Scene Intelligence**:
  - Uses **Gemini 2.5 Flash Vision** to analyze physical spaces from user-uploaded photos.
  - Distinguishes strict **Visible Facts** from **Inferences** to prevent hallucination.
  - Calculates an immediate **Visual Clarity Score** (e.g. `25% Clarity`) and detects the single primary bottleneck.

- 🔮 **Transformed Reality Projection ("After State")**:
  - Predicts how the environment will look and feel after completing actions.
  - Features an **Interactive Before/After Split Slider** comparing the current cluttered reality against the projected orderly state.

- ⚡ **Exactly 3 Prioritized Action Blueprints**:
  - **Quick Win**: 2–5 minute low-friction momentum booster.
  - **High Impact**: Core architectural transformation solving the primary bottleneck.
  - **Long-Term**: Sustainable habit, system, or prevention routine.

- 🎯 **Interactive Mission Mode**:
  - Step-by-step interactive checklist mode with live progress percentage.
  - Celebration modal upon 100% mission completion with next recommended mission.

- 📷 **"Proof of Work" Dual-Image Vision Audit**:
  - Users snap or upload an **"After" photo** upon finishing physical tasks.
  - Gemini performs a rigorous dual-image comparative audit:
    - Verifies physical achievements and removed clutter.
    - Computes **Clarity Improvement Delta** (e.g., `+67% Visual Clarity Gain`).
    - Issues a certified audit status (`PASSED` vs `NEEDS_WORK`) with maintenance tips.

- 🚀 **Deployed on Google Cloud Run**:
  - Production-ready containerized deployment on Cloud Run in `us-central1`.
  - Server-side Vertex AI Application Default Credentials (zero client-side API secret exposure).

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Reality.exe Client                   │
│   (React 19 + TypeScript + Vite + Tailwind CSS v4)     │
│   - Image Dropzone & Scenario Selector                 │
│   - Interactive Before/After Split Slider              │
│   - Mission Mode Checklist & Proof of Work Upload      │
└───────────────────────────┬────────────────────────────┘
                            │
                     HTTP / JSON API
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Express AI Server                     │
│   - Zod Request / Response Schema Validation           │
│   - Strict JSON-mode prompt engineering                │
│   - /api/analyze  -> Scene Intelligence + Future Vision│
│   - /api/verify   -> Dual-Image Proof-of-Work Audit    │
└───────────────────────────┬────────────────────────────┘
                            │
               @google/genai Node SDK (ADC)
                            │
┌───────────────────────────▼────────────────────────────┐
│            Google Vertex AI / Gemini 2.5 Flash         │
│   - Multimodal Vision Reasoning                        │
│   - Structured Output Generation                       │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
.
├── reality-exe/                # Full-Stack Reality.exe Application
│   ├── server/                 # Express backend
│   │   ├── index.ts            # Server entrypoint & static SPA serving
│   │   ├── gemini.ts           # Gemini 2.5 Flash Vision client
│   │   └── schemas.ts          # Zod validation schemas
│   ├── src/                    # React frontend
│   │   ├── components/         # MissionView, AnalysisPanel, FutureVisionModal, etc.
│   │   ├── types/reality.ts    # TypeScript domain types
│   │   └── App.tsx             # State machine & view router
│   ├── public/samples/         # Bundled realistic test scenarios
│   ├── Dockerfile              # Multi-stage container build with esbuild
│   └── vite.config.ts          # Vite configuration + Tailwind v4
└── simple-agent/               # Vertex AI Agent Engine reasoning agent
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+
- Google Cloud CLI (`gcloud`) or Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/priyaapandey/reality-exe.git
cd reality-exe/reality-exe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure credentials
Create a `.env` file in `reality-exe/`:
```env
PORT=5001
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
# Or use: GEMINI_API_KEY=your_gemini_api_key
```

If using Vertex AI, ensure Application Default Credentials (ADC) are active:
```bash
gcloud auth application-default login
```

### 4. Run the development servers
In terminal 1 (Backend AI Server):
```bash
npx tsx server/index.ts
```

In terminal 2 (Frontend Client):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker & Cloud Run Deployment

Build and deploy directly with Google Cloud Run:

```bash
gcloud run deploy reality-exe \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id,GOOGLE_CLOUD_LOCATION=us-central1
```

---

## 🛠️ Tech Stack

- **AI Model**: Google Gemini 2.5 Flash via `@google/genai`
- **Cloud Platform**: Google Cloud Run & Vertex AI
- **Backend**: Node.js, Express, TypeScript, Zod, esbuild
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons

---

## 📄 License

Apache-2.0
