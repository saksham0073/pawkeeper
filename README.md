# 🐾 PawKeeper — Deployment Guide

## What's in this package

```
pawkeeper/
├── src/
│   ├── main.jsx          ← React entry point
│   └── PawKeeper.jsx     ← Full app (with localStorage persistence)
├── public/
│   ├── manifest.json     ← PWA manifest (makes it installable on phone)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── index.html            ← HTML shell
├── package.json          ← Dependencies (React + Vite)
├── vite.config.js        ← Build config
├── vercel.json           ← Vercel routing (SPA support)
└── .gitignore
```

---

## What changed from the Claude prototype

- **localStorage persistence** — Dora, Scooby, all vet visits, events, and reminders
  now survive page refreshes. Data is saved automatically on every change.
- **Versioned storage** — keys are prefixed `pk_v1_` so future schema updates
  can migrate data cleanly without breaking existing saves.
- **PWA-ready** — manifest + icons mean users can "Add to Home Screen" on iOS/Android.

---

## Step 1 — Set up locally (takes ~3 minutes)

You need Node.js installed. Check: `node -v`
If missing, download from https://nodejs.org (LTS version).

```bash
# 1. Unzip this folder somewhere on your computer, then:
cd pawkeeper

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

Open http://localhost:5173 — you'll see PawKeeper running.
Test that data persists: add a vet visit, refresh the page — it should still be there.

---

## Step 2 — Push to GitHub

```bash
# Inside the pawkeeper folder:
git init
git add .
git commit -m "Initial PawKeeper deploy"

# Create a new repo on github.com (name it: pawkeeper)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/pawkeeper.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy to Vercel (free, takes ~2 minutes)

1. Go to **vercel.com** → sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and import your **pawkeeper** repo
4. Vercel auto-detects Vite — leave all settings as default
5. Click **"Deploy"**

That's it. You'll get a live URL like `pawkeeper.vercel.app` in about 60 seconds.

### Every future update:
```bash
# Make changes to PawKeeper.jsx, then:
git add .
git commit -m "describe your change"
git push
```
Vercel auto-rebuilds and redeploys. Your live URL updates in ~30 seconds.

---

## Step 4 — Install on your phone

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap the three-dot menu → "Add to Home screen"
3. PawKeeper appears as an app icon — tap it to open full-screen

### iPhone (Safari)
1. Open your Vercel URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap "Add" — PawKeeper appears on your home screen

---

## Adding features after deployment

You never need to re-deploy manually. The workflow is:

1. Open PawKeeper.jsx in Claude → ask for changes
2. Copy the updated file into your local `src/` folder
3. `git add . && git commit -m "add feature X" && git push`
4. Vercel deploys automatically — live in ~30 seconds

Your data in localStorage is safe across code updates.

---

## Future upgrades (when you're ready)

| Feature | What to add |
|---|---|
| Real OCR prescription scan | Replace `extractFromImage()` in PawKeeper.jsx with Claude Vision API call |
| Google Calendar full sync | Add Google OAuth backend (Supabase Edge Functions work well) |
| Push notifications | Add a Service Worker file + `Notification.requestPermission()` |
| Multi-device sync | Replace localStorage with Supabase database (free tier) |
| Private login | Add Supabase Auth — one file change |

---

## Troubleshooting

**`npm install` fails** → Make sure you're inside the `pawkeeper/` folder, not a parent directory.

**Blank screen on Vercel** → Check the Vercel build log. Usually means a missing dependency — run `npm install` locally first to confirm it builds.

**Data not persisting** → Open browser DevTools → Application → Local Storage → check for `pk_v1_pets` key. If it's there, persistence is working.

**"Add to Home Screen" not appearing on iPhone** → Must use Safari specifically, not Chrome on iOS.
