<br>

# Airlytics – Air Pollution Tracker

Airlytics is a full-stack experience that helps people understand the air they breathe. It blends a glassmorphic landing page, an interactive Tailwind-powered dashboard, rich analytics, and a callable API into a single deployment-ready project that targets Indian cities first but adapts to any region.

---

## Why this project exists

- Make invisible pollution visible with an approachable user interface.
- Give families, students, and city planners fast answers: How bad is the air right now, is it getting better, and what should we do next?
- Provide developers with a reference implementation that demonstrates authentication hardening, rate-limiting, analytics aggregation, and Render-friendly deployment practices.

---

## What you get at a glance

- **Immersive UI** – Landing and dashboard screens with animated gradients, cards, theming, and responsive layouts that scale from phones to desktops.
- **Actionable analytics** – Aggregated AQI history, pollutant breakdowns, region comparisons, and three-day trend forecasting generated server-side.
- **Secure authentication** – Email + password login with Outlook SMTP OTP challenge, guest access for try-before-you-sign-up, JWT-based sessions, and password hardening rules.
- **Performance-minded backend** – Express with gzip compression, trust-proxy support, configurable CORS, retry-friendly database initialization, and health checks tuned for Render.
- **Test coverage** – Jest and Supertest suites exercising authentication, analytics overviews, and key middleware logic.

---

## Architecture snapshot

- **Client**
  - Static assets served from the `public` directory (landing page, dashboard, guest funnel).
  - Tailwind CSS compiled locally into a single minified bundle (`npm run build:css`).
  - Leaflet maps, Chart.js visualizations, GSAP transitions, and custom scripts for guest onboarding.

- **Server**
  - Express 4 with modular routers for authentication, pollution data, analytics, and OTP verification.
  - Middleware layer for rate limiting, validation, guest access scoping, and centralized error handling.
  - Nodemailer-based SMTP integration that automatically falls back to in-response OTPs when credentials are missing.

- **Data layer**
  - PostgreSQL in production, SQLite during tests. Sequelize models for Users, PollutionReadings, CityDailySummaries, TrackedCities, and OTP tokens.
  - Seed scripts to populate cities and demo readings. Analytics service composes summaries, rankings, and trend indicators without raw SQL in application code.

- **Infrastructure**
  - Deployable on Render via `render.yaml`. Build pipeline now installs development dependencies, compiles Tailwind, and prunes before release (`npm ci && npm run build && npm prune --omit=dev`).
  - `.nvmrc` targets Node 20 on the platform while package engines vector toward Node 18 locally.

---

## User experience highlights

- **Landing journey** – A story-driven page that explains the problem, sells the solution, and guides visitors toward login, guest preview, or data exploration.
- **Dashboard** – Cards, charts, and maps update automatically; tracked cities persist in local storage; guest prompts nudge visitors to register without blocking access.
- **Accessibility** – Semantic landmarks, ARIA labels on interactive cards, focus-visible states, and text contrast tuned for glassmorphism backgrounds.

---

## Security and resilience

- Passwords must be long, complex, and free from personal information. The validator rejects breached and trivial combinations.
- JWT secrets default to a clear warning so production deploys must set `JWT_SECRET` explicitly.
- Rate limiting guards both authentication and general API surfaces, with higher ceilings for analytical endpoints.
- OTP delivery defaults to Outlook SMTP; fallback mode keeps demos working by surfacing the OTP in API responses only when explicitly permitted.
- Health endpoint responds even when the database is still connecting, so Render can complete health checks during cold starts.

---

## Environment reference

Configure these environment variables before running or deploying. Describe them in human language to keep this document code-free:

- **DATABASE_URL** (or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD) – points Sequelize to your PostgreSQL instance.
- **DB_PORT** and **DB_POOL_MAX** – shape the connection pool; defaults align with Render’s free tier limits.
- **JWT_SECRET** – required for token signing; store securely.
- **JWT_EXPIRY** – token lifetime (defaults to twenty-four hours).
- **BCRYPT_SALT_ROUNDS** – password hashing cost factor (twelve is a good balance).
- **EMAIL_USER** and **EMAIL_PASS** – Outlook/Hotmail SMTP credentials or app password.
- **ALLOW_OTP_FALLBACK** – set to true for demos without SMTP; set to false in production to enforce email delivery.
- **EXPOSE_OTP_CODES** – only enable in automated tests; otherwise leave false.
- **ALLOWED_ORIGINS** – comma-separated list of trusted front-end origins.
- **PORT** – listening port; Render injects one automatically.

---

## Getting started locally (no code blocks required)

1. Install Node.js 18 or later together with npm 9 or later.
2. Install PostgreSQL (or use the embedded SQLite workflow for tests).
3. Clone the repository and move into the project directory using your preferred Git workflow.
4. Install dependencies by running npm install inside the project directory.
5. Build the Tailwind stylesheet through npm run build:css so the dashboard can load its styles.
6. Create a `.env` file and populate the environment variables described above.
7. Apply database migrations with npm run migrate, then seed demo data with npm run seed if you want immediate sample readings.
8. Start the server with npm start (production-style) or npm run dev (nodemon-powered development loop).
9. Visit the landing page at http://localhost:10000/ and the dashboard at http://localhost:10000/dashboard.

---

## Testing and quality gates

- Run npm test to execute the Jest suite; it uses an isolated SQLite database and fakes SMTP delivery.
- Linting is handled implicitly by standardized formatting within the repo; integrate ESLint or Prettier as a future enhancement if team conventions require it.
- Tailwind assets should be rebuilt (npm run build:css) whenever you update classes in `public/styles/tailwind.input.css`.
- Database migrations are idempotent; re-run npm run migrate after changing schema definitions to keep environments aligned.

---

## Deploying on Render

1. Create a new Web Service on Render and point it to this repository. Select the Node runtime.
2. Provision a PostgreSQL instance on Render (the free tier works for demos) and copy the External URL into your service as DATABASE_URL. Mirror the host, port, user, and password variables if you prefer the expanded configuration.
3. Add all required environment variables from the earlier checklist, including JWT secrets and SMTP credentials. Leave ALLOW_OTP_FALLBACK enabled only if you are comfortable exposing fallback OTPs in API responses.
4. Render executes the build command specified in `render.yaml`: install all dependencies, compile Tailwind, then prune development-only packages to reduce runtime size.
5. The start command launches the Express server in production mode. Render’s health check hits `/health`; once it returns OK the service is live.
6. Open a shell on the running instance (Render Dashboard → Shell) and execute npm run migrate once to create the tables. Optionally run npm run seed to load demo data.

If you previously used `npm ci --omit=dev`, update your service configuration or redeploy so the new build command takes effect; this change prevents Tailwind from going missing during builds and eliminates the 502 errors reported by Render.

---

## Data lifecycle

- **Static city metadata** lives in `public/data/cities.js` and the `cities` table populated via seeders.
- **Pollution readings** are seeded for demos. The `PollutionReading` model supports full CRUD and links to both `User` and `City` records.
- **City daily summaries** power analytics charts. The service layer aggregates averages, regional comparisons, and rolling trends directly in JavaScript so that deployments without database functions still work.
- **Materialized view refresh** endpoint attempts to call a Postgres stored procedure (`refresh_city_pollution_analytics`). Provide that function in production if you want real-time recomputation; otherwise the call is safely skipped.

---

## Observability and operations

- Server logs clearly mark database status, CORS origins, and warnings about insecure defaults.
- A keep-alive interval re-authenticates every thirty seconds to detect dropped database connections and restart the connection logic without knocking the service offline.
- Compression and JSON body limits keep response sizes low and guard against payload abuse.
- Static files are served with cache-busting headers for HTML while letting CSS and JS be cached by the browser.

---

## Features available today

- Guest mode with guardrails (limited pagination, truncated payloads) and a fast “random city” API that powers the landing marquee.
- Authenticated dashboard experience with tracked cities stored locally, interactive map selection, and an analytics overview that gracefully falls back when data is sparse.
- OTP-secured login flow that returns helpful diagnostics about SMTP delivery state, plus email typo suggestions during login.
- Admin-ready CRUD endpoints for pollution readings, protected by role checks and validation middleware.
- Rate-limited analytics endpoints (`/api/analytics/...`) that deliver filtered city lists, detail views, and aggregated insights for the frontend visualizations.

---

## Features present in code but not fully surfaced yet

- **Tracked city persistence** – Database models, migrations, and associations exist, but the current UI still stores tracked cities in the browser. Expose the corresponding API endpoints and sync logic to persist selections server-side.
- **Pollution reading management UI** – The backend exposes create, update, and delete routes with validation and admin authorization, yet the dashboard does not surface forms or controls for these actions.
- **Materialized analytics refresh** – The `/api/analytics/refresh` endpoint expects a database function named `refresh_city_pollution_analytics`. Implement that function or replace it with a background job to generate fresh summaries.
- **OTP token persistence** – There is an `OtpToken` model ready for long-lived token storage. The current implementation keeps OTPs in-memory; migrate to persistent storage if you need shared or multi-instance deployments.
- **Health advice granularity** – `services/healthAdvisor.js` prepares nuanced recommendations per pollutant, but the frontend currently surfaces only the primary message.

Documenting these unfinished threads helps future contributors pick them up without reverse-engineering the codebase.

---

## Roadmap and stretch ideas

- Connect to real-time government or third-party AQI feeds instead of relying on seeded data.
- Expand the geography beyond India and add localized content for each region.
- Deliver push notifications or email digests when AQI crosses critical thresholds.
- Build a native mobile companion and reuse the API for data access.
- Layer in historical trend analysis over months or years, backed by archival tables.

---

## How to contribute

1. Log bugs or enhancement ideas in the issue tracker so they can be triaged.
2. Fork the repository, branch off `main`, and commit focused changes. Follow conventional commit messages if you plan to automate releases.
3. Include unit tests or snapshot updates when you modify backend behavior.
4. Run npm test and npm run build locally before opening a pull request. Share build output in the PR description to speed up review.
5. Document UI or API changes in this README to keep deployment consumers informed.

---

## Credits

- Concept and development: **Pratham** (GitHub: @Pratham2511)
- Visual inspiration: modern glassmorphism design systems and Tailwind UI patterns.
- Open-source libraries: Express, Sequelize, Chart.js, Leaflet, GSAP, Nodemailer, Tailwind CSS.

---

## Support and contact

- Open GitHub issues for bugs, deployment questions, or enhancement requests.
- For private outreach, use the email address configured in the project maintainer’s profile.
- Keep an eye on the Render dashboard for operational insights; the health check endpoint is `/health`.

---

Clean air should be accessible knowledge. Airlytics turns data into decisions—thanks for helping it grow.
