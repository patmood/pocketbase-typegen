export function toPascalCase(str: string) {
  if (/^[\p{L}\d]+$/iu.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  return str
    .replace(
      /([\p{L}\d])([\p{L}\d]*)/giu,
      (g0: string, g1: string, g2: string) =>
        g1.toUpperCase() + g2.toLowerCase()
    )
    .replace(/[^\p{L}\d]/giu, "")
}

export function sanitizeFieldName(name: string) {
  // If the first character is a number, wrap it in quotes to pass typecheck
  return !isNaN(parseFloat(name.charAt(0))) ? `"${name}"` : name
}
