# AppealBench

**LLM Insurance Appeal Comparator** — Compare AI-generated insurance appeal letters across multiple LLMs using 15 expert-designed evaluation metrics.

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Features](#features)
- [How It Works](#how-it-works)
- [Evaluation Metrics](#evaluation-metrics)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Development)](#quick-start-local-development)
- [API Keys](#api-keys)
- [Input Modes: API vs Manual Paste](#input-modes-api-vs-manual-paste)
- [Production Build](#production-build)
- [Deployment & Hosting](#deployment--hosting)
- [Uploading to GitHub (Step by Step)](#uploading-to-github-step-by-step)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Why This Exists

Insurance denials are increasingly common, and appeal letters vary dramatically in quality depending on which AI model generates them. A physician or patient advocate often has no objective way to compare which LLM produces the most effective appeal. AppealBench solves this by running the same appeal prompt through multiple LLMs simultaneously, then having a judge model score each output across 15 metrics specifically designed for insurance appeal effectiveness — including medical necessity argumentation, legal compliance, denial rebuttal strength, and predicted overturn likelihood.

---

## Features

- **Multi-LLM Generation** — Claude Opus 4.6, GPT-5, GLM-5, and OpenEvidence
- **Flexible Input Per Model** — Every model supports both API generation AND manual paste (copy output from any source)
- **15 Evaluation Metrics** — Purpose-built for insurance appeals (medical necessity, denial rebuttal, legal compliance, etc.)
- **Choose Your Judge** — Select which model evaluates the outputs (Claude Opus 4.6, GPT-5, or GLM-5)
- **Visual Comparison** — Radar charts, horizontal bar charts, and detailed scoring tables with justifications
- **Weighted Scoring** — Metrics weighted by importance for appeal overturn likelihood
- **Flexible API Keys** — Enter in the UI, use server-side `.env`, or both
- **Recommendation Engine** — Judge provides a written recommendation and improvement suggestions
- **Copy & Expand** — Copy any output to clipboard or expand to full view

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. USER ENTERS APPEAL DETAILS                          │
│     Patient info, diagnosis, denied service,            │
│     denial reason, supporting evidence                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  2. SELECT MODELS & INPUT MODES                         │
│     Each model: choose [⚡ API] or [📋 Paste]           │
│     API = auto-generate · Paste = manual input          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  3. GENERATE & COMPARE                                  │
│     API models → server calls provider APIs             │
│     Paste models → user's pasted text included          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  4. SELECT JUDGE & EVALUATE                             │
│     Judge model scores all outputs on 15 metrics        │
│     Returns: scores, justifications, recommendation     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  5. VISUAL RESULTS                                      │
│     Radar chart · Bar chart · Score table · Rec panel   │
└─────────────────────────────────────────────────────────┘
```

---

## Evaluation Metrics

Each metric is scored 1–10 by the judge model, then weighted to produce an overall composite score.

| # | Metric | Weight | What It Measures |
|---|--------|--------|-----------------|
| 1 | Medical Necessity Argumentation | 10 | Strength of clinical justification for the requested treatment/service |
| 2 | Clinical Evidence & Guideline Citation | 9 | References to peer-reviewed literature, NCCN, UpToDate, clinical guidelines |
| 3 | Plan Language Reference | 8 | Cites the insurer's own coverage criteria, plan documents, or formulary |
| 4 | Legal/Regulatory Compliance | 8 | ERISA, ACA, state mandate references, regulatory framework accuracy |
| 5 | Denial Reason Rebuttal | 10 | Directly addresses the stated denial rationale point by point |
| 6 | Patient-Specific Clinical Detail | 7 | Incorporates individual medical history, comorbidities, prior treatments |
| 7 | Structural Completeness | 6 | Proper format: header, timeline, narrative, request, escalation path |
| 8 | Persuasive Tone Calibration | 7 | Assertive but professional; not adversarial or obsequious |
| 9 | Actionable Request Clarity | 7 | Unambiguous ask: overturn, peer-to-peer, external review |
| 10 | Supporting Documentation References | 6 | Calls out attached records, letters of medical necessity, chart notes |
| 11 | Urgency & Timeline Communication | 8 | Deadlines, clinical consequences of delay, time-sensitive needs |
| 12 | Precedent & Prior Auth History | 6 | Cites relevant prior approvals, comparable cases, or case law |
| 13 | Readability & Clarity | 5 | Accessible to non-clinical reviewers while maintaining accuracy |
| 14 | Completeness of Required Elements | 7 | All regulatory appeal requirements met (member ID, dates, provider info) |
| 15 | Overall Predicted Effectiveness | 10 | Composite likelihood of appeal overturn based on all factors |

**Overall Score Formula:**  `weighted_overall = Σ(metric_score × metric_weight) / Σ(all_weights)`

---

## Architecture

```
llm-appeal-judge/
├── server/
│   ├── index.js              # Express API server
│   │                         #   POST /api/generate  → calls LLM APIs
│   │                         #   POST /api/evaluate  → judge scores outputs
│   │                         #   GET  /api/metrics   → returns metric definitions
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main React application (all components)
│   │   ├── App.css           # Full application styling (dark theme)
│   │   └── main.jsx          # React entry point
│   ├── index.html            # HTML shell with font imports
│   ├── vite.config.js        # Vite dev config with API proxy to :3001
│   └── package.json
├── .env.example              # Template for server-side API keys
├── .gitignore                # node_modules, dist, .env excluded
├── package.json              # Root scripts (setup, dev, build, start)
└── README.md                 # This file
```

**Tech Stack:**  React 18 · Vite · Recharts · Node.js · Express · DM Sans + Playfair Display + JetBrains Mono

---

## Prerequisites

Before you begin, ensure you have installed:

| Tool | Check Command | Install Link |
|------|--------------|-------------|
| **Node.js 18+** | `node --version` | [nodejs.org](https://nodejs.org) (use LTS) |
| **npm** | `npm --version` | Comes with Node.js |
| **Git** | `git --version` | [git-scm.com/downloads](https://git-scm.com/downloads) |

---

## Quick Start (Local Development)

### Step 1: Get the Project

**If cloning from GitHub:**
```bash
git clone https://github.com/YOUR_USERNAME/llm-appeal-judge.git
cd llm-appeal-judge
```

**If extracting from the downloaded `.tar.gz`:**
```bash
tar xzf llm-appeal-judge.tar.gz
cd llm-appeal-judge
```

### Step 2: Install Dependencies

```bash
npm run setup
```

This runs `npm install` in both the `server/` and `client/` directories.

### Step 3: Configure API Keys (Optional — can also enter in UI)

```bash
cp .env.example .env
```

Open `.env` in your editor and add your API keys:
```env
CLAUDE_OPUS_4_6_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
GPT_5_API_KEY=sk-xxxxxxxxxxxxx
GLM_5_API_KEY=xxxxxxxxxxxxx
```

### Step 4: Start the Development Servers

```bash
npx concurrently "npm run dev:server" "npm run dev:client"
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173` (with automatic proxy to backend)

### Step 5: Open the App

Navigate to **http://localhost:5173** in your browser. You're running!

---

## API Keys

### Two Ways to Provide Keys (Use Either or Both)

| Method | How | Best For |
|--------|-----|----------|
| **UI Entry** | Click "API Configuration" panel, enter keys | Personal use, quick testing |
| **Server `.env`** | Add keys to `.env` file | Hosted deployments, shared instances |

UI keys are stored in browser memory only — never persisted to disk.

### Where to Get API Keys

| Provider | Model | Sign Up | Pricing |
|----------|-------|---------|---------|
| **Anthropic** | Claude Opus 4.6 | [console.anthropic.com](https://console.anthropic.com) | Pay-per-use (~$15/1M input tokens) |
| **OpenAI** | GPT-5 | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Pay-per-use |
| **Zhipu AI** | GLM-5 | [open.bigmodel.cn](https://open.bigmodel.cn) | Pay-per-use |
| **OpenEvidence** | N/A | [openevidence.com](https://www.openevidence.com) | Free (paste output manually) |

**Typical cost per run** (generate 3 letters + evaluate): $0.15–$0.50

---

## Input Modes: API vs Manual Paste

Every model card has a toggle between **⚡ API** and **📋 Paste** mode:

| Mode | How It Works | When to Use |
|------|-------------|-------------|
| **⚡ API** | App calls the provider's API with your prompt | You have an API key and want automatic generation |
| **📋 Paste** | You paste output text from any external source | No API key, using a web UI tool, or comparing existing output |

**OpenEvidence** defaults to Paste (no public API). All others default to API but can be switched to Paste. This lets you mix-and-match: run Claude via API, paste GPT-5 from ChatGPT's web UI, and paste OpenEvidence — all in the same comparison.

---

## Production Build

```bash
npm run build     # Builds React frontend into client/dist/
npm start         # Express serves built frontend + API on port 3001
```

Access at `http://localhost:3001`.

---

## Deployment & Hosting

### Option A: Railway (Recommended — Easiest)

[Railway](https://railway.app) deploys directly from GitHub with zero config.

1. Push code to GitHub (see [below](#uploading-to-github-step-by-step))
2. Go to [railway.app](https://railway.app) → sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"** → select `llm-appeal-judge`
4. Configure:
   - **Build Command:** `cd client && npm install && npx vite build && cd ../server && npm install`
   - **Start Command:** `cd server && node index.js`
5. Go to **Variables** tab → add your API keys:
   ```
   CLAUDE_OPUS_4_6_API_KEY=sk-ant-xxxxx
   GPT_5_API_KEY=sk-xxxxx
   GLM_5_API_KEY=xxxxx
   PORT=3001
   ```
6. Railway gives you a public URL automatically

**Cost:** Free tier (500 hrs/month). Paid from $5/month.

### Option B: Render (Free Tier Available)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → sign in with GitHub
3. **"New"** → **"Web Service"** → connect repo
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `cd server && npm install && cd ../client && npm install && npx vite build`
   - **Start Command:** `cd server && node index.js`
5. Add environment variables → Deploy

**Cost:** Free tier (spins down after 15 min idle). Paid from $7/month.

### Option C: DigitalOcean App Platform

1. Push code to GitHub
2. [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps) → **"Create App"** → connect repo
3. **Build Command:** `npm run setup && npm run build`
4. **Run Command:** `npm start`
5. Add environment variables → Deploy

**Cost:** From $5/month.

### Option D: Self-Hosted VPS

```bash
# On your VPS (Ubuntu):
ssh root@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone https://github.com/YOUR_USERNAME/llm-appeal-judge.git
cd llm-appeal-judge
npm run setup
cp .env.example .env && nano .env   # add your keys
npm run build

# Run with PM2 (keeps it running after you disconnect)
sudo npm install -g pm2
pm2 start server/index.js --name appealbench
pm2 save && pm2 startup

# (Optional) Nginx reverse proxy + free HTTPS
sudo apt install nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/appealbench`:
```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/appealbench /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com   # free HTTPS via Let's Encrypt
```

---

## Uploading to GitHub (Step by Step)

### First Time Setup (If You've Never Used GitHub)

#### 1. Create a GitHub Account
- Go to [github.com](https://github.com) → **"Sign up"**
- Choose username, enter email, create password
- Verify your email address

#### 2. Install Git

**macOS:**
```bash
xcode-select --install
```

**Windows:**  
Download from [git-scm.com/download/win](https://git-scm.com/download/win). Use default settings. This gives you **Git Bash** — use it for all commands below.

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install git
```

#### 3. Configure Git with Your Identity

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your-email@example.com"
```
Use the same email you registered on GitHub.

#### 4. Create a GitHub Personal Access Token (Required for Pushing)

GitHub no longer accepts passwords. You need a token:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name it: `Git CLI`
4. Expiration: 90 days (or "No expiration")
5. Check the **`repo`** scope (full control of repositories)
6. Click **"Generate token"**
7. **Copy the token now** (starts with `ghp_`) — you won't see it again!
8. Save it somewhere secure (password manager recommended)

#### 5. Create a New Repository on GitHub

1. Log into GitHub
2. Click the **`+`** in the top-right → **"New repository"**
3. Fill in:
   - **Repository name:** `llm-appeal-judge`
   - **Description:** `Compare LLM outputs for insurance appeal letters with 15 evaluation metrics`
   - **Visibility:** ✅ Public (so anyone can use it)
   - ❌ Do NOT check "Add a README" (we already have one)
   - ❌ Do NOT check "Add .gitignore" (we already have one)
4. Click **"Create repository"**
5. Keep the page open — you'll need the URL shown

#### 6. Extract Project and Push to GitHub

Open Terminal (macOS/Linux) or Git Bash (Windows):

```bash
# Navigate to where you downloaded the file
cd ~/Downloads

# Extract the project
tar xzf llm-appeal-judge.tar.gz
cd llm-appeal-judge

# Initialize Git
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: AppealBench v1.0 — LLM Insurance Appeal Comparator"

# Rename branch to main
git branch -M main

# Connect to GitHub (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/llm-appeal-judge.git

# Push to GitHub
git push -u origin main
```

**When prompted for credentials:**
- **Username:** your GitHub username
- **Password:** paste your Personal Access Token (from step 4), NOT your GitHub password

#### 7. Verify It Worked

Go to `https://github.com/YOUR_USERNAME/llm-appeal-judge` in your browser. You should see all your files with this README displayed.

### Making Updates Later

```bash
# After editing files:
git add .
git commit -m "Description of what you changed"
git push
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_OPUS_4_6_API_KEY` | No* | Anthropic API key for Claude Opus 4.6 |
| `GPT_5_API_KEY` | No* | OpenAI API key for GPT-5 |
| `GLM_5_API_KEY` | No* | Zhipu AI API key for GLM-5 |
| `PORT` | No | Server port (default: `3001`) |

*At least one API key is needed for generation/evaluation. Keys can be provided via `.env` or entered in the UI.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Cannot find module" errors** | `rm -rf server/node_modules client/node_modules && npm run setup` |
| **API returns 401/403** | Check API key is correct and billing is set up at the provider |
| **Port already in use** | `lsof -i :3001` then `kill -9 <PID>`, or use `PORT=3002 npm start` |
| **Build fails on host** | Ensure Node.js 18+; check build command installs deps for both server AND client |
| **Evaluation returns parse error** | Re-run evaluation; try a different judge model (Claude is most reliable for JSON) |
| **Blank page after build** | Run `cd client && npx vite build` and verify `client/dist/` has files |
| **CORS errors in browser** | Ensure you're accessing via `localhost:5173` (dev) or `localhost:3001` (prod), not opening files directly |

---

## Contributing

Contributions are welcome! Ideas for improvement:

- Add more LLM providers (Gemini, Llama, Mistral)
- Export evaluation results to PDF
- Save comparison history
- Custom metric definitions
- Batch comparison mode
- Fine-tune weights based on actual appeal outcomes

To contribute: Fork → Branch → Commit → Push → Pull Request.

---

## Disclaimer

This tool is for informational and comparison purposes only. It does not constitute legal or medical advice. Evaluation scores are generated by AI models and represent the judge model's assessment — not a guarantee of appeal success. Always consult qualified healthcare and legal professionals for insurance appeal decisions.

---

## License

MIT — free to use, modify, and distribute.
