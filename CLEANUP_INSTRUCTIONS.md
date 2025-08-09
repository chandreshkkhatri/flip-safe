# Manual Cleanup Instructions

## Legacy Directories to Remove

Please manually delete these legacy directories that are no longer needed:

1. **`analytics-ui/`** - Legacy analytics interface (replaced by merged features in action-ui)
2. **`z-trader-action-ui/`** - Legacy action interface (replaced by action-ui)

## Clean Project Structure

After removing the legacy directories, your project structure should be:

```
flip-safe/
├── action-ui/                    # 🎯 UNIFIED APPLICATION
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Simulator.js      # From analytics-ui
│   │   │   ├── AdminConsole.js   # From analytics-ui  
│   │   │   ├── Orders/           # Trading features
│   │   │   ├── Holdings/         # Trading features
│   │   │   ├── Positions/        # Trading features
│   │   │   ├── Funds/            # Trading features
│   │   │   ├── Alerts/           # Trading features
│   │   │   └── Terminal/         # Trading features
│   │   ├── utils/                # Simulation utilities
│   │   └── helpers/              # API helpers
│   └── package.json
├── app.js                        # Express server
├── package.json                  # Main package.json
├── README_SETUP.md              # Updated documentation
└── [server files...]
```

## Commands to Delete (run from project root):

```bash
rm -rf analytics-ui
rm -rf z-trader-action-ui
```

## Verification

After cleanup, confirm these commands work:

```bash
npm run install-all    # Install dependencies
npm run dev           # Start server + UI
```

The unified application should run on:
- Backend: http://localhost:3000  
- Frontend: http://localhost:3098