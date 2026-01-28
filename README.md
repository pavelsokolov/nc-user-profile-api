# user-profile-api

REST API for user profile management. Express, TypeScript, Firebase Admin SDK, Firestore.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Server runs at `http://localhost:8080`.

## Docker Compose (recommended)

Both repos must be siblings:

```
parent/
  nc-user-profile-api/
  nc-user-profile-web/
```

```bash
docker compose up --build
```

- API: http://localhost:8080
- Frontend: http://localhost:3000
- Emulator UI: http://localhost:4000

Get SMS verification codes:

```bash
curl http://localhost:9099/emulator/v1/projects/demo-project/verificationCodes
```

## Testing

```bash
pnpm test                # unit tests
pnpm test:integration    # requires emulators running
```
