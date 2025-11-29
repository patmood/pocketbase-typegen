export type Options = {
  db?: string
  url?: string
  out: string
  json?: string
  email?: string
  password?: string
  token?: string
  sdk?: boolean
  env?: boolean | string
  constraints?: boolean  // New option
  constraintsOut?: string  // New option for output file
}

export type FieldSchema = {
  id: string
  name: string
  type:
    | "text"
    | "file"
    | "text"
    | "number"
    | "bool"
    | "email"
    | "url"
    | "date"
    | "autodate"
    | "select"
    | "json"
    | "relation"
    | "user"
    | "editor"
    | "geoPoint"
  system: boolean
  required: boolean
  unique: boolean
} & RecordOptions

export type CollectionRecord = {
  id: string
  type: "base" | "auth" | "view"
  name: string
  system: boolean
  fields: FieldSchema[]
  listRule: string | null
  viewRule: string | null
  createRule: string | null
  updateRule: string | null
  deleteRule: string | null
}

// Every field is optional
export type RecordOptions = {
  maxSelect?: number | null
  min?: number | null
  max?: number | null
  pattern?: string
  values?: string[]
  onCreate?: boolean
  onUpdate?: boolean
}
