# Pocketbase Typegen

Generate typescript definitions from your [pocketbase.io](https://pocketbase.io/) schema.

## Quickstart

`npx pocketbase-typegen --db ./pb_data/data.db --out pocketbase-types.ts`

This will produce types for all your pocketbase collections to use in your frontend typescript codebase.

## Usage

```
Options:
  -V, --version          output the version number
  -d, --db <char>        path to the pocketbase SQLite database
  -j, --json <char>      path to JSON schema exported from pocketbase admin UI
  -u, --url <char>       URL to your hosted pocketbase instance. When using this options you must also provide email and password options.
  -e, --email <char>     email for an admin pocketbase user. Use this with the --url option
  -p, --password <char>  password for an admin pocketbase user. Use this with the --url option
  -o, --out <char>       path to save the typescript output file (default: "pocketbase-types.ts")
  -h, --help             display help for command
```

DB example:

`npx pocketbase-typegen --db ./pb_data/data.db`

JSON example (export JSON schema from the pocketbase admin dashboard):

`npx pocketbase-typegen --json ./pb_schema.json`

URL example:

`npx pocketbase-typegen --url https://myproject.pockethost.io --email admin@myproject.com --password 'secr3tp@ssword!'`

## Example output

The output is a typescript file `pocketbase-types.ts` ([example](./test/pocketbase-types-example.ts)) which will contain one type for each collection and an enum of all collections.

For example and "order" collection record might look like this:

```typescript
export type OrdersRecord = {
  amount: number
  payment_type: "credit card" | "paypal" | "crypto"
  user: UserIdString
  product: string
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
