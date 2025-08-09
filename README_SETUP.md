# Flip Secure - Unified Trading Platform

## Project Structure
- **Server**: Express.js backend with MongoDB (Port 3000)
- **action-ui**: Unified trading and analytics interface (Port 3098)

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
- Unified UI on http://localhost:3098

### Individual Services
```bash
# Backend server only
npm run server

# Unified UI only
npm run ui
```

### Production Build
```bash
# Build UI for production
npm run build-ui
```

## API Endpoints
- `/auth` - Authentication routes
- `/db` - Database operations
- `/kc` - Kite Connect integration
- `/ticker` - Real-time ticker data
- `/alerts` - Price alerts
- `/orders` - Order management

## Features

### Trading Features
- Real-time market data and live trading
- Order placement and management (Buy/Sell)
- Portfolio tracking (Holdings, Positions, Funds)
- Price alerts and notifications
- Draggable order entry panels
- Advanced trading terminal

### Analytics Features  
- Historical data simulation
- Market data analysis tools
- Administrative console for data management
- Customizable market watch lists
- Chart analysis with multiple timeframes
- Data caching and management

### Unified Experience
- Single application with both trading and analytics modes
- Shared components for consistent UI/UX
- Night/day theme toggle
- Real-time data synchronization

## Troubleshooting

### Port Already in Use
If you get a port already in use error, you can:
1. Kill the process using the port: `lsof -ti:3000 | xargs kill`
2. Or change the port in the respective configuration

### CORS Issues
CORS is configured to allow requests from localhost:3098 and localhost:3000. If you change ports, update the CORS configuration in `app.js`.

### MongoDB Connection
Ensure MongoDB is running:
```bash
# Check MongoDB status
mongod --version

# Start MongoDB (if installed locally)
mongod
```