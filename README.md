# TaskFlow — Application Repository

TaskFlow is an AI task processing platform: authenticated users submit text
processing tasks (uppercase, lowercase, reverse, word count), which run
asynchronously on a Python worker fleet via a Redis queue, backed by MongoDB.

This repo contains the **application** itself (frontend, backend, worker,
CI/CD). Kubernetes manifests and the Argo CD Application live in the
separate **infrastructure repository**.

```
app-repo/
├── frontend/     React + Vite dashboard
├── backend/      Node.js + Express REST API
├── worker/       Python background worker
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

## Architecture, in one paragraph

The frontend talks only to the backend API. The backend never processes a
task itself — it saves the task to MongoDB with status `pending` and pushes
`{ taskId }` onto a Redis list. Python workers block on that same list with
`BRPOP`; whichever worker is free picks up the job, flips it to `running`,
runs the operation, and writes the result/logs/final status straight back to
MongoDB. The frontend polls the task every few seconds until it reaches a
terminal state (`success` / `failed`).

## Option A — run locally without Docker

You'll need Node.js 20+, Python 3.12+, a local MongoDB, and a local Redis
running.

```bash
# 1. backend
cd backend
cp .env.example .env        # edit MONGODB_URI / REDIS_URL if not using defaults
npm install
npm run dev                 # http://localhost:5000

# 2. worker (separate terminal)
cd worker
cp .env.example .env
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python worker.py

# 3. frontend (separate terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173, proxies /api to :5000 via vite.config.js
```

## Option B — run everything with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts MongoDB, Redis, the backend, one worker, and the frontend
(served by nginx). Visit **http://localhost:8080**.

Want to see the worker actually scale? Run more of them:

```bash
docker compose up --build --scale worker=4
```

## Environment variables

See `backend/.env.example` and `worker/.env.example` for the full list.
The only one you must change before anything resembling production is
`JWT_SECRET` (and `ADMIN_SIGNUP_CODE`, which gates who can create an admin
account through the admin signup page).

## Admin access

There's no public "become an admin" button. The `/admin/signup` page
requires an **admin invite code** that must match `ADMIN_SIGNUP_CODE` on the
backend — set your own value and only share it with people who should
actually get admin access. Regular users clicking the "Admin" links in the
navbar first see a SweetAlert2 warning before they're allowed anywhere near
the admin login/signup pages.

## Testing

- `backend/__manual_tests__/logic.test.js` — sanity checks for JWT signing
  and bcrypt hashing (`node __manual_tests__/logic.test.js` from `backend/`)
- `worker/test_operations.py` / `worker/test_worker.py` — pytest suite for
  the four text operations and the task processing state machine, using
  `mongomock` so it runs without a real MongoDB (`pip install -r
  requirements-dev.txt && pytest` from `worker/`)
- `npm run lint` in both `frontend/` and `backend/`

## CI/CD (`.github/workflows/ci-cd.yml`)

On every push to `main`:

1. **Lint** — backend and frontend
2. **Build & push** — multi-stage Docker images for backend/worker/frontend,
   tagged with both `latest` and the short commit SHA, pushed to Docker Hub
3. **Update infra repo** — clones the infrastructure repository and rewrites
   the image tags in its Kubernetes manifests to the new SHA, then commits
   and pushes. Argo CD (running in the cluster, watching that repo) picks up
   the change automatically and syncs it — this is the GitOps hand-off point.

Required GitHub Actions secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`,
`INFRA_REPO_PAT` (a personal access token with push rights to the infra
repo).

## A note on the frontend build/proxy setup

In development, `frontend/vite.config.js` proxies `/api` straight to
`http://localhost:5000` — the same pattern used across this codebase's other
projects. In production there's no Netlify involved (this ships as a Docker
image behind Kubernetes/nginx instead), so the equivalent job is done by
`frontend/nginx.conf`, which proxies `/api/` to the `taskflow-backend`
Kubernetes Service. Same idea, different hop.

## Assumptions / notes for the reviewer

- Email sending (verification links, password reset links) falls back to
  console-logging the link when `SMTP_HOST` isn't configured, so the full
  auth flow is testable without a real mailbox.
- The admin panel (dashboard, user list, task list) was not explicitly
  required by the assignment brief but was added as a small, clearly scoped
  extra for demonstration.
- `Contact Us` and `Report Issue` forms currently simulate submission
  client-side (no backend endpoint was specified for them in the brief) —
  wiring them to a real endpoint would be a one-file change.
