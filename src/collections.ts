import { CollectionRecordWithRelations } from "./types"
import { getGenericArgList } from "./generics"
import { toPascalCase } from "./utils"
import { ENHANCED_RECORD_SERVICE_DEFINITION, TYPED_POCKETBASE_COMMENT } from "./constants"

export function createCollectionEnum(collectionNames: Array<string>): string {
  const collections = collectionNames
    .map((name) => `\t${toPascalCase(name)} = "${name}",`)
    .join("\n")
  const typeString = `export enum Collections {
${collections}
}`
  return typeString
}

export function createCollectionRecords(
  collections: CollectionRecordWithRelations[]
): string {
  const nameRecordMap = collections
    .map((c) => {
      const recordName = toPascalCase(c.name) + "Record"
      const generics = getGenericArgList(c)
      if (generics.length > 0) {
        const unknownGenerics = generics.map(() => "unknown").join(", ")
        return `\t${c.name}: ${recordName}<${unknownGenerics}>`
      }
      return `\t${c.name}: ${recordName}`
    })
    .join("\n")
  return `export type CollectionRecords = {
${nameRecordMap}
}`
}

export function createCollectionResponses(
  collectionNames: Array<string>
): string {
  const nameRecordMap = collectionNames
    .map((name) => `\t${name}: ${toPascalCase(name)}Response`)
    .join("\n")
  return `export type CollectionResponses = {
${nameRecordMap}
}`
}

/**
 * Generates a single property line for a relation within the RelationMappings type.
 * @returns e.g., `\t"author"?: UsersResponse<Trest>`
 */
function generateRelationProperty(
  fieldName: string,
  relation: { required: boolean; collectionName: string; isMultiple: boolean }
): string {
  const targetCollectionName = toPascalCase(relation.collectionName);
  const responseType = `${targetCollectionName}Response<Trest>`;
  
  const isOptional = !relation.required ? "?" : "";
  const isArray = relation.isMultiple ? "[]" : "";
  
  return `\t"${fieldName}"${isOptional}: ${responseType}${isArray}`;
}

/**
 * Generates the body of the RelationMappings type for a given collection's relations.
 */
function generateRelationMappings(
  relations: CollectionRecordWithRelations['relations']
): string {
  if (!relations) return "";
  
  return Object.entries(relations)
    .map(([fieldName, relation]) => generateRelationProperty(fieldName, relation))
    .join("\n");
}

/**
 * Generates the complete "...RelationMappings" and "...Expand" helper types for a single collection.
 */
function generateTypesForCollection(
  collection: CollectionRecordWithRelations
): string {
  const collectionName = toPascalCase(collection.name);
  const relationMappings = generateRelationMappings(collection.relations);

  // Using template strings makes the overall structure clearer.
  const relationMappingsType = `
// Expand Helper Types for "${collection.name}"
type ${collectionName}RelationMappings<Trest extends string = ""> = {
${relationMappings}
}`;

  const expandHelperType = `
type ${collectionName}Expand<T extends string> = 
	// 1. Handle comma-separated expands, e.g., "author,tags"
	T extends \`\${infer F},\${infer R}\`
		? ${collectionName}Expand<F> & ${collectionName}Expand<R>
	
	// 2. Handle nested expands, e.g., "author.name"
	: T extends \`\${infer K extends keyof ${collectionName}RelationMappings}.\${infer Rest}\`
		? { [P in K]: ${collectionName}RelationMappings<Rest>[P] }

	// 3. Handle top-level expands, e.g., "author"
	: T extends keyof ${collectionName}RelationMappings
		? { [K in T]: ${collectionName}RelationMappings[K] }
	
	// 4. If not empty and none of the above match, the type is never.
	: T extends ""
		? undefined
		: never;
`;
  // Remove all single-line comments (//...) from the generated string.
  const expandHelperTypeWithoutComments = expandHelperType.replace(/\s*\/\/.*$/gm, '');
  
  return `${relationMappingsType}\n${expandHelperTypeWithoutComments}`;
}

/**
 * Main function: Generates TypeScript expand helper types for all given collections.
 */
export function createExpandHelpers(
  collections: CollectionRecordWithRelations[]
): string {
  // 1. Filter for collections that have relations defined.
  const collectionsWithRelations = collections.filter(
    (collection) => collection.relations && Object.keys(collection.relations).length > 0
  );

  // 2. Generate the type definition string for each of those collections.
  const allTypeStrings = collectionsWithRelations.map(generateTypesForCollection);

  // 3. Join all the individual type strings into a single file content.
  return allTypeStrings.join("\n");
}


export function createEnhancedPocketBase(
  collections: CollectionRecordWithRelations[]
): string {
  const responseTypeCases = collections
    .map((c, i) => {
      const responseType = toPascalCase(c.name) + "Response"

      const jsonGenerics = getGenericArgList(c).map(() => "unknown")
      const hasRelations = c.relations && Object.keys(c.relations).length > 0

      const allGenerics: string[] = [...jsonGenerics]
      if (hasRelations) {
        allGenerics.push("TExpand")
      }

      const prefix = i === 0 ? "" : "\t: "

      const genericsString = allGenerics.length > 0
        ? `<${allGenerics.join(", ")}>`
        : ""

      return `${prefix}TCollection extends Collections.${toPascalCase(c.name)}
		? ${responseType}${genericsString}`
    })
    .join("\n")

  const collectionOverloads = collections.map(c => {
    const collectionEnumName = toPascalCase(c.name);
    return `\tcollection(idOrName: Collections.${collectionEnumName}): EnhancedRecordService<Collections.${collectionEnumName}> & RecordService`
  }).join("\n")


  return `
// Helper type for dynamic response based on passed generics
type GetResponseType<
	TCollection extends Collections,
	TExpand extends string,
> = ${responseTypeCases}
	: never

${ENHANCED_RECORD_SERVICE_DEFINITION}

${TYPED_POCKETBASE_COMMENT}
export type TypedPocketBase = {
${collectionOverloads}
} & PocketBase
`
}
