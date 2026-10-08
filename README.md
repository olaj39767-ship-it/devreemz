# wastech — Smart Electronics Storefront & Concierge

A chat-first storefront and AI concierge for brand-new and certified used electronics, complete with live inventory matching, trade-in valuations, want-list sourcing, and hardware device diagnostics.

---

## Deploying to Vercel

This project is pre-configured to deploy on [Vercel](https://vercel.com) out of the box with zero custom build configuration needed.

### Step 1: Push or Import to GitHub
1. In Google AI Studio, export or sync your project to your GitHub repository (via **Settings > Export to GitHub** or download as ZIP).

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select your imported GitHub repository.
3. Vercel will automatically detect:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (configured via `vercel.json`)

### Step 3: Add Environment Variables
Before clicking **Deploy**, open the **Environment Variables** section and add:
- `GEMINI_API_KEY`: Your Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)).

### Step 4: Click Deploy!
- Vercel will compile the Vite frontend into `dist/` and automatically deploy the Serverless Function in `api/index.ts` to power the API endpoints (`/api/chat`, `/api/trade-in-quote`, `/api/sourcing-request`, `/api/health`, `/api/inventory`).
- Both SPA page reloads and API routing are handled seamlessly through `vercel.json`.

---

## Running on Localhost (Step-by-Step)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the root folder:
```bash
# .env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```
*(You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). If you don't provide one, the app will still run smoothly and will use the intelligent offline concierge fallback).*

### 3. Start the Development Server
```bash
npm run dev
```
You will immediately see terminal output confirming:
```
----------------------------------------------------
🚀 wastech Concierge server is running!
👉 Local:   http://localhost:3000
👉 Network: http://0.0.0.0:3000
🔑 GEMINI_API_KEY: Configured ✅ (or Missing ⚠️)
----------------------------------------------------
```

### 4. Open in Your Browser
Open **`http://localhost:3000`** in your browser (Chrome, Safari, Firefox, Edge, etc.).

- **Terminal Console**: You will see all API routes logged (e.g. `[API] GET /api/health`, `[AI Concierge] Processing query`).
- **Browser Developer Tools (`F12` / Inspect > Console)**: You will see `[wastech Frontend Active]` and all chat communication logged with real-time payload objects.
