# Student Writing Analyser

A Next.js app that analyses scanned handwritten student writing samples against CCSS ELA Grades 6–8 standards using Claude AI.

## Features
- Upload scanned PDFs of student writing
- Automatic handwriting transcription
- Spelling score out of 5
- General observations
- CCSS ELA Grades 6–8 standards assessment
- Download results as CSV

---

## Deploy to Vercel (Step-by-Step)

### Step 1 — Push to GitHub
1. Go to [github.com](https://github.com) and create a new repository (name it `student-writing-analyser`)
2. Upload all these project files to the repository

### Step 2 — Get your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project** → select your `student-writing-analyser` repo
3. Before clicking Deploy, go to **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 2
4. Click **Deploy**
5. In ~2 minutes you'll have a live URL like `student-writing-analyser.vercel.app`

### Step 4 — Share with Teachers
Send the Vercel URL to your colleagues. No login required.

---

## Run Locally (Optional)
```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your API key
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Cost Estimate
- Vercel hosting: **free**
- Anthropic API: ~**$0.01–0.03 per PDF** analysed
- 100 PDFs ≈ $1–3
