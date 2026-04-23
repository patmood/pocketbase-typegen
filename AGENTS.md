# AGENTS.md

## What this is

CLI tool (`pocketbase-typegen`) that generates TypeScript type definitions from a PocketBase schema. Inputs: live PocketBase URL (with auth), SQLite DB file, or exported JSON schema. Output: a single `pocketbase-types.ts` file. Also exposes a programmatic API (`generateFromSchema`) for use as a library.

## Commands

```sh
npm test              # Vitest unit tests (with coverage)
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint on src/ and test/
npm run prettier      # Prettier check on src/ and test/
npm run build         # esbuild bundle to dist/cli.js + dist/index.js (must run before integration tests)
npm run format        # Auto-fix: prettier then eslint
npm run test:update   # Update Vitest snapshots (vitest run -u)
```

CI runs: `build -> test -> typecheck`. Run in that order locally too -- tests import from source but integration tests need the build output.

## Integration tests

Integration tests run **inside Docker only** -- they need a live PocketBase server:

```sh
npm run pocketbase:test   # Build Docker image + run integration test suite
npm run pocketbase:serve  # Build Docker image + start PocketBase for manual testing (port 8090)
```

Do not try to run `test/integration/test.sh` directly on the host. It expects the PocketBase binary and DB at Docker-specific paths.

## Architecture

- `src/index.ts` -- Programmatic API entrypoint; exports `generateFromSchema()` for library usage
- `src/cli.ts` -- CLI entrypoint (commander), parses args, resolves schema source via strategy pattern, calls `generateFromSchema()`, writes output file
- `src/schema.ts` -- Schema loaders: `fromDatabase`, `fromJSON`, `fromURLWithPassword`, `fromURLWithToken` (throw errors instead of calling `process.exit()`)
- `src/lib.ts` -- Core type generation (`generate()`)
- `src/fields.ts` -- PocketBase field-type to TypeScript-type mapping
- `src/collections.ts` -- Collection-level type string builders
- `src/generics.ts` -- Generic type parameter generation for JSON/relation fields
- `src/sqlite.ts` -- SQLite schema reader (uses `better-sqlite3`)
- `src/http.ts` -- HTTP client for PocketBase API (fetch dependency is injected, not pulled from global state)
- `src/types.ts` -- Shared TypeScript types
- `src/utils.ts` -- Shared utility functions

## Testing

- Unit tests live in `test/` and mirror `src/` filenames (e.g., `test/fields.test.ts`)
- Tests use **Vitest snapshots** in `test/__snapshots__/`. After changing generated output, run `npm run test:update` to update them.
- `test/pb_schema.json` is the fixture used by `fromJSON` tests
- `test/pocketbase-types-example.ts` is a reference output file (excluded from prettier and vitest)
- `test/typecheck.ts` exists solely to typecheck the generated example against the PocketBase SDK types
- 100% unit test coverage is enforced

## Style / lint

- **Prettier**: no semicolons, double quotes, trailing commas (es5), 2-space indent
- **ESLint**: flat config (`eslint.config.js`) with `typescript-eslint` and built-in `sort-keys` rule -- object keys must be sorted alphabetically. CI will catch unsorted keys.
- `@typescript-eslint/no-explicit-any` is **off** (any is allowed)
- `@typescript-eslint/ban-ts-comment` is **off** (ts-ignore/ts-expect-error allowed)
- Package is `"type": "module"` (ESM). tsconfig targets ESNext with bundler module resolution. The esbuild step produces the final ESM bundles.

## Gotchas

- The root `pocketbase-types.ts` is a generated output file (used for local dev/testing), not source code. Don't edit it by hand.
- `better-sqlite3` is a native module -- `npm ci` may need build tools. Node >= 18 required.
- `bun:sqlite` is listed as an esbuild external -- the tool also supports running under Bun at runtime.
- The build produces two bundles: `dist/cli.js` (CLI binary) and `dist/index.js` (library/programmatic API). The `main` field points to `dist/index.js` via the `exports` map.
- Schema loaders throw errors instead of calling `process.exit()`, making them safe to use programmatically.
- The `generate()` function in `src/lib.ts` uses `localeCompare` for stable collection sorting (not `<=` comparison).
