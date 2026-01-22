# Clixary

Clixary is an image-sharing and event management platform. Users can create events, upload images, view galleries, and the system processes images in the background (thumbnails, watermarks, and automatic tagging). The project exposes a REST API (Django REST Framework) consumed by a React + TypeScript frontend.


## Contents
- Backend: Django (in project root)
- Frontend: React + TypeScript (folder: `frontend`)
- Background tasks: Celery with Redis broker

## Project structure (high level)
```
Autumn_Assignment/
├─ core/                  # Django project (settings, ASGI, WSGI, celery app)
├─ accounts/              # User management and auth
├─ events/                # Event models, views, serializers
├─ images/                # Image models, uploads, tasks (thumbnails, watermark)
├─ activities/            # Reactions, notifications, middleware
├─ tags/                  # Tag models and serializers
├─ frontend/              # React + TypeScript frontend app
├─ media/                 # Uploaded media (originals, thumbnails, watermarked)
├─ manage.py
├─ runserver.ps1          # PowerShell helper to load .env and run dev server
├─ requirements.txt
├─ .env.example
└─ README.md
```

## Ports used (defaults)
- Backend Django dev server: 8000 (http://localhost:8000)
- Frontend React dev server: 3000 (http://localhost:3000)
- Redis (Celery broker/result backend): 6379

Notes:
- The React frontend runs on port 3000 and talks to the backend API (CORS configured for localhost:3000). When you run both servers locally, keep these ports free to avoid conflicts.
- Django Channels (WebSockets) uses the same host/port as Django's ASGI server (8000) when you run the development server.

---

## Tech stack
- Python 3.10+ / Django 6.x
- Django REST Framework
- React + TypeScript (Create React App)
- Celery (for background tasks)
- Redis (as Celery broker/result backend)

## Prerequisites
- Python 3.10+ (or the project's supported version)
- Node.js 16+ / npm or yarn for the frontend
- (Optional for Celery) Redis server
- Recommended: create a Python virtual environment

---

## Environment variables
This project uses a `.env` file at the repository root to store developer secrets and environment overrides. Real secrets must NOT be committed. A `.env.example` file is included with placeholders.

Important environment variables (see `.env.example`):

- `SECRET_KEY` — Django secret key. Keep it secret in production.
- `DEBUG` — `True` or `False`.
- `ALLOWED_HOSTS` — comma-separated hosts.
- Database: `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.
  - If these DB variables are not provided (or `DB_ENGINE` set to sqlite), Django will fall back to a local SQLite DB (`db.sqlite3`) for development.
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `EMAIL_USE_SSL`.
- `CELERY_BROKER_URL` — e.g. `redis://localhost:6379/0` (optional; required if you run Celery workers).

To start from the example file:

Windows PowerShell:

```powershell
copy .env.example .env
# Edit .env to fill in real values (especially SECRET_KEY for persistent local sessions)
```


Notes:
- `runserver.ps1` (included) will load `.env` automatically (PowerShell). If you use other shells, consider adding `python-dotenv` or use your shell's export mechanism.
- The project already reads `SECRET_KEY` from environment; if absent it will generate a secure key at runtime (useful for quick dev runs but not persistent across restarts).

---

## Celery (background tasks)

The project includes Celery tasks (thumbnail generation, watermarking, auto-tagging). To run them you need a broker (Redis recommended).

1. Start Redis (platform-specific). Example on Linux with redis-server installed:

```bash
redis-server
```

2. Start a Celery worker from the project root:

```bash
celery -A core worker -l info
```

Notes:
- `CELERY_BROKER_URL` is read from settings; set it in `.env` if you want to override the default `redis://localhost:6379/0`.
- Tasks are defined with `@shared_task` (see `images/tasks.py`). Code calls `.delay()` to queue work.

---


## Backend (Django) - Quickstart

1. Create and activate a virtualenv:

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```


2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Ensure `.env` is present (see above). If you don't provide DB env vars, the project will use the SQLite fallback.

4. Run migrations and start the dev server (PowerShell helper included):

```powershell
# Run migrations
python manage.py migrate
# Start the server (loads .env)
.\runserver.ps1
```


Note: If `SECRET_KEY` is not set in `.env`, the settings will generate a random key at startup. For persistent sessions, provide `SECRET_KEY` in your `.env`.

---

## Frontend (React)

The frontend lives in the `frontend/` folder.

1. Install frontend deps:

```powershell
cd frontend
npm install
```

2. Run frontend dev server (default port 3000):

```powershell
npm start
```

When developing, the frontend expects the backend API to be available (CORS origins are set for localhost:3000 in settings).


---


## Troubleshooting

- Q: The server starts but tasks don't run.
  - A: Make sure Redis is running and a Celery worker is active. Check `CELERY_BROKER_URL` in `.env`.

- Q: Email not sending in dev.
  - A: Ensure `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` exist in `.env`. When absent the console email backend is used (emails printed to console).