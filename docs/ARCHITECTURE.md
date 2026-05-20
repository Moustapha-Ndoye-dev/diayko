# Architecture Diayko

Le repo est organise comme un monorepo pnpm simple.

```text
apps/
  mobile/          Expo + React Native, navigation Expo Router
  api-server/      API Express, routes, services, repos, middlewares
  mockup-sandbox/  Prototype UI separe de la production

packages/
  db/              Drizzle ORM, schema PostgreSQL, migrations
  api-spec/        Contrat OpenAPI source
  api-zod/         Schemas Zod generes depuis OpenAPI
  api-client-react/ Hooks/client generes pour React Query

scripts/           Outils workspace
docs/              Documentation technique et securite
```

## Regles simples

- Une application executable va dans `apps/*`.
- Le code partage ou genere va dans `packages/*`.
- L'API ne depend pas du mobile.
- Le mobile consomme l'API via `apps/mobile/lib/api.ts` ou les clients generes.
- La base de donnees reste centralisee dans `packages/db`.
- Les anciens dossiers `artifacts/` et `lib/` ne sont plus des emplacements de source.

## Commandes utiles

```bash
pnpm dev:api
pnpm dev:mobile
pnpm db:push:neon
pnpm db:push:postgres
pnpm typecheck
```

## Base de donnees

L'environnement local charge `.env` automatiquement via `scripts/with-env.mjs`.
Pour Neon, renseigner :

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```
