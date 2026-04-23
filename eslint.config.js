import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "sort-keys": ["warn", "asc", { allowLineSeparatedGroups: true }],
    },
  },
  {
    files: ["test/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "pocketbase-types.ts",
      "test/pocketbase-types-example.ts",
      "test/integration/**",
    ],
  },
)
