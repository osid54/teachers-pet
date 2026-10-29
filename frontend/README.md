Teacher's Pet frontend is a Vite + React single-page app using React Router and Tailwind CSS. FastAPI provides the worksheet and template APIs.

## Local development

Install dependencies with `npm install`, then run `npm run dev` from this directory. Open http://localhost:3000. The backend runs separately on port 5000; see the root README for setup.

The API defaults to http://localhost:5000. To use another backend, create `.env.local` here with `VITE_API_BASE_URL=http://localhost:5000`. Vite exposes `VITE_` variables to the browser; do not put secrets in them.

Use `npm run build` to produce static files in `dist/`, `npm run preview` to preview them, and `npm run lint` to check source files.

## Workflow tests

Use Node.js 22.12+ or 24 LTS and run `npm test` from this directory. The Vitest/Testing Library suite uses mocked API responses: it does not connect to Railway, require Python, or write live templates. Tests cover worksheet input state, duplication, template saving/editing, browsing, and generation failures/downloads. Browser layout and real PDF appearance are separate verification steps.

## Deployment

The `Frontend Checks` GitHub Actions workflow runs locked dependency installation, lint, mocked tests, and a production build on Node.js 24 for relevant pushes and PRs. It does not deploy or receive live API credentials. Its build uses a non-production API URL for verification only; production builds still need the Vercel environment variable below.

On Vercel, set the project root to `frontend`, the framework preset to Vite, the build command to `npm run build`, and the output directory to `dist`. Set `VITE_API_BASE_URL` to the Railway backend URL. `vercel.json` rewrites direct navigation to SPA routes back to `index.html`.