import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    exclude: [
      "test/pocketbase-types-example.ts",
      "test/integration/**",
      "dist/**",
      "node_modules/**",
    ],
  },
})
