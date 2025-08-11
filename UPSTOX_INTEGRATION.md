# Upstox Integration Guide

## Overview

Flip Safe now supports multiple trading accounts including Upstox alongside the existing Kite (Zerodha) integration. This allows users to manage their portfolio across multiple brokers from a single unified interface.

## Features Added

### 🏦 Multi-Account Support

- **Centralized Account Management**: Add and manage multiple trading accounts
- **Unified Data View**: View orders, positions, and holdings from all accounts in one place
- **Account-wise Identification**: Each data entry shows which account it belongs to
- **Secure Credential Storage**: API keys and secrets stored securely with proper encryption

### 🔌 Upstox API Integration

- **OAuth 2.0 Authentication**: Secure login flow with Upstox
- **Real-time Data**: Fetch live orders, positions, and holdings
- **Market Data**: Access to LTP, quotes, and historical data
- **Order Management**: Place, modify, and cancel orders (coming soon)

### 🎨 Enhanced UI/UX

- **Account Management Dashboard**: Dedicated page to manage trading accounts
- **Multi-account Tables**: Enhanced tables showing data from multiple brokers
- **Account Badges**: Visual indicators showing which broker each entry belongs to
- **Responsive Design**: Works seamlessly on desktop and mobile

## Setup Instructions

### 1. Upstox Developer Account Setup

1. Visit [Upstox Developer Console](https://upstox.com/developer/)
2. Create a new app with the following settings:
   - **App Type**: Web App
   - **Redirect URI**: `https://your-domain.com/api/auth/upstox/callback`
   - **Scopes**: Select required permissions (orders, holdings, positions)

3. Note down your:
   - API Key
   - API Secret

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB connection (for storing accounts)
MONGODB_URI=your_mongodb_connection_string
```

### 3. Adding Upstox Account

1. Navigate to the **Accounts** page in the app
2. Click **"Add Account"**
3. Select **Upstox** as account type
4. Enter your API credentials:
   - Account Name (custom name for identification)
   - API Key
   - API Secret
   - Redirect URI (optional, defaults to callback URL)

5. Click **"Add Account"**
6. Click **"Connect Account"** to authenticate with Upstox
7. Complete OAuth flow on Upstox website
8. You'll be redirected back with successful authentication

## Technical Architecture

### Database Models

```typescript
interface IAccount {
  userId: string;
  accountType: 'kite' | 'upstox' | 'binance';
  accountName: string;
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}
```

### Unified Data Interfaces

```typescript
interface UnifiedOrder {
  id: string;
  accountId: string;
  accountType: 'kite' | 'upstox' | 'binance';
  symbol: string;
  exchange: string;
  quantity: number;
  price?: number;
  orderType: string;
  transactionType: 'BUY' | 'SELL';
  status: string;
  timestamp: string;
}
```

### API Routes

- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `POST /api/auth/upstox/login` - Initiate Upstox OAuth
- `GET /api/auth/upstox/callback` - Handle OAuth callback
- `GET /api/trading/orders?userId=X` - Get unified orders
- `GET /api/trading/positions?userId=X` - Get unified positions
- `GET /api/trading/holdings?userId=X` - Get unified holdings

## Key Components

### 1. Account Management

- **AccountCard**: Displays account info with connection status
- **AddAccountModal**: Form for adding new trading accounts
- **AccountsPage**: Main account management interface

### 2. Unified Trading Service

- **TradingService**: Central service handling multiple brokers
- **UpstoxAPI**: Upstox-specific API client
- **Data Normalization**: Converts broker-specific data to unified format

### 3. Enhanced Pages

- **Orders Page**: Shows orders from all connected accounts
- **Positions Page**: Displays positions across all brokers
- **Holdings Page**: Portfolio view with multi-account support

## Usage

1. **Add Accounts**: Connect your Kite and Upstox accounts
2. **View Unified Data**: All your trading data appears in single tables
3. **Account Identification**: Each entry shows which broker it belongs to
4. **Manage Accounts**: Edit, delete, or reconnect accounts as needed

## Future Enhancements

- **Binance Integration**: Crypto trading support
- **Order Placement**: Place orders across multiple brokers
- **Portfolio Analytics**: Advanced analytics across accounts
- **Real-time Updates**: WebSocket connections for live data
- **Mobile App**: React Native mobile application

## Support

For issues or questions:

1. Check the application logs for error details
2. Verify API credentials and permissions
3. Ensure proper OAuth redirect URI configuration
4. Contact support with specific error messages

## Security Notes

- API secrets are never sent to the client
- Access tokens are encrypted in database
- OAuth flows use secure HTTPS connections
- Account credentials are validated server-side
