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
}

export type FieldSchema = {
  id: string
  name: string
  type:
  | "text"
  | "file"
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

export type Relation = {
  collectionName: string
  isMultiple: boolean
  required: boolean
}

export type CollectionRecordWithRelations = CollectionRecord & {
  relations: Record<string, Relation>
}


// Every field is optional
export type RecordOptions = {
  maxSelect?: number | null
  min?: number | null
  max?: number | null
  pattern?: string
  values?: string[]
  collectionId?: string
}
