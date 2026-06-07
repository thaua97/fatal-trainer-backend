# Fatal Trainer API

REST API for the Fatal Trainer catalog, built with **Node.js**, **TypeScript**, **Fastify**, **Prisma**, and **PostgreSQL**, following **DDD**, **SOLID**, and design patterns (Use Cases, Repository, Adapter, Strategy, Factory, In-Memory Repository).

## Requirements

- Node.js 20+
- Docker (PostgreSQL)

## Setup

```bash
cd backend
cp .env.example .env
docker compose up -d
export $(grep -v '^#' .env | xargs)
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API runs at `http://localhost:3333/api`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm test` | Unit tests (domain/use cases) |
| `npm run test:e2e` | E2E tests (HTTP + PostgreSQL) |
| `npm run test:coverage` | Unit coverage report |
| `npm run db:seed` | Seed 500+ personal trainers |

## Architecture

```
src/
├── core/                 # Entity base, UniqueEntityID
├── domain/               # Bounded contexts (catalog, auth, favorites, reports)
│   └── */application/    # Use cases + repository ports
│   └── */enterprise/     # Entities, value objects, strategies
├── infra/
│   ├── http/             # Fastify controllers, presenters, middlewares
│   ├── database/prisma/  # Prisma adapters + mappers
│   └── storage/          # Gallery file storage (local + S3/CDN)
└── utils/tests/          # Factories + in-memory repositories
```

### Design patterns

- **Use Case**: application logic (`ListPersonalTrainersUseCase`, etc.)
- **Repository**: ports in domain, Prisma/in-memory adapters in infra
- **Strategy**: sort/filter pipelines for catalog queries
- **Factory**: `makePersonalTrainer()` (seed/tests), `make*UseCase()` (HTTP wiring)
- **Adapter**: HTTP controllers, Prisma mappers, local file storage

## API routes (17)

| Method | Route |
|--------|-------|
| GET | `/api/personal-trainers` |
| GET | `/api/personal-trainers/featured` |
| GET | `/api/personal-trainers/:id` |
| GET/PATCH | `/api/personal-trainers/me` |
| POST/DELETE/PATCH | `/api/personal-trainers/me/gallery/*` |
| GET/POST/DELETE | `/api/personal-trainers/bookmakers` |
| POST | `/api/auth/login`, `/register`, `/logout` |
| GET | `/api/auth/me` |
| POST | `/api/reports` |

List query params match the Nuxt front (`search`, `specialties`, `modalities`, `minPrice`, `maxPrice`, `minRating`, `city`, `maxDistanceKm`, `onPromotion`, `sortBy`, `sortOrder`, `page`, `pageSize`).

Response includes `hasMore` for pagination (RF-011).

## Frontend integration

Point the Nuxt app to the external API:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3333/api
```

Replace Nitro server routes with fetch to this API when ready.

## Image storage (gallery / profile photo)

| `STORAGE_DRIVER` | Behavior |
|------------------|----------|
| `local` (default) | Files in `UPLOAD_DIR`, served at `GET /uploads/*` |
| `s3` | Upload to S3 via `@aws-sdk/client-s3`; public URLs via `CDN_BASE_URL` (CloudFront) |

Set in `.env`:

```env
STORAGE_DRIVER=local
# For production:
# STORAGE_DRIVER=s3
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=fatal-trainer-assets-prod
# CDN_BASE_URL=https://d123abc.cloudfront.net
```

AWS setup guide: [docs/infra/s3-cloudfront-setup.md](docs/infra/s3-cloudfront-setup.md).

Gallery endpoints accept `multipart/form-data` field `file` (jpeg/png/webp, max 5 MB, max 12 images per trainer).

## Seed users

Senha padrão para todos: `123456`

| Email | Role | Perfil no catálogo |
|-------|------|--------------------|
| aluno@fataltrainer.com | student | — |
| maria@fataltrainer.com | student | — |
| personal@fataltrainer.com | personal-trainer | sim |
| bruno@fataltrainer.com | personal-trainer | sim |

## Tests

- **Unit**: in-memory repositories, domain services, use cases
- **E2E**: Supertest + isolated PostgreSQL schema per run

```bash
npm test
npm run test:e2e
npm run test:coverage
```
