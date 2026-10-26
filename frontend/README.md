Teacher's Pet frontend is a Vite + React single-page app using React Router and Tailwind CSS. FastAPI provides the worksheet and template APIs.

## Local development

Install dependencies with `npm install`, then run `npm run dev` from this directory. Open http://localhost:3000. The backend runs separately on port 5000; see the root README for setup.

The API defaults to http://localhost:5000. To use another backend, create `.env.local` here with `VITE_API_BASE_URL=http://localhost:5000`. Vite exposes `VITE_` variables to the browser; do not put secrets in them.

Use `npm run build` to produce static files in `dist/`, `npm run preview` to preview them, and `npm run lint` to check source files. Existing lint findings in the template/worksheet flows are not part of the framework migration.

## Deployment

On Vercel, set the project root to `frontend`, the framework preset to Vite, the build command to `npm run build`, and the output directory to `dist`. Set `VITE_API_BASE_URL` to the Railway backend URL. `vercel.json` rewrites direct navigation to SPA routes back to `index.html`.