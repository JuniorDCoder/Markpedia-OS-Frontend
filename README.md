# Markpedia OS — Frontend

A modern frontend for Markpedia OS built with Next.js 13 (App Router) and TypeScript. The UI is styled with Tailwind CSS and uses shadcn/ui + Radix UI primitives. State and server data are managed with Zustand and TanStack Query. HTTP requests are handled via Axios service modules.

This project is configured for static export (next export), making it easy to deploy to any static hosting provider.

## Tech Stack
- Language: TypeScript (React 18)
- Framework: Next.js 13.5 (App Router under `app/`)
- Styling: Tailwind CSS + tailwindcss-animate
- UI: shadcn/ui + Radix UI
- Data fetching: Axios
- State: Zustand
- Server state/query: TanStack Query
- Icons: lucide-react
- Charts: Recharts
- Animations: Framer Motion
- Build: Next.js (SWC) with static export enabled
- Linting: ESLint via `next lint`
- Package manager: npm (package-lock.json present)

## Requirements
- Node.js: 18.x or newer is recommended for Next.js 13.5
- npm: 9+ recommended (comes with Node 18+)

TODO: Add an `.nvmrc` or engines field to lock the Node version used in development/CI.

## Getting Started
1. Install dependencies:
   - npm install
2. Copy environment file and set variables (see Environment Variables below):
   - cp .env.example .env.local  # if present; otherwise create .env.local
3. Start the development server:
   - npm run dev
4. Open http://localhost:3000 in your browser.

## Scripts
- npm run dev — Start the Next.js dev server
- npm run build — Build the app (produces a static export due to `output: 'export'`)
- npm run start — Start Next.js server mode
  - Note: With `output: 'export'`, Next.js generates a static `out/` directory. `next start` is not used to serve exported static builds. Instead, use a static server (see Deployment/Preview below). Keeping this script for parity; verify usage if switching off static export. TODO: Confirm intended usage of `start` for this project.
- npm run lint — Run ESLint checks

## Environment Variables
Defined in code:
- NEXT_PUBLIC_API_BASE_URL — Base URL for Axios (public, exposed to the browser). Defaults to `/api` if not set.
  - Location: services/api.ts

How to set:
- Create `.env.local` at the repo root and add:
  - NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the client bundle.

## Project Structure
Top-level directories and notable files:
- app/ — App Router routes and layout; global CSS at `app/globals.css`.
- components/ — Reusable UI components (shadcn/ui under `components/ui`).
- hooks/ — Custom React hooks.
- lib/ — Utilities and helper modules.
- services/ — API clients and integrations (e.g., `services/api.ts`).
- store/ — Zustand stores.
- types/ — Shared TypeScript types.
- public/ — Static assets (if present).
- next.config.js — Next.js configuration (`output: 'export'`, image optimization disabled, build ignores TS/ESLint errors).
- tailwind.config.ts — Tailwind configuration; scans `app`, `components`, and `pages`.
- postcss.config.js — PostCSS configuration.
- tsconfig.json — TypeScript configuration with `strict: true` and path alias `@/*`.
- components.json — shadcn/ui configuration and path aliases.
- package.json — Project metadata and npm scripts.

## Development Notes
- Static export: The project sets `output: 'export'` and `images: { unoptimized: true }`. `npm run build` will generate `out/` for static hosting.
- TypeScript/ESLint during build: `next.config.js` is configured to ignore TypeScript and ESLint errors in CI builds. Re-enable for stricter pipelines if desired.
- Path aliases: `@/*` maps to the repo root (see `tsconfig.json`).

## Running and Building
- Development:
  - npm run dev
- Production build (static export):
  - npm run build
  - The static site is output to the `out/` directory.
- Preview a static build locally:
  - npx serve@latest out
  - or use any static file server to serve the `out/` directory.

## Testing
No test framework is set up in this repository, and no test files were found.

TODO:
- Choose and configure a test setup (e.g., Jest/React Testing Library for unit tests, Playwright for E2E).
- Add test scripts (e.g., `npm test`, `npm run test:e2e`) and CI integration.

## Environment & Configuration Checklist
- [ ] Provide `.env.example` with documented variables.
- [ ] Decide on production API base URL and set `NEXT_PUBLIC_API_BASE_URL` accordingly.
- [ ] Consider re-enabling TypeScript/ESLint checks during `next build` for CI quality gates.
- [ ] Confirm whether static export is intended; if not, remove `output: 'export'` and use `npm run start` for server rendering.

## Deployment
Since the project uses static export, typical options include:
- Static hosts: GitHub Pages, Netlify, Vercel (static), Cloudflare Pages, S3 + CloudFront, etc.
- Build command: npm run build
- Publish directory: out

If server-side rendering (SSR) is desired, remove `output: 'export'` and configure a Node runtime (e.g., deploy to Vercel with SSR or a Node server running `npm run start`).

## License
No license file was found in the repository.

TODO: Add a LICENSE file (e.g., MIT, Apache-2.0) that matches the project's intended licensing.

## Contributing
- Fork the repo and create a feature branch.
- Run and test changes locally.
- Open a PR with a clear description and screenshots/gifs if UI changes are involved.

## Acknowledgements
- Next.js
- Tailwind CSS and tailwindcss-animate
- shadcn/ui and Radix UI
- TanStack Query
- Zustand
- Lucide Icons
- Recharts
- Framer Motion
