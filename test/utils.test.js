"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
describe("toPascalCase", () => {
    it("return pascal case string", () => {
        expect((0, utils_1.toPascalCase)("foo bar")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("Foo Bar")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("fooBar")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("FooBar")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("--foo-bar--")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("__FOO_BAR__")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("!--foo-¿?-bar--121-**%")).toEqual("FooBar121");
        expect((0, utils_1.toPascalCase)("Here i am")).toEqual("HereIAm");
        expect((0, utils_1.toPascalCase)("FOO BAR")).toEqual("FooBar");
        expect((0, utils_1.toPascalCase)("ça.roule")).toEqual("ÇaRoule");
        expect((0, utils_1.toPascalCase)("добрий-день")).toEqual("ДобрийДень");
    });
});
