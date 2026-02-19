import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../../dist/plugin",
    rolldownOptions: {
      output: {
        entryFileNames: "code.js",
      },
      input: "./api/main.ts",
    },
  },
});
