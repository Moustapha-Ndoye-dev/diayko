# Threat Model

## Project Overview

Diayko is a mobile-first second-hand fashion marketplace built as a pnpm monorepo. The production stack consists of an Expo/React Native client in `apps/mobile/`, an Express 5 REST API in `apps/api-server/src/`, and PostgreSQL accessed through Drizzle ORM schemas in `packages/db/src/schema/`.

The primary production assets are marketplace listings, user profiles, and private buyer/seller conversations. The mobile client is untrusted and can be modified by an attacker, so any identity, role, or business-state signal originating from the client must be verified server-side. Per platform assumptions, deployed traffic is protected in transit by platform-managed TLS, and `NODE_ENV` is assumed to be `production` in production.

## Assets

- **User identities and profile records** — user IDs, names, bios, verification flags, and marketplace reputation fields. Compromise enables impersonation and fake marketplace activity.
- **Listings and seller actions** — item ownership, prices, descriptions, images, and delete/create actions. Unauthorized modification directly impacts business integrity and user trust.
- **Private conversation data** — buyer/seller identifiers, message contents, and unread state. This is non-public user data and must not be readable or writable by unrelated users.
- **Database integrity** — the API has direct write access to PostgreSQL. Any server-side trust in client-supplied identifiers can become cross-user tampering at database scope.
- **Operational secrets and request metadata** — environment variables, auth headers, cookies, and logs. They must not leak through responses or logging.

## Trust Boundaries

- **Mobile client → API** — every request body, query parameter, path parameter, and client-side state value is attacker-controlled.
- **API → PostgreSQL** — API route handlers translate untrusted inputs into database queries and writes; authorization and validation failures here become persistent data compromise.
- **Public → user-specific data** — item browsing may be public, but conversation history, message posting, item ownership actions, and any identity-bound actions require server-side subject binding.
- **Development-only → production** — `apps/mockup-sandbox/`, `scripts/`, and local build helpers are usually out of scope unless direct production reachability is demonstrated.

## Scan Anchors

- **Production entry points**: `apps/api-server/src/index.ts`, `apps/api-server/src/app.ts`, Expo app entry via `apps/mobile/app/_layout.tsx` / `expo-router/entry`
- **Highest-risk code areas**: `apps/api-server/src/routes/items.ts`, `apps/api-server/src/routes/conversations.ts`, `apps/api-server/src/routes/users.ts`
- **Public vs authenticated surfaces**: current scan baseline assumes API routes are publicly reachable unless explicit server-side auth middleware is present
- **Usually dev-only**: `apps/mockup-sandbox/`, `scripts/`, mobile build scripts, local tooling

## Threat Categories

### Spoofing

This project currently relies heavily on client-supplied user identifiers and client-maintained state. The system must not treat `userId`, `sellerId`, `buyerId`, `senderId`, or local flags such as seller approval as proof of identity. All non-public API actions must be bound to a validated server-side principal, and the acting user must be derived from authentication rather than request payload fields.

### Tampering

Marketplace integrity depends on preventing users from creating, deleting, liking, or messaging as another user. The API must enforce ownership and membership checks server-side before mutating listings, conversations, messages, or engagement counters. Client-side business rules are advisory only and cannot be relied on for authorization.

### Information Disclosure

Conversation contents and user-specific inbox data are private marketplace data. The API must only return conversations and messages to authenticated participants of that conversation. Error responses and logs must avoid exposing secrets or internal details beyond what is necessary for client handling.

### Denial of Service

Publicly reachable creation and messaging endpoints can be abused for spam or database growth if left unauthenticated or unthrottled. The main security guarantee here is that identity-bound write operations should first require authentication and authorization; rate limits matter once those controls exist, but lack of auth is the higher-priority issue in this codebase.

### Elevation of Privilege

Because the backend currently appears to trust client-supplied identifiers, an attacker may be able to act with another user’s privileges or access another user’s private data without needing to compromise credentials. The API must enforce per-resource authorization for item ownership, conversation membership, and any other user-scoped data access. All database queries and writes must preserve that authorization boundary even when IDs are syntactically valid.
