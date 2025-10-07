You are GitHub Copilot working in the Air-Pollution_Tracker repository (Node.js + Express backend, Sequelize ORM, PostgreSQL, Tailwind/Chart.js/Leaflet frontend). Backend entry point: `server.js`. Current branch: main.

Project state recap:
• Auth + session model:
  - Supports OTP login for users; guests identified via `User-Type` header.
  - Middleware stack includes rate limiting, guest guard, and JWT handling.
• Database schema (Sequelize migrations applied previously, but rerun if needed):
  - Tables: `Users`, `Cities`, `PollutionReadings`, `CityDailySummaries`, `TrackedCities`, `OtpTokens`.
  - Materialized view or refresh helper exposed via analytics service for cross-city aggregates.
• Services/controllers/routes recently added or refreshed:
  - `services/analyticsService.js`: provides city list, city analytics payload (trend, pollutants, health), overview metrics, view refresh.
  - `controllers/analyticsController.js`: wraps service with request/response handling, guards for refresh endpoint.
  - `routes/analyticsRoutes.js`: exposes `/api/analytics/cities`, `/api/analytics/cities/:slug/analytics`, `/api/analytics/overview`, `/api/analytics/refresh` (protected).
  - `server.js`: wires analytics routes, ensures guest flow still returns live city readings, integrates refresh guard.
• Data seeding pipeline:
  - `utils/dataGenerator.js`: deterministic synthetic dataset generator (180 cities, baseline AQI profiles, hourly readings for ~4 days, daily summaries, tracked cities).
  - `seeders/20231001000001-demo-pollution-readings.js`: now uses generator, resets ID sequences for Postgres, populates all relevant tables.
• Frontend dashboard overhaul:
  - `public/index.html`: Tailwind-based layout with hero, analytics cards, charts, map, tracked panel, health module; references `/js/dashboard.js`, Tailwind CDN, Chart.js, Leaflet, GSAP.
  - `public/styles/app.css`: custom scrollbar, map popup styling, dark theme polish.
  - `public/js/dashboard.js`: handles state, API fetches, guest/auth badge, overview hydration, Chart.js charts (line/doughnut/bar/radar), Leaflet markers/popup actions, city search/filter, tracked-city persistence (localStorage, guest limits), health advisory rendering, GSAP animations when available.

Tooling/config reminders:
• `package.json` scripts: 
  - `start` (production), `dev` (nodemon), `migrate`, `seed`, `build` (currently echo).
• Dependencies already installed: express, sequelize, pg, express-rate-limit, express-validator, chart.js, leaflets/GSAP (loaded via CDN in index), jest/supertest for tests.
• No tests run after recent changes. Last recorded command: `npm run build` (just echo).
• Environment: expects Postgres connection via `.env`. Guests leverage random city fallback if analytics fails.

Outstanding / next-step items:
1. Run DB migrations + seeds in a fresh environment; confirm synthetic data loads correctly and analytics queries return expected structures. Verify materialized view refresh under Postgres (guarded for SQLite).
2. Replace alert-based error handling in `public/js/dashboard.js` with non-blocking UI feedback (toast/notification component). Consider reusing Tailwind classes; ensure focus management/accessibility.
3. Add backend tests (jest + supertest) covering analytics routes (city list, city analytics, overview, refresh guard). Optionally integrate service-level unit tests with mocked repositories.
4. Evaluate dashboard performance with 180+ cities: consider debouncing searches, limiting markers, or lazy loading for mobile.
5. Polish UX: loading skeletons for city detail/overview, tooltip enhancements, responsive tweaks for sub-768px breakpoints.
6. Stretch goal: persist tracked cities server-side for authenticated users (update `TrackedCities` via API), sync with localStorage at login/logout.

When resuming:
- Ensure `.env` configured (DB credentials, JWT secret, OTP email settings if applicable).
- Run `npm install` (if dependencies missing), then `npm run migrate`, `npm run seed`.
- Launch `npm run dev` to validate endpoint responses; use `/api/analytics/...` to verify payload shapes.
- Confirm static assets served correctly (Leaflet CSS/JS must remain available via CDN or local copy).
- Continue implementing remaining tasks in priority order above, updating documentation/tests as needed.

Use this context to guide further modernization and validation.