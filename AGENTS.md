# AGENTS.md

## What this is

CLI tool (`pocketbase-typegen`) that generates TypeScript type definitions from a PocketBase schema. Inputs: live PocketBase URL (with auth), SQLite DB file, or exported JSON schema. Output: a single `pocketbase-types.ts` file.

## Commands

```sh
npm test              # Jest unit tests (with coverage)
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint on src/ and test/
npm run prettier      # Prettier check on src/ and test/
npm run build         # esbuild bundle to dist/index.js (must run before integration tests)
npm run format        # Auto-fix: prettier then eslint
npm run test:update   # Update Jest snapshots (jest -u)
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

- `src/index.ts` -- CLI entrypoint (commander), parses args, calls `main()`
- `src/cli.ts` -- Orchestrator: picks schema source (URL/DB/JSON/env), calls `generate()`, writes output file
- `src/schema.ts` -- Schema loaders: `fromDatabase`, `fromJSON`, `fromURLWithPassword`, `fromURLWithToken`
- `src/lib.ts` -- Core type generation (`generate()`)
- `src/fields.ts` -- PocketBase field-type to TypeScript-type mapping
- `src/collections.ts` -- Collection-level type string builders
- `src/generics.ts` -- Generic type parameter generation for JSON/relation fields
- `src/sqlite.ts` -- SQLite schema reader (uses `better-sqlite3`)
- `src/http.ts` -- HTTP client for PocketBase API
- `src/types.ts` -- Shared TypeScript types

## Testing

- Unit tests live in `test/` and mirror `src/` filenames (e.g., `test/fields.test.ts`)
- Tests use **Jest snapshots** in `test/__snapshots__/`. After changing generated output, run `npm run test:update` to update them.
- `test/pb_schema.json` is the fixture used by `fromJSON` tests
- `test/pocketbase-types-example.ts` is a reference output file (excluded from prettier and jest)
- `test/typecheck.ts` exists solely to typecheck the generated example against the PocketBase SDK types

## Style / lint

- **Prettier**: no semicolons, double quotes, trailing commas (es5), 2-space indent
- **ESLint**: `sort-keys-fix` plugin is enabled -- object keys must be sorted alphabetically. CI will catch unsorted keys.
- `@typescript-eslint/no-explicit-any` is **off** (any is allowed)
- Package is `"type": "module"` (ESM), but tsconfig targets CommonJS for Jest compatibility. The esbuild step produces the final ESM bundle.

## Gotchas

- The root `pocketbase-types.ts` is a generated output file (used for local dev/testing), not source code. Don't edit it by hand.
- `better-sqlite3` is a native module -- `npm ci` may need build tools. Node >= 18 required.
- `bun:sqlite` is listed as an esbuild external -- the tool also supports running under Bun at runtime.
