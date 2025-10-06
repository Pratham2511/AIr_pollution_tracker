# Guest Access Testing Guide

## How to Test Guest Features

### 1. Start the Application
```bash
npm start
```

### 2. Access Landing Page
- Navigate to `http://localhost:10000/` (or your deployed URL)
- You should see the landing page with login/register options

### 3. Login as Guest
- Click the "Continue as Guest" button on the login form
- A modal will appear showing guest limitations
- Click "Continue as Guest" to proceed

### 4. Test Guest Restrictions

#### ✅ Test 1: Can View Basic Air Quality Data
**Expected**: Should work perfectly
- Click "Add Random City" button
- A city card should appear with:
  - City name
  - AQI value
  - PM2.5 level
  - PM10 level
  - Info message about guest limitations

#### ✅ Test 2: Cannot Add Cities from Map
**Expected**: Should be blocked
- Click on "Map View" tab
- Try clicking on the map
- Map clicks should be disabled
- "Add City" buttons in popups should be hidden

#### ✅ Test 3: Cannot Access Detailed Analysis
**Expected**: Should show restriction
- Click on "Analysis" tab
- Should see a message about guest limitations
- Detailed charts and comparisons should be hidden/disabled

#### ✅ Test 4: Can View Health Recommendations
**Expected**: Should work perfectly
- Click on "Health Tips" tab
- Should see all health recommendations
- No restrictions or limitations

#### ✅ Test 5: Visual Indicators
**Expected**: Should see guest indicators
- "👤 Guest Mode" badge in navbar
- Yellow warning alert at top with limitations list
- "Register Now" buttons throughout
- Information messages in city cards

### 5. Test Authenticated User (Verify No Breaking Changes)

#### Login as Registered User
- Logout as guest
- Register a new account or login with existing credentials

#### ✅ Test 6: Full Functionality for Authenticated Users
**Expected**: Everything should work normally
- Can add random cities (with full data)
- Can add cities from map
- Can access detailed analysis
- Can view health recommendations
- Can track multiple cities
- Can refresh data
- Can remove cities

### 6. Backend API Tests

#### Test Guest API Endpoint
```bash
# Get random city as guest
curl -X GET http://localhost:10000/api/guest/random-city \
  -H "User-Type: guest" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "city": {
    "name": "Mumbai",
    "lat": 19.076,
    "lon": 72.8777,
    "aqi": 156,
    "pm25": 65.2,
    "pm10": 120.5,
    "lastUpdated": "2025-10-06T..."
  }
}
```

#### Test Restricted Endpoint as Guest
```bash
# Try to track a city as guest (should fail)
curl -X POST http://localhost:10000/api/cities/track \
  -H "User-Type: guest" \
  -H "Content-Type: application/json" \
  -d '{"cityName":"Delhi","latitude":28.7041,"longitude":77.1025}'
```

**Expected Response**:
```json
{
  "message": "This feature is not available for guest users. Please register or login to access this feature.",
  "error": "GUEST_RESTRICTION"
}
```

## Expected Behavior Summary

### Guest Users Can:
✅ Login without credentials
✅ View random city data (basic AQI, PM2.5, PM10)
✅ Access health recommendations
✅ See their guest status in navbar
✅ See upgrade prompts

### Guest Users Cannot:
❌ Add custom cities from map
❌ Track specific cities
❌ Access detailed pollutant analysis
❌ View comparison charts
❌ Remove tracked cities
❌ Refresh tracked cities data

### Authenticated Users Can:
✅ Everything guests can do, plus:
✅ Add cities from map
✅ Track unlimited cities
✅ Access detailed analysis
✅ View all pollutant data
✅ Compare cities
✅ Remove and refresh cities

## Common Issues & Solutions

### Issue 1: Guest restrictions not applied
**Solution**: Check browser console for JavaScript errors, ensure `guestFeatures.js` is loaded before other scripts

### Issue 2: Guest can add cities from map
**Solution**: Check that `User-Type: guest` header is being sent, verify backend middleware is applied

### Issue 3: Authenticated users see restrictions
**Solution**: Check that `localStorage.getItem('userType')` is not set to 'guest', verify token is valid

### Issue 4: Health tab not accessible
**Solution**: Check that health tab is not accidentally restricted in frontend code

## Browser Console Commands

### Check Current User Type
```javascript
console.log('User Type:', localStorage.getItem('userType'));
console.log('User Data:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('token'));
```

### Manually Set Guest Mode (for testing)
```javascript
localStorage.setItem('userType', 'guest');
localStorage.setItem('user', JSON.stringify({ name: 'Guest User' }));
location.reload();
```

### Clear Authentication (logout)
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('userType');
location.href = '/';
```

## Success Criteria

✅ All guest restrictions implemented
✅ Guest users see appropriate error messages
✅ Authenticated users retain full functionality
✅ No JavaScript errors in console
✅ No backend errors in server logs
✅ Visual indicators clearly show guest status
✅ Upgrade prompts encourage registration
✅ Health recommendations accessible to all

---

**Ready to Test**: Yes
**Estimated Testing Time**: 15-20 minutes
**Priority**: High (affects user experience)
