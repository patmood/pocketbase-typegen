import { FieldSchema } from "./types"
import { toPascalCase } from "./utils"

export function createFieldMetadata(
  name: string,
  schema: Array<FieldSchema>
): string {

  const metadata = schema
    .map((field) => {
      const parts: string[] = []

      // numeric range
      if (typeof field.min === "number" && field.min !== 0) {
        parts.push(`\t\tmin: ${field.min},`)
      }
      if (typeof field.max === "number" && field.max !== 0) {
        parts.push(`\t\tmax: ${field.max},`)
      }

      // selection and file-related
      if (typeof (field as any).maxSelect === "number" && (field as any).maxSelect !== 0) {
        parts.push(`\t\tmaxSelect: ${(field as any).maxSelect},`)
      }
      if (typeof (field as any).maxSize === "number" && (field as any).maxSize !== 0) {
        parts.push(`\t\tmaxSize: ${(field as any).maxSize},`)
      }
      if (Array.isArray((field as any).mimeTypes) && (field as any).mimeTypes.length > 0) {
        parts.push(`\t\tmimeTypes: ${JSON.stringify((field as any).mimeTypes)},`)
      }

      // presence / uniqueness
      if (typeof field.required === "boolean") {
        parts.push(`\t\trequired: ${field.required},`)
      }
      if (typeof field.unique === "boolean") {
        parts.push(`\t\tunique: ${field.unique},`)
      }

      // pattern / values
      if (typeof (field as any).pattern === "string" && (field as any).pattern) {
        parts.push(`\t\tpattern: ${JSON.stringify((field as any).pattern)},`)
      }
      if (Array.isArray((field as any).values) && (field as any).values.length > 0) {
        parts.push(`\t\tvalues: ${JSON.stringify((field as any).values)},`)
      }

      // lifecycle flags
      if (typeof (field as any).onCreate === "boolean") {
        parts.push(`\t\tonCreate: ${(field as any).onCreate},`)
      }
      if (typeof (field as any).onUpdate === "boolean") {
        parts.push(`\t\tonUpdate: ${(field as any).onUpdate},`)
      }

      if (parts.length === 0) return null

      return `\t${field.name}: {\n${parts.join("\n")}\n\t},`
    })
    .filter(Boolean)
  if (metadata.length === 0) return ""

  const typeName = toPascalCase(name)
  return `export const ${typeName}FieldMetadata = {\n${metadata.join("\n")}\n} as const`
}