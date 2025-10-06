# Database Setup Guide

## Prerequisites
- PostgreSQL installed on your system
- Node.js and npm installed

## Local Development Setup

### 1. Install PostgreSQL
If you haven't installed PostgreSQL yet:
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: Use Homebrew: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Create Database and User

Open PostgreSQL command line (psql) and run:

```sql
-- Create user
CREATE USER pollutiondb_user WITH PASSWORD 'your_password';

-- Create database
CREATE DATABASE pollutiondb OWNER pollutiondb_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pollutiondb TO pollutiondb_user;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pollutiondb
DB_USER=pollutiondb_user
DB_PASSWORD=your_password
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Server
```bash
npm start
```

The server will automatically:
- Connect to the database
- Create necessary tables
- Start on port 10000

## Production Setup (Render.com)

### Using DATABASE_URL
On Render.com, PostgreSQL provides a `DATABASE_URL` environment variable automatically.

Set the following environment variable in Render dashboard:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

The application will automatically detect and use this URL.

## Database Schema

The application creates the following tables automatically:

1. **Users** - User authentication
   - id, name, email, password, createdAt, updatedAt

2. **Cities** - City information
   - id, name, lat, lon, aqi, pm25, pm10, no2, so2, co, o3, createdAt, updatedAt

3. **TrackedCities** - User's tracked cities
   - id, userId, cityId, cityName, lat, lon, aqi, pm25, pm10, no2, so2, co, o3, createdAt, updatedAt

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL service is running
- Windows: Check Services app
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Authentication Failed
```
Error: password authentication failed for user
```
**Solution**: 
1. Check your `.env` file has correct credentials
2. Verify user exists: `psql -U postgres -c "\du"`
3. Reset password if needed in psql

### Database Does Not Exist
```
Error: database "pollutiondb" does not exist
```
**Solution**: Create the database using the SQL commands in step 2 above

### SSL Required Error (Local Development)
```
Error: self signed certificate
```
**Solution**: The app automatically disables SSL for local development (NODE_ENV !== 'production')

## Testing Database Connection

Run this to test your database connection:
```bash
node -e "const { Sequelize } = require('sequelize'); const s = new Sequelize('pollutiondb', 'pollutiondb_user', 'your_password', { host: 'localhost', dialect: 'postgres' }); s.authenticate().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message));"
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | No | - | Full PostgreSQL connection URL (production) |
| DB_HOST | No | localhost | Database host |
| DB_PORT | No | 5432 | Database port |
| DB_NAME | No | pollutiondb | Database name |
| DB_USER | No | pollutiondb_user | Database username |
| DB_PASSWORD | Yes | - | Database password |
| PORT | No | 10000 | Server port |
| JWT_SECRET | Yes | - | Secret key for JWT tokens |
| NODE_ENV | No | development | Environment (development/production) |
