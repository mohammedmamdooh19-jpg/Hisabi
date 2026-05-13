# Hisabi · حسابي
### Your Personal Finance Tracker for Bahrain

---

## 🚀 Deploy to Vercel (Step by Step)

### Option A — Drag & Drop (Easiest, no account needed for dev)

1. Go to **vercel.com** and sign up (free) with your email or GitHub
2. Click **"Add New Project"**
3. Choose **"Import Git Repository"** OR scroll down to **"Deploy without Git"**
4. Drag and drop this entire `hisabi` folder
5. Vercel auto-detects it as a React app
6. Click **Deploy**
7. In ~2 minutes you'll have a live URL like `hisabi.vercel.app` 🎉

### Option B — Via GitHub (Recommended for future updates)

1. Create a free GitHub account at github.com
2. Create a new repository called `hisabi`
3. Upload all files from this folder to the repo
4. Go to vercel.com → "Add New Project" → Import from GitHub
5. Select the `hisabi` repo → Deploy
6. Every time you update the code on GitHub, Vercel auto-redeploys ✨

---

## 🔑 Important: API Key Setup

The AI chat feature needs an Anthropic API key to work.

1. Get a free API key at **console.anthropic.com**
2. In Vercel dashboard → your project → **Settings** → **Environment Variables**
3. Add: `REACT_APP_ANTHROPIC_KEY` = your key
4. Redeploy

> Without the key, everything works except the AI chat.

---

## 🌐 Custom Domain (hisabi.bh)

1. Buy `hisabi.bh` from a domain registrar (nic.bh for .bh domains)
2. In Vercel → your project → **Settings** → **Domains**
3. Add `hisabi.bh` and follow the DNS instructions
4. Done — usually takes 10–30 minutes to go live

---

## 📱 Add to iPhone Home Screen (PWA)

1. Open `hisabi.vercel.app` in Safari on iPhone
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. It appears as an app icon — opens fullscreen, no browser bar!

Same works on iPad and Android.

---

## 📁 File Structure

```
hisabi/
├── public/
│   ├── index.html       ← App shell + fonts
│   ├── manifest.json    ← PWA config (Add to Home Screen)
│   ├── icon-192.png     ← App icon (add your own)
│   └── icon-512.png     ← App icon large (add your own)
├── src/
│   ├── index.js         ← React entry point
│   └── App.jsx          ← The entire Hisabi app
├── package.json         ← Dependencies
├── vercel.json          ← Vercel routing config
└── README.md            ← This file
```

---

## 🔄 Making Changes Later

1. Come back to Claude with this file
2. Describe what you want to change
3. Get updated `App.jsx`
4. Replace the file in your GitHub repo (or re-upload to Vercel)
5. Live in minutes ✨

---

Built with ❤️ in Bahrain · حسابي — Track every fils.
