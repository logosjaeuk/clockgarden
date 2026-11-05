# Clock Garden — Horology Journal & Chronometry Lab

This repository contains the authoritative digital journal and research archive for Clock Garden (`clockgarden.com`).

## Architecture
- Framework: Astro 7 Content Layer (SSG)
- Content Collections: `src/content/articles/*.md`
- Categories: `mechanics`, `history`, `astronomy`, `horology-care`
- Local CMS: `cms/server.mjs` (port 3333, `npm run cms`)
- Deployment: Cloudflare Pages (`npm run build`, output: `dist`)
