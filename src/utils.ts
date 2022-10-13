export function toPascalCase(str) {
  if (/^[\p{L}\d]+$/iu.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  return str
    .replace(
      /([\p{L}\d])([\p{L}\d]*)/giu,
      (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
    )
    .replace(/[^\p{L}\d]/giu, "")
}
