# ChumleyViz

ChumleyViz is a full-stack dashboard management system built with React, Vite, TypeScript, and FastAPI. It supports JWT-based authentication, folder and dashboard organization, drag-and-drop moves between folders, and a reusable dashboard rendering shell for plugging in external BI content later.

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

- JWT login flow with a Microsoft SSO-style entry screen
- Protected frontend routes and persisted session storage
- Folder create, rename, delete, list, and grid/list view toggle
- Dashboard organizer board with drag-and-drop folder assignment
- Dashboard move in and out of folders through drag/drop and inline picker
- Dynamic dashboard renderer driven by backend widget definitions
- Toasts, loading states, empty states, and responsive shell
- Light and dark theme support
- Seeded demo data for users, folders, and dashboards

## Demo Login

The reference login page is implemented as a Microsoft SSO-style demo flow. The backend seeds one demo user:

- Email: `microsoft@aspectdemo.com`
- Password: `Aspect@12345`

The frontend login page uses the SSO-style button and signs in through `POST /login` with the `microsoft_sso` provider payload.

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

## Frontend Setup

```bash
cd /Users/ankitsingh/Aspect/chumleyviz/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

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
- `DEMO_SSO_EMAIL`
- `DEMO_SSO_PASSWORD`

Frontend:

- `VITE_API_BASE_URL`

## Testing

- Frontend unit test setup is provided with Vitest.
- Backend integration smoke coverage is provided with `pytest` and FastAPI `TestClient`.

## Notes for External Dashboard Integration

Dashboard rendering is schema-driven. Each dashboard carries a `widgets` array from the API, and the React renderer maps widget `kind` values to reusable render blocks. That makes it straightforward to replace placeholder widgets with embedded BI components or richer charting later without changing the foldering and auth flows.
