import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { viteSingleFile } from "vite-plugin-singlefile";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const uiRoot = resolve(__dirname, "ui");
const distDir = resolve(__dirname, "../../dist/plugin");

export default defineConfig({
  root: uiRoot,
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    emptyOutDir: false,
    outDir: distDir,
  },
});
