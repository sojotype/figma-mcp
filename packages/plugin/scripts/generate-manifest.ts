import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { manifest } from "../figma.manifest";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(scriptDir, "../../..");
const distPath = resolve(projectRoot, "dist", "plugin");

mkdirSync(distPath, { recursive: true });
writeFileSync(
  resolve(distPath, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);
