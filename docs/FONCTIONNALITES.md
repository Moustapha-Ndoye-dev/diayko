# Fonctionnalites Diayko

Checklist produit et technique de l'application.

**Derniere mise a jour** : 20 mai 2026.
**Derniere validation** : 237 tests Vitest verts sur 33 fichiers, executes par lots sur Neon PostgreSQL, plus `pnpm run typecheck`.
Voir [TESTS_APPROUVES.md](./TESTS_APPROUVES.md).

Miroir anglais : [functionality.md](./functionality.md).

## Legende

| Symbole | Signification |
|---------|----------------|
| `[x]` | Fait |
| `[x] API` | Backend livre et couvert par Vitest |
| `[ ]` | A faire ou incomplet |

Notes :

- Le code actif est dans `apps/`, `packages/`, `docs/` et `scripts/`.
- Les chemins `artifacts/` et `lib/` sont des anciens miroirs/jonctions. Ne pas les utiliser comme source principale.
- La base active est Neon PostgreSQL. SQLite/libsql a ete retire du code et de la configuration actifs.

---

## 1. Onboarding et acces

- [x] Afficher un onboarding de presentation.
- [x] Permettre a l'utilisateur de choisir ses centres d'interet.
- [x] Enregistrer localement que l'onboarding est termine.
- [x] Rediriger vers la page de connexion apres onboarding.
- [x] Proteger les ecrans principaux si l'utilisateur n'est pas connecte.
- [ ] Ajouter un bouton clair pour modifier les centres d'interet apres inscription.

## 2. Authentification

- [x] Creer un compte avec e-mail et mot de passe. - `authJwt.test.ts`, `auth.test.ts`
- [x] Se connecter avec e-mail et mot de passe. - `authJwt.test.ts`
- [x] Stocker les tokens JWT en stockage securise mobile.
- [x] Rafraichir automatiquement le token avec un refresh token. - `authJwt.test.ts`, `jwtAuth.test.ts`
- [x] Se deconnecter. - `authJwt.test.ts`
- [x] Invalider les tokens apres logout. - `authJwt.test.ts`, `auth.edge.test.ts`
- [x] Supprimer son compte. - `users.test.ts`
- [x] API Verification d'e-mail. - `tddBacklog.test.ts`
- [x] API Mot de passe oublie avec reponse generique 202. - `tddBacklog.test.ts`
- [x] API Reinitialisation mot de passe par token. - `tddBacklog.test.ts`
- [x] API Changement de mot de passe utilisateur connecte. - `tddBacklog.test.ts`
- [x] Renforcer `JWT_SECRET` en production. - `unit/lib.security.test.ts`
- [ ] Ecran mobile verification d'e-mail.
- [ ] Ecran mobile mot de passe oublie + envoi e-mail reel.
- [ ] Ecran mobile reinitialisation mot de passe.
- [ ] Ecran mobile changement de mot de passe.
- [ ] Connexion sociale, si decide plus tard.

## 3. Marketplace et catalogue

- [x] Afficher la page d'accueil marketplace.
- [x] Afficher les articles depuis l'API. - `items.test.ts`
- [x] Afficher les categories. - `misc.test.ts`
- [x] Filtrer par categorie. - `items.test.ts`
- [x] Afficher une grille d'articles.
- [x] Afficher un etat vide.
- [x] Afficher des skeletons pendant le chargement.
- [x] Afficher une page detail article. - `items.test.ts`
- [x] Compter les vues d'un article. - `items.test.ts`
- [x] Partager un article.
- [x] Pagination / infinite scroll cote mobile.
- [x] API Tri par prix (`?sort=price_asc`). - `tddBacklog.test.ts`
- [x] Tri par nouveaute et prix cote mobile.
- [x] API Statut article vendu (`PATCH /api/items/:id/status`). - `tddBacklog.test.ts`
- [x] API Masquer les annonces liees a une commande en cours. - `tddBacklog.test.ts`
- [x] Reflet mobile du statut vendu / indisponibilite.
- [ ] Seed Neon avec des articles de demo propres.
- [ ] Tri popularite cote mobile.

## 4. Recherche et filtres

- [x] Recherche mobile dans les articles charges.
- [x] Filtres mobile par taille.
- [x] Filtres mobile par etat.
- [x] Recherche API par titre, marque et description. - `items.test.ts`
- [x] Filtres API par categorie, taille, etat et prix. - `items.test.ts`, `items.integration.test.ts`
- [x] Brancher l'ecran recherche mobile directement sur l'API.
- [x] Ajouter filtre prix dans l'interface mobile.
- [x] Brancher le tri API `price_asc` dans l'interface mobile.
- [ ] Sauvegarder les recherches recentes.

## 5. Favoris

- [x] Ajouter un article aux favoris. - `favorites.test.ts`, `items.test.ts`
- [x] Retirer un article des favoris. - `favorites.test.ts`
- [x] Afficher la page favoris.
- [x] Synchroniser les favoris avec l'API.
- [x] Notification vendeur quand un article recoit un favori. - `productBacklog.test.ts`
- [ ] Ameliorer le retour visuel si l'action favori echoue.

## 6. Profil utilisateur

- [x] Afficher le profil utilisateur. - `users.test.ts`
- [x] Modifier le nom. - `users.test.ts`
- [x] Modifier la bio. - `users.test.ts`
- [x] Afficher les favoris dans le profil.
- [x] Afficher les annonces du vendeur approuve. - `users.test.ts`
- [x] Afficher les stats de base du profil.
- [x] API Adresse de livraison sur la commande. - `tddBacklog.test.ts`
- [ ] Upload photo de profil.
- [ ] Modifier l'adresse e-mail.
- [ ] Carnet d'adresses de livraison persistant.
- [ ] Export de donnees utilisateur reel.

## 7. Vendeur

- [x] Demander l'acces vendeur. - `authJwt.test.ts`
- [x] Stocker le statut vendeur : `none`, `pending`, `approved`.
- [x] Cacher l'onglet vendre si le vendeur n'est pas approuve.
- [x] API admin pour approuver/refuser le statut vendeur. - `authJwt.test.ts`, `admin.test.ts`
- [x] API Liste des vendeurs en attente (`GET /api/admin/sellers`). - `tddBacklog.test.ts`
- [x] Afficher une carte de statut vendeur dans le profil.
- [ ] Interface admin web/mobile pour valider les vendeurs.
- [ ] Verification vendeur complete (KYC).
- [ ] Documents/KYC vendeur, si necessaire.
- [ ] Notifications lors de l'approbation vendeur.

## 8. Publication d'articles

- [x] Ecran mobile de creation d'annonce.
- [x] Formulaire titre, marque, description, categorie, taille, etat, couleur, prix.
- [x] Calcul de frais vendeur affiche dans l'interface.
- [x] API de creation d'article avec validation. - `items.test.ts`
- [x] API de modification d'article. - `items.test.ts`, `items.integration.test.ts`, `authJwt.test.ts`
- [x] API de suppression d'article. - `items.test.ts`
- [x] API Marquer un article comme vendu. - `tddBacklog.test.ts`
- [x] Autoriser temporairement une annonce sans photo (`images: []`). - `items.test.ts`, `productBacklog.test.ts`
- [ ] Upload reel de photos.
- [ ] Stockage cloud des images.
- [ ] Connecter le bouton "Ajouter des photos".
- [ ] Modifier une annonce depuis le mobile.
- [ ] Supprimer une annonce depuis le mobile.
- [ ] Marquer vendu depuis le mobile.
- [ ] Moderation des annonces.

## 9. Achat et checkout

- [x] Ecran checkout mobile.
- [x] Formulaire adresse de livraison.
- [x] Selection Wave, Orange Money, Free Money et espece en UI.
- [x] Recapitulatif de commande.
- [x] API de creation de commande. - `orders.test.ts`
- [x] API Refus d'une deuxieme commande sur le meme article (409). - `tddBacklog.test.ts`
- [x] API Devis checkout (`POST /api/checkout/quote`). - `tddBacklog.test.ts`
- [x] API de liste des commandes. - `orders.test.ts`
- [x] API de detail commande. - `orders.test.ts`
- [x] API de changement de statut commande. - `orders.test.ts`
- [x] API Annulation de commande par l'acheteur. - `tddBacklog.test.ts`
- [x] Brancher le checkout mobile sur `api.orders.create`.
- [x] Brancher le devis mobile sur `POST /api/checkout/quote`.
- [x] Notifications acheteur et vendeur quand une commande est creee. - `productBacklog.test.ts`
- [ ] Paiement reel Wave.
- [ ] Paiement reel Orange Money.
- [ ] Paiement reel Free Money.
- [ ] Webhooks de paiement.
- [ ] Confirmation de paiement avant creation definitive.
- [ ] Remboursement.

## 10. Livraison

- [x] Timeline de livraison cote API. - `orders.test.ts`
- [x] Statuts commande : `processing`, `in_transit`, `delivered`, `cancelled`.
- [x] Page "Mes livraisons" connectee aux commandes.
- [x] Tracking ID genere. - `orders.test.ts`
- [x] ETA affichee.
- [x] API Confirmation de reception par l'acheteur. - `tddBacklog.test.ts`
- [ ] Ecran mobile confirmation de reception.
- [ ] Integration transporteur reelle.
- [ ] Mise a jour automatique du suivi.
- [ ] Gestion litige livraison.

## 11. Messagerie

- [x] Inbox mobile.
- [x] Conversations API. - `conversations.test.ts`
- [x] Messages API. - `conversations.test.ts`
- [x] Envoi de message. - `conversations.test.ts`
- [x] Pagination des messages avec curseur. - `conversations.test.ts`
- [x] Compteurs non lus buyer/seller. - `conversations.test.ts`, `tddBacklog.test.ts`
- [x] API Marquer conversation lue (`PATCH .../read`). - `tddBacklog.test.ts`
- [x] Censure des informations de contact mobile + API. - `mobileCensor.test.ts`, `tddBacklog.test.ts`
- [x] API Signalement d'une conversation. - `tddBacklog.test.ts`
- [x] Conversations anonymisees avec identite Diayko cote UI.
- [x] Notification destinataire quand un message arrive. - `productBacklog.test.ts`
- [ ] Rafraichissement temps reel.
- [ ] WebSocket ou polling propre.
- [ ] Pieces jointes/images dans les messages.
- [ ] Notifications push pour nouveaux messages.
- [ ] Ecran mobile signalement.

## 12. Avis et reputation

- [x] Tables et API reviews. - `reviews.test.ts`
- [x] Creation d'un avis apres commande livree cote API. - `reviews.test.ts`
- [x] Liste des avis vendeur cote API. - `reviews.test.ts`, `users.test.ts`
- [x] Notes/reviewCount dans le profil.
- [ ] Ecran mobile pour noter une commande.
- [ ] Affichage complet des avis sur profil/article.
- [ ] Calcul automatique de la note vendeur apres avis.
- [ ] Moderation des avis.

## 13. Notifications

- [x] Ecran notifications mobile.
- [x] Marquer les notifications locales comme lues.
- [x] API Notifications persistees en base. - `tddBacklog.test.ts`
- [x] API Liste / lire / tout marquer lu. - `tddBacklog.test.ts`
- [x] Synchroniser l'ecran mobile avec `GET /api/notifications`.
- [x] Notifications commande, message, like, vente. - `productBacklog.test.ts`
- [ ] Push notifications Expo.
- [ ] Preferences de notifications connectees au backend.

## 14. Portefeuille et paiements vendeur

- [x] Ecran portefeuille mobile.
- [x] UI solde, comptes lies, historique.
- [x] API Solde vendeur (`GET /api/wallet`). - `tddBacklog.test.ts`
- [x] API Demande de retrait avec statut `pending`. - `tddBacklog.test.ts`
- [x] API Historique transactions (`GET /api/wallet/transactions`). - `productBacklog.test.ts`
- [x] Brancher l'ecran portefeuille sur l'API.
- [x] Historique des transactions connecte au mobile.
- [ ] Paiement / virement reel vers Wave ou Orange Money.
- [ ] Calcul automatique des gains vendeur apres livraison.
- [ ] Blocage des fonds jusqu'a livraison.

## 15. Statistiques vendeur

- [x] Ecran statistiques vendeur.
- [x] UI metrics, graphique, top articles.
- [x] API Metrics reelles vues/likes (`GET /api/seller/stats`). - `tddBacklog.test.ts`
- [x] API Historique ventes vendeur (`GET /api/me/sales`). - `tddBacklog.test.ts`
- [x] Brancher l'ecran stats sur l'API.
- [ ] Revenus reels.
- [ ] Taux de conversion.
- [ ] Export des statistiques.

## 16. Parametres, support et legal

- [x] Ecran parametres.
- [x] Deconnexion depuis parametres.
- [x] Suppression de compte depuis parametres.
- [x] Centre d'aide statique.
- [x] API Articles d'aide (`GET /api/help/articles`). - `tddBacklog.test.ts`
- [x] Pages legales.
- [x] Liens support e-mail/WhatsApp.
- [x] API Ticket support (`POST /api/support/tickets`). - `tddBacklog.test.ts`
- [ ] Formulaire mobile connecte a l'API support.
- [ ] Preferences persistantes en base.
- [ ] Gestion complete confidentialite.

## 17. Admin et moderation

- [x] Role utilisateur `admin`.
- [x] Protection API par role admin. - `authJwt.test.ts`, `admin.test.ts`
- [x] Endpoint admin pour statut vendeur. - `authJwt.test.ts`
- [x] API Liste vendeurs en attente. - `tddBacklog.test.ts`
- [x] API Signalement conversation. - `tddBacklog.test.ts`
- [ ] Dashboard admin.
- [ ] Validation/refus vendeur depuis UI.
- [ ] Moderation articles.
- [ ] Moderation messages.
- [ ] Gestion litiges.
- [ ] Audit log admin.

## 18. Promotions et contenu plateforme

- [x] API Liste promotions actives. - `tddBacklog.test.ts`
- [x] API Detail promotion. - `tddBacklog.test.ts`
- [ ] Ecran mobile promotions connecte a l'API.
- [ ] Gestion admin des campagnes en base.

## 19. Technique, API et securite

- [x] Monorepo reorganise : `apps/`, `packages/`, `docs/`, `scripts/`.
- [x] API Express 5.
- [x] Drizzle ORM.
- [x] Neon PostgreSQL configure.
- [x] Schema Postgres pousse sur Neon.
- [x] PostgreSQL unique pour dev, tests et production.
- [x] SQLite/libsql retire du code et de la configuration actifs.
- [x] Validation Zod sur les routes.
- [x] Middleware auth.
- [x] Rate limiting. - `rateLimiter.test.ts`, `rateLimiter.integration.test.ts`
- [x] Store rate limit Postgres. - `pgRateLimitStore.test.ts`
- [x] Healthcheck API. - `misc.test.ts`, `health.test.ts`
- [x] Maintenance cleanup rate limits. - `health.test.ts`
- [x] Tests API Vitest/Supertest : 237 tests verts sur 33 fichiers.
- [x] Backlog TDD : 27/27 verts. - `tddBacklog.test.ts`
- [x] Backlog produit P0 : 5/5 verts. - `productBacklog.test.ts`
- [x] Tests unitaires services et libs. - `apps/api-server/tests/unit/`
- [x] Typecheck workspace.
- [x] Build API.
- [x] Security headers manuels.
- [x] CORS production restreint. - `unit/lib.security.test.ts`
- [ ] CI complete.
- [ ] Seed Neon automatise.
- [ ] Logs production structures et dashboards.
- [ ] Monitoring erreurs.
- [ ] Documentation API a jour (OpenAPI / orval regen).

---

## Reste a faire par priorite

### P0 - Parcours mobile encore ouvert

1. [ ] Ecrans auth : mot de passe oublie, reset, verification e-mail.
2. [ ] Upload reel de photos + stockage cloud.
3. [ ] Bouton mobile "Ajouter des photos".
4. [ ] Formulaire mobile support branche API.

### P1 - Admin et confiance

5. [ ] Interface admin minimale pour vendeurs `pending`.
6. [ ] Moderation articles/messages/avis.
7. [ ] Signalement conversation cote UI.
8. [ ] Seed Neon articles de demo.
9. [ ] KYC vendeur si necessaire.

### P2 - Paiements et temps reel

10. [ ] Integrations paiement Wave / Orange Money / Free Money + webhooks.
11. [ ] Paiement vendeur / virement reel.
12. [ ] Chat temps reel (WebSocket ou polling propre).
13. [ ] Push notifications Expo.

### P3 - Production

14. [ ] CI complete.
15. [ ] Monitoring erreurs + dashboards logs.
16. [ ] Documentation API OpenAPI/orval a jour.
17. [ ] Transporteur et suivi colis reel.

---

## Mapping tests vers fonctionnalites API

| Fichier de test | Domaine |
|-----------------|---------|
| `auth.test.ts` | Routes protegees |
| `authJwt.test.ts` | Auth JWT, seller-access, admin seller-status, PATCH items |
| `auth.edge.test.ts` | Cas limites auth |
| `jwtAuth.test.ts` | Sign/verify JWT |
| `tddBacklog.test.ts` | Backlog TDD mai 2026 (27 scenarios) |
| `productBacklog.test.ts` | Backlog produit P0 (5 scenarios) |
| `users.test.ts` | Profil, PATCH, DELETE |
| `users.edge.test.ts` | Cas limites utilisateurs |
| `items.test.ts` | Catalogue CRUD, like, view, recherche |
| `items.integration.test.ts` | PATCH, filtres |
| `orders.test.ts` | Commandes, timeline, statuts |
| `reviews.test.ts` | Avis post-livraison |
| `conversations.test.ts` | Threads, messages, pagination |
| `conversations.edge.test.ts` | Cas limites conversations |
| `favorites.test.ts` | Favoris |
| `admin.test.ts` | Admin seller-status |
| `health.test.ts` | Health + maintenance |
| `misc.test.ts` | Categories, 404 |
| `rateLimiter.test.ts` | Rate limit |
| `rateLimiter.integration.test.ts` | Rate limit integration |
| `pgRateLimitStore.test.ts` | Store rate limit Postgres |
| `unit/services.*.test.ts` | Services metier |
| `unit/lib.*.test.ts` | Libs API |
| `currency.test.ts` | Format FCFA |
| `mobileCensor.test.ts` | Censure mobile |

Detail : [apps/api-server/tests/README.tdd.md](../apps/api-server/tests/README.tdd.md).
