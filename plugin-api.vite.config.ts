import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rolldownOptions: {
      output: {
        entryFileNames: "code.js",
      },
      input: "./src/plugin/api/main.ts",
    },
  },
});
