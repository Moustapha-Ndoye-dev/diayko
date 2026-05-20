# Fonctionnalites testees et approuvees

Derniere validation locale : 20 mai 2026.

## Commandes executees

- [x] Validation API Vitest par lots
  - **237 tests** passes sur **33 fichiers**.
  - Backlog TDD `tddBacklog.test.ts` : **27/27**.
  - Backlog produit `productBacklog.test.ts` : **5/5**.
  - PostgreSQL Neon via `DATABASE_URL` / schema isole `tests/setup.ts`.
- [x] `pnpm run typecheck`
  - Typecheck workspace OK.

Note : la commande unique `pnpm --filter @workspace/api-server run test` a ete lancee, mais elle a depasse 15 minutes sur Neon. Tous les fichiers ont donc ete valides par lots pour eviter les timeouts lies a la latence reseau et aux schemas de test isoles.

## Backlog TDD (27/27 verts)

- [x] Mot de passe oublie, reset, changement.
- [x] Verification e-mail (`emailVerified` sur `/api/auth/user`).
- [x] Statut article vendu ; masquage annonce en commande active ; tri `price_asc`.
- [x] Commande avec adresse ; annulation ; devis checkout ; double achat refuse.
- [x] Confirmation reception -> `delivered` ; `GET /api/me/sales`.
- [x] Admin liste vendeurs pending ; stats vendeur ; wallet + retrait.
- [x] Notifications API ; support ticket ; signalement conversation.
- [x] Conversation lue ; censure serveur messages.
- [x] Promotions ; aide ; mark-all-read notifications.

## Backlog produit P0 (5/5 verts)

- [x] Creation d'annonce sans photo temporaire (`images: []`).
- [x] Notification vendeur quand un article recoit un favori.
- [x] Notification destinataire quand un message arrive.
- [x] Notifications acheteur + vendeur quand une commande est creee.
- [x] Historique wallet via `GET /api/wallet/transactions`.

## Fonctionnalites approuvees par tests automatises

### Auth et compte

- [x] Inscription, connexion, refresh, utilisateur courant (`authJwt.test.ts`, `auth.test.ts`).
- [x] Deconnexion et invalidation tokens (`authJwt.test.ts`, `auth.edge.test.ts`).
- [x] Emails en double refuses (`authJwt.test.ts`).
- [x] Mot de passe court refuse (`auth.edge.test.ts`).
- [x] Mauvais mot de passe / refresh invalide (`auth.edge.test.ts`).
- [x] Mot de passe oublie, reset, changement, verify email (`tddBacklog.test.ts`).
- [x] Roles admin / seller-access (`authJwt.test.ts`, `admin.test.ts`).

### Utilisateurs

- [x] Profil public, PATCH nom/bio, interdiction edition autrui (`users.test.ts`, `users.edge.test.ts`).
- [x] Suppression compte (`users.test.ts`).
- [x] Services users unitaires (`unit/services.users.test.ts`).

### Articles et catalogue

- [x] Liste, recherche, filtres, pagination (`items.test.ts`, `items.integration.test.ts`).
- [x] CRUD, like, vues, PATCH proprietaire (`items.test.ts`, `authJwt.test.ts`).
- [x] Statut vendu, tri prix, masquage commande en cours (`tddBacklog.test.ts`).
- [x] Services items unitaires (`unit/services.items.test.ts`).

### Commandes et checkout

- [x] Creation, timeline, detail, filtres role/statut (`orders.test.ts`).
- [x] Adresse livraison, annulation, devis, confirm-receipt, ventes vendeur (`tddBacklog.test.ts`).
- [x] Services orders unitaires (`unit/services.orders.test.ts`).

### Conversations

- [x] Creation, messages, pagination, non-lus (`conversations.test.ts`).
- [x] Cas limites + signalement + lecture + censure API (`conversations.edge.test.ts`, `tddBacklog.test.ts`).
- [x] Services conversations unitaires (`unit/services.conversations.test.ts`).

### Avis, favoris, admin

- [x] Reviews post-livraison (`reviews.test.ts`, `unit/services.reviews.test.ts`).
- [x] Favoris (`favorites.test.ts`).
- [x] Admin seller-status + liste pending (`admin.test.ts`, `tddBacklog.test.ts`).

### Wallet, notifications, plateforme

- [x] Wallet et retrait (`tddBacklog.test.ts`).
- [x] Historique transactions wallet (`productBacklog.test.ts`).
- [x] Notifications CRUD (`tddBacklog.test.ts`).
- [x] Notifications metier commande, message, like, vente (`productBacklog.test.ts`).
- [x] Support, promotions, aide (`tddBacklog.test.ts`).

### Infra API

- [x] Rate limiting (`rateLimiter.test.ts`, `rateLimiter.integration.test.ts`, `pgRateLimitStore.test.ts`).
- [x] Health + maintenance (`health.test.ts`, `misc.test.ts`).
- [x] Libs JWT, asyncHandler, errors, bearer (`jwtAuth.test.ts`, `unit/lib.*.test.ts`).
- [x] Security headers, CORS production, `JWT_SECRET` fort (`unit/lib.security.test.ts`).
- [x] Auth locale unitaire (`unit/services.localAuth.test.ts`).

### Mobile (pur, sans API)

- [x] Format FCFA et frais (`currency.test.ts`).
- [x] Censure chat (`mobileCensor.test.ts`).

## Non approuve automatiquement

- [ ] UI Expo : navigation, rendu, parcours E2E device.
- [ ] UI Expo : checkout, wallet, notifications et stats sont branches, mais pas encore valides par test E2E device.
- [ ] Upload photo vers stockage cloud.
- [ ] Paiements reels Wave / Orange Money / Free Money.
- [ ] Livraison transporteur externe.
- [ ] Push et chat temps reel.

## Notes

Les tests creent un schema PostgreSQL isole (`TEST_DATABASE_SCHEMA`). Voir `apps/api-server/tests/setup.ts`.  
Checklist produit : [FONCTIONNALITES.md](./FONCTIONNALITES.md).
