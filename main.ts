// nov20-frontpage: copies the front-page image to the output directory.
//
// The image itself is the entry: a 1024x1024 PNG summing up the world's
// news of Friday 20 November 2026. This program only validates it and
// copies it, so both runs write byte-identical output. Node 22, standard
// library only, no network.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

const MAX_BYTES = 1048576; // 1 MiB
const MAX_DIM = 1024;

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIG)) {
  throw new Error("entry.png is not a PNG");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_DIM || height > MAX_DIM) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
if (statSync(target).size !== bytes.length) {
  throw new Error("output size does not match entry.png");
}
const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error("output does not match entry.png");
}
console.log(`wrote ${target} (${written.length} bytes, ${width}x${height})`);
