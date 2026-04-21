import esbuild from "esbuild"
import { nodeExternalsPlugin } from "esbuild-node-externals"
esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    treeShaking: true,
    platform: "node",
    format: "esm",
    target: "node18",
    external: ["bun:sqlite"],
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1))
