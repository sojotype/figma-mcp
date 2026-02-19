import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const watchedFiles = [resolve(distDir, "code.js"), resolve(distDir, "ui.html")];

const mtimes = new Map<string, number>();
let running = false;

const regenerateManifest = () => {
  if (running) {
    return;
  }

  running = true;
  try {
    execFileSync("bun", ["scripts/generate-manifest.ts"], { stdio: "inherit" });
    console.log("manifest.json regenerated");
  } finally {
    running = false;
  }
};

const checkChanges = () => {
  let changed = false;

  for (const file of watchedFiles) {
    if (!existsSync(file)) {
      continue;
    }

    const { mtimeMs } = statSync(file);
    if (mtimeMs > (mtimes.get(file) ?? 0)) {
      mtimes.set(file, mtimeMs);
      changed = true;
    }
  }

  if (changed) {
    regenerateManifest();
  }
};

setInterval(checkChanges, 500);
checkChanges();
