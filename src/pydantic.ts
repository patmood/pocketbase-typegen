import { CollectionRecord, FieldSchema, pydanticTypeMap } from "./types"
import { toPascalCase } from "./utils"

export function generatePydantic(schema: Array<CollectionRecord>): string {
  const imports = `from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Literal, TypeVar, Generic
from datetime import datetime
from enum import Enum, auto`

  const models = schema
    .map((collection) => {
      // Generate enums for select fields first
      const enums = collection.fields
        .filter(
          (field) =>
            field.type === "select" && field.values && field.values.length > 0
        )
        .map((field) => generateEnum(collection.name, field))
        .join("\n\n")

      // Generate the actual model
      const fields = collection.fields
        .map((field) => generatePydanticField(collection.name, field))
        .join("\n    ")

      const baseClass =
        collection.type === "auth" ? "AuthSystemFields" : "BaseSystemFields"

      return `
${enums}

class ${toPascalCase(collection.name)}Base(${baseClass}):
    """Base model for ${collection.name} collection"""
    ${fields}

class ${toPascalCase(collection.name)}Create(${toPascalCase(
        collection.name
      )}Base):
    """Create model for ${
      collection.name
    } collection (used for creation/updates)"""
    pass

class ${toPascalCase(collection.name)}(${toPascalCase(collection.name)}Base):
    """Full model for ${collection.name} collection including system fields"""
    id: str
    created: datetime
    updated: datetime
    
    model_config = ConfigDict(from_attributes=True)`
    })
    .join("\n\n")

  // Add base system field classes
  const systemFields = `
class BaseSystemFields(BaseModel):
    """Base system fields included in all collections"""
    id: str
    
class AuthSystemFields(BaseSystemFields):
    """Additional system fields for auth collections"""
    email: str
    email_visibility: bool
    username: str
    verified: bool`

  // Add collection mapping
  const collectionMapping = `
# Type mapping for all collections
Collections = {
    ${schema
      .map(
        (collection) => `"${collection.name}": ${toPascalCase(collection.name)}`
      )
      .join(",\n    ")}
}

# Type alias for any collection model
AnyCollection = ${schema
    .map((collection) => toPascalCase(collection.name))
    .join(" | ")}
`

  return `${imports}\n\n${systemFields}\n\n${models}\n\n${collectionMapping}\n`
}

function generateEnum(collectionName: string, field: FieldSchema): string {
  if (!field.values) return ""
  const enumName = `${toPascalCase(collectionName)}${toPascalCase(
    field.name
  )}Options`
  const values = field.values.map((v) => `    ${v} = "${v}"`).join("\n")

  return `class ${enumName}(str, Enum):
    """Options for ${field.name} field in ${collectionName} collection"""
${values}`
}

function generatePydanticField(
  collectionName: string,
  field: FieldSchema
): string {
  const typeStr = getPydanticType(collectionName, field)
  const optional = !field.required
  const fieldType = optional ? `Optional[${typeStr}]` : typeStr
  const defaultValue = optional ? " = None" : ""
  const description =
    field.type === "relation"
      ? `\n    """Reference to ${field.options?.collectionId} collection"""`
      : ""

  return `${field.name}: ${fieldType}${defaultValue}${description}`
}

function getPydanticType(collectionName: string, field: FieldSchema): string {
  if (field.type === "select" && field.values && field.values.length > 0) {
    const enumName = `${toPascalCase(collectionName)}${toPascalCase(
      field.name
    )}Options`
    if (field.maxSelect && field.maxSelect > 1) {
      return `List[${enumName}]`
    }
    return enumName
  }

  const baseType =
    pydanticTypeMap[field.type as keyof typeof pydanticTypeMap] || "Any"

  if (field.type === "json") {
    return "Dict[str, Any]"
  }

  if (field.maxSelect && field.maxSelect > 1) {
    return `List[${baseType}]`
  }

  return baseType
}
