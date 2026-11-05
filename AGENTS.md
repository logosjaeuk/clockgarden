# Clock Garden — Smart Work & Productivity Field Guide

This repository contains the authoritative digital journal and practical knowledge archive for Clock Garden (`clockgarden.com`).

## Architecture
- Framework: Astro 7 Content Layer (SSG)
- Content Collections: `src/content/articles/*.md`
- Categories: `spreadsheet`, `notion`, `templates`, `workflow`
- Design System: Modern minimal document system (pure slate & clean white, modern royal blue accent, system sans-serif)
- Local CMS: `cms/server.mjs` (port 3333, `npm run cms`)
- Deployment: Cloudflare Pages (`npm run build`, output: `dist`)
