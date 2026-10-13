# Reality.exe — An AI That Turns What It Sees Into Action

> *"See it. Understand it. Do it."*

Reality.exe converts real-world images (messy desks, cluttered study areas, unorganized spaces) into grounded visual intelligence and structured, interactive execution missions using Gemini Vision.

---

## 🌟 Key Features

1. **Grounded Visual Intelligence**:
   - Uses the official `@google/genai` SDK with multimodal vision (`gemini-2.5-flash`).
   - Categorizes findings into **Direct Visible Facts** vs. **Inferences** with confidence ratings.
   - Highlights the single **Primary Transformation Opportunity**.

2. **Exactly 3 Prioritized Action Blueprints**:
   - ⚡ **QUICK WIN**: 2–5 minute immediate momentum builder.
   - 🎯 **HIGH IMPACT**: The highest-payoff focal improvement solving the core disorder.
   - 🛡️ **LONG-TERM**: Lasting habit, prevention, or storage architecture.

3. **Interactive Mission Mode**:
   - Converts any selected blueprint into a live execution checklist.
   - Dynamic progress bar, live task completion counter, and state tracking.
   - **Mission Accomplished Screen**: Congratulatory celebration, mission recap, and automatic recommendation for the next mission.

4. **Production Architecture**:
   - **Backend**: Express + Node.js + `@google/genai` + Zod schema validation.
   - **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
   - **Zero Secret Leakage**: All Gemini Vision inference and credentials remain strictly on the backend.

---

## 🚀 Quickstart

### 1. Configure Environment
Create a `.env` in the `reality-exe` root:

```bash
# If using a Gemini API Key:
GEMINI_API_KEY=your_gemini_api_key

# Or if running in Google Cloud / Lab with Vertex AI ADC:
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
PORT=5001
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Environment

Run both the Express backend and the Vite frontend:

```bash
# Terminal 1: Run Express AI Backend
npx tsx server/index.ts

# Terminal 2: Run Vite Frontend
npm run dev
```

Open your browser at:
`http://localhost:5173`
