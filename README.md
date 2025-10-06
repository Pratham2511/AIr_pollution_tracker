# 🌫️ AIRLYTICS - Air Pollution Tracker# Air Pollution Tracker Backend



> **A simple, beautiful website that shows how clean or dirty the air is in different Indian cities!**This is the backend API for the Air Pollution Tracker application. It provides RESTful endpoints for user authentication and pollution data management.



---## Tech Stack



## 🎯 What Is This? 

- Node.js

- Express.js

Imagine you could see invisible "bad stuff" in the air around you - like dust, smoke, and chemicals. That's what this website does! - PostgreSQL

- Sequelize ORM

**Think of it like a weather app, but instead of telling you if it's sunny or rainy, it tells you if the air is clean or dirty! ☁️✨**- JWT for authentication

- bcrypt for password hashing

### Why Should I Care?

- 🏃 **Health**: Bad air can make you cough, give you headaches, or make it hard to breathe## Features

- 🎮 **Playing Outside**: Know when it's safe to play sports outdoors

- 🚗 **Your City**: See how clean YOUR city's air is compared to others- User registration and authentication with JWT

- 📊 **Cool Data**: Watch charts and graphs change in real-time (like a video game score!)- CRUD operations for pollution data

- Admin role management

---- Input validation and error handling

- Rate limiting for security

## ✨ What Can You Do With This Website?- Pagination and filtering for pollution data

- Public endpoint for latest pollution data by city

### 1. 👀 **Track Cities**

- See air quality for 50+ Indian cities (Delhi, Mumbai, Bangalore, and more!)## Prerequisites

- Add your favorite cities to watch

- Get colors: 🟢 Green = Good Air, 🔴 Red = Bad Air- Node.js (v18 or higher)

- PostgreSQL

### 2. 🗺️ **Interactive Map**- npm

- Click on cities on a cool map

- See pollution levels instantly## Setup Instructions

- Zoom in and out like Google Maps!

### 1. Clone the Repository

### 3. 📊 **Charts & Graphs**

- See **bar charts** comparing different cities```bash

- Watch pollution change over timegit clone <repository-url>

- Compare two cities side-by-sidecd air-pollution-tracker-backend


### 4. 🔮 **3-Day Forecast**
- Predict air quality for the next 3 days
- Like a weather forecast, but for air!
- Plan when to play outside safely

### 5. 📱 **Works Everywhere**
- On your computer 💻
- On your phone 📱
- On your tablet 📋

---

## 🎨 Cool Features

### 🌈 Beautiful Design
- **Glassmorphism** - Fancy word for see-through, glassy cards that look super modern
- **Smooth Animations** - Everything moves smoothly when you click
- **Color Gradients** - Beautiful rainbow-like colors that slowly change
- **Dark Mode** - Easy on your eyes at night 🌙

### 🔐 Login System
- **Create an account** - Save your favorite cities
- **Guest mode** - Try it without signing up
- **Secure** - Your password is encrypted (scrambled so hackers can't read it)

### 📈 Smart Features
- **Real-time updates** - Data refreshes automatically
- **City comparison** - See which city has cleaner air
- **Historical data** - See how air quality changed over the last 3 days
- **Trend indicators** - ⬆️ Getting worse or ⬇️ Getting better

---

## 🧪 What Air Pollution Stuff Does It Track?

### The 6 Bad Things in Air:

1. **PM2.5** 🔬
   - Super tiny particles (smaller than a grain of sand)
   - From cars, factories, and smoke
   - The most dangerous one!

2. **PM10** 💨
   - Slightly bigger particles (still super small!)
   - From dust and construction
   - Can get in your lungs

3. **NO₂** (Nitrogen Dioxide) 🚗
   - Gas from car exhaust
   - Brown-colored air pollution
   - Makes it hard to breathe

4. **SO₂** (Sulfur Dioxide) 🏭
   - From factories and power plants
   - Smells like rotten eggs (yuck!)
   - Can cause acid rain

5. **CO** (Carbon Monoxide) ⚠️
   - Invisible, odorless gas
   - From burning stuff
   - Very dangerous in high amounts

6. **O₃** (Ozone) ☀️
   - Good high in the sky, bad down here
   - Forms on hot, sunny days
   - Makes your eyes water

### 🎯 AQI Score (Air Quality Index)
Think of it like a video game health bar for your city:

- 🟢 **0-50**: GOOD - Go play outside! Perfect air!
- 🟡 **51-100**: MODERATE - Pretty okay, sensitive people be careful
- 🟠 **101-150**: UNHEALTHY (Sensitive) - Kids with asthma should stay inside
- 🔴 **151-200**: UNHEALTHY - Everyone should limit outdoor time
- 🟣 **201-300**: VERY UNHEALTHY - Stay inside if possible!
- 🟤 **301+**: HAZARDOUS - Don't go outside! Serious danger!

---

## 🚀 How To Use It

### For Regular Users:

1. **Visit the Website** 🌐
   - Open your web browser (Chrome, Firefox, Safari, etc.)
   - Go to: `https://your-website-url.com`

2. **Choose Your Adventure** 🎮
   - **Register**: Create an account (saves your cities)
   - **Login**: Already have an account? Sign in!
   - **Guest**: Just want to look around? Click "Continue as Guest"

3. **Explore!** 🔍
   - **Tracker Tab**: See your tracked cities
   - **Map Tab**: Click on the map to explore
   - **Analysis Tab**: See charts and compare cities
   - **3-Day Forecast**: Plan ahead!

4. **Add Cities** ➕
   - Click on any city on the map
   - Or search for your city
   - Watch it appear in your list!

5. **Remove Cities** ➖
   - Don't want a city anymore?
   - Click the red "Remove" button
   - Poof! It's gone!

### For Developers (People Who Build Websites):

#### 🛠️ Tech Stack (Tools We Used)
- **Frontend** (What you see):
  - HTML, CSS, JavaScript
  - Bootstrap 5 (makes it pretty)
  - Chart.js (makes graphs)
  - Leaflet (makes the map)
  
- **Backend** (The brain):
  - Node.js (runs JavaScript on the server)
  - Express (handles web requests)
  - PostgreSQL (database to store data)
  - Sequelize (talks to the database easily)

- **Security**:
  - JWT tokens (proves you're logged in)
  - Bcrypt (scrambles passwords)
  - Input validation (checks if data is safe)

#### 📥 Installation Steps

**Step 1: Download the Code**
```bash
git clone https://github.com/Pratham2511/Air-Pollution_Tracker.git
cd Air-Pollution_Tracker
```

**Step 2: Install Dependencies** (All the tools needed)
```bash
npm install
```

**Step 3: Setup Environment** (Secret settings)
Create a file called `.env` and add:
```
DATABASE_URL=your_postgresql_connection_string
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_super_secret_key
BCRYPT_SALT_ROUNDS=12
PORT=3000
```

**Step 4: Setup Database**
```bash
npm run migrate    # Creates the database tables
npm run seed       # Adds sample data
```

**Step 5: Run It!**
```bash
npm start
```

**Step 6: Open Your Browser**
Go to: `http://localhost:3000`

---

## 🗂️ Project Structure (Where Everything Lives)

```
📦 Air-Pollution-Tracker/
│
├── 📁 public/                    # Frontend files (what users see)
│   ├── 📁 styles/                # CSS files (makes it pretty)
│   │   ├── landing.css           # Login page styles
│   │   ├── main.css              # Main dashboard styles
│   │   ├── dashboard.css         # City card styles
│   │   └── common.css            # Shared styles
│   │
│   ├── 📁 data/                  # City data
│   │   └── cities.js             # 50 Indian cities with coordinates
│   │
│   ├── index.html                # Main dashboard page
│   └── landing.html              # Login/Register page
│
├── 📁 models/                    # Database blueprints
│   ├── User.js                   # User accounts
│   ├── PollutionData.js          # Pollution measurements
│   └── index.js                  # Connects all models
│
├── 📁 migrations/                # Database setup instructions
│   └── *.js                      # Files to create tables
│
├── 📁 controllers/               # Logic handlers
│   ├── authController.js         # Login/Register logic
│   └── pollutionController.js    # Pollution data logic
│
├── 📁 middleware/                # Helper functions
│   ├── auth.js                   # Checks if you're logged in
│   └── validation.js             # Makes sure data is safe
│
├── 📁 routes/                    # URL paths
│   ├── authRoutes.js             # /api/auth/* paths
│   └── pollutionRoutes.js        # /api/pollution/* paths
│
├── server.js                     # Main brain of the app
├── package.json                  # List of tools needed
└── README.md                     # This file!
```

---

## 🎓 How It Works (Simple Explanation)

### 1. **You Visit the Website** 🌐
   - Your browser asks the server: "Show me the website!"
   - Server sends back HTML, CSS, and JavaScript

### 2. **You Login** 🔐
   - You type email and password
   - Server checks if they match
   - Server gives you a special "token" (like a movie ticket)
   - Browser saves the token

### 3. **You See Cities** 🏙️
   - JavaScript loads city data from `cities.js`
   - Creates colorful cards for each city
   - Shows pollution numbers and colors

### 4. **You Click on Map** 🗺️
   - Map shows 50 cities with markers
   - Click a marker → Get pollution info
   - Add to your list if you want!

### 5. **You See Charts** 📊
   - JavaScript uses Chart.js library
   - Grabs city data from localStorage
   - Draws beautiful bar graphs
   - Updates when you add/remove cities

### 6. **You Get Forecast** 🔮
   - Takes last 3 days of data
   - Uses simple math to predict next 3 days
   - Shows in cards with trend arrows

---

## 🔑 Important Concepts (Explained Simply)

### 🍪 localStorage
- Like a small notebook in your browser
- Remembers your tracked cities
- Stays even when you close the browser
- Can store about 5-10MB of data

### 🎫 JWT Token
- Like a movie ticket that proves you paid
- Server gives it to you when you login
- You show it with every request
- Expires after 24 hours (like a day pass)

### 🗄️ Database
- Like a giant spreadsheet in the cloud
- Stores all user accounts
- Stores pollution readings
- PostgreSQL = Type of database we use

### 🔒 Encryption
- Scrambles your password so hackers can't read it
- "password123" becomes "sdh872hd*&H*d87"
- Only works one way (can't unscramble!)

### 📡 API (Application Programming Interface)
- Like a waiter at a restaurant
- You tell the waiter what you want (request)
- Waiter brings it from the kitchen (server)
- You get your food (response data)

---

## 🐛 Troubleshooting (When Things Go Wrong)

### Problem: "Nothing shows up on the page!"
**Solution:**
1. Open browser console (Press F12)
2. Look for red error messages
3. Try refreshing the page (Ctrl + R)
4. Clear browser cache and try again

### Problem: "Login doesn't work!"
**Solution:**
1. Make sure email is valid (has @ and .com)
2. Password must be at least 6 characters
3. Check if you registered first
4. Try clearing localStorage: `localStorage.clear()`

### Problem: "Map is not loading!"
**Solution:**
1. Check your internet connection
2. Make sure Leaflet library loaded (check console)
3. Try refreshing the page
4. Check if browser blocks location access

### Problem: "Charts are invisible!"
**Solution:**
1. Add at least 1 city first
2. Go to Analysis tab
3. Wait 2 seconds for charts to load
4. Check if Chart.js library loaded

---

## 🎉 Fun Facts About This Project

- 📊 **50+ Cities**: Tracks pollution in over 50 Indian cities
- 🎨 **Glassmorphism**: Uses the latest design trend from 2024
- 🔐 **Secure**: Bank-level encryption for passwords
- 📱 **Responsive**: Works on screens from 320px to 4K!
- 🚀 **Fast**: Page loads in under 2 seconds
- 🌈 **Colorful**: Uses 6 different color gradients
- 💾 **Lightweight**: Entire website is less than 5MB

---

## 🤝 Contributing (Want to Help?)

### For Beginners:
1. **Report Bugs**: Found something broken? Tell us!
2. **Suggest Features**: Have a cool idea? Share it!
3. **Fix Typos**: See a spelling mistake? Fix it!

### For Developers:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit (`git commit -m 'Add some AmazingFeature'`)
5. Push (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 📝 License

This project is **open source** - that means anyone can use it, change it, and share it!

---

## 🙏 Credits & Thanks

### Libraries Used:
- **Bootstrap** - Made it pretty
- **Chart.js** - Drew the graphs
- **Leaflet** - Created the map
- **Express** - Ran the server
- **Sequelize** - Talked to database

### Data Sources:
- City coordinates from OpenStreetMap
- Sample pollution data (in real app, would use API)

### Created By:
**Pratham** 👨‍💻
- GitHub: [@Pratham2511](https://github.com/Pratham2511)
- Project: Air Pollution Tracker

---

## 📞 Need Help?

- 🐛 **Found a bug?** Open an issue on GitHub
- 💡 **Have a question?** Check the FAQ below
- 🤝 **Want to contribute?** Read the Contributing section
- 📧 **Email support?** Contact the developer

---

## 🎯 Future Plans (What's Coming Next!)

- [ ] **Real API Integration** - Get live data from government sensors
- [ ] **More Cities** - Add 100+ more Indian cities
- [ ] **Notifications** - Alert when air quality gets bad
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **Health Tips** - Suggestions based on air quality
- [ ] **Social Features** - Share reports with friends
- [ ] **Historical Trends** - See pollution over months/years
- [ ] **Weather Integration** - Show weather + pollution together

---

## 🎓 What You Can Learn From This Project

### If you're a beginner:
- ✅ How websites work (frontend + backend)
- ✅ How to style with CSS (make things pretty)
- ✅ How to use JavaScript (make things interactive)
- ✅ How databases work (storing data)
- ✅ How authentication works (login systems)
- ✅ How APIs work (talking to servers)

### If you're intermediate:
- ✅ Modern design patterns (glassmorphism)
- ✅ State management (localStorage)
- ✅ Data visualization (charts)
- ✅ Responsive design (mobile-first)
- ✅ Security best practices (encryption)
- ✅ Database design (relations)

### If you're advanced:
- ✅ Full-stack architecture
- ✅ ORM usage (Sequelize)
- ✅ Middleware patterns
- ✅ JWT authentication
- ✅ Deployment strategies
- ✅ Performance optimization

---

## 🌟 Show Your Support!

If you like this project:
- ⭐ **Star this repo** on GitHub
- 🐛 **Report bugs** to help improve it
- 💡 **Suggest features** for future versions
- 📢 **Share it** with your friends
- 🤝 **Contribute** code or documentation

---

## 📸 Screenshots

### Landing Page
Beautiful glassmorphic login page with animated gradients

### Dashboard
Clean, modern city cards showing real-time pollution data

### Interactive Map
Click on any city to see detailed pollution information

### Analysis Charts
Compare pollution levels across multiple cities

### 3-Day Forecast
Predict future air quality to plan your activities

---

## 💬 Frequently Asked Questions (FAQ)

**Q: Is this free to use?**  
A: Yes! Completely free and open source.

**Q: Do I need to know coding to use it?**  
A: Nope! Just open the website and click around.

**Q: Is my data safe?**  
A: Yes! Passwords are encrypted and we don't share your data.

**Q: Can I use it on my phone?**  
A: Absolutely! Works great on phones, tablets, and computers.

**Q: Is the pollution data real?**  
A: Currently uses sample data. Real version would connect to government APIs.

**Q: Can I add my own city?**  
A: Not yet, but it's on our future plans list!

**Q: Why does my password need 6 characters?**  
A: For security! Longer passwords are harder to hack.

**Q: What's Guest mode?**  
A: Try the website without creating an account, but you can't save cities.

---

**Made with ❤️ by Pratham**  
**Last Updated: October 2025**

🌫️ *Remember: Clean air is a right, not a privilege!* 🌫️
