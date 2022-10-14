import esbuild from "esbuild"
import { nodeExternalsPlugin } from "esbuild-node-externals"
esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    minify: false,
    treeShaking: true,
    platform: "node",
    format: "cjs",
    target: "node14",
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1))

// esbuild src/index.ts --bundle --outfile=dist/index.js --external:./node_modules/* --format=esm --platform=node
