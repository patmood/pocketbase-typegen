"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../src/lib");
describe("generate", () => {
    it("generates correct output given db input", () => {
        const name = "books";
        const schema = JSON.stringify([
            {
                name: "title",
                type: "text",
                required: false,
            },
        ]);
        const result = (0, lib_1.generate)([{ name, schema }]);
        expect(result).toMatchSnapshot();
    });
});
describe("createCollectionEnum", () => {
    it("creates enum of collection names", () => {
        const names = ["book", "magazine"];
        expect((0, lib_1.createCollectionEnum)(names)).toMatchSnapshot();
    });
});
describe("createRecordType", () => {
    it("creates type definition for a record", () => {
        const name = "books";
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
        ]);
        const result = (0, lib_1.createRecordType)(name, schema);
        expect(result).toMatchSnapshot();
    });
});
describe("createTypeField", () => {
    it("handles required and optional fields", () => {
        expect((0, lib_1.createTypeField)("name", true, "text")).toEqual("\tname: string;\n");
        expect((0, lib_1.createTypeField)("name", false, "text")).toEqual("\tname?: string;\n");
    });
    it("converts pocketbase schema types to typescript", () => {
        expect((0, lib_1.createTypeField)("name", true, "text")).toEqual("\tname: string;\n");
        expect((0, lib_1.createTypeField)("textField", true, "text")).toEqual("\ttextField: string;\n");
        expect((0, lib_1.createTypeField)("numberField", true, "number")).toEqual("\tnumberField: number;\n");
        expect((0, lib_1.createTypeField)("boolField", true, "bool")).toEqual("\tboolField: boolean;\n");
        expect((0, lib_1.createTypeField)("emailField", true, "email")).toEqual("\temailField: string;\n");
        expect((0, lib_1.createTypeField)("urlField", true, "url")).toEqual("\turlField: string;\n");
        expect((0, lib_1.createTypeField)("dateField", true, "date")).toEqual("\tdateField: string;\n");
        expect((0, lib_1.createTypeField)("selectField", true, "select")).toEqual("\tselectField: string;\n");
        expect((0, lib_1.createTypeField)("jsonField", true, "json")).toEqual("\tjsonField: string;\n");
        expect((0, lib_1.createTypeField)("fileField", true, "file")).toEqual("\tfileField: string;\n");
        expect((0, lib_1.createTypeField)("relationField", true, "relation")).toEqual("\trelationField: string;\n");
        expect((0, lib_1.createTypeField)("userField", true, "user")).toEqual("\tuserField: string;\n");
    });
});
