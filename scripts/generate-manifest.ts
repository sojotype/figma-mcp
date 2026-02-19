import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { manifest } from "../src/plugin/figma.manifest";

const distPath = resolve("dist");

mkdirSync(distPath, { recursive: true });
writeFileSync(
  resolve(distPath, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);
