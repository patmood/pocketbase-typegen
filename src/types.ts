export type Options = {
  db?: string
  out: string
  json?: string
}

export type RecordSchema = {
  id: string
  name: string
  type: string
  system: boolean
  required: boolean
  unique: boolean
  options: object
}

export type CollectionRecord = {
  id: string
  name: string
  system: boolean
  listRule: string | null
  viewRule: string | null
  createRule: string | null
  updateRule: string | null
  deleteRule: string | null
  schema: Array<RecordSchema>
}
