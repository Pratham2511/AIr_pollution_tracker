# Render Database Connection Troubleshooting

## ✅ Your Setup is Correct!

You have environment variables set in Render dashboard - that's perfect! No `.env` file needed for production.

## 🔍 Checking Render Database Connection

### Step 1: Check Render Logs

Go to your Render dashboard and check the logs. You should see one of these:

**✅ SUCCESS:**
```
🔄 Attempting to connect to database...
📍 Connection details: {
  host: 'dpg-xxxxx.oregon-postgres.render.com',
  port: 5432,
  database: 'pollutiondb_xxxx',
  user: 'pollutiondb_user',
  hasUrl: true,
  environment: 'production'
}
✅ Database connection established successfully.
✅ Database synchronized.
📊 Models synced: [ 'User', 'City', 'TrackedCity' ]
🚀 Server running on port 10000
```

**❌ ERROR:**
```
❌ Database connection failed:
Error name: SequelizeConnectionError
Error message: ...
🔄 Retrying in 10 seconds...
```

### Step 2: Verify PostgreSQL Database on Render

1. **Check if PostgreSQL service exists:**
   - Go to Render Dashboard
   - Look for a PostgreSQL database service
   - Should be named something like "air-pollution-tracker-db"

2. **If NO PostgreSQL service:**
   - Click "New +"
   - Select "PostgreSQL"
   - Name it: `air-pollution-tracker-db`
   - Region: Same as your web service
   - Click "Create Database"

3. **Get the connection details:**
   - Click on your PostgreSQL database
   - You'll see "Internal Database URL" and "External Database URL"
   - Copy the **Internal Database URL**

### Step 3: Set DATABASE_URL in Web Service

1. Go to your **Web Service** (not the database)
2. Click "Environment" tab
3. Find or add `DATABASE_URL` variable
4. Paste the **Internal Database URL** from your PostgreSQL service
5. Should look like: `postgresql://username:password@dpg-xxxxx.oregon-postgres.render.com/databasename`
6. Click "Save Changes"

### Step 4: Verify Other Environment Variables

Make sure these are set in your Web Service environment:

**Required:**
- ✅ `DATABASE_URL` - PostgreSQL connection URL
- ✅ `JWT_SECRET` - Your JWT secret key (any secure random string)
- ✅ `NODE_ENV` - Set to `production`

**Optional (have defaults):**
- `PORT` - 10000 (Render sets this automatically)
- `BCRYPT_SALT_ROUNDS` - 10 (default)

### Step 5: Check PostgreSQL Version

Render uses PostgreSQL 15 by default. Our app is compatible, so this should not be an issue.

### Step 6: Common Render-Specific Issues

#### Issue 1: Database and Web Service in Different Regions
**Symptom:** Slow connection or connection timeout  
**Solution:** Ensure both services are in the same region (e.g., Oregon)

#### Issue 2: Using External URL Instead of Internal
**Symptom:** Connection works but is slow  
**Solution:** Use the Internal Database URL (faster, free traffic)

#### Issue 3: Database Not Created
**Symptom:** "database does not exist" error  
**Solution:** 
1. Database is created automatically by Render
2. Check PostgreSQL service is fully deployed (green checkmark)
3. Wait 1-2 minutes after creation

#### Issue 4: Connection Limits Reached
**Symptom:** "too many connections" error  
**Solution:** 
- Free tier: 97 connections max
- Our pool config: max 10 connections (should be fine)
- Check if you have multiple instances running

### Step 7: Force Redeploy

Sometimes Render needs a fresh deploy:

1. Go to your Web Service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment to complete
5. Check logs immediately

## 🎯 What the Server Will Show in Render Logs

### If DATABASE_URL is Set:
```
📍 Connection details: {
  host: 'dpg-xxxxx.oregon-postgres.render.com',
  ...
  hasUrl: true,  ← This means DATABASE_URL was found
  environment: 'production'
}
```

### If DATABASE_URL is NOT Set:
```
📍 Connection details: {
  host: 'localhost',  ← Wrong! Should be Render's host
  ...
  hasUrl: false,  ← DATABASE_URL not found
  environment: 'production'
}
```

If you see `hasUrl: false`, the `DATABASE_URL` environment variable is not being read.

## 🔧 Quick Fix Checklist

- [ ] PostgreSQL database service created on Render
- [ ] PostgreSQL database fully deployed (green status)
- [ ] DATABASE_URL environment variable set in Web Service
- [ ] DATABASE_URL contains the **Internal Database URL**
- [ ] JWT_SECRET environment variable set
- [ ] NODE_ENV set to 'production'
- [ ] Both services in the same region
- [ ] Web service redeployed after setting environment variables

## 📱 Need Help?

**Share these from your Render logs:**
1. The "Connection details" log output
2. The exact error message (if any)
3. Screenshot of your Environment variables (hide the values!)

This will help diagnose the specific issue.

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Green checkmark on both services in Render dashboard
2. ✅ No database errors in logs
3. ✅ You can access your website
4. ✅ User registration/login works
5. ✅ Cities can be tracked and saved

## 💡 Pro Tips

1. **Use Internal Database URL** - It's free and faster
2. **Set NODE_ENV=production** - Enables production optimizations
3. **Check logs regularly** - Catch issues early
4. **Use same region** - Oregon or nearest to your users
5. **Environment changes need redeploy** - Render auto-redeploys when you change env vars

## 🚀 Most Common Solution

90% of the time, the issue is:
1. DATABASE_URL not set, OR
2. Using External URL instead of Internal URL, OR
3. PostgreSQL service not fully deployed yet

Check these three things first!
