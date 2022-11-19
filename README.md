# Pocketbase Typegen

Generate typescript definitions from your [pocketbase.io](https://pocketbase.io/) schema.

## Quickstart

`npx pocketbase-typegen --db ./pb_data/data.db --out pocketbase-types.ts`

This will produce types for all your PocketBase collections to use in your frontend typescript codebase.

## Versions

When using PocketBase v0.8.x, use `pocketbase-typegen` v1.1.x

Users of PocketBase v0.7.x should use `pocketbase-typegen` v1.0.x

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

The output is a typescript file `pocketbase-types.ts` ([example](./test/pocketbase-types-example.ts)) which will contain:

- `Collections` An enum of all collections/
- `[CollectionName]Record` One type for each collection (eg ProfilesRecord)/
- `[CollectionName]Response` One response type for each collection (eg ProfilesResponse) which includes system fields. This is what is returned from the PocketBase API.
  - `[CollectionName][FieldName]Options` If the collection contains a select field with set values, an enum of the options will be generated.
- `CollectionRecords` A type mapping each collection name to the record type.

## Example usage

In the upcoming [PocketBase SDK](https://github.com/pocketbase/js-sdk) v0.8 you will be able to use generic types when fetching records, eg:

```typescript
import { Collections, TasksResponse } from "./pocketbase-types"

pb.collection(Collections.Tasks).getOne<TasksResponse>("RECORD_ID") // -> results in Promise<TaskResponse>
```
