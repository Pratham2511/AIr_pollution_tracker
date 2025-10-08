# AIr Pollution Tracker

## Project Overview
AIr Pollution Tracker is a comprehensive full-stack application designed to monitor and analyze air quality data across 180+ cities worldwide. The project provides users with real-time AQI (Air Quality Index) data, historical trends, interactive analytics dashboards, and health advisories to promote awareness and encourage healthier living.

### Key Features
- 🌍 **Interactive Map Dashboard**: Leaflet-based map with real-time pollution markers for cities worldwide
- 📊 **Advanced Analytics**: City-specific analytics with trend analysis, pollutant breakdowns, and health impact assessments
- 👤 **Guest & Authenticated Access**: Full guest mode support with optional OTP-based email authentication
- 🎯 **City Tracking**: Track your favorite cities and get quick access to their air quality data
- 💊 **Health Advisories**: Personalized health recommendations based on current AQI levels
- 📈 **Data Visualizations**: Interactive charts using Chart.js (line, doughnut, bar, and radar charts)
- 🔒 **Secure Authentication**: OTP-based email authentication with JWT tokens
- ⚡ **Performance Optimized**: Rate limiting, compression, and efficient database queries

## Complete Tech Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + OTP-based email verification (nodemailer)
- **Security**: bcrypt, express-rate-limit, express-validator
- **Testing**: Jest + Supertest

### Frontend
- **Styling**: Tailwind CSS 3.4
- **Charts**: Chart.js
- **Maps**: Leaflet.js
- **Animations**: GSAP
- **Architecture**: Single-page vanilla JavaScript application

### DevOps
- **Deployment**: Render, Heroku, AWS (Docker-ready)
- **Database Migrations**: Sequelize CLI
- **Development**: nodemon for hot-reloading


## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 12+ (local or cloud instance)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Pratham2511/AIr_pollution_tracker.git
cd AIr_pollution_tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. Use `.env.example` as a template:

```bash
cp .env.example .env
```

Configure the following required variables:

```env
# Server Configuration
NODE_ENV=development
PORT=10000

# Database Configuration (for Production - use DATABASE_URL)
DATABASE_URL=postgresql://username:password@host:port/database

# OR for Local Development (use individual parameters)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pollutiondb
DB_USER=pollutiondb_user
DB_PASSWORD=your_password_here

# JWT Secret (REQUIRED)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRY=24h

# Auth & Security
BCRYPT_SALT_ROUNDS=12

# Email Configuration (for OTP)
EMAIL_USER=your_outlook_email@example.com
EMAIL_PASS=your_outlook_password_or_app_password
EXPOSE_OTP_CODES=false
ALLOW_OTP_FALLBACK=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Database Pooling
DB_POOL_MAX=5

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE pollutiondb;
CREATE USER pollutiondb_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE pollutiondb TO pollutiondb_user;
\q
```

#### Run Migrations
```bash
npm run migrate
```

#### Seed Database with Sample Data
```bash
npm run seed
```

This will populate the database with:
- 180 cities across different regions
- ~4 days of hourly pollution readings
- Daily summaries for trend analysis
- Sample tracked cities

### 5. Build Assets (Optional)
```bash
npm run build
```

This compiles Tailwind CSS for production.

### 6. Run the Application

#### Development Mode (with hot-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at:
- Local: `http://localhost:10000` (or your configured PORT)
- API endpoints: `http://localhost:10000/api/*`

### 7. Access the Application
Open your browser and navigate to:
- **Dashboard**: `http://localhost:10000/`
- **Landing Page**: `http://localhost:10000/landing.html`
- **Health Check**: `http://localhost:10000/health`


## API Documentation

### Base URL
```
http://localhost:10000/api
```

### Authentication
Most endpoints support both authenticated users and guest access. Include JWT token in the Authorization header for authenticated requests:
```
Authorization: Bearer <your_jwt_token>
```

For guest access, include:
```
User-Type: guest
```

---

### Auth Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Registration successful. OTP sent to your email.",
  "otpRequired": true,
  "expiresAt": "2024-01-01T12:30:00.000Z",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email address",
  "otpRequired": true,
  "expiresAt": "2024-01-01T12:30:00.000Z",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

---

### Analytics Endpoints

#### List All Cities
```http
GET /api/analytics/cities
```

**Response:**
```json
{
  "cities": [
    {
      "id": 1,
      "name": "Delhi",
      "slug": "delhi",
      "country": "India",
      "region": "Asia",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "isIndian": true
    }
  ]
}
```

#### Get City Details
```http
GET /api/analytics/cities/:slugOrId
```

**Response:**
```json
{
  "city": {
    "id": 1,
    "name": "Delhi",
    "slug": "delhi",
    "country": "India",
    "region": "Asia",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "currentAqi": 156,
    "category": "Unhealthy",
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Get City Analytics
```http
GET /api/analytics/cities/:slugOrId/analytics
```

**Response:**
```json
{
  "cityName": "Delhi",
  "currentAqi": 156,
  "category": "Unhealthy",
  "pollutantSnapshot": {
    "pm25": 89.5,
    "pm10": 156.2,
    "co": 1.2,
    "no2": 45.3,
    "so2": 12.1,
    "o3": 34.6
  },
  "aqiTrend": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "aqi": 156
    }
  ],
  "hourlyPattern": [...],
  "weekdayPattern": [...],
  "improvementTracker": [...],
  "healthImpact": {
    "category": "Unhealthy",
    "color": "#FF6B6B",
    "advice": "Everyone should reduce prolonged outdoor exertion...",
    "sensitiveGroups": ["Children", "Elderly", "People with respiratory conditions"]
  }
}
```

#### Get Overview Analytics
```http
GET /api/analytics/overview
```

**Response:**
```json
{
  "cities": [...],
  "averagePollutants": {
    "pm25": 45.2,
    "pm10": 78.3,
    "co": 0.8,
    "no2": 32.1,
    "so2": 8.5,
    "o3": 28.4
  },
  "categoryDistribution": {
    "Good": 45,
    "Moderate": 67,
    "Unhealthy": 38,
    "Very Unhealthy": 20,
    "Hazardous": 10
  },
  "rankings": {
    "worst": {...},
    "best": {...},
    "mostImproved": [...]
  }
}
```

#### Refresh Analytics (Authenticated)
```http
POST /api/analytics/refresh
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Analytics refreshed successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Pollution Endpoints

#### Get Cities
```http
GET /api/pollution/cities?limit=100
```

#### Get Latest Pollution Reading
```http
GET /api/pollution/latest?cityId=1
```

**Response:**
```json
{
  "reading": {
    "id": 1,
    "cityId": 1,
    "aqi": 156,
    "category": "Unhealthy",
    "pm25": 89.5,
    "pm10": 156.2,
    "co": 1.2,
    "no2": 45.3,
    "so2": 12.1,
    "o3": 34.6,
    "dominantPollutant": "pm10",
    "recordedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Get All Pollution Readings
```http
GET /api/pollution?cityId=1&limit=50&page=1
```

#### Create Pollution Reading (Authenticated)
```http
POST /api/pollution
Authorization: Bearer <token>
Content-Type: application/json

{
  "cityId": 1,
  "aqi": 156,
  "pm25": 89.5,
  "pm10": 156.2,
  "co": 1.2,
  "no2": 45.3,
  "so2": 12.1,
  "o3": 34.6
}
```

---

### Guest Endpoints

#### Get Random City Data
```http
GET /api/guest/random-city
```

**Response:**
```json
{
  "success": true,
  "city": {
    "id": 42,
    "name": "Mumbai",
    "country": "India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "currentReading": {
      "aqi": 98,
      "category": "Moderate",
      "pm25": 45.2,
      "recordedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```


## Project Structure

```
AIr_pollution_tracker/
├── config/
│   └── config.js                 # Sequelize database configuration
├── controllers/
│   ├── analyticsController.js    # Analytics endpoint handlers
│   ├── authController.js         # Authentication logic
│   ├── emailOtpController.js     # OTP management
│   └── pollutionController.js    # Pollution data handlers
├── middleware/
│   ├── auth.js                   # JWT authentication middleware
│   ├── guestAuth.js              # Guest access middleware
│   ├── rateLimiter.js            # Rate limiting configuration
│   └── validation.js             # Request validation schemas
├── migrations/
│   └── *.js                      # Sequelize database migrations
├── models/
│   ├── City.js                   # City model
│   ├── CityDailySummary.js       # Daily aggregation model
│   ├── OtpToken.js               # OTP token model
│   ├── PollutionReading.js       # Pollution reading model
│   ├── TrackedCity.js            # User-tracked cities model
│   ├── User.js                   # User model
│   └── index.js                  # Sequelize initialization
├── public/
│   ├── index.html                # Main dashboard
│   ├── landing.html              # Landing page
│   ├── js/
│   │   └── dashboard.js          # Dashboard functionality
│   ├── styles/
│   │   ├── app.css               # Custom styles
│   │   └── tailwind.*.css        # Tailwind CSS
│   └── Websitelogo.jpeg          # Logo asset
├── routes/
│   ├── analyticsRoutes.js        # Analytics API routes
│   ├── authRoutes.js             # Auth API routes
│   ├── otpRoutes.js              # OTP API routes
│   └── pollutionRoutes.js        # Pollution API routes
├── seeders/
│   └── *.js                      # Database seed files
├── services/
│   ├── analyticsService.js       # Analytics business logic
│   ├── healthAdvisor.js          # Health advisory logic
│   └── otpService.js             # OTP generation/verification
├── tests/
│   └── *.test.js                 # Jest test suites
├── utils/
│   ├── dataGenerator.js          # Synthetic data generator
│   ├── email.js                  # Email utilities
│   └── security.js               # Security utilities
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── .sequelizerc                  # Sequelize CLI configuration
├── package.json                  # Dependencies and scripts
├── server.js                     # Application entry point
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # This file
```

## Database Schema

### Tables

#### Users
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password`: Bcrypt hashed password
- `isAdmin`: Admin flag
- `createdAt`, `updatedAt`: Timestamps

#### Cities
- `id`: Primary key
- `name`: City name
- `slug`: URL-friendly identifier
- `country`: Country name
- `region`: Geographic region
- `latitude`, `longitude`: Coordinates
- `isIndian`: Flag for Indian cities

#### PollutionReadings
- `id`: Primary key
- `cityId`: Foreign key to Cities
- `aqi`: Air Quality Index
- `category`: AQI category (Good, Moderate, etc.)
- `pm25`, `pm10`, `co`, `no2`, `so2`, `o3`: Pollutant levels
- `dominantPollutant`: Primary pollutant
- `recordedAt`: Reading timestamp

#### CityDailySummaries
- `id`: Primary key
- `cityId`: Foreign key to Cities
- `summaryDate`: Date of summary
- `avgAqi`: Average AQI for the day
- `minAqi`, `maxAqi`: Min/max AQI values
- `dominantPollutant`: Most prominent pollutant
- `trendScore`: Trend indicator

#### TrackedCities
- `id`: Primary key
- `userId`: Foreign key to Users
- `cityId`: Foreign key to Cities
- `createdAt`: Tracking start date

#### OtpTokens
- `id`: Primary key
- `userId`: Foreign key to Users
- `otp`: One-time password
- `expiresAt`: Expiration timestamp
- `isUsed`: Usage flag

## Available NPM Scripts

```bash
# Start production server
npm start

# Start development server with hot-reload
npm run dev

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Build Tailwind CSS for production
npm run build

# Build Tailwind CSS only
npm run build:css

# Run tests
npm test
```

## Deployment Guide

### Render Deployment (Recommended)

1. **Create a Render Account**: Sign up at [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Go to "New +" → "PostgreSQL"
   - Choose a name and region
   - Note the Internal Database URL and External Database URL

3. **Create Web Service**:
   - Go to "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `air-pollution-tracker`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run migrate && npm run seed`
     - **Start Command**: `npm start`

4. **Environment Variables**:
   Add in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<your_internal_database_url>
   JWT_SECRET=<generate_secure_random_string>
   EMAIL_USER=<your_email>
   EMAIL_PASS=<your_email_password>
   PORT=10000
   ```

5. **Deploy**: Click "Create Web Service"

### Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t air-pollution-tracker .
   ```

2. **Run with Docker Compose** (recommended):
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:14
       environment:
         POSTGRES_DB: pollutiondb
         POSTGRES_USER: pollutiondb_user
         POSTGRES_PASSWORD: secure_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       
     app:
       build: .
       ports:
         - "10000:10000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://pollutiondb_user:secure_password@db:5432/pollutiondb
         - JWT_SECRET=your_secure_jwt_secret
       depends_on:
         - db
         
   volumes:
     postgres_data:
   ```

   Run with:
   ```bash
   docker-compose up -d
   ```

3. **Or Run Standalone Container**:
   ```bash
   docker run -p 10000:10000 \
     -e DATABASE_URL=postgresql://... \
     -e JWT_SECRET=... \
     air-pollution-tracker
   ```

### Heroku Deployment

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASS=your_password
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Run Migrations**:
   ```bash
   heroku run npm run migrate
   heroku run npm run seed
   ```

### Environment-Specific Configuration

#### Production Checklist
- ✅ Set strong `JWT_SECRET` (minimum 32 characters)
- ✅ Configure `DATABASE_URL` with SSL enabled
- ✅ Set `NODE_ENV=production`
- ✅ Configure email SMTP settings
- ✅ Set appropriate `ALLOWED_ORIGINS` for CORS
- ✅ Enable rate limiting (default settings are production-ready)
- ✅ Review and adjust `DB_POOL_MAX` based on your database plan

## Troubleshooting

### Common Issues

#### Database Connection Errors
**Problem**: `Unable to connect to the database` or `Connection refused`

**Solutions**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check via Activity Monitor/Task Manager
- Check database credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`
- For cloud databases, verify network access and SSL settings
- Check if `DATABASE_URL` format is correct: `postgresql://user:password@host:port/database`

#### Migration Errors
**Problem**: `ERROR: relation "Cities" already exists`

**Solutions**:
```bash
# Reset database (WARNING: destroys all data)
npx sequelize-cli db:migrate:undo:all
npm run migrate
npm run seed
```

#### JWT Token Errors
**Problem**: `Access denied. No token provided` or `Invalid token`

**Solutions**:
- Ensure `JWT_SECRET` is set in `.env`
- Token may have expired (default: 24 hours) - login again
- Check Authorization header format: `Bearer <token>`

#### OTP Not Received
**Problem**: OTP emails not being delivered

**Solutions**:
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Check spam/junk folder
- Enable "Allow less secure apps" or use App Password for Gmail/Outlook
- Set `ALLOW_OTP_FALLBACK=true` for development (auto-authenticates)
- Set `EXPOSE_OTP_CODES=true` in development to see OTP in API response

#### Port Already in Use
**Problem**: `Error: listen EADDRINUSE: address already in use :::10000`

**Solutions**:
```bash
# Find process using port 10000
lsof -i :10000  # macOS/Linux
netstat -ano | findstr :10000  # Windows

# Kill the process or change PORT in .env
export PORT=3000
```

#### Missing Dependencies
**Problem**: Module not found errors

**Solutions**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Tailwind CSS Not Building
**Problem**: Styles not applied or build errors

**Solutions**:
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check if tailwindcss is installed
npm list tailwindcss
```

#### Guest Mode Not Working
**Problem**: Guest endpoints return authentication errors

**Solutions**:
- Add `User-Type: guest` header to requests
- Or simply don't include any Authorization header (defaults to guest)

### Development Tips

- **Enable Debug Logging**: Set `NODE_ENV=development` to see detailed logs
- **Reset Database**: Use migration undo commands to reset schema
- **Test API Endpoints**: Use the included `test-api.html` page at `/test-api.html`
- **Check Health**: Visit `/health` endpoint to verify server status
- **Hot Reload**: Use `npm run dev` instead of `npm start` for automatic restarts

### Performance Issues

#### Slow Queries
- Check PostgreSQL indexes are created (handled by migrations)
- Monitor database connection pool: adjust `DB_POOL_MAX`
- Review query patterns in browser Network tab

#### High Memory Usage
- Reduce `DB_POOL_MAX` if running on limited resources
- Check for memory leaks in long-running processes
- Use production mode: `NODE_ENV=production npm start`

### Getting Help

If you encounter issues not covered here:
1. Check the [GitHub Issues](https://github.com/Pratham2511/AIr_pollution_tracker/issues)
2. Review `masterprompt.md` for detailed project context
3. Check application logs for detailed error messages
4. Verify your environment matches the requirements in Prerequisites section


## Contributing Guidelines

We welcome contributions to the AIr Pollution Tracker project! Please follow these guidelines:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AIr_pollution_tracker.git
   cd AIr_pollution_tracker
   ```
3. **Set up development environment** following the Setup Instructions above
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow
1. **Make your changes**:
   - Write clean, maintainable code
   - Follow existing code style and conventions
   - Add comments for complex logic
   
2. **Test your changes**:
   ```bash
   npm test
   npm run dev  # Manual testing
   ```

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m 'Add: Brief description of your changes'
   ```
   
   **Commit Message Guidelines**:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes
   - `Test:` for test additions/modifications

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes

### Code Standards

#### JavaScript
- Use ES6+ features where appropriate
- Use `const` and `let`, avoid `var`
- Follow existing formatting (2-space indentation)
- Use meaningful variable and function names

#### Database
- All schema changes must include migrations
- Test migrations with both `migrate` and `migrate:undo`
- Update seed files if needed

#### API
- Document new endpoints in README
- Validate all inputs
- Return appropriate HTTP status codes
- Include error handling

#### Frontend
- Use Tailwind utility classes
- Ensure responsive design
- Test on multiple screen sizes
- Maintain accessibility standards

### Testing
- Write tests for new features
- Ensure existing tests pass: `npm test`
- Test both authenticated and guest modes
- Test edge cases and error conditions

### Pull Request Checklist
- [ ] Code follows project conventions
- [ ] Tests added/updated and passing
- [ ] Documentation updated (README, comments)
- [ ] No console.log statements in production code
- [ ] Environment variables documented in .env.example
- [ ] Migrations tested (up and down)
- [ ] Changes tested in both development and production mode

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features (analytics, visualizations, etc.)
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage improvements
- 🌐 Internationalization (i18n)
- ♿ Accessibility improvements

### Questions?
- Open an issue for discussion before starting large changes
- Check existing issues and PRs to avoid duplicates
- Be respectful and constructive in all interactions

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Chart.js** for beautiful data visualizations
- **Leaflet** for interactive maps
- **Tailwind CSS** for styling framework
- **Sequelize** for database ORM
- **Express.js** for backend framework

## Contact & Support

- **Repository**: [github.com/Pratham2511/AIr_pollution_tracker](https://github.com/Pratham2511/AIr_pollution_tracker)
- **Issues**: [GitHub Issues](https://github.com/Pratham2511/AIr_pollution_tracker/issues)
- **Maintainer**: [@Pratham2511](https://github.com/Pratham2511)

---

**Built with ❤️ to promote cleaner air and healthier living**
