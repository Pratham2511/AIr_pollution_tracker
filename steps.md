Project: Air Pollution Tracker
Tech Stack: HTML, JavaScript, Bootstrap 5.3, Node.js, Express.js, PostgreSQL, Leaflet
(optional) Light TailwindCSS usage (~20%) for refinement


---

🎯 Goal

You are an expert full-stack AI web developer.
You must modernize and enhance my existing project Air Pollution Tracker into a smooth, accurate, professional-grade web app — while keeping all existing functionality fully operational.

Your mission is to:

Upgrade design, animations, and analytics

Use accurate, realistic air pollution data

Maintain PostgreSQL backend & API structure

Keep deployment-ready for Render



---

⚡ Core Improvements

1. Frontend Modernization

Keep HTML + Bootstrap 5.3 as the main styling system.

Use TailwindCSS (≈20%) for refined layouts, typography, and utilities (e.g., spacing, gradients, shadows).

Smooth transitions via GSAP / Framer Motion / Animate.css.

Fully responsive, accessible, and modern UI/UX.

Clean, minimalist, professional dashboard feel.



---

🌆 Single City Analysis Page

Each city card in the “Tracker” tab has a “Detailed Analysis” button → /city-analysis.html.

Focus: One city only.

Show 6 key analyses (unique & non-overlapping):

1. City AQI Trend – hourly/daily AQI progression


2. Pollutant Concentration – PM2.5, PM10, CO, NO₂, SO₂, O₃ comparison


3. Dominant Pollutant – highlight main AQI driver


4. Day & Hour Patterns – typical pollution peaks


5. Health Impact – advisory based on AQI and pollutants


6. 3-Day Improvement Tracker – short-term AQI change



📊 Use Chart.js for all visualizations.
No map view here — Leaflet only used in Map View tab.
All data fetched dynamically from PostgreSQL via efficient Express routes.


---

🌍 Overall City Analysis Page

From “Tracker” tab → “Overall Analysis” → /overall-analysis.html.

Focus: All tracked cities (user-added)

Show 6 major analyses (unique):

1. Multi-City AQI Comparison – rank & compare


2. Average Pollutant Levels – pollutant trends across cities


3. AQI Category Distribution – % of cities by AQI category


4. Regional Pollution Correlation – pattern similarities


5. Overall Trend & Ranking – best/worst, most improved cities


6. 3-Day Aggregate Change – overall AQI movement



📊 Use Chart.js only, no Leaflet here.
Ensure smooth transitions, responsive visuals, and efficient API fetches.


---

💾 PostgreSQL Database (Realistic Data)

Use a realistic, code-generated dataset that reflects real-world pollution patterns, not mock samples.

Rules for Data Accuracy:

Generate data programmatically based on real-world ranges and trends (e.g., India, USA, Europe, Asia).

AQI and pollutant values must be plausible and follow realistic variation curves (urban vs rural, day vs night).

Include:

200 total cities
→ 80 major Indian cities (accurate spellings, major metros + Tier-2)
→ 120 global cities (diverse continents)


Include daily/hourly AQI and pollutant breakdowns (PM2.5, PM10, CO, NO₂, SO₂, O₃).

Generate data via code logic, not static CSVs.

Use timestamps, city metadata (lat/lon, region) for correlation features.

Optimize PostgreSQL with indexes, views, and materialized queries for faster chart loading.



---

🔐 OTP Authentication (MailerSend API)

Email validation (catch typos like @gamil.com)

Strong password rules (≥8 chars, 1 uppercase, 1 lowercase, 1 special)

OTP via MailerSend API

6-digit OTP

5-minute expiry

/api/verify-otp endpoint


Store env vars:

MAILERSEND_API_KEY

SENDER_EMAIL


Integrate OTP in login flow with Bootstrap modal & clean UI



---

⚙️ Render Deployment

Environment variables: MAILERSEND_API_KEY, SENDER_EMAIL, DB credentials

HTTPS-compatible OTP

Optimize build and start commands

Validate all pages post-deployment



---

📦 Deliverables

Updated, well-commented codebase

Realistic data-driven PostgreSQL schema + seed generator

Fully functional:

Single City Analysis (6 charts)

Overall Analysis (6 charts)

Map View tab (Leaflet)

OTP login flow


Render-ready deployment guide



---

🚀 Performance & Quality Targets

Smooth 60 fps UI animations

Optimized PostgreSQL queries

Modular, maintainable codebase

Cross-browser, mobile responsive

Data realism close to actual air quality trends



---

✅ Summary

Transform Air Pollution Tracker into a professional, accurate, and visually stunning web app that combines:

True-to-life pollution data

12 analytical charts (6 + 6)

PostgreSQL backend

Tailwind-enhanced Bootstrap UI

OTP-secured login

Render-ready deployment


All with clean design, smooth animations, and high data integrity.
