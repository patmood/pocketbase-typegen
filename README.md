# Pocketbase Typegen

Generate typescript definitions from your [pocketbase.io](https://pocketbase.io/) schema.

Run it:

`npx pocketbase-typegen --db ./pb_data/data.db --out pocketbase-types.ts`

This will produce types for all your pocketbase collections to use in your frontend typescript codebase.

## Who should use this?

- Project uses pocketbase.io back end
- Front end uses typescript
- You manage your database schema in dev and generate migrations before deploying to production
