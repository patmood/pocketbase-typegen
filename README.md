# Pocketbase Typegen

Generate typescript definitions from your [pocketbase.io](https://pocketbase.io/) schema.

## Quickstart

`npx pocketbase-typegen --url https://myproject.pockethost.io --email admin@myproject.com --password 'secr3tp@ssword!'`

This will produce types for all your PocketBase collections to use in your frontend typescript codebase.

## Version Support

| PocketBase | pocketbase-typegen | npx command                                                                    |
| ---------- | ------------------ | ------------------------------------------------------------------------------ |
| v0.23.x    | v1.3.x             | npx pocketbase-typegen --db ./pb_data/data.db --out pocketbase-types.ts        |
| v0.18.x    | v1.2.x             | npx pocketbase-typegen@1.2.1 --db ./pb_data/data.db --out pocketbase-types.ts  |
| v0.8.x     | v1.1.x             | npx pocketbase-typegen@1.1.1 --db ./pb_data/data.db --out pocketbase-types.ts  |
| v0.7.x     | v1.0.x             | npx pocketbase-typegen@1.0.13 --db ./pb_data/data.db --out pocketbase-types.ts |

## Usage

```
Options:
  -V, --version              output the version number
  -u, --url <url>            URL to your hosted pocketbase instance. When using this options you must also provide email and
                             password options or auth token option.
  --email <email>            Email for a pocketbase superuser. Use this with the --url option.
  -p, --password <password>  Password for a pocketbase superuser. Use this with the --url option.
  -t, --token <token>        Auth token for a pocketbase superuser. Use this with the --url option.
  -d, --db <path>            Path to the pocketbase SQLite database.
  -j, --json <path>          Path to JSON schema exported from pocketbase admin UI.
  --env [dir]                Use environment variables for configuration. Add PB_TYPEGEN_URL, PB_TYPEGEN_EMAIL, PB_TYPEGEN_PASSWORD
                             to your .env file. Optionally provide a path to a directory containing a .env file (default: true)
  -o, --out <path>           Path to save the typescript output file. (default: "pocketbase-types.ts")
  --no-sdk                   Removes the pocketbase package dependency. A typed version of the SDK will not be generated.
  -h, --help                 display help for command
```

### URL example with email and password:

`npx pocketbase-typegen --url https://myproject.pockethost.io --email admin@myproject.com --password 'secr3tp@ssword!'`

### URL example with auth token:

You can generate such token via the above impersonate API or from the Dashboard > Collections > \_superusers > {select superuser} > "Impersonate" dropdown option.

`npx pocketbase-typegen --url https://myproject.pockethost.io --token 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'`

### ENV example:

Also supports environment specific files such as .env.local (uses [dotenv-flow](https://www.npmjs.com/package/dotenv-flow))

`npx pocketbase-typegen --env` or `npx pocketbase-typegen --env path/to/dir`

.env variables include:

```
PB_TYPEGEN_URL=https://myproject.pockethost.io
PB_TYPEGEN_EMAIL=admin@myproject.com
PB_TYPEGEN_PASSWORD=secr3tp@ssword!
PB_TYPEGEN_TOKEN=eyJhbGciOiJI...ozhyQVfYm24
```

### Database example:

`npx pocketbase-typegen --db ./pb_data/data.db`

### JSON example (export JSON schema from the pocketbase admin dashboard):

`npx pocketbase-typegen --json ./pb_schema.json`

### Shortcut

Add it to your projects `package.json`:

```
"scripts": {
  "typegen": "pocketbase-typegen --env",
},
```

## Example Output

The output is a typescript file `pocketbase-types.ts` ([example](./test/pocketbase-types-example.ts)) which will contain:

- `Collections` An enum of all collections.
- `[CollectionName]Record` One type for each collection (eg ProfilesRecord).
- `[CollectionName]Response` One response type for each collection (eg ProfilesResponse) which includes system fields. This is what is returned from the PocketBase API.
  - `[CollectionName][FieldName]Options` If the collection contains a select field with set values, an enum of the options will be generated.
- `CollectionRecords` A type mapping each collection name to the record type.
- `CollectionResponses` A type mapping each collection name to the response type.
- `TypedPocketBase` A type for usage with type asserted PocketBase instance.

## Example Usage

Using PocketBase SDK v0.18.3+, collections can be [automatically typed](https://github.com/pocketbase/js-sdk#specify-typescript-definitions) using the generated `TypedPocketBase` type:

```typescript
import { TypedPocketBase } from "./pocketbase-types"

const pb = new PocketBase("http://127.0.0.1:8090") as TypedPocketBase

await pb.collection("tasks").getOne("RECORD_ID") // -> results in TaskResponse
await pb.collection("posts").getOne("RECORD_ID") // -> results in PostResponse
```

Alternatively, you can use generic types for each request, eg:

```typescript
import { Collections, TasksResponse } from "./pocketbase-types"

await pb.collection(Collections.Tasks).getOne<TasksResponse>("RECORD_ID") // -> results in TaskResponse
```

## Example Advanced Usage

You can provide types for JSON fields and [expanded relations](https://pocketbase.io/docs/expanding-relations/) by passing generic arguments to the Response types:

```typescript
import { Collections, CommentsResponse, UserResponse } from "./pocketbase-types"

/**
  type CommentsRecord<Tmetadata = unknown> = {
    text: string
    metadata: null | Tmetadata // This is a json field
    user: RecordIdString // This is a relation field
  }
*/
type Metadata = {
  likes: number
}
type Expand = {
  user: UsersResponse
}
const result = await pb
  .collection(Collections.Comments)
  .getOne<CommentsResponse<Metadata, Expand>>("RECORD_ID", { expand: "user" })

// Now you can access the expanded relation with type safety and hints in your IDE
result.expand.user.username
```

## Status

![](https://github.com/patmood/pocketbase-typegen/actions/workflows/test.yml/badge.svg?branch=main) ![](https://github.com/patmood/pocketbase-typegen/actions/workflows/integration.yml/badge.svg?branch=main)
