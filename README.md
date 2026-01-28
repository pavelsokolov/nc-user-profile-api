# nc-user-profile-api

REST API for user profile management. Built with Express, TypeScript, and Firebase (Auth + Firestore). Designed for deployment on GCP Cloud Run.

**Related:** frontend repo — [nc-user-profile-web](https://github.com/pavelsokolov/nc-user-profile-web)

## Notable dependencies

- **Express 4** — HTTP framework
- **Firebase Admin SDK** — token verification and Firestore access
- **Zod** — request body validation
- **Helmet** — security headers
- **vitest + supertest** — unit and integration testing
- **ESLint 9 + Prettier** — linting and formatting

## Prerequisites

- Node.js >= 18
- pnpm
- Docker (recommended, for Firebase emulators)

## Setup (Docker — recommended)

Docker Compose starts the API together with Firestore and Auth emulators:

```bash
pnpm install               # install dependencies
cp .env.example .env       # configure environment variables
docker compose up --build  # starts API + emulators
```

After startup:

- API: http://localhost:8080
- Emulator UI: http://localhost:4000
- Auth emulator: http://localhost:9099

To retrieve SMS verification codes issued by the Auth emulator:

```bash
curl http://localhost:9099/emulator/v1/projects/demo-project/verificationCodes
```

The default Firebase project ID is `demo-project`. If you change it, update `.env` and test configs.

## Setup (manual)

If you prefer to run without Docker (e.g. using your own Firebase project):

```bash
pnpm install               # install dependencies
cp .env.example .env       # configure environment variables (add service account path)
pnpm dev                   # starts dev server with vite-node at http://localhost:8080
```

## Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Start dev server with auto-reload (vite-node) |
| `pnpm build`            | Compile TypeScript to `dist/`                 |
| `pnpm start`            | Run production build (`node dist/index.js`)   |
| `pnpm test`             | Run unit tests (vitest)                       |
| `pnpm test:integration` | Run integration tests (requires emulators)    |
| `pnpm lint`             | Run ESLint                                    |
| `pnpm format`           | Format code with Prettier                     |
| `pnpm format:check`     | Check formatting without writing              |
| `pnpm prepare`          | Activate git hooks (run once after install)   |

## Environment variables

See `.env.example` for the full list. Key ones:

- `PORT` — server port (default `8080`)
- `FRONTEND_ORIGIN` — allowed CORS origin, must match the frontend URL exactly (default `http://localhost:5173`)
- `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` — point Firebase Admin SDK to local emulators

When running against real Firebase, set the path to your service account JSON as documented in `.env.example`.

## API

All endpoints except `/health` require `Authorization: Bearer <firebase-id-token>`.

- `GET /health` — health check
- `GET /api/profile` — fetch current user's profile (always returns 200)
- `POST /api/profile` — create or update profile (body: `name`, `email`)

Status codes: `200` success, `400` validation error, `401` auth error, `500` server error.

## Project structure

```
src/
  index.ts        # server entrypoint
  app.ts          # Express app (CORS, helmet, routes)
  firebase.ts     # Firebase Admin SDK init
  config.ts       # env config
  routes/         # route definitions
  controllers/    # request handlers
  services/       # business logic / Firestore access
  schemas/        # Zod validation schemas
  middleware/     # auth, traceId, errorHandler
  __tests__/      # unit and integration tests
```

## Important notes

- **Native ESM.** The project uses `"type": "module"` with `NodeNext` module resolution. All local imports must use `.js` extensions (e.g. `import { config } from './config.js'`). No `require()`.
- **Firestore access is server-only.** Firestore security rules deny all client access. All reads/writes go through the Firebase Admin SDK in this API.
- **CORS.** `FRONTEND_ORIGIN` must match the frontend URL exactly (scheme + host + port). Mismatches will silently block requests.

## Architecture notes

- User identity comes exclusively from the verified Firebase ID token. The phone number from the token is the Firestore document ID (`users` collection).
- The API is stateless — no sessions, no server-side state.
- `POST /api/profile` is an upsert; timestamps (`createdAt`, `updatedAt`) are managed automatically.
- `GET /api/profile` returns empty `name`/`email` if no profile exists yet (never 404).

## CI/CD

GitHub Actions runs three jobs on every push and PR:

1. **Lint** — ESLint + Prettier check
2. **Unit tests** — vitest
3. **Integration tests** — vitest with Firebase emulators

See `.github/workflows/` for the workflow definition.

## Deployment

Deployed to GCP Cloud Run via automatic continuous deployment from the GitHub repo. Cloud Run builds the container image using the `Dockerfile` in the repo root.

## Firestore data

<img width="1108" height="604" alt="Screenshot 2026-01-28 at 21 29 05" src="https://github.com/user-attachments/assets/54b0f51a-ee6b-4751-b7ed-0922679b97f1" />
