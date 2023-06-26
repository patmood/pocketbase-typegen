export type Options = {
  db?: string
  url?: string
  out: string
  json?: string
  email?: string
  password?: string
  env?: boolean
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
    | "select"
    | "json"
    | "relation"
    | "user"
    | "editor"
  system: boolean
  required: boolean
  unique: boolean
  options: RecordOptions
}

export type CollectionRecord = {
  id: string
  type: "base" | "auth" | "view"
  name: string
  system: boolean
  listRule: string | null
  viewRule: string | null
  createRule: string | null
  updateRule: string | null
  deleteRule: string | null
  schema: Array<FieldSchema>
}

// Every field is optional
export type RecordOptions = {
  maxSelect?: number | null
  min?: number | null
  max?: number | null
  pattern?: string
  values?: string[]
}
