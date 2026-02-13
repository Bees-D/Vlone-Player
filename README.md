# Vlone Player 999 🕊️💨

**Vlone Player 999** is a premium, high-fidelity web music player dedicated to the Juice WRLD archive. It provides a seamless, aesthetic experience for streaming over 2,700+ unreleased tracks, sessions, and masters.

---

## 🔗 Project Links & API
- **Main Repository**: [Bees-D/Vlone-Player](https://github.com/Bees-D/Vlone-Player)
- **Asset Storage**: [Bees-D/Vlone-Storage](https://github.com/Bees-D/Vlone-Storage) (Reserved for persistent uploads)
- **API Documentation**: [juicewrldapi.com/api-docs](https://juicewrldapi.com/api-docs)
- **Base URL**: `https://juicewrldapi.com`

---

## 🚀 Quick Start
1. **Install Dependencies**: `npm install`
2. **Setup Environment**: Copy `.env.example` to `.env` and add your `VITE_API_PAT` (optional for public reading).
3. **Run Dev Server**: `npm run dev`
4. **Build for Production**: `npm run build`

---

## ✅ Current Status: Phase 2 COMPLETE
The project has successfully reached the end of Phase 2. The core player is robust, and advanced features like file browsing and playlist management are fully functional.

### Key Features Implemented:
- **Persistent Player**: Mini-player at bottom + Full-screen Immersive Mode.
- **4 Playback Modes**: Normal, Shuffle, Smart Shuffle (30% Radio injection), and 999 Radio (Infinite).
- **Advanced File Explorer**: Root-to-leaf traversal, tree view, search, and sorting.
- **Playlist System**: Create, rename, delete, and import/export playlists (`.vlone.json`).
- **Custom Cover Art**: Support for animated GIF/WebP covers with site-wide replacement.
- **Lyrics & Metadata**: Dedicated song detail views and sliding lyrics panel.
- **Real-Time Stats**: Live dashboard showing database health and API latency.

---

## 🛠️ Deployment Guide

### Vercel (Recommended)
1. Import your repository to Vercel.
2. Vercel will auto-detect Vite.
3. Add `VITE_API_PAT` if needed.
4. Deploy!

### Cloudflare Pages
1. Connect your repository in the Cloudflare Dashboard.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `_redirects` in `public/` (already present) to handle SPA routing.

---

## 🧪 Current Issues & Roadmap (Phase 3)

### Technical Issues to Fix:
1. **Hardcoded URLs**: `src/context/PlayerContext.tsx` contains a legacy path (`/juicewrld/stream`) which should be updated to use the standard API helper.
2. **Duplicate Utils**: `formatDuration` is declared in multiple components. Needs consolidation into `lib/utils.ts`.
3. **Producer Fetching**: `api.getProducers()` only scans the first page. Needs pagination support.
4. **Mega-Components**: `App.tsx` and `HomeView.tsx` need refactoring into smaller sub-components for better maintainability.

### Phase 3 Goals:
- [ ] **Deeper Analytics**: Track "Most Played" and total listening time locally.
- [ ] **Theme Switcher**: Custom accent colors and dynamic backgrounds based on album art.
- [ ] **Offline Support**: PWA integration for caching tracks via Service Workers.
- [ ] **Era Chart**: Replace the placeholder in the Stats Dashboard with a real visualization.

---

**Version**: 2.0.0  
**Last Updated**: February 13, 2026  
**Branding**: Vlone Player 999 / Juice WRLD Vault
