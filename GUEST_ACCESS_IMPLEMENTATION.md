# Guest Access Implementation Summary

## Overview
This document describes the implementation of guest access limitations for the Air Pollution Tracker application.

## Guest Access Limitations Implemented

### ✅ Cannot Add Custom Cities from the Map
- **Backend**: Added restriction middleware to prevent guests from adding cities via `/api/cities/track` endpoint
- **Frontend**: Disabled map click functionality and "Add City" buttons in map popups for guest users
- **User Feedback**: Shows modal explaining the restriction when guests attempt to add cities from the map

### ✅ Limited to Viewing Random City Data Only
- **Backend**: Created new guest-specific endpoints:
  - `GET /api/guest/random-city` - Returns a single random city with basic data
  - `GET /api/guest/cities` - Returns up to 5 random cities with limited information
- **Frontend**: Modified `addRandomCity()` function to use guest API when user is a guest
- **Data Limitation**: Guests only receive basic air quality data (AQI, PM2.5, PM10) without detailed pollutant information

### ✅ Cannot Access Detailed City Analysis
- **Backend**: No detailed analysis endpoints are accessible to guests
- **Frontend**: 
  - Analysis tab is disabled for guest users
  - Shows informational message explaining the restriction
  - Blocks access to comparison charts and detailed pollutant insights
- **User Feedback**: Displays upgrade prompt when guests try to access analysis features

### ✅ Can View Basic Air Quality Data
- **Implementation**: Guest users can see:
  - City name and location
  - Air Quality Index (AQI)
  - PM2.5 levels
  - PM10 levels
  - AQI level interpretation (Good, Moderate, Unhealthy, etc.)
- **UI**: Simplified city cards with basic information and upgrade prompts

### ✅ Access to Health Recommendations
- **Implementation**: Health Tips tab remains fully accessible to guest users
- **No Restrictions**: Guests can view all health recommendations and safety tips

## Files Modified

### 1. Backend Files

#### `middleware/guestAuth.js`
- Enhanced guest authentication middleware
- Added `restrictGuestFeature` middleware to block premium features
- Properly identifies and flags guest users with `isGuest: true`

#### `server.js`
- Imported guest authentication middleware
- Added guest-specific API routes:
  - `/api/guest/random-city` - Get single random city with basic data
  - `/api/guest/cities` - Get multiple random cities with limited data
- Applied `restrictGuestFeature` middleware to protected routes:
  - `/api/cities/track` (POST)
  - `/api/cities/untrack/:cityName` (DELETE)
  - `/api/cities/tracked/refresh` (PUT)
- Modified `/api/cities/tracked` (GET) to return restriction message for guests
- Updated `/api/cities` (GET) to return limited data for guest users

### 2. Frontend Files

#### `public/js/guestFeatures.js`
- Completely rewritten to implement all guest restrictions
- Key functions:
  - `setupGuestRestrictions()` - Main function to apply all restrictions
  - `disableMapCitySelection()` - Prevents adding cities from map
  - `disableDetailedAnalysis()` - Blocks analysis features
  - `setupRandomCityViewing()` - Configures random city viewing for guests
  - `displayGuestCity()` - Shows city data with limited information
  - `createGuestCityCard()` - Creates simplified city cards for guests
  - `addGuestBadge()` - Adds visual indicator showing guest status
  - `addUpgradePrompt()` - Shows prominent upgrade message
  - `showGuestRestrictionModal()` - Explains restrictions when accessed
  - `getRequestHeaders()` - Adds proper headers for API requests
- Override `window.fetch` to automatically include guest headers

#### `public/index.html`
- Added `guestFeatures.js` script import (loads before other scripts)
- Modified authentication check to initialize guest restrictions
- Updated `addCityFromMap()` to check for guest status and show restrictions
- Modified `addRandomCity()` to use guest API for guest users
- Added `displayGuestCity()` function to display limited guest data
- Added `showNotification()` utility function for user feedback
- Enhanced guest user profile display in navbar

## User Experience

### Visual Indicators
1. **Guest Badge**: Orange "👤 Guest Mode" badge in navbar
2. **Upgrade Prompt**: Prominent alert at top of page listing limitations
3. **Restricted Elements**: Disabled/hidden buttons with tooltips
4. **Information Cards**: In-card messages explaining limitations

### Upgrade Prompts
Guests see upgrade prompts in multiple places:
- Top of dashboard (dismissible alert)
- Within city cards
- When attempting restricted actions (modal)
- In analysis tab (if accessed)

### Guest Workflow
1. Guest logs in from landing page
2. Dashboard loads with guest restrictions applied
3. Can click "Add Random City" to see basic air quality data
4. Can view Health Tips tab freely
5. Cannot add cities from map (shows restriction message)
6. Cannot access detailed analysis (shows upgrade prompt)
7. Sees limited data in all city cards
8. Multiple prompts encourage registration

## API Request Flow

### Guest User Request
```javascript
fetch('/api/guest/random-city', {
  headers: {
    'User-Type': 'guest',
    'Content-Type': 'application/json'
  }
})
```

### Authenticated User Request
```javascript
fetch('/api/cities/tracked', {
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  }
})
```

## Security Considerations

1. **Backend Validation**: All restrictions enforced server-side
2. **Middleware Protection**: Premium features protected by `restrictGuestFeature` middleware
3. **Data Limitation**: Guests receive minimal data even if they bypass frontend restrictions
4. **No User ID**: Guest users have `userId: null` to prevent data association

## Testing Checklist

- [x] Guest can login successfully
- [x] Guest sees limited city data (AQI, PM2.5, PM10 only)
- [x] Guest cannot add cities from map
- [x] Guest can only view random cities
- [x] Guest cannot access detailed analysis
- [x] Guest can view health recommendations
- [x] Guest sees visual indicators (badge, prompts)
- [x] Authenticated users retain full functionality
- [x] All restrictions enforced on backend
- [x] Proper error messages for restricted actions

## Future Enhancements

1. **Analytics**: Track guest conversion rates
2. **Feature Teasers**: Show previews of premium features
3. **Time-Limited Access**: Offer temporary full access trials
4. **Social Sharing**: Allow guests to share basic data
5. **Email Capture**: Collect emails for follow-up

## Upgrade Path

When a guest decides to register:
1. Click any "Register Now" button
2. Redirect to landing page registration form
3. After registration, full access granted immediately
4. Previous guest data is not carried over (by design)

---

**Implementation Date**: 2025-10-06
**Status**: ✅ Complete
**Breaking Changes**: None - All existing functionality preserved for authenticated users
