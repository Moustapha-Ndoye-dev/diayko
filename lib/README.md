# Legacy path alias

`lib/db` is a directory junction to [`packages/db`](../packages/db).

Use **`packages/db`** for new work. The junction keeps older IDE paths (`lib/db/...`) working after the monorepo layout change.

If TypeScript still reports missing modules on `lib/db/...`, run **TypeScript: Restart TS Server** and open **`packages/db/src/schema/pg/reviews.ts`**, or reload the file from disk.
