# Air Pollution Tracker - Debug Guide

## Current Status (October 6, 2025)

### ✅ What's Working:
- Server starts successfully
- Database connection established
- User authentication (login/register)
- Environment variables configured

### ❌ What's NOT Working:
- Cities data not loading in frontend
- Tracker tab not working
- Map view not showing cities
- Analysis tabs not functioning

## Quick Diagnosis Steps

### Step 1: Check API Endpoints in Browser

Open your deployed app and check these URLs directly:

1. **Check Cities Count:**
   ```
   https://air-pollution-tracker-ouf6.onrender.com/api/cities/count
   ```
   Expected: `{"count":50}`

2. **Check Cities Data:**
   ```
   https://air-pollution-tracker-ouf6.onrender.com/api/cities
   ```
   Expected: JSON array with 50 cities

3. **Check Health:**
   ```
   https://air-pollution-tracker-ouf6.onrender.com/health
   ```
   Expected: `{"status":"OK",...}`

### Step 2: Check Browser Console

1. Open your app: https://air-pollution-tracker-ouf6.onrender.com
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors (red text)
5. Take screenshots of any errors

### Step 3: Check Network Tab

1. In Developer Tools, go to Network tab
2. Refresh the page
3. Look for failed requests (red)
4. Click on `/api/cities` request
5. Check:
   - Status Code (should be 200)
   - Response data (should show cities)
   - Any error messages

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** Console shows "blocked by CORS policy"
**Solution:** Server needs CORS headers

### Issue 2: 404 Not Found
**Symptom:** `/api/cities` returns 404
**Solution:** Routes not mounted correctly

### Issue 3: 500 Server Error
**Symptom:** API calls return 500 error
**Solution:** Check server logs for actual error

### Issue 4: Empty Response
**Symptom:** API returns `[]` or `null`
**Solution:** Data module not loading correctly

## What to Share for Debugging

Please provide:

1. **Browser Console Errors:**
   - Take screenshot of Console tab
   - Copy any red error messages

2. **Network Tab:**
   - Screenshot of failed requests
   - Response content of `/api/cities` request

3. **Render Deployment Logs:**
   - Latest logs from Render dashboard
   - Any error messages after "Your service is live"

4. **API Direct Test:**
   - Visit `/api/cities` directly in browser
   - Copy the full response or error message

## Manual Testing Commands

If you want to test locally:

```bash
# Test the data module
node -e "const { indianCitiesData } = require('./data/citiesData'); console.log('Cities:', indianCitiesData.length);"

# Start server locally
npm start

# Test endpoints (in another terminal)
curl http://localhost:10000/api/cities/count
curl http://localhost:10000/api/cities | python3 -m json.tool | head -50
```

## Expected API Responses

### GET /api/cities/count
```json
{
  "count": 50
}
```

### GET /api/cities
```json
[
  {
    "name": "Delhi",
    "lat": 28.6139,
    "lon": 77.209,
    "aqi": 285,
    "pm25": 125,
    "pm10": 180,
    "no2": 68,
    "so2": 22,
    "co": 2.8,
    "o3": 85
  },
  ...more cities
]
```

## Files Changed in Latest Fix

1. **server.js** - Updated legacy routes to use citiesData module
2. **data/citiesData.js** - New module with 50 cities data
3. **controllers/pollutionController.js** - Updated to use citiesData module
4. **routes/pollutionRoutes.js** - Added refresh-data endpoint

## Current Commit

Latest: `0de215d` - "FINAL FIX: Update legacy routes to use citiesData module"

---

## Next Steps

1. Check the API endpoints directly in browser
2. Check browser console for errors
3. Share the actual error messages or screenshots
4. We'll debug based on what's actually failing
