# ChumleyViz

ChumleyViz is a full-stack dashboard management system built with React, Vite, TypeScript, and FastAPI. It supports Microsoft Entra sign-in, app-issued JWT sessions, folder and dashboard organization, drag-and-drop moves between folders, and a reusable dashboard rendering shell for plugging in external BI content later.

## Stack

- Frontend: React 19, Vite, TypeScript, Zustand, Axios, `@dnd-kit/core`, `react-hot-toast`
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, SQLite by default
- Architecture: feature-based frontend modules and modular backend packages (`routers`, `services`, `models`, `schemas`)

## Project Structure

```text
chumleyviz/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── services/
│       ├── theme/
│       └── types/
└── README.md
```

## Features

- Real Microsoft Entra login on the frontend with backend token exchange
- App-issued JWT session after Microsoft token validation
- Protected frontend routes and persisted session storage
- Folder create, rename, delete, list, and grid/list view toggle
- Dashboard organizer board with drag-and-drop folder assignment
- Dashboard move in and out of folders through drag/drop and inline picker
- Dynamic dashboard renderer driven by backend widget definitions
- Toasts, loading states, empty states, and responsive shell
- Light and dark theme support
- Seeded demo data for users, folders, and dashboards

## Authentication

Frontend sign-in uses `@azure/msal-browser` to acquire a Microsoft access token for the configured API scope. The frontend then exchanges that token with `POST /auth/microsoft/exchange`, and the backend validates the Entra token against your tenant JWKS before issuing the app JWT used by the rest of the API.

Role assignment works like this:

- Existing local users keep their stored role
- New Microsoft users whose email appears in `ADMIN_EMAILS` become `admin`
- Other new Microsoft users become `viewer`

The backend still supports `POST /login` with seeded email/password users for local smoke tests and viewer-role testing.

## Backend Setup

```bash
cd /Users/ankitsingh/Aspect/chumleyviz/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`.

Set these backend values in `.env` before using real Microsoft login:

```bash
ADMIN_EMAILS=ankit.singh@aspect.co.uk,microsoft@aspectdemo.com
ENTRA_TENANT_ID=93ce9c27-3bb2-4ef2-b686-1829de4f2584
ENTRA_API_CLIENT_ID=a69d5fb3-99af-440f-b88d-01f4aa7a8db2
ENTRA_ISSUER=https://login.microsoftonline.com/93ce9c27-3bb2-4ef2-b686-1829de4f2584/v2.0
ENTRA_JWKS_URL=https://login.microsoftonline.com/93ce9c27-3bb2-4ef2-b686-1829de4f2584/discovery/v2.0/keys
```

## Frontend Setup

```bash
cd /Users/ankitsingh/Aspect/chumleyviz/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

Set these frontend values in `.env` before using Microsoft sign-in:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_MSAL_CLIENT_ID=a69d5fb3-99af-440f-b88d-01f4aa7a8db2
VITE_MSAL_TENANT_ID=93ce9c27-3bb2-4ef2-b686-1829de4f2584
VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/93ce9c27-3bb2-4ef2-b686-1829de4f2584
VITE_MSAL_REDIRECT_URI=http://localhost:5173
VITE_MSAL_API_SCOPE=api://a69d5fb3-99af-440f-b88d-01f4aa7a8db2/access_as_user
```

## Root Scripts

From `/Users/ankitsingh/Aspect/chumleyviz`:

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
npm run test:frontend
npm run test:backend
```

## API Endpoints

- `POST /login`
- `POST /auth/microsoft/exchange`
- `GET /folders`
- `POST /folders`
- `PATCH /folders/{id}`
- `DELETE /folders/{id}`
- `GET /dashboards`
- `PATCH /dashboards/{id}`
- `GET /health`

All folder and dashboard endpoints require a bearer token.

## Environment Variables

Backend:

- `APP_NAME`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `ADMIN_EMAILS`
- `DEMO_SSO_EMAIL`
- `DEMO_SSO_PASSWORD`
- `ENTRA_TENANT_ID`
- `ENTRA_API_CLIENT_ID`
- `ENTRA_ISSUER`
- `ENTRA_JWKS_URL`

Frontend:

- `VITE_API_BASE_URL`
- `VITE_MSAL_CLIENT_ID`
- `VITE_MSAL_TENANT_ID`
- `VITE_MSAL_AUTHORITY`
- `VITE_MSAL_REDIRECT_URI`
- `VITE_MSAL_API_SCOPE`

## Testing

- Frontend unit test setup is provided with Vitest.
- Backend integration smoke coverage is provided with `pytest` and FastAPI `TestClient`.

## Notes for External Dashboard Integration

Dashboard rendering is schema-driven. Each dashboard carries a `widgets` array from the API, and the React renderer maps widget `kind` values to reusable render blocks. That makes it straightforward to replace placeholder widgets with embedded BI components or richer charting later without changing the foldering and auth flows.
