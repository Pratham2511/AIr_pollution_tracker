# AIr Pollution Tracker

## Project Overview
AIr Pollution Tracker is an application designed to monitor and analyze air quality data from various sources. The project aims to provide users with real-time data on air pollution levels, along with historical trends and forecasts, to promote awareness and encourage healthier living.

## Complete Tech Stack
- **Frontend**: React.js, Redux, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **APIs**: OpenWeatherMap API, AirQuality API
- **Deployment**: Docker, Heroku/AWS
- **Testing**: Jest, Mocha

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Pratham2511/AIr_pollution_tracker.git
   cd AIr_pollution_tracker
   ```

2. **Install Dependencies**:
   - For the Frontend:
     ```bash
     cd frontend
     npm install
     ```

   - For the Backend:
     ```bash
     cd backend
     npm install
     ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the required environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   API_KEY=your_api_key
   ```

4. **Run the Application**:
   - For the Frontend:
     ```bash
     cd frontend
     npm start
     ```

   - For the Backend:
     ```bash
     cd backend
     npm start
     ```

## API Documentation
### Endpoints
- **GET /api/air-quality**: Fetch the current air quality data.
- **POST /api/air-quality**: Add new air quality data.

### Request Example
```json
{
  "location": "City Name",
  "pm2.5": 35,
  "pm10": 50
}
```

### Response Example
```json
{
  "success": true,
  "data": {
    "location": "City Name",
    "pm2.5": 35,
    "pm10": 50
  }
}
```

## Project Structure
```
AIr_pollution_tracker/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── package.json
└── README.md
```

## Deployment Guide
1. **Create a Docker Image**:
   ```bash
   docker build -t air-pollution-tracker .
   ```

2. **Run the Docker Container**:
   ```bash
   docker run -p 3000:3000 air-pollution-tracker
   ```

3. **Deploy on Heroku/AWS**:
   Follow the respective documentation for deploying a Node.js application.

## Troubleshooting
- **Common Issues**:
  - If you encounter errors related to MongoDB, check your connection string in the `.env` file.
  - Ensure that all necessary environment variables are set.

## Contributing Guidelines
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.
