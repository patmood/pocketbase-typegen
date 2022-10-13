import { toPascalCase } from "../src/utils"

describe("toPascalCase", () => {
	it("return pascal case string", () => {
		expect(toPascalCase("foo bar")).toEqual("FooBar")
		expect(toPascalCase("Foo Bar")).toEqual("FooBar")
		expect(toPascalCase("fooBar")).toEqual("FooBar")
		expect(toPascalCase("FooBar")).toEqual("FooBar")
		expect(toPascalCase("--foo-bar--")).toEqual("FooBar")
		expect(toPascalCase("__FOO_BAR__")).toEqual("FooBar")
		expect(toPascalCase("!--foo-¿?-bar--121-**%")).toEqual("FooBar121")
		expect(toPascalCase("Here i am")).toEqual("HereIAm")
		expect(toPascalCase("FOO BAR")).toEqual("FooBar")
		expect(toPascalCase("ça.roule")).toEqual("ÇaRoule")
		expect(toPascalCase("добрий-день")).toEqual("ДобрийДень")
	})
})
