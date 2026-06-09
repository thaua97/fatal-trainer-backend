# RFCs — Fatal Trainer API (Back-end)

**Versão:** 1.1  
**Data:** 2026-06-08  
**Stack:** Node.js · TypeScript · Fastify 5 · Prisma · PostgreSQL

Este documento registra as **decisões arquiteturais** (RFCs) adotadas na API REST. Cada entrada segue: **Contexto → Decisão → Consequências → Trade-offs → Referências**.

---

## Índice

| RFC | Título | Status |
|-----|--------|--------|
| [RFC-001](#rfc-001-ddd-com-bounded-contexts) | DDD com bounded contexts | Aceita |
| [RFC-002](#rfc-002-fastify--camadas-de-infra) | Fastify + camadas de infra | Aceita |
| [RFC-003](#rfc-003-strategy-pattern-para-filtros-e-ordenação) | Strategy pattern para filtros e ordenação | Aceita |
| [RFC-004](#rfc-004-paginação-server-side) | Paginação server-side | Aceita |
| [RFC-005](#rfc-005-autenticação-jwt-em-cookie-httponly) | Autenticação JWT em cookie httpOnly | Aceita |
| [RFC-006](#rfc-006-mapeamento-centralizado-de-erros) | Mapeamento centralizado de erros | Aceita |
| [RFC-007](#rfc-007-validação-zod-na-fronteira-http) | Validação Zod na fronteira HTTP | Aceita |
| [RFC-008](#rfc-008-prisma--postgresql) | Prisma + PostgreSQL | Aceita |
| [RFC-009](#rfc-009-seed-em-lotes) | Seed em lotes | Aceita |
| [RFC-010](#rfc-010-abstração-de-storage-local--s3) | Abstração de storage (local / S3) | Aceita |
| [RFC-011](#rfc-011-use-cases-como-unidade-de-aplicação) | Use cases como unidade de aplicação | Aceita |
| [RFC-012](#rfc-012-repositórios-in-memory-para-testes) | Repositórios in-memory para testes | Aceita |
| [RFC-013](#rfc-013-impersonation-admin) | Impersonation (admin) | Aceita |
| [RFC-014](#rfc-014-promoções-via-templates) | Promoções via templates | Aceita |
| [RFC-015](#rfc-015-contrato-de-api-alinhado-ao-front) | Contrato de API alinhado ao front | Aceita |
| [RFC-016](#rfc-016-estratégia-de-testes) | Estratégia de testes | Aceita |

---

## RFC-001: DDD com bounded contexts

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

A API cobre catálogo, auth, favoritos, reviews, denúncias e admin — domínios com regras distintas e ciclos de evolução independentes.

### Decisão

Organizar `src/domain/` em **bounded contexts**:

```
src/domain/
├── catalog/      # Listagem, perfil, galeria, promoções do trainer
├── auth/         # Login, registro, sessão
├── favorites/    # Favoritos por usuário
├── reviews/      # Avaliações de trainers
├── reports/      # Denúncias
├── admin/        # Gestão de usuários, denúncias, templates, impersonation
└── shared/       # Erros de domínio, tipos transversais
```

Cada contexto segue:

```
domain/<context>/
├── enterprise/     # Entidades, value objects, strategies
├── application/    # Use cases, ports (repositories)
└── (sem infra aqui)
```

Infraestrutura em `src/infra/` (HTTP, Prisma, storage).

### Consequências

- Use cases testáveis sem HTTP nem banco.
- Adapters Prisma implementam ports definidos no domain.
- Mappers convertem Prisma ↔ entidades de domínio.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Contextos evoluem com fronteiras claras | Boilerplate: ports, mappers, use cases por operação |
| Testes de domínio isolados do HTTP/ORM | Overhead para endpoints CRUD triviais |
| Alinhamento com backend "enterprise-ready" | Curva de onboarding maior para contribuidores |
| Shared kernel evita duplicação de erros | Comunicação entre contextos ainda acoplada via DB |

---

## RFC-002: Fastify + camadas de infra

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Precisávamos de servidor HTTP performático, tipado, com suporte a cookies, CORS e multipart para uploads.

### Decisão

**Fastify 5** como framework HTTP, com estrutura:

```
src/
├── core/                    # Entity base, UniqueEntityID
├── domain/                  # Bounded contexts (regras + use cases)
├── infra/
│   ├── http/
│   │   ├── controllers/     # Rotas Fastify (thin)
│   │   ├── presenters/      # Serialização de resposta
│   │   ├── middlewares/     # Auth, admin-only
│   │   ├── schemas/         # Zod input schemas
│   │   └── errors/          # mapErrorToResponse, error codes
│   ├── database/prisma/     # Adapters + mappers
│   └── storage/             # Local + S3
├── env/                     # Validação de env com Zod
└── utils/tests/             # Factories, repos in-memory
```

Controllers delegam para **factories de use case** (`makeListPersonalTrainersUseCase()`).

### Consequências

- Plugins: `@fastify/cors` (credentials), `@fastify/cookie`, `@fastify/multipart`.
- Prefixo global `/api`.
- Build de produção via `tsup`.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Fastify: performance e schema de plugins maduro | Ecossistema menor que Express para snippets/tutoriais |
| Controllers finos facilitam leitura | Muitas camadas (controller → factory → use case → repo) |
| Zod + error handler centralizados | Menos "magia" que frameworks full-stack (NestJS) |
| tsup gera bundle enxuto | Debugging de stack trace exige source maps em prod |

---

## RFC-003: Strategy pattern para filtros e ordenação

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Listagem suporta múltiplos filtros combináveis (`search`, `specialties`, `city`, `minPrice`, etc.) e critérios de ordenação. Lógica monolítica seria difícil de estender e testar.

### Decisão

**Strategy pattern** com pipelines composáveis:

```
src/domain/catalog/enterprise/strategies/
├── filter/     # SearchFilterStrategy, CityFilterStrategy, PriceFilterStrategy, …
└── sort/       # PriceSortStrategy, RatingSortStrategy, DistanceSortStrategy, …
```

`ListPersonalTrainersUseCase` aplica strategies antes de paginar.

### Consequências

- Novo filtro = nova strategy + registro no pipeline.
- Testes unitários por strategy isolada.
- Filtros espelham query params consumidos pelo front Nuxt.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Extensível: novo filtro = nova classe | Pipeline pode aplicar filtros em memória antes do SQL (perf) |
| Cada strategy testável isoladamente | Ordem de aplicação das strategies importa e deve ser documentada |
| Código autodocumentado por nome | Mais arquivos que uma query Prisma monolítica |
| Paridade com params do front | Filtros complexos (distância) podem não usar índice PG |

---

## RFC-004: Paginação server-side

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Seed de 500 trainers; front exige carregamento incremental sem transferir dataset completo.

### Decisão

- Value object **`ListQuery`** com `page`, `pageSize` (default **20**).
- Resposta padronizada:

```json
{
  "items": [...],
  "total": 500,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

- Queries Prisma com `skip` / `take` após pipeline de filter/sort.

### Consequências

- Front acumula páginas com botão "Carregar mais".
- `hasMore` evita request desnecessária na última página.
- Alinhado com RNF de performance do front.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Payload pequeno e previsível | `total` exige count query (custo extra em listas grandes) |
| Escala para milhares de registros | Client acumula páginas; server não "sabe" do acúmulo |
| Contrato simples (`hasMore`) | Offset pagination degrada em páginas altas (deep pagination) |
| Alinhado com infinite scroll do front | Cursor-based seria mais eficiente em escala maior |

---

## RFC-005: Autenticação JWT em cookie httpOnly

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Front Nuxt usa SSR; sessão precisa ser segura (sem token em localStorage) e compatível com `$fetch` + credentials.

### Decisão

- JWT assinado armazenado em **cookie httpOnly** (`ft_session`).
- Modelo `Session` no Prisma (`token`, `user_id`, `impersonator_user_id`).
- Endpoints: `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`.
- Middleware de auth lê cookie e injeta usuário no request.

### Consequências

- CORS com `credentials: true`.
- Front envia cookies automaticamente via `apiFetch`.
- Roles: `student`, `personal-trainer`, `admin`.

### Alternativas rejeitadas

| Alternativa | Motivo |
|-------------|--------|
| Bearer token em header | Complexidade extra no SSR Nuxt |
| Session server-side opaca | JWT stateless suficiente para escopo demo |

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Seguro contra XSS (httpOnly) | Revogação imediata exige invalidar `Session` no DB |
| SSR Nuxt funciona com `credentials` | JWT em cookie complica clients não-browser (mobile nativo) |
| Stateless na verificação do token | Tamanho do cookie vs session ID opaco |
| Modelo `Session` suporta impersonation | Rotação de secret invalida todas as sessões |

---

## RFC-006: Mapeamento centralizado de erros

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Erros de domínio, Zod, Prisma e exceções genéricas precisam de resposta HTTP consistente para o front traduzir.

### Decisão

Pipeline em `src/infra/http/errors/`:

| Camada | Artefato |
|--------|----------|
| Códigos | `ERROR_CODES` (`validation`, `unauthorized`, `notFound`, …) |
| Domain → HTTP | `mapErrorToResponse()` |
| Controllers | `withErrorHandling(handler)` wrapper |
| Global | `app.setErrorHandler()` no Fastify |

Formato de resposta:

```json
{
  "message": "validation",
  "errors": { "email": "alreadyExists" }
}
```

Erros de domínio tipados: `ValidationError`, `ResourceNotFoundError`, `InvalidCredentialsError`, `ForbiddenError`, etc.

### Consequências

- Front usa `applyApiError` + `useFieldErrorTranslator` com códigos estáveis.
- Erros 500 logados; corpo genérico para o client.
- Prisma P2002 (unique) mapeado para conflito/validation.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Contrato estável para o front traduzir | Perde-se detalhe do erro original no client (500 → genérico) |
| Um único ponto de mapeamento | Novo tipo de erro exige update em domain + mapper |
| Logs ricos no server para 5xx | Códigos string (`validation`) menos tipados que enums HTTP puros |
| Prisma errors normalizados | Edge cases de ORM podem escapar do mapeamento |

---

## RFC-007: Validação Zod na fronteira HTTP

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Input HTTP precisa ser validado antes de atingir use cases; mensagens devem ser estruturadas por campo.

### Decisão

- Schemas Zod em `src/infra/http/schemas/`.
- Controllers parseiam body/query/params com Zod.
- `flattenZodErrors()` converte `ZodError` → `Record<string, string>`.
- Regras de negócio mais complexas permanecem nos use cases / domain services.

### Consequências

- 400 com `message: "validation"` e mapa de erros por campo.
- Env vars também validadas via Zod em `src/env/`.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Validação declarativa e tipada na borda | Schemas duplicam parcialmente regras do domain |
| Erros por campo padronizados (400) | Duas camadas de validação (Zod HTTP + domain) |
| Fail-fast na subida (`env` inválido) | Refactor de DTO exige sync schema Zod + use case |
| Base para OpenAPI futuro | Mensagens Zod default pouco amigáveis sem custom map |

---

## RFC-008: Prisma + PostgreSQL

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Persistência relacional com migrations, tipos gerados e suporte a Docker local.

### Decisão

- **PostgreSQL** via Docker Compose em dev.
- **Prisma** como ORM com `@prisma/adapter-pg`.
- Schema em `prisma/schema.prisma`; sync via `db push` (dev) / migrations (prod).
- Mappers Prisma ↔ entidades de domínio (não expor models Prisma nos use cases).

### Consequências

- `prisma generate` no build.
- Deploy Render: `preDeployCommand` roda migrations; seed manual pós-deploy.
- Prisma Studio disponível via `npm run db:studio`.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Tipos gerados end-to-end | Mappers manuais Prisma ↔ domain (duplicação de shape) |
| Migrations e Studio aceleram dev | `db push` em dev vs migrations em prod — dois fluxos |
| PostgreSQL robusto para relações | Docker obrigatório para dev/E2E local |
| Adapter `pg` performático | Queries N+1 possíveis se includes não forem cuidadosos |
| Ecossistema maduro | Vendor lock-in moderado no schema Prisma |

---

## RFC-009: Seed em lotes

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Inserir 500 trainers + usuários + reviews de uma vez causa timeout e pico de memória.

### Decisão

- **`generateMockTrainers(500)`** via factory em `src/utils/tests/factories/`.
- Inserção em **lotes de 50** com `createMany` no seed.
- Seed **destrutiva** (apaga dados existentes) — adequada para demo/desafio.
- Fotos via URLs estáveis Pexels (sem API key).

### Consequências

- Comando `npm run db:seed` reproduz ambiente de avaliação.
- Usuários de teste documentados no README (admin, aluno, personal).
- Re-seed em produção via Shell do Render.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Seed reproduzível para demo/avaliação | **Destrutiva** — apaga dados reais se rodada em prod por engano |
| Lotes evitam timeout/memória | Seed lenta (~dezenas de segundos) vs insert único |
| Factory reutilizada em testes | Dados sintéticos (nomes aleatórios) ≠ cenários realistas |
| Pexels sem API key | Dependência de URLs externas estáveis |

---

## RFC-010: Abstração de storage (local / S3)

**Status:** Aceita  
**Data:** 2026-06-06

### Contexto

Upload de galeria do trainer em dev (filesystem) vs produção (CDN).

### Decisão

Variável **`STORAGE_DRIVER`**:

| Valor | Comportamento |
|-------|---------------|
| `local` (default) | Arquivos em `UPLOAD_DIR`, servidos em `GET /uploads/*` |
| `s3` | Upload via `@aws-sdk/client-s3`; URLs públicas via `CDN_BASE_URL` |

Port de storage no domain; adapters em `src/infra/storage/`.

Limites: multipart **max 5 MB**, até **12 imagens** por trainer.

### Consequências

- Front usa `NUXT_PUBLIC_ASSETS_BASE_URL` para resolver URLs de mídia.
- Guia AWS: [`docs/infra/s3-cloudfront-setup.md`](./infra/s3-cloudfront-setup.md).

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Dev simples (filesystem local) | Comportamento diferente local vs prod (URLs, permissões) |
| S3 + CDN escala em produção | Setup AWS manual (bucket, CloudFront, IAM) |
| Port abstrai implementação | Dois adapters para testar e manter |
| Limite 5 MB / 12 imgs contém abuso | Sem resize/otimização de imagem no upload |

---

## RFC-011: Use cases como unidade de aplicação

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Controllers não devem conter regras de negócio; lógica precisa ser testável e reutilizável.

### Decisão

Cada operação exposta via HTTP mapeia para um **use case** na camada application:

| Use case | Responsabilidade |
|----------|------------------|
| `ListPersonalTrainersUseCase` | Filter + sort + paginate |
| `GetPersonalTrainerByIdUseCase` | Perfil público |
| `GetOrCreateMyTrainerUseCase` | Lazy-create perfil do trainer logado |
| `UpdateMyTrainerUseCase` | PATCH por seção (info, promotion, …) |
| `CreateReportUseCase` | Denúncia com validação |
| `StartImpersonationUseCase` | Admin → usuário alvo |
| `AdminPromotionTemplatesUseCases` | CRUD de templates |

Controllers: parse input → invoke use case → present output.

### Consequências

- Factories (`make*UseCase`) centralizam wiring de dependências.
- Use cases recebem ports (interfaces), não Prisma diretamente.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Regras de negócio testáveis e explícitas | Verbosidade: 1 use case + 1 factory por operação HTTP |
| Controllers permanecem finos | Risco de use cases "anêmicos" que só delegam ao repo |
| Wiring centralizado nas factories | Refactor de assinatura propaga em vários arquivos |
| Alinhado com DDD/Clean Architecture | Overkill perceptível em CRUD admin simples |

---

## RFC-012: Repositórios in-memory para testes

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Testes unitários de domain/use cases não devem depender de PostgreSQL.

### Decisão

- **Ports** (interfaces) definidos em `domain/*/application/`.
- **Adapters Prisma** em `infra/database/prisma/`.
- **Repositórios in-memory** em `src/utils/tests/` para Vitest.
- Factories (`makePersonalTrainer`, `generateMockTrainers`) para dados de teste.

### Consequências

- `npm test` — unitários rápidos sem Docker.
- `npm run test:e2e` — Supertest + PostgreSQL real para contrato HTTP.
- `npm run test:all` combina ambos.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Unitários rápidos (~ms) sem infra | Repos in-memory podem divergir do comportamento Prisma |
| E2E valida contrato HTTP real | E2E exige Docker PG; mais lentos e frágeis |
| Factories compartilhadas seed + test | Manter paridade in-memory ↔ SQL é esforço contínuo |
| Pirâmide clara | Cobertura E2E ainda parcial vs rotas totais |

---

## RFC-013: Impersonation (admin)

**Status:** Aceita  
**Data:** 2026-06-06

### Contexto

Admin precisa reproduzir experiência do usuário sem compartilhar senha.

### Decisão

Fluxo:

1. `POST /admin/users/:id/impersonate` (admin autenticado).
2. Sessão admin salva em cookie separado (`ft_admin_session`).
3. Nova `Session` para usuário alvo com `impersonator_user_id`.
4. `POST /admin/impersonation/exit` restaura sessão admin.

Schema: `Session.impersonator_user_id` nullable.

### Consequências

- Front exibe `FTImpersonationBanner` quando `impersonator` presente em `/auth/me`.
- Auditoria básica via campo de impersonation (sem log dedicado no MVP).

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Suporte/debug sem compartilhar senha | Superfície de ataque: admin pode agir como qualquer user |
| Dois cookies isolam sessão admin | Complexidade de fluxo cookie (troca, exit, edge cases) |
| Campo `impersonator_user_id` rastreia origem | Sem audit log dedicado — compliance limitado |
| UX clara no front (banner) | Sessão impersonada indistinguível de login real nos logs |

---

## RFC-014: Promoções via templates

**Status:** Aceita  
**Data:** 2026-06-08

### Contexto

Promoções configuradas livremente por trainer geravam inconsistência e dificultavam moderação.

### Decisão

- Tabela **`promotion_templates`** gerenciada pelo admin.
- Trainer armazena JSON `{ templateId, redemptionCount }` no perfil.
- **Hydration** no mapper: campos completos (`discountPercent`, `startsAt`, `endsAt`, …) resolvidos do template no read.
- `DELETE /admin/promotions/:id` bloqueado se `activationCount > 0`.
- Trainer ativa via `PATCH /personal-trainers/me` com `{ section: 'promotion', promotion: { templateId } }`.

### Consequências

- Breaking change: trainers não escrevem mais promoção embedded legacy.
- Front consome `GET /promotion-templates` para picker no painel.
- Compatibilidade de leitura com promoções legacy até seed/migration limpar.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Moderação e consistência de campanhas | Trainer não cria promoção ad hoc (menos flexibilidade) |
| Hydration centralizada no mapper | Join template ↔ trainer em todo read de perfil |
| Delete bloqueado com ativações | Migração de JSON legacy exige cuidado |
| Admin controla catálogo de templates | Latência extra se template for editado (trainers ativos afetados) |

---

## RFC-015: Contrato de API alinhado ao front

**Status:** Aceita  
**Data:** 2026-06-07

### Contexto

Front Nuxt foi desenvolvido primeiro com Nitro mock; backend deve ser drop-in replacement.

### Decisão

- Query params da listagem **espelham** `useTrainerFilters` / `list-query.ts` do front.
- Formato de resposta idêntico ao mock Nitro (`items`, `total`, `page`, `pageSize`, `hasMore`).
- Códigos de erro estáveis consumidos por `extract-api-errors` / `applyApiError`.
- Prefixo `/api` em todas as rotas.

### Consequências

- Alternância mock ↔ API real via env no front, sem alteração de composables.
- Coleção Insomnia: `insomnia/fatal-trainer-api.json`.
- Spec de integração: [`fatal-trainer/docs/specs/api-integration-frontend.md`](../fatal-trainer/docs/specs/api-integration-frontend.md).

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Front desenvolvido primeiro continua funcionando | Backend "segue" decisões do mock Nitro, não vice-versa |
| Troca de origem transparente via env | Evolução de API exige sync manual mock + Fastify + front |
| Query params espelhados reduzem surpresas | Acoplamento forte entre repos (não há schema OpenAPI único) |
| Insomnia como referência informal | Sem contrato machine-readable (Pact/OpenAPI) |

---

## RFC-016: Estratégia de testes

**Status:** Aceita  
**Data:** 2026-06-05

### Contexto

Domain rico + HTTP + Prisma exigem pirâmide de testes clara.

### Decisão

| Tipo | Comando | Escopo |
|------|---------|--------|
| Unit (domain + use cases) | `npm test` | Strategies, validators, use cases com repos in-memory |
| E2E (HTTP) | `npm run test:e2e` | Supertest, PostgreSQL, fluxos auth/catalog/admin |
| Cobertura | `npm run test:coverage` | Relatório Vitest dos unitários |

Validadores de domínio testados isoladamente (`validate-trainer-profile`, `create-report-validation`).

### Consequências

- CI ideal: `lint` + `test:all` (pendente — ver melhorias futuras no README).
- OpenAPI/Swagger a partir de Zod — extensão futura.

### Trade-offs

| Ganho | Custo |
|-------|-------|
| Domain coberto sem I/O (rápido) | E2E não cobre 100% das rotas e combinações |
| Supertest valida stack HTTP real | CI com PG aumenta tempo e flakiness |
| Cobertura reportada nos unitários | Duplicação de setup (in-memory vs PG) |
| Validators isolados | `test:all` ainda não automatizado no pipeline |

---

## Rotas por bounded context (referência)

### Catálogo (escopo do desafio)

| Método | Rota |
|--------|------|
| GET | `/personal-trainers` |
| GET | `/personal-trainers/featured` |
| GET | `/personal-trainers/:id` |
| GET | `/personal-trainers/:trainerId/reviews` |

### Auth + favoritos

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

### Admin + extras

| Área | Prefixo |
|------|---------|
| Admin auth/users/reports/promotions/impersonation | `/admin/*` |
| Denúncias públicas | `POST /reports` |
| Templates de promoção | `GET /promotion-templates` |

---

## Como propor uma nova RFC

1. Descrever o problema, alternativas consideradas e trade-offs.
2. Implementar use case + adapter + testes.
3. Adicionar entrada numerada neste documento.
4. Atualizar README e spec de integração front se o contrato HTTP mudar.

---

## Documentação relacionada

- [README](../README.md)
- [Integração front ↔ API](../fatal-trainer/docs/specs/api-integration-frontend.md)
- [Setup S3 + CloudFront](./infra/s3-cloudfront-setup.md)
- [Desafio técnico](../fatal-trainer/docs/challenge.md)
- [RFCs do front-end](../fatal-trainer/docs/rfc.md)
