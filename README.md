# DevHub AI

A lightweight MVP for the DevHub AI platform described in the implementation blueprint. The app presents the marketplace, API discovery experience, AI workspace, account management, and usage monitor in a single dashboard.

## Features

- API Hub overview and service status cards
- Electronics Explorer search handoff to the official element14 Philippines website
- AI model and workspace cards
- Account and provider management panels
- Usage monitoring with cost and quota views
- Modular architecture summary matching the platform blueprint
- Versioned FastAPI backend with a health endpoint
- Environment templates for frontend, backend, and Supabase configuration

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

In a separate PowerShell terminal, run the API:

```bash
Set-Location "C:\Users\lance\devaitracker"
C:/Users/lance/AppData/Local/Programs/Python/Python313/python.exe -m uvicorn apps.api.app.main:app --reload --port 8000
```

The frontend is available at `http://localhost:5173` and the API health check is available at `http://localhost:8000/api/v1/health`.

## Test and build

```bash
npm run build
C:/Users/lance/AppData/Local/Programs/Python/Python313/python.exe -m pytest apps/api/tests
```

Copy `.env.example` to `.env` for frontend settings and `apps/api/.env.example` to `apps/api/.env` for backend settings. Never commit real Supabase keys.

The Electronics Explorer currently opens product searches on element14 Philippines and does not retrieve or display catalog data. No element14 API credentials or backend integration are configured. Official API access and usage terms should be confirmed with element14 before adding live catalog queries.
