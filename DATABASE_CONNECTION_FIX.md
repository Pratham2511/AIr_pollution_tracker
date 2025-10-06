# Database Connection Fix Summary

## ✅ Changes Made

### 1. **Added Environment Variable Support**
- Added `require('dotenv').config()` to load `.env` file
- Created `.env.example` template file

### 2. **Fixed SSL Configuration**
- **Production (Render)**: SSL enabled automatically with `DATABASE_URL`
- **Local Development**: SSL disabled when `NODE_ENV !== 'production'`
- This fixes the common "self-signed certificate" error in local development

### 3. **Improved Error Logging**
- Enabled SQL query logging: `logging: console.log`
- Enhanced error messages showing:
  - Connection details (host, port, database, user)
  - Error name and message
  - Parent error details
  - Error codes
- Better retry mechanism with detailed logs

### 4. **Added Default Values**
- `DB_PASSWORD` now has default value for easier local testing
- All database parameters have sensible defaults

### 5. **Created Documentation**
- `DATABASE_SETUP.md` - Complete guide for database setup
- `.env.example` - Environment variable template

## 🔧 What You Need to Do

### ⚠️ IMPORTANT: .env File is ONLY for Local Development

**For Render/Production:** You do NOT need a `.env` file! Environment variables are set in the Render dashboard.

### For Local Development Only:

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Install PostgreSQL** (if not installed):
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

3. **Create Database:**
   ```sql
   -- Open psql and run:
   CREATE USER pollutiondb_user WITH PASSWORD 'your_password';
   CREATE DATABASE pollutiondb OWNER pollutiondb_user;
   GRANT ALL PRIVILEGES ON DATABASE pollutiondb TO pollutiondb_user;
   ```

4. **Update `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pollutiondb
   DB_USER=pollutiondb_user
   DB_PASSWORD=your_password  # Use the password you set
   JWT_SECRET=your_secret_key_here
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

### For Production (Render.com):

**Good News!** No changes needed for Render deployment:
- Render automatically provides `DATABASE_URL` environment variable
- SSL is automatically enabled for production
- The app will detect and use it automatically

**Just make sure to set in Render dashboard:**
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV=production` - (optional, recommended)

## 🐛 Troubleshooting

### If you see "Database connection failed":

**Check these in order:**

1. **PostgreSQL is running:**
   - Windows: Check Services app for "postgresql" service
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`

2. **Database exists:**
   ```bash
   psql -U postgres -c "\l" | grep pollutiondb
   ```

3. **User exists:**
   ```bash
   psql -U postgres -c "\du" | grep pollutiondb_user
   ```

4. **Password is correct:**
   - Check your `.env` file
   - Try connecting manually: `psql -U pollutiondb_user -d pollutiondb`

5. **Check the server logs:**
   - The server now prints detailed connection info
   - Look for the "Connection details" log
   - Check for specific error messages

### Common Error Solutions:

**Error: "ECONNREFUSED"**
→ PostgreSQL service not running. Start it.

**Error: "password authentication failed"**
→ Wrong password in `.env` file. Update it.

**Error: "database does not exist"**
→ Create the database using SQL commands above.

**Error: "self signed certificate" (local)**
→ Fixed! SSL is now disabled for local development.

**Error: "role does not exist"**
→ Create the user using SQL commands above.

## 📊 What The Server Will Show

When you start the server, you should see:
```
🔄 Attempting to connect to database...
📍 Connection details: {
  host: 'localhost',
  port: 5432,
  database: 'pollutiondb',
  user: 'pollutiondb_user',
  hasUrl: false,
  environment: 'development'
}
✅ Database connection established successfully.
✅ Database synchronized.
📊 Models synced: [ 'User', 'City', 'TrackedCity' ]
🚀 Server running on port 10000
```

If you see ❌ errors, check the troubleshooting section above.

## 🎯 Next Steps

1. Set up your local database following the guide
2. Create and configure your `.env` file
3. Start the server
4. The database tables will be created automatically
5. You can start using the application!

## 📝 Files Changed

- `server.js` - Added dotenv, improved logging, SSL fix
- `.env.example` - Environment variable template (NEW)
- `DATABASE_SETUP.md` - Detailed setup guide (NEW)
- `DATABASE_CONNECTION_FIX.md` - This summary (NEW)
