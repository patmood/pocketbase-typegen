import {
	createCollectionEnum,
	createRecordType,
	createTypeField,
	generate,
} from "../src/lib"

describe("generate", () => {
	it("generates correct output given db input", () => {
		const name = "books"
		const schema = JSON.stringify([
			{
				name: "title",
				type: "text",
				required: false,
			},
		])
		const result = generate([{ name, schema }])
		expect(result).toMatchSnapshot()
	})
})

describe("createCollectionEnum", () => {
	it("creates enum of collection names", () => {
		const names = ["book", "magazine"]
		expect(createCollectionEnum(names)).toMatchSnapshot()
	})
})

describe("createRecordType", () => {
	it("creates type definition for a record", () => {
		const name = "books"
		const schema = JSON.stringify([
			{
				system: false,
				id: "hhnwjkke",
				name: "title",
				type: "text",
				required: false,
				unique: false,
				options: { min: null, max: null, pattern: "" },
			},
		])
		const result = createRecordType(name, schema)
		expect(result).toMatchSnapshot()
	})
})

describe("createTypeField", () => {
	it("handles required and optional fields", () => {
		expect(createTypeField("name", true, "text")).toEqual("\tname: string;\n")
		expect(createTypeField("name", false, "text")).toEqual("\tname?: string;\n")
	})

	it("converts pocketbase schema types to typescript", () => {
		expect(createTypeField("name", true, "text")).toEqual("\tname: string;\n")
		expect(createTypeField("textField", true, "text")).toEqual(
			"\ttextField: string;\n"
		)
		expect(createTypeField("numberField", true, "number")).toEqual(
			"\tnumberField: number;\n"
		)
		expect(createTypeField("boolField", true, "bool")).toEqual(
			"\tboolField: boolean;\n"
		)
		expect(createTypeField("emailField", true, "email")).toEqual(
			"\temailField: string;\n"
		)
		expect(createTypeField("urlField", true, "url")).toEqual(
			"\turlField: string;\n"
		)
		expect(createTypeField("dateField", true, "date")).toEqual(
			"\tdateField: string;\n"
		)
		expect(createTypeField("selectField", true, "select")).toEqual(
			"\tselectField: string;\n"
		)
		expect(createTypeField("jsonField", true, "json")).toEqual(
			"\tjsonField: string;\n"
		)
		expect(createTypeField("fileField", true, "file")).toEqual(
			"\tfileField: string;\n"
		)
		expect(createTypeField("relationField", true, "relation")).toEqual(
			"\trelationField: string;\n"
		)
		expect(createTypeField("userField", true, "user")).toEqual(
			"\tuserField: string;\n"
		)
	})
})
