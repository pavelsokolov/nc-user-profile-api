# user-profile-api

REST API for user profile management. Built with Express, TypeScript, Firebase Admin SDK, and Firestore. Deployed to GCP Cloud Run.

## Prerequisites

- Node.js 22+
- pnpm
- A Firebase project with Firestore enabled
- GCP credentials: run `gcloud auth application-default login` once

## Local setup

```bash
git clone <repo-url> && cd nc-user-profile-api
pnpm install
cp .env.example .env
```

### Run with pnpm

```bash
pnpm dev
```

The server starts at `http://localhost:8080`.

### Local dev with Firebase emulators

The easiest way to develop locally without a real Firebase project. Docker Compose starts Firebase Auth + Firestore emulators automatically.

Both repos must be cloned as siblings:

```
parent/
  nc-user-profile-api/
  nc-user-profile-web/
```

```bash
docker compose up --build
```

- API: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Emulator UI: `http://localhost:4000`

No `.env` file or GCP credentials needed — the compose setup uses `demo-project` values and connects to emulators automatically.

To use emulators with standalone `pnpm dev`, uncomment the emulator env vars in `.env` (see `.env.example`).

### Run API standalone with Docker

```bash
docker build -t user-profile-api .
docker run --rm -p 8080:8080 \
  -e FRONTEND_ORIGIN=http://localhost:3000 \
  -v "$HOME/.config/gcloud:/root/.config/gcloud:ro" \
  user-profile-api
```

Verify:

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

## Testing

```bash
pnpm test
```

## API endpoints

| Method | Path       | Auth     | Description              |
| ------ | ---------- | -------- | ------------------------ |
| GET    | `/health`  | No       | Health check             |
| GET    | `/profile` | Required | Get current user profile |
| POST   | `/profile` | Required | Create/update profile    |

All authenticated endpoints require an `Authorization: Bearer <Firebase ID Token>` header.

## Deployment

Deployed to GCP Cloud Run. The `Dockerfile` handles the multi-stage build. Cloud Run provides credentials automatically via the attached service account.
