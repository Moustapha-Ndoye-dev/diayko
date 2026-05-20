# Diayko — Marketplace mode d'occasion

[![CI](https://github.com/Moustapha-Ndoye-dev/diayko/actions/workflows/ci.yml/badge.svg)](https://github.com/Moustapha-Ndoye-dev/diayko/actions/workflows/ci.yml)

Application mobile de vente de vêtements et accessoires de seconde main, construite avec Expo (React Native) et une API Express/PostgreSQL.

## Stack technique

- **Mobile** : Expo 53, React Native, Expo Router
- **API** : Express 5, Drizzle ORM, PostgreSQL
- **Validation** : Zod, OpenAPI (contrat-first)
- **Tests** : Vitest + Supertest (intégration)

## Lancer le projet

```bash
pnpm install
pnpm db:push:neon     # Appliquer le schéma DB sur Neon/Postgres
pnpm dev:api          # Démarrer l'API (port 8080)
pnpm dev:mobile       # Démarrer l'app mobile Expo
```

## Config Neon/Postgres

Copie `.env.example` en `.env`, puis colle l'URL Neon dans `DATABASE_URL`.
Elle doit ressembler à `postgresql://...neon.tech/...?...sslmode=require`.

## Architecture

```text
apps/
  mobile/          Application Expo
  api-server/      API Express
  mockup-sandbox/  Prototype UI

packages/
  db/              Drizzle ORM, schema PostgreSQL, migrations
  api-spec/        Contrat OpenAPI
  api-zod/         Schémas Zod générés
  api-client-react/ Client React Query généré
```

Voir aussi [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Pour le suivi produit, voir [docs/FONCTIONNALITES.md](docs/FONCTIONNALITES.md).

Pour les fonctionnalites validees par tests, voir [docs/TESTS_APPROUVES.md](docs/TESTS_APPROUVES.md).

## Tests

```bash
pnpm --filter @workspace/api-server run test
```

La suite API utilise PostgreSQL. Elle charge `.env`, cree un schema de test isole, puis le supprime a la fin.
