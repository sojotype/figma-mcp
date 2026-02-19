import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { viteSingleFile } from "vite-plugin-singlefile";

const uiRoot = resolve(__dirname, "src/plugin/ui");
const distDir = resolve(__dirname, "dist");

export default defineConfig({
  root: uiRoot,
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    emptyOutDir: false,
    outDir: distDir,
  },
});
