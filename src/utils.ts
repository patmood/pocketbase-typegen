export function toPascalCase(string) {
  return `${string}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w*)/, "g"),
      (_, $2, $3) => `${$2.toUpperCase() + $3}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase())
}

// describe('String to pascal case', function() {
//     it('should return a pascal cased string', function() {
//       chai.assert.equal(toPascalCase('foo bar'), 'FooBar');
//       chai.assert.equal(toPascalCase('Foo Bar'), 'FooBar');
//       chai.assert.equal(toPascalCase('fooBar'), 'FooBar');
//       chai.assert.equal(toPascalCase('FooBar'), 'FooBar');
//       chai.assert.equal(toPascalCase('--foo-bar--'), 'FooBar');
//       chai.assert.equal(toPascalCase('__FOO_BAR__'), 'FooBar');
//       chai.assert.equal(toPascalCase('!--foo-¿?-bar--121-**%'), 'FooBar121');
//       chai.assert.equal(toPascalCase('Here i am'), 'HereIAm');
//       chai.assert.equal(toPascalCase('FOO BAR'), 'FooBar');
//     });
//   });
