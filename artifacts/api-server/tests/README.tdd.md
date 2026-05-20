# TDD - API Diayko

## Suite complete (fonctionnalites livrees)

Lancer :

```bash
pnpm --filter @workspace/api-server run test
```

Requiert PostgreSQL (`DATABASE_URL` ou `TEST_DATABASE_URL`) - voir `tests/setup.ts`.

Derniere validation locale : 237 tests verts sur 33 fichiers, executes par lots sur Neon pour eviter le timeout de la commande unique.

### Integration HTTP (`supertest`)

| Fichier | Domaine |
|---------|---------|
| `auth.test.ts` | protection des routes sensibles |
| `authJwt.test.ts` | register, login, refresh, logout, seller-access, admin, PATCH items |
| `auth.edge.test.ts` | mot de passe court, mauvais mot de passe, refresh invalide, logout 401 |
| `users.test.ts` | profil, PATCH, DELETE /users/me |
| `users.edge.test.ts` | PATCH vide, reviews vides, pagination items vendeur |
| `items.test.ts` | CRUD, like, view, recherche, filtres prix |
| `items.integration.test.ts` | PATCH owner, body vide, filtres size/condition, view 404 |
| `orders.test.ts` | commandes, statuts, timeline |
| `reviews.test.ts` | avis post-livraison |
| `conversations.test.ts` | threads, messages, pagination |
| `conversations.edge.test.ts` | self-chat, seller mismatch, messages 404, texte vide |
| `favorites.test.ts` | favoris |
| `admin.test.ts` | seller-status admin (404, 400, 403) |
| `health.test.ts` | healthz + maintenance cleanup (token) |
| `misc.test.ts` | categories, 404 global |
| `rateLimiter*.test.ts` | anti-spam (unit + intégration + store PG) |
| `productBacklog.test.ts` | backlog produit P0 (annonce sans photo, notifications metier, transactions wallet) |

### Unitaires (libs + services)

| Fichier | Domaine |
|---------|---------|
| `jwtAuth.test.ts` | sign/verify access & refresh |
| `unit/lib.auth.test.ts` | `getBearerToken` |
| `unit/lib.asyncHandler.test.ts` | wrapper async Express |
| `unit/lib.errorHandler.test.ts` | `HttpError`, handler Zod |
| `unit/lib.security.test.ts` | CORS prod, security headers, JWT_SECRET fort |
| `unit/services.localAuth.test.ts` | register/login, hash, tokenVersion |
| `unit/services.users.test.ts` | profil public, update, delete |
| `unit/services.items.test.ts` | liste, détail, création, like |
| `unit/services.orders.test.ts` | create, list, detail, statuts |
| `unit/services.reviews.test.ts` | avis commande livrée |
| `unit/services.conversations.test.ts` | inbox, messages, unread |

### Mobile (hors API)

| Fichier | Domaine |
|---------|---------|
| `currency.test.ts` | format FCFA |
| `mobileCensor.test.ts` | censure contacts client |

## Backlog livre (`tddBacklog.test.ts`)

Les 27 scenarios du backlog (auth, marketplace, wallet, notifications, checkout, etc.) sont implementes et couverts par `tddBacklog.test.ts`.

## Backlog produit P0 (`productBacklog.test.ts`)

Les 5 scenarios produit ajoutes apres lecture de `docs/FONCTIONNALITES.md` sont verts : annonce sans photo temporaire, notifications metier like/message/commande/vente, et historique transactions wallet.

Cases produit cochees dans [docs/FONCTIONNALITES.md](../../../docs/FONCTIONNALITES.md) (lignes **API** + mapping tests).
