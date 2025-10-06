# 🌍 Air Pollution Tracker - Airlytics

> **Track air quality across India with real-time pollution data, interactive maps, and personalized analytics!**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-render-url.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-17-blue)](https://www.postgresql.org)

---

## 📖 What is This Project?

**Airlytics** is a web application that helps you track air pollution in Indian cities! 🇮🇳

Imagine you're planning to go outside to play, but you want to know if the air quality is good enough. This app tells you:
- 🌡️ How clean or polluted the air is (AQI score)
- 💨 What's in the air (PM2.5, PM10, CO, NO₂, SO₂, O₃)
- 🏥 What to do based on air quality (play outside vs. stay indoors)
- 📊 Compare pollution between different cities
- 🔮 Predict air quality for the next 3 days

Think of it like a **weather app, but for air pollution**!

---

## ✨ Key Features

### For Everyone:
- 🗺️ **Interactive Map** - See pollution levels across 50+ Indian cities
- 📍 **City Cards** - Beautiful cards showing real-time air quality data
- 🎨 **Color-Coded AQI** - Green = Good, Yellow = Moderate, Red = Unhealthy
- 💨 **Wind Animations** - Cool visual effects showing air movement
- 🏥 **Health Recommendations** - What to do based on air quality

### For Registered Users (Free Account):
- 💾 **Save Your Cities** - Track your favorite cities permanently
- 📊 **Advanced Analysis** - View charts comparing pollution across cities
- 🔮 **3-Day Forecast** - Predict future air quality
- ⚖️ **City Comparison** - Compare pollution between any 2 cities
- ☁️ **Cloud Sync** - Access your data from any device

### For Guest Users (No Account Needed):
- 👀 **View Only** - See pollution data (limited to 3 cities)
- 🚫 **No Saving** - Data clears when you close the browser
- 🔒 **Basic Features** - No advanced analysis or forecasting

---

## 🎯 How It Works (Simple Explanation)

### 1️⃣ **You Visit the Website**
```
You → Open Browser → Go to Airlytics
```

### 2️⃣ **Choose How to Use It**
```
Option A: Register (Free!) → Get full features + save your data
Option B: Continue as Guest → Limited features, no saving
```

### 3️⃣ **Add Cities You Care About**
```
Click "Add Random City" → Mumbai appears
Click Map → Choose Delhi → Added!
```

### 4️⃣ **See Pollution Data**
```
City Cards Show:
- AQI Number (50 = Good, 200 = Unhealthy)
- PM2.5, PM10, NO₂, SO₂, CO, O₃ levels
- Health advice (e.g., "Great day to play outside!")
```

### 5️⃣ **Analyze & Compare**
```
Go to Analysis Tab → See Charts
- Which city has worst air?
- Compare Mumbai vs. Delhi
- Predict next 3 days
```

### 6️⃣ **Your Data is Safe**
```
Logout → Your cities saved in database
Login Tomorrow → All your cities are back!
```

---

## 🛠️ Tech Stack (Technologies Used)

### Frontend (What You See):
| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **HTML5** | Structure of web pages | Like the skeleton of a house |
| **CSS3** | Makes it look pretty | Like painting and decorating |
| **JavaScript** | Makes it interactive | Like adding working doors and lights |
| **Bootstrap 5** | Pre-made styles | Like using LEGO blocks instead of making everything from scratch |
| **Chart.js** | Graphs and charts | Turns numbers into pretty visual graphs |
| **Leaflet.js** | Interactive maps | Like Google Maps but customizable |

### Backend (Behind the Scenes):
| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Node.js** | Runs JavaScript on server | Like the engine of a car |
| **Express.js** | Handles web requests | Like a waiter taking orders and bringing food |
| **PostgreSQL** | Database (stores data) | Like a big filing cabinet for all user data |
| **Sequelize** | Talks to database | Translates JavaScript to database language |
| **JWT** | Secure login tokens | Like a special ID card that proves you're logged in |
| **bcrypt** | Password security | Scrambles passwords so hackers can't read them |

### Hosting (Where It Lives):
- **Render.com** - The "home" where the website lives 24/7
- **GitHub** - Where the code is stored (like Google Drive but for code)

---

## 📊 Project Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER VISITS WEBSITE                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   LANDING PAGE (/)            │
         │   - Login Form                │
         │   - Register Form             │
         │   - Guest Access Button       │
         └───────────┬───────────────────┘
                     │
        ┏━━━━━━━━━━━━┻━━━━━━━━━━━━┓
        ▼                          ▼
┌───────────────┐          ┌──────────────┐
│  REGISTER     │          │  GUEST LOGIN │
│  - Enter Name │          │  - No signup │
│  - Email      │          │  - Limited   │
│  - Password   │          │              │
└───────┬───────┘          └──────┬───────┘
        │                         │
        ▼                         │
┌───────────────┐                 │
│  LOGIN        │                 │
│  - Email      │                 │
│  - Password   │                 │
└───────┬───────┘                 │
        │                         │
        └─────────┬───────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  DASHBOARD (/dashboard) │
        └─────────┬───────────┘
                  │
    ┏━━━━━━━━━━━━━┻━━━━━━━━━━━━━┓
    ▼                            ▼
┌─────────────┐          ┌──────────────┐
│ TRACKER TAB │          │ MAP TAB      │
│ (Home View) │          │ (Interactive)│
└─────┬───────┘          └──────┬───────┘
      │                         │
      │ • Add Random City       │ • View 50+ Cities
      │ • Remove Cities         │ • Click to Add
      │ • Refresh Data          │ • Zoom & Pan
      │ • View City Cards       │
      │                         │
      └────────┬────────────────┘
               │
               ▼
     ┌────────────────────┐
     │   DATABASE SYNC    │
     │                    │
     │  IF REGISTERED:    │
     │  ✓ Save to DB      │
     │  ✓ Load from DB    │
     │  ✓ Persist Forever │
     │                    │
     │  IF GUEST:         │
     │  ✗ localStorage    │
     │  ✗ Lost on logout  │
     └────────┬───────────┘
              │
              ▼
    ┌──────────────────────┐
    │  ANALYSIS TAB        │
    │  (Registered Only)   │
    │                      │
    │  • 4 Trend Charts    │
    │  • City Comparison   │
    │  • 3-Day Forecast    │
    │  • Detailed Stats    │
    └──────────┬───────────┘
               │
               ▼
         ┌──────────┐
         │  LOGOUT  │
         │          │
         │ Clears:  │
         │ • Token  │
         │ • Cache  │
         └────┬─────┘
              │
              ▼
         BACK TO LANDING PAGE
```

---

## 🚀 How Data Flows

### When You Add a City:

```
1. You Click "Add Random City" Button
           ↓
2. JavaScript picks a random city from list (50 cities)
           ↓
3. IF Registered User:
   → Sends city data to Server (API)
   → Server saves to PostgreSQL Database
   → Returns success message
   
   IF Guest User:
   → Saves to Browser's localStorage only
   → No server/database involved
           ↓
4. City Card appears on screen
           ↓
5. Done! ✅
```

### When You Logout and Login Again:

```
REGISTERED USER:
1. Logout → Clears browser data
2. Login → Server checks username/password
3. Server finds your tracked cities in database
4. Sends cities back to your browser
5. All your cities appear again! ✅

GUEST USER:
1. Logout → All data deleted
2. No database entry
3. Start fresh next time ❌
```

---

## 📁 Project Structure (Simplified)

```
Air-Pollution_Tracker/
│
├── 📄 server.js                 # Main server file (brain of backend)
├── 📄 package.json              # List of tools/libraries we use
├── 📄 render.yaml               # Deployment configuration
│
├── 📂 models/                   # Database structure definitions
│   ├── User.js                  # How user data is stored
│   └── TrackedCity.js           # How city data is stored
│
├── 📂 migrations/               # Database table creation scripts
│   ├── create-users.js
│   └── create-tracked-cities.js
│
├── 📂 public/                   # Frontend files (what you see)
│   ├── index.html               # Main dashboard page
│   ├── landing.html             # Login/Register page
│   │
│   ├── 📂 styles/               # CSS styling files
│   │   ├── common.css           # Shared styles
│   │   ├── landing.css          # Login page styles
│   │   ├── dashboard.css        # Dashboard styles
│   │   └── main.css             # Main styles
│   │
│   ├── 📂 scripts/              # JavaScript files
│   │   └── pollutionTracker.js  # Main app logic
│   │
│   └── 📂 data/
│       └── cities.js            # List of 50 Indian cities
│
├── 📂 controllers/              # Business logic
│   ├── authController.js        # Handles login/register
│   └── pollutionController.js   # Handles pollution data
│
├── 📂 middleware/               # Security & validation
│   ├── auth.js                  # Checks if user is logged in
│   ├── validation.js            # Validates input data
│   └── rateLimiter.js           # Prevents spam/abuse
│
└── 📂 routes/                   # API endpoints
    ├── authRoutes.js            # /api/auth/*
    └── pollutionRoutes.js       # /api/cities/*
```

---

## 🎮 How to Use (User Guide)

### For New Users:

#### **Step 1: Register (30 seconds)**
1. Go to the website
2. Click "Register" tab
3. Enter:
   - Your name (e.g., "Pratham")
   - Email (e.g., "pratham@example.com")
   - Password (at least 6 characters)
4. Click "Register" button
5. ✅ You're in!

#### **Step 2: Add Your First City**
1. Click **"Add Random City"** button
2. A city card appears showing:
   - City name (e.g., "Mumbai")
   - AQI number (e.g., 85 - Moderate)
   - Pollutants (PM2.5, PM10, etc.)
   - Health advice
3. Add more cities as needed

#### **Step 3: Explore the Map**
1. Click **"Map"** tab at the top
2. See markers for 50+ Indian cities
3. Click any marker
4. Click **"Add to Tracker"** in popup
5. City added to your tracker!

#### **Step 4: View Advanced Analysis**
1. Click **"Analysis"** tab
2. See 4 charts comparing all your cities:
   - PM2.5 levels
   - PM10 levels
   - NO₂ levels
   - O₃ levels
3. Scroll down for City Comparison
4. Select 2 cities to compare side-by-side

#### **Step 5: Check 3-Day Forecast**
1. Still in Analysis tab
2. Scroll to "3-Day Forecast" section
3. See predictions for next 3 days
4. Green = Improving, Red = Getting worse

---

## 🔑 Key Concepts Explained (For Beginners)

### What is AQI? (Air Quality Index)
Think of it like a grade for air quality:
- **0-50 (Green)** = A+ (Excellent! Go play outside!)
- **51-100 (Yellow)** = B (Good, but sensitive people be careful)
- **101-150 (Orange)** = C (Unhealthy for sensitive groups)
- **151-200 (Red)** = D (Unhealthy, limit outdoor activity)
- **201-300 (Purple)** = F (Very unhealthy, stay indoors)
- **301+ (Maroon)** = F- (Hazardous! Don't go outside!)

### What are PM2.5 and PM10?
**Particulate Matter** = Tiny dust particles in air
- **PM2.5** = Super tiny (smaller than human hair)
  - Can go deep into your lungs
  - More dangerous
- **PM10** = Slightly bigger
  - Still harmful but not as much

Think of PM2.5 like invisible sand that can hurt your lungs!

### What is a Database?
A **database** is like a super organized filing cabinet:
- Each drawer = Table (Users, Cities, etc.)
- Each folder = Row (One user, One city)
- Each paper = Field (Name, Email, AQI, etc.)

When you save cities, they go into the database so you can find them later!

### What is JWT (JSON Web Token)?
A **JWT** is like a movie ticket:
- You buy a ticket (login with password)
- Theatre gives you a ticket (server gives you JWT)
- You show ticket to enter (browser sends JWT with each request)
- Ticket expires after time (JWT expires after 24 hours)

---

## 💻 For Developers: Setup Instructions

### Prerequisites
- Node.js v18+ installed
- PostgreSQL database
- Git installed
- Text editor (VS Code recommended)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/Pratham2511/Air-Pollution_Tracker.git
cd Air-Pollution_Tracker

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your values
DATABASE_URL=postgresql://username:password@localhost:5432/airlytics
JWT_SECRET=your-secret-key-here
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development
PORT=10000

# 5. Run database migrations
npx sequelize-cli db:migrate

# 6. Start the server
npm start

# 7. Open browser
http://localhost:10000
```

---

## 🌐 API Endpoints

### Authentication
```javascript
POST /api/auth/register
// Register new user
Body: { name, email, password }

POST /api/auth/login
// Login user
Body: { email, password }

POST /api/auth/logout
// Logout user
```

### Tracked Cities (Requires Authentication)
```javascript
GET /api/cities/tracked
// Get user's tracked cities
Headers: { Authorization: "Bearer <token>" }

POST /api/cities/track
// Add city to tracking
Body: { cityName, latitude, longitude, aqi, pm25, pm10, no2, so2, co, o3 }

DELETE /api/cities/untrack/:cityName
// Remove city from tracking

PUT /api/cities/tracked/refresh
// Update all tracked cities data
Body: { cities: [...] }
```

---

## 🎨 Features Breakdown

### 1. User Authentication System
- **Registration**: Create account with email & password
- **Login**: Secure JWT-based authentication
- **Guest Access**: Try without signing up
- **Session Management**: Auto-logout on token expiry
- **Password Security**: Bcrypt hashing with salt rounds

### 2. City Tracking
- **Add Cities**: From random selection or map
- **Remove Cities**: One-click removal
- **Refresh Data**: Update all pollution values
- **Persistence**: 
  - Registered: PostgreSQL database
  - Guest: Browser localStorage

### 3. Data Visualization
- **City Cards**: Beautiful square cards with pollution data
- **Interactive Map**: 50+ Indian cities with markers
- **Trend Charts**: Compare pollution across cities
- **Forecast Chart**: Stock-market style prediction chart

### 4. Analysis Features (Registered Only)
- **4 Pollutant Charts**: PM2.5, PM10, NO₂, O₃
- **City Comparison**: Side-by-side comparison
- **3-Day Forecast**: Predict future air quality
- **Historical Tracking**: Save data over time

### 5. Guest Restrictions
- ❌ Max 3 cities
- ❌ No map interaction
- ❌ No Analysis tab
- ❌ No data persistence
- ✅ Basic viewing only

---

## 📱 Responsive Design

Works perfectly on:
- 💻 Desktop (1920x1080+)
- 💻 Laptop (1366x768+)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667+)

---

## 🔒 Security Features

1. **Password Hashing**: Bcrypt with 12 salt rounds
2. **JWT Tokens**: 24-hour expiration
3. **Input Validation**: Real-time email/password validation
4. **SQL Injection Prevention**: Sequelize ORM parameterized queries
5. **Rate Limiting**: Prevent brute force attacks
6. **HTTPS**: SSL/TLS encryption for database
7. **CORS**: Configured for secure cross-origin requests

---

## 🎯 User Flows

### Flow 1: New User Registration
```
Visit Website
    ↓
Click "Register"
    ↓
Enter Name, Email, Password
    ↓
Click "Register" Button
    ↓
✅ Account Created
    ↓
Redirect to Dashboard
    ↓
Add Your First City
```

### Flow 2: Returning User
```
Visit Website
    ↓
Enter Email & Password
    ↓
Click "Login"
    ↓
✅ Authentication Success
    ↓
Load Saved Cities from Database
    ↓
Dashboard Shows All Your Cities!
```

### Flow 3: Guest User
```
Visit Website
    ↓
Click "Continue as Guest"
    ↓
Dashboard Opens
    ↓
Add Cities (Max 3)
    ↓
⚠️ Try to Access Analysis → Blocked
    ↓
⚠️ Try to Click Map → Blocked
    ↓
Logout → All Data Lost
```

---

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(255) | User's full name |
| email | VARCHAR(255) | Unique email (case-insensitive) |
| password | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update date |

### Tracked_Cities Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → Users.id |
| city_name | VARCHAR(255) | Name of city |
| latitude | FLOAT | City latitude |
| longitude | FLOAT | City longitude |
| aqi | INTEGER | Air Quality Index |
| pm25 | FLOAT | PM2.5 level |
| pm10 | FLOAT | PM10 level |
| no2 | FLOAT | NO₂ level |
| so2 | FLOAT | SO₂ level |
| co | FLOAT | CO level |
| o3 | FLOAT | O₃ level |
| created_at | TIMESTAMP | When city was added |
| updated_at | TIMESTAMP | Last data update |

**Unique Constraint**: (user_id, city_name) - One user cannot track same city twice

---

## 🎨 Design Philosophy

### Color Scheme
- **Primary**: Sky Blue → Aqua → Purple → Indigo gradient
- **AQI Colors**: 
  - Good: Green (#28a745)
  - Moderate: Yellow (#ffc107)
  - Unhealthy: Red (#dc3545)
  - Hazardous: Dark Purple (#6c1e7a)

### Typography
- **Headings**: 1.15rem - 2rem
- **Body**: 1rem
- **Font**: System fonts for fast loading

### Animations
- Wind effects on city cards
- Smooth hover transitions
- Fade-in notifications
- Chart animations

---

## 🧪 Testing

### Manual Testing Checklist
See `TESTING_CHECKLIST.md` for detailed test scenarios:
- ✅ User registration flow
- ✅ User login flow
- ✅ Add/remove cities
- ✅ Data persistence
- ✅ Guest restrictions
- ✅ Analysis features
- ✅ Multi-user isolation

### Browser Testing
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📚 Documentation

- **README.md** (this file) - Project overview
- **FEATURE_SUMMARY.md** - Detailed feature documentation
- **TESTING_CHECKLIST.md** - Testing scenarios
- **DEPLOYMENT_SUMMARY.md** - Deployment guide

---

## 🚀 Deployment

### Deployed On: Render.com

#### Environment Variables Required:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
BCRYPT_SALT_ROUNDS=12
NODE_ENV=production
PORT=10000
```

#### Auto-Deployment:
- Push to `main` branch → Render auto-deploys
- Build time: ~2-3 minutes
- Zero-downtime deployment

---

## 🐛 Known Issues

1. **Database Expiration**: Free tier expires Nov 2, 2025
2. **JWT Secret**: Currently using phone numbers (should be random)
3. **No Email Verification**: Any email format accepted
4. **No Password Reset**: Must remember password
5. **No Profile Editing**: Cannot change name/email after signup

---

## 🔮 Future Enhancements

### Short Term:
- [ ] Email verification with OTP
- [ ] Password reset via email
- [ ] User profile editing
- [ ] Export data as CSV/PDF
- [ ] Dark mode toggle

### Long Term:
- [ ] Real-time data from live APIs (OpenWeatherMap, etc.)
- [ ] Push notifications for high AQI
- [ ] Mobile app (React Native)
- [ ] Social sharing features
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Historical trend analysis (30+ days)
- [ ] Air quality predictions using ML
- [ ] Community features (comments, ratings)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Code Style

- **JavaScript**: ES6+ syntax
- **Indentation**: 2 spaces
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Explain "why", not "what"
- **Functions**: Keep them small and focused

---

## 🎓 Learning Resources

### For Beginners:
- [HTML Basics](https://www.w3schools.com/html/) - Learn HTML
- [CSS Tutorial](https://www.w3schools.com/css/) - Learn styling
- [JavaScript Guide](https://javascript.info/) - Learn JS from scratch
- [Node.js Tutorial](https://nodejs.dev/learn) - Backend basics

### For This Project:
- [Express.js Guide](https://expressjs.com/) - Web framework
- [Sequelize Docs](https://sequelize.org/) - Database ORM
- [Chart.js Docs](https://www.chartjs.org/) - Charting library
- [Leaflet Tutorial](https://leafletjs.com/examples.html) - Maps

---

## 📧 Contact & Support

- **Developer**: Pratham
- **GitHub**: [Pratham2511](https://github.com/Pratham2511)
- **Project**: [Air-Pollution_Tracker](https://github.com/Pratham2511/Air-Pollution_Tracker)

For bugs or feature requests, please open an issue on GitHub.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Bootstrap** - For the beautiful UI framework
- **Leaflet** - For the amazing maps
- **Chart.js** - For stunning data visualizations
- **Render.com** - For free hosting
- **OpenWeatherMap** - For air quality data concepts
- **Indian Cities** - Data compiled from various public sources

---

## 📈 Project Stats

- **Total Lines of Code**: ~3000+
- **Files**: 20+
- **Cities Covered**: 50+ Indian cities
- **Features**: 15+ major features
- **Development Time**: Multiple iterations
- **Tech Stack**: 10+ technologies

---

## 🎉 Quick Start Guide

**For Complete Beginners (5 minutes):**

1. **Visit the website** (get URL from Render dashboard)
2. **Click "Register"**
3. **Enter**: 
   - Name: Your Name
   - Email: your.email@example.com
   - Password: password123
4. **Click Register** button
5. **Click "Add Random City"** - See a city appear!
6. **Click "Map"** - See cities on map
7. **Click "Analysis"** - See charts! 📊

**That's it! You're tracking air pollution! 🎉**

---

## 🌟 Why This Project is Cool

1. **Real-World Application** - Solves actual problem (air pollution tracking)
2. **Full-Stack** - Frontend + Backend + Database
3. **Modern Tech** - Latest technologies and best practices
4. **User-Friendly** - Even 10-year-olds can understand!
5. **Scalable** - Can handle many users
6. **Secure** - Password hashing, JWT tokens, validation
7. **Beautiful** - Modern UI with animations
8. **Educational** - Great for learning web development

---

**Made with ❤️ for cleaner air and better health!** 🌍💨

---

## 🎯 TL;DR (Too Long; Didn't Read)

> **Air Pollution Tracker** is a web app that shows air quality in Indian cities. 
> 
> **Tech**: Node.js + Express + PostgreSQL + Bootstrap + Chart.js + Leaflet
> 
> **Features**: Track cities, view maps, analyze data, predict future air quality
> 
> **Users**: Register for full features OR use as guest (limited)
> 
> **Deploy**: Render.com with auto-deploy from GitHub
> 
> **Goal**: Help people make informed decisions about outdoor activities based on air quality

---

*Last Updated: October 6, 2025*
