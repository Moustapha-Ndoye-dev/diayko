# Legacy path alias

`artifacts/mobile` and `artifacts/api-server` are directory junctions to [`apps/mobile`](../apps/mobile) and [`apps/api-server`](../apps/api-server).

Use **`apps/mobile`**, **`apps/api-server`**, and **`packages/db`** for new work. The junctions keep older IDE paths and bookmarks working after the monorepo layout change.

SonarLint / Aikido: prefer analyzing `apps/` and `packages/` — exclude `artifacts/` and `lib/` in IDE settings (see `.vscode/settings.json`).

## TypeScript still shows errors on `artifacts/mobile/...`?

1. **Reload from disk** on `login.tsx` (discard unsaved edits — stale buffers still use `parseApiFeedback(e)`).
2. Command palette: **TypeScript: Go to Project Configuration** → should open `apps/mobile/tsconfig.json`.
3. **TypeScript: Restart TS Server**, then **Developer: Reload Window**.
4. From repo root: `pnpm install` if `node_modules` is missing.

`pnpm exec tsc --noEmit` in `apps/mobile` (or `artifacts/mobile` via the junction) should pass with no errors.
