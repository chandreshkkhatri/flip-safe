# Flip Secure - Unified Trading Platform

## Project Structure
- **Server**: Express.js backend with MongoDB
- **z-trader-ui**: Main trading interface (Port 3099)
- **z-trader-action-ui**: Action trading interface (Port 3098)

## Prerequisites
- Node.js (v12 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

## Quick Setup

### 1. Install all dependencies
```bash
npm run install-all
```

### 2. Configure Database
Make sure MongoDB is running and update the connection string in `db-connection.js` if needed.

### 3. Configure Kite Connect API
Update your Kite Connect credentials in `app-cred.json`.

## Running the Application

### Development Mode (All services)
```bash
npm run dev
```
This will start:
- Backend server on http://localhost:3000
- z-trader-ui on http://localhost:3099
- z-trader-action-ui on http://localhost:3098

### Individual Services
```bash
# Backend server only
npm run server

# z-trader-ui only
npm run ui

# z-trader-action-ui only
npm run action-ui
```

## API Endpoints
- `/auth` - Authentication routes
- `/db` - Database operations
- `/kc` - Kite Connect integration
- `/ticker` - Real-time ticker data
- `/alerts` - Price alerts
- `/orders` - Order management

## Features
- Real-time market data
- Order placement and management
- Price alerts
- Portfolio tracking
- Historical data analysis
- Market watch customization

## Troubleshooting

### Port Already in Use
If you get a port already in use error, you can:
1. Kill the process using the port: `lsof -ti:3000 | xargs kill`
2. Or change the port in the respective configuration

### CORS Issues
CORS is configured to allow requests from localhost:3098, localhost:3099, and localhost:3000. If you change ports, update the CORS configuration in `app.js`.

### MongoDB Connection
Ensure MongoDB is running:
```bash
# Check MongoDB status
mongod --version

# Start MongoDB (if installed locally)
mongod
```