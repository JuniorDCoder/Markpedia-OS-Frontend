<!-- .github/copilot-instructions.md -->
# Copilot / AI Agent Instructions — Markpedia OS Frontend

Short, practical guidance to help AI coding agents be immediately productive in this repository.

1) Big picture
- Framework: Next.js 13 (App Router) using `app/` for routes and layouts. Global CSS lives in `app/globals.css`.
- UI: Tailwind + `components/ui` (shadcn patterns) and Radix primitives under `components/`.
- Data & state: HTTP via `lib/api/*` and `services/*.ts`; client state via `store/` (Zustand) and server state via TanStack Query.

2) Where to make API changes
- Primary HTTP helper: `lib/api/client.ts` — use `apiRequest()` and `loginApi()` as examples.
- Service modules live in `services/` (e.g. `attendanceService.ts`, `goalService.ts`); add new endpoints there for consistency.
- Environment vars: `lib/api/client.ts` prefers `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_API_URL`. `services/api.ts` also reads `process.env.NEXT_PUBLIC_BACKEND_URL`.

3) Auth & storage patterns
- Auth store: `store/auth.ts` exposes `useAuthStore`, `login`, `logout`, and `initializeAuth()` — localStorage keys used: `auth_token` and `auth_user`.
- When adding auth flows, mirror `loginApi()` usage and persist via the store helpers.

4) Build / dev / lint commands (concrete)
- Install: `npm install`
- Dev: `npm run dev` (Next dev server)
- Build: `npm run build` (project currently configured to ignore TS/ESLint errors during build in `next.config.js` — see notes below)
- Lint: `npm run lint`

5) Project-specific gotchas & conventions
- `next.config.js` currently sets `typescript.ignoreBuildErrors = true` and `eslint.ignoreDuringBuilds = true`. Do not assume builds enforce type/ESLint checks unless these are changed.
- The README mentions static export, but `next.config.js` has `output: 'export'` commented out. Verify intended deployment mode before changing build/deploy logic.
- Mock data: `services/api.ts` contains significant mock objects used during development. Check whether a service is mocked before calling backend endpoints.
- Avoid editing compiled assets under `.next/` — source files live under `app/`, `components/`, `lib/`, `services/`, `store/`.

6) Patterns and examples to follow
- Route + UI: Add pages under `app/(dashboard)/...` to match existing nested layout conventions (see `app/(dashboard)/layout.tsx`).
- API call example: `await apiRequest('/some/path', { method: 'GET' })` from `lib/api/client.ts`.
- Zustand example: use `useAppStore` in `store/app.ts` for UI state like `sidebarCollapsed`.

7) Tests, CI, and missing pieces
- No test framework configured. If adding tests, prefer Jest + React Testing Library for unit tests and Playwright for E2E. Add corresponding `npm` scripts and CI steps.
- Add `.env.example` and consider adding `engines` or `.nvmrc` to lock Node versions (README suggests Node 18+).

8) When editing or creating files
- Keep TypeScript strictness (project uses `strict: true` in `tsconfig.json`), but note builds may ignore errors — still aim for no type errors.
- Use existing patterns (service modules, Zustand stores, and shadcn component patterns). Copy one of the service files in `services/` as a template.

9) Useful files to open when starting work
- `app/` (routes + layouts)
- `lib/api/client.ts` (API wrapper)
- `services/*` (service clients)
- `store/*` (Zustand stores)
- `components/ui/*` (shadcn component patterns)
- `next.config.js` and `package.json` (build + env conventions)

If any section is incomplete or you want more examples (e.g., a short checklist for adding a new service or a PR template), tell me which area and I will expand or iterate.
