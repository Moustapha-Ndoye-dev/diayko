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
pnpm --filter @workspace/db run push          # Appliquer le schéma DB
pnpm --filter @workspace/api-server run dev   # Démarrer l'API (port 8080)
pnpm --filter @workspace/mobile run dev       # Démarrer l'app mobile
```

## Tests

```bash
pnpm --filter @workspace/api-server run test
```

Requiert une variable d'environnement `DATABASE_URL` pointant vers une base PostgreSQL.
