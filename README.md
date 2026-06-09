# Fatal Trainer API

API REST do catálogo Fatal Trainer — Node.js, TypeScript, Fastify, Prisma e PostgreSQL.

Backend complementar ao front-end Nuxt do [desafio técnico Atlas Technologies](../fatal-trainer/docs/challenge.md). Fornece os **500 personal trainers** exigidos pelo desafio, com busca, filtros, ordenação e paginação server-side consumidos pelo front em [`fatal-trainer`](../fatal-trainer/).

> **Demo (front-end):** [https://fatal-trainer.vercel.app/](https://fatal-trainer.vercel.app/)
>
> **API (produção):** [https://fatal-trainer-backend.onrender.com/api](https://fatal-trainer-backend.onrender.com/api)
>
> **Vídeo de apresentação:** _link do vídeo (máx. 5 min) — a preencher_

---

## Sobre o projeto

API que sustenta o catálogo de personal trainers autônomos. Implementa DDD com use cases, repositórios, strategies de filtro/ordenação e adapters Prisma — sem expor o dataset completo ao client de uma vez.

### Papel no desafio

| Responsabilidade | Detalhe |
|------------------|---------|
| Volume de dados | Seed de **500 trainers** via [`prisma/seed.ts`](prisma/seed.ts) |
| Listagem paginada | `GET /api/personal-trainers` com `page`, `pageSize` (padrão 20) e `hasMore` |
| Busca e filtros | `search`, `specialties`, `modalities`, `city`, `minPrice`, `maxPrice`, `minRating`, `onPromotion` |
| Ordenação | `sortBy` (preço, rating, distância, nome, etc.) + `sortOrder` |
| Perfil | `GET /api/personal-trainers/:id` com descrição, preço, avaliação, localização, galeria |

---

## Atendimento ao desafio (via API)

Mapeamento dos requisitos do [`challenge.md`](../fatal-trainer/docs/challenge.md) cobertos por esta API:

| Requisito | Implementação |
|-----------|---------------|
| 500 profissionais | [`generateMockTrainers(500)`](src/utils/tests/factories/make-personal-trainer.ts) no seed |
| Busca por nome/profissão | `SearchFilterStrategy` + query `search` |
| Filtragem | Strategies em [`src/domain/catalog/enterprise/strategies/filter/`](src/domain/catalog/enterprise/strategies/filter/) |
| Ordenação | Strategies em [`src/domain/catalog/enterprise/strategies/sort/`](src/domain/catalog/enterprise/strategies/sort/) |
| Carregamento sob demanda | Paginação em [`ListPersonalTrainersUseCase`](src/domain/catalog/application/use-cases/list-personal-trainers.ts) — resposta com `hasMore` |
| Perfil detalhado | `GET /api/personal-trainers/:id` |
| Dados fora do bundle do front | API server-side; front consome lotes paginados |

---

## Como executar o projeto

**Requisitos:** Node.js 20+, Docker (PostgreSQL)

### Setup local

```bash
git clone <repo-url>
cd fatal-trainer-backend
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm run dev
```

A API sobe em [http://localhost:3333/api](http://localhost:3333/api).

### Integração com o front-end

No projeto [`fatal-trainer`](../fatal-trainer/), configure [`.env`](../fatal-trainer/.env.example):

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3333/api
NUXT_PUBLIC_USE_MOCK_API=false
```

Depois:

```bash
cd fatal-trainer
pnpm install
pnpm dev
```

Documentação completa da integração: [`fatal-trainer/docs/specs/api-integration-frontend.md`](../fatal-trainer/docs/specs/api-integration-frontend.md).

### Produção (Render)

Deploy via [`render.yaml`](render.yaml). O front Nuxt na Vercel aponta para esta API.

| Ambiente | URL |
|----------|-----|
| API REST (base) | [https://fatal-trainer-backend.onrender.com/api](https://fatal-trainer-backend.onrender.com/api) |
| Health check / listagem | [https://fatal-trainer-backend.onrender.com/api/personal-trainers?page=1&pageSize=1](https://fatal-trainer-backend.onrender.com/api/personal-trainers?page=1&pageSize=1) |
| Front-end | [https://fatal-trainer.vercel.app/](https://fatal-trainer.vercel.app/) |

Variáveis no front (Vercel):

```env
NUXT_PUBLIC_API_BASE_URL=https://fatal-trainer-backend.onrender.com/api
NUXT_PUBLIC_ASSETS_BASE_URL=https://fatal-trainer-backend.onrender.com
NUXT_PUBLIC_USE_MOCK_API=false
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção (`tsup`) |
| `npm run prod` | Executa o build |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários (domain + use cases) |
| `npm run test:e2e` | Testes E2E (HTTP + PostgreSQL) |
| `npm run test:all` | Unit + E2E |
| `npm run test:coverage` | Cobertura dos testes unitários |
| `npm run db:push` | Sincroniza schema Prisma com o banco |
| `npm run db:seed` | Popula 500 trainers + usuários de teste |
| `npm run db:studio` | Prisma Studio |

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Runtime | Node.js + TypeScript | Tipagem end-to-end, ecossistema maduro |
| HTTP | Fastify 5 | Performance, plugins (CORS, cookie, multipart) |
| ORM | Prisma + PostgreSQL | Migrations, tipos gerados, adapter `pg` |
| Arquitetura | DDD + SOLID | Bounded contexts, ports & adapters, use cases testáveis |
| Catálogo | Strategy pattern | Filtros e ordenação composáveis e extensíveis |
| Paginação | Server-side (`pageSize: 20`) | Alinha com RNF do front; nunca retorna 500 itens de uma vez |
| Seed | Lotes de 50 registros | `createMany` em batch evita timeout e pico de memória |
| Auth | JWT em cookie httpOnly | Sessão segura para front SSR |
| Uploads | Local (dev) / S3+CDN (prod) | `STORAGE_DRIVER` configurável via `.env` |
| Testes | Vitest (unit + e2e) | Repositórios in-memory para domain; Supertest para HTTP |

### Padrões de design

- **Use Case** — lógica de aplicação (`ListPersonalTrainersUseCase`, `CreateReportUseCase`, etc.)
- **Repository** — ports no domain, adapters Prisma/in-memory na infra
- **Strategy** — pipelines de filtro e ordenação do catálogo
- **Factory** — `generateMockTrainers()` (seed/testes), `make*UseCase()` (wiring HTTP)
- **Adapter** — controllers Fastify, mappers Prisma, storage local/S3

---

## Organização do repositório

```
src/
├── core/                      # Entity base, UniqueEntityID
├── domain/                    # Bounded contexts
│   ├── catalog/               # Listagem, perfil, galeria, promoções
│   ├── auth/                  # Login, registro, sessão
│   ├── favorites/             # Favoritos por usuário
│   ├── reviews/               # Avaliações de trainers
│   ├── reports/               # Denúncias
│   └── admin/                 # Painel administrativo
├── infra/
│   ├── http/                  # Controllers, presenters, middlewares, schemas Zod
│   ├── database/prisma/       # Adapters + mappers Prisma
│   └── storage/               # Upload local e S3
├── utils/tests/               # Factories e repositórios in-memory
prisma/
├── schema.prisma              # Modelo de dados
├── seed.ts                    # Seed principal (500 trainers)
└── seeds/                     # Usuários, reviews, templates de promoção
```

---

## API — rotas principais

Prefixo base: `/api`

### Catálogo (escopo do desafio)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/personal-trainers` | Listagem paginada com busca, filtros e ordenação |
| GET | `/personal-trainers/featured` | Trainers em destaque |
| GET | `/personal-trainers/:id` | Perfil completo |
| GET | `/personal-trainers/:trainerId/reviews` | Avaliações do trainer |

**Query params da listagem** (espelham o front Nuxt):

`search`, `specialties`, `modalities`, `minPrice`, `maxPrice`, `minRating`, `city`, `maxDistanceKm`, `onPromotion`, `sortBy`, `sortOrder`, `page`, `pageSize`

Resposta inclui `hasMore` para carregamento incremental.

### Autenticação e favoritos

| Método | Rota |
|--------|------|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` |
| GET | `/auth/me` |
| GET/POST/DELETE | `/personal-trainers/bookmakers` |

### Painel do trainer

| Método | Rota |
|--------|------|
| GET/PATCH | `/personal-trainers/me` |
| POST/DELETE/PATCH | `/personal-trainers/me/gallery/*` |

### Extras (além do mínimo do desafio)

| Área | Rotas |
|------|-------|
| Denúncias | `POST /reports` |
| Admin | `/admin/auth/*`, `/admin/users/*`, `/admin/reports/*`, `/admin/promotions/*`, `/admin/impersonation/*` |
| Promoções | `GET /promotion-templates` |

Coleção Insomnia: [`insomnia/fatal-trainer-api.json`](insomnia/fatal-trainer-api.json).

---

## Performance e escalabilidade

| Estratégia | Implementação |
|------------|---------------|
| Paginação server-side | `pageSize` padrão 20 em [`list-query.ts`](src/domain/catalog/enterprise/value-objects/list-query.ts) |
| Filtro/ordenação no banco | Queries Prisma com `skip`/`take` após pipeline de strategies |
| Seed em batch | Inserção de 500 trainers em lotes de 50 ([`prisma/seed.ts`](prisma/seed.ts)) |
| Upload limitado | Multipart max 5 MB, até 12 imagens por trainer |
| Storage configurável | Local em dev; S3 + CloudFront em produção |

Metas de Core Web Vitals do front dependem desta API não enviar o dataset inteiro — ver [`fatal-trainer/docs/requisitos-nao-funcionais.md`](../fatal-trainer/docs/requisitos-nao-funcionais.md).

---

## Armazenamento de imagens

| `STORAGE_DRIVER` | Comportamento |
|------------------|---------------|
| `local` (padrão) | Arquivos em `UPLOAD_DIR`, servidos em `GET /uploads/*` |
| `s3` | Upload via `@aws-sdk/client-s3`; URLs públicas via `CDN_BASE_URL` |

```env
STORAGE_DRIVER=local
# Produção:
# STORAGE_DRIVER=s3
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=fatal-trainer-assets-prod
# CDN_BASE_URL=https://d123abc.cloudfront.net
```

Guia AWS: [`docs/infra/s3-cloudfront-setup.md`](docs/infra/s3-cloudfront-setup.md).

---

## Seed e usuários de teste

O comando `npm run db:seed` popula:

- **500 personal trainers** com nomes, especialidades, preços, cidades e fotos (Pexels)
- Usuários de teste, templates de promoção e avaliações

Senha padrão (aluno/personal): `123456` — admin: `Admin@Fatal2026!`

| Email | Role | Perfil no catálogo |
|-------|------|--------------------|
| admin@fataltrainer.com | admin | — |
| aluno@fataltrainer.com | student | — |
| maria@fataltrainer.com | student | — |
| personal@fataltrainer.com | personal-trainer | sim |
| bruno@fataltrainer.com | personal-trainer | sim |

### Re-seed em produção (Render)

O `initialDeployHook` do Render executa a seed **apenas no primeiro deploy**. Após alterar os dados da seed, é necessário rodá-la manualmente:

1. Faça push do código com as mudanças de seed
2. Aguarde o deploy automático (migrations via `preDeployCommand`)
3. No Render Dashboard → serviço `fatal-trainer-api` → **Shell**
4. Execute:

```bash
pnpm run db:seed
```

5. Valide no log: `Seeded 500 personal trainers` ou via API:

```bash
curl "https://fatal-trainer-api.onrender.com/api/personal-trainers?page=1&pageSize=1"
```

**Atenção:** a seed apaga todos os dados existentes (users, trainers, favoritos, reviews, sessions) antes de reinserir. Adequado para ambiente demo/desafio.

---

## Uso de Inteligência Artificial

Ferramenta utilizada: **Cursor**

A IA foi usada como apoio em:

- estruturação de use cases e bounded contexts
- geração e revisão de testes unitários e E2E
- documentação de specs e integração com o front
- debugging e refatoração de adapters Prisma

Todas as decisões de arquitetura, modelagem de domínio e revisão final do código foram feitas pelo desenvolvedor.

---

## Melhorias futuras

- Parâmetro `city` no endpoint `GET /personal-trainers/featured`
- Índices PostgreSQL dedicados para filtros mais frequentes (`city`, `rating`, `servicePrice`)
- Documentar métricas de latência da listagem (p95/p99) sob carga
- Pipeline CI com `test:all` + lint automatizados
- OpenAPI/Swagger gerado a partir dos schemas Zod

---

## Observações para avaliação

1. **500 profissionais** — este repositório é a fonte canônica para validar o requisito de volume do desafio. Rode `npm run db:seed` antes de testar o front com `NUXT_PUBLIC_USE_MOCK_API=false`.

2. **Escopo expandido** — auth, favoritos, reviews, denúncias e admin foram desenvolvidos para suportar o produto completo, não apenas o catálogo mínimo.

3. **Contrato com o front** — query params e formato de resposta (`items`, `total`, `page`, `pageSize`, `hasMore`) espelham o que o Nuxt consome em [`personal-trainers.service.ts`](../fatal-trainer/app/services/catalog/personal-trainers.service.ts).

4. **Referência do desafio** — escopo original em [`fatal-trainer/docs/challenge.md`](../fatal-trainer/docs/challenge.md).

---

## Documentação adicional

- [RFCs — decisões arquiteturais](docs/rfc.md)
- [RFCs do front-end](../fatal-trainer/docs/rfc.md)
- [README do front-end](../fatal-trainer/README.md)
- [Integração front ↔ API](../fatal-trainer/docs/specs/api-integration-frontend.md)
- [Desafio técnico (challenge)](../fatal-trainer/docs/challenge.md)
- [Setup S3 + CloudFront](docs/infra/s3-cloudfront-setup.md)
