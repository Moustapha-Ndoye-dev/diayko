# Vinted Clone

A second-hand fashion marketplace mobile app (Expo/React Native) backed by a REST API (Express + PostgreSQL).

## Run & Operate

- `pnpm dev:api` — run the API server (port 8080, served at `/api`)
- `pnpm dev:mobile` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm db:push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with sample data
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned on Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Mobile**: Expo 53, React Native, Expo Router (file-based navigation)
- **API**: Express 5, pino logger
- **DB**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → Zod schemas + React Query hooks)
- **Build**: esbuild (CJS bundle for API server)

## Where things live

> **Raccourcis** : `client` pointe vers `apps/mobile` et `server` pointe vers `apps/api-server`.
> Le code source vit maintenant dans `apps/` et `packages/`.

### Server — architecture en 3 couches

```
apps/api-server/src/
├── routes/       ← thin : valider (Zod) → appeler service → répondre
├── services/     ← logique métier (créer commande, toggle like, vérifier participants…)
├── repos/        ← TOUTES les requêtes Drizzle (1 fichier par entité)
├── middlewares/  ← auth, rate-limit, errorHandler
└── lib/          ← asyncHandler, logger, pgRateLimitStore
```

**Règle d'or** : `routes/` n'accèdent jamais directement à `db`. Toujours route → service → repo.

- `apps/mobile/` — Expo mobile app
  - `app/(tabs)/` — Tab screens (Home, Search, Sell, Inbox, Profile)
  - `app/item/[id].tsx` — Item detail screen
  - `components/` — Reusable UI components (ItemCard, PromoCarousel, FeaturedSellers, etc.)
  - `context/AppContext.tsx` — Global state, fetches items from the real API
  - `lib/api.ts` — Typed API client wrapping fetch
  - `data/mockData.ts` — Static data (categories, sizes, conditions, fallback sellers)
  - `constants/colors.ts` — Design tokens (primary teal: #09B1BA)
- `apps/api-server/src/` — Express API
  - `routes/items.ts` — Items CRUD + like/view
  - `routes/users.ts` — User profiles
  - `routes/conversations.ts` — Messaging
  - `routes/categories.ts` — Category list
- `packages/api-spec/openapi.yaml` — Source-of-truth API contract
- `packages/api-zod/` — Generated Zod schemas (from codegen)
- `packages/api-client-react/` — Generated React Query hooks (from codegen)
- `packages/db/src/schema/` — Drizzle ORM table definitions
  - `users.ts`, `items.ts`, `conversations.ts`
- `scripts/src/seed.ts` — DB seeder with sample users, items, and conversations

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed Zod validators on server + React Query hooks on client. Never edit generated files manually.
- **Graceful degradation**: Mobile app falls back to local mock data if the API is unreachable (useful during development or first load).
- **Teal branding** (`#09B1BA`) used throughout — matches Vinted's visual identity.
- **Numeric prices in DB**: Drizzle stores `price` as `numeric(10,2)` string; always `Number()` cast when reading.
- **Image URLs**: Currently seeded with Unsplash URLs; the local asset images (`item1.png`…`item6.png`) are used as fallbacks when API images are empty.

## Product

- **Browse** — Two-column grid of listings with category filter pills, search bar, promo carousel (sales, boosted items, new arrivals), and top sellers strip.
- **Search** — Full-text search across title/brand/description, filterable by size and condition.
- **Item Detail** — Photos, price with discount badge, condition, seller profile with rating, "Buy" and "Make offer" CTAs.
- **Sell** — Listing form with category, size, condition, color pickers and a real-time service fee calculator. Posts to the API.
- **Inbox** — Conversation list with unread badge, last message preview, and item thumbnail.
- **Profile** — Stats (items, followers, following), quick-access menu, and tabs for listings vs favourites.

## User preferences

- Language: French (user communicates in French)
- Build mobile-first; use real data from the API as quickly as possible

## Gotchas

- **Always run codegen after editing `openapi.yaml`**: `pnpm --filter @workspace/api-spec run codegen`
- **After codegen, the `packages/api-zod/src/index.ts` is auto-fixed** by the codegen script (Orval generates a duplicate export conflict; the script patches it).
- **`zod/v4` is not resolvable by esbuild** — use `import { z } from "zod"` in server routes.
- **Do not run `pnpm dev` at root** — use workflow restart or `pnpm --filter` commands.
- **`currentUser.id` is `"local-user"` locally** — the sell screen guards against passing this as a UUID to the API.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
