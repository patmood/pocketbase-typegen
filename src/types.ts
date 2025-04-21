export type Options = {
  db?: string
  url?: string
  out: string
  json?: string
  email?: string
  password?: string
  sdk?: boolean
  env?: boolean | string
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
  system: boolean
  required: boolean
  unique: boolean
  options?: {
    collectionId?: string;
    cascadeDelete?: boolean;
    maxSelect?: number;
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
  }
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
}
