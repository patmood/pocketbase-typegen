# Pocketbase Typegen

Generate typescript definitions from your [pocketbase.io](https://pocketbase.io/) schema.

### Run it once:

`npx pocketbase-typegen --db ./pb_data/data.db --out pocketbase-types.ts`

This will produce types for all your pocketbase collections to use in your frontend typescript codebase.

### Install in your project and run it often:

Install: `npm install --save-dev pocketbase-typegen`

Add to your `package.json` scripts:

```json
  "scripts": {
    "start": "...",
    "build": "...",
    "typegen": "pocketbase-typegen -d pb_data/data.db -o src/pocketbase-types.ts"
  },
```

Run it any time you modify your pocketbase collections:

`npm run typegen`

## Example output

The output is a typescript file `pocketbase-types.ts` which will contain an enum of all your collections, and the type of each record. For example:

```typescript
export enum Collections {
  Profiles = "profiles",
  Books = "books",
  Magazines = "magazines",
  Everything = "everything",
}

export type ProfilesRecord = {
  userId: string
  name?: string
  avatar?: string
}
```

Using the [pocketbase SDK](https://github.com/pocketbase/js-sdk) (v0.8.x onwards), you can then type your responses like this:

```typescript
import type { Collections, ProfilesRecord } from "./path/to/pocketbase-types.ts"
const result = (await client.records.getList)<ProfilesRecord>(
  Collections.Profiles,
  1,
  50
)
```

Now the `result` of the data fetch will be accurately typed throughout your codebase!
