# TaskFlow — Application Repository

AI Task Processing Platform built with the MERN stack plus a Python background worker, built as a technical assessment for a MERN Full Stack Developer role.

Users register, log in, and submit text-processing tasks (uppercase, lowercase, reverse, word count). Tasks are queued in Redis, picked up asynchronously by a Python worker, and results are written back to MongoDB.

This repo contains the application code. Kubernetes manifests and Argo CD configuration live in the separate [infrastructure repository](https://github.com/Itachi7011/Taskflow_infra-repo).

## Architecture

```
Browser → nginx (frontend) → Express API (backend) → MongoDB
                                     │
                                     ▼
                              Redis queue (LPUSH)
                                     │
                                     ▼
                          Python worker (BRPOP) → MongoDB
```

- **Frontend**: React + Vite, served by nginx in production, proxies `/api` to the backend
- **Backend**: Node.js + Express, JWT auth, bcrypt password hashing, rate limiting, Helmet
- **Worker**: Python, consumes jobs from a Redis list via `BRPOP`, processes them, writes results back to MongoDB
- **Database**: MongoDB
- **Queue**: Redis (plain list — `LPUSH` from Node, `BRPOP` from Python; no external queue library needed since both languages speak the same primitive)

## Tech stack

| Component | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend API | Node.js + Express |
| Background worker | Python |
| Database | MongoDB |
| Queue | Redis |
| Auth | JWT + bcrypt |
| Containerization | Docker (multi-stage builds, non-root users) |

## Local setup (Docker Compose)

### Prerequisites
- Docker + Docker Compose
- Your user added to the `docker` group (`sudo usermod -aG docker $USER`, then log out/in) so you don't need `sudo` for every command

### 1. Environment variables
Copy `backend/.env.example` to `backend/.env` and fill in real values for local dev (the example file documents every variable). The values already baked into `docker-compose.yml` are fine for local development as-is.

### 2. Start everything
```bash
docker compose up --build
```
This starts MongoDB, Redis, the backend API, the Python worker, and the frontend (served on nginx). Health checks ensure Mongo/Redis are ready before backend/worker start.

### 3. Bootstrap the first admin account

Normal signup requires an `ADMIN_SIGNUP_CODE` to become an admin — by design, so random users can't self-promote. Since there's no admin yet to hand out that code the first time, bootstrap one directly:

```bash
docker compose exec -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD=YourStrongPassword123 taskflow-backend npm run seed:admin
```

This creates (or promotes, if the account already exists) an admin user directly via the `User` model — bypassing the public `/auth/register` endpoint entirely, so the invite-code security model stays intact. Once you have one admin, that account can issue `ADMIN_SIGNUP_CODE` invites for any future admins through the normal signup flow.

### 4. Open the app
```
http://localhost:8080
```

## Running lint

```bash
cd backend && npm run lint
cd frontend && npm run lint
```

## CI/CD

Pushing to `main` triggers a GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) that:

1. **Lints** both backend and frontend
2. **Builds and pushes** all three Docker images to Docker Hub, tagged with the short commit SHA
3. **Commits the new image tags** into the infra repository's `k8s/` manifests

Argo CD (configured in the infra repo, with auto-sync and self-heal enabled) picks up that commit automatically and rolls out the new images — no manual deployment step required after merging to `main`.

### Required GitHub Secrets (set on this repo, under Settings → Secrets and variables → Actions)

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub account for pushing images |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Read & Write scope) |
| `INFRA_REPO_PAT` | GitHub Personal Access Token (classic, `repo` scope) — lets this workflow push commits into the infra repo |

## Notes on design decisions

- **Redis queue has an in-process fallback** (`queues/taskQueue.js`) that processes a task directly in the backend if Redis is unreachable, rather than failing the request outright. In normal operation (local Docker or Kubernetes, both self-hosting Redis) this fallback never triggers — Redis connects on startup and stays connected. It exists purely as resilience against a transient Redis outage, not as the primary processing path.
- **Email verification** falls back to printing the verification link to the console when SMTP isn't configured, rather than failing signup — useful for local/demo environments without real SMTP credentials.