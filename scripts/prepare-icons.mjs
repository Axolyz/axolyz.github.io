import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Remove transparent margins, then scale proportionally to fill the vertical axis.
const input = fileURLToPath(new URL("../src/assets/brand/favicon-doll.png", import.meta.url));
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * 4 + 3] >= 16) {
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
}
if (right < left || bottom < top) throw new Error("The favicon source is empty");
if (right - left > bottom - top) throw new Error("Use a portrait-shaped source to fill the height without cropping");
const source = await sharp(input).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .resize(512, 512, { fit: "contain", background: "#00000000" }).png().toBuffer();
const sizes = [16, 32, 48, 64, 128, 256];
const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size, { fit: "contain", background: "#00000000" }).png().toBuffer()));
// ICO supports PNG-encoded entries, preserving transparency at every size.
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (let i = 0; i < sizes.length; i++) {
  const entry = 6 + i * 16;
  header[entry] = header[entry + 1] = sizes[i] % 256;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
}
await writeFile(new URL("../public/favicon.ico", import.meta.url), Buffer.concat([header, ...images]));
await sharp(source).resize(32, 32).png().toFile(new URL("../public/favicon-32.png", import.meta.url).pathname);
await sharp(source).resize(512, 512).png().toFile(new URL("../public/favicon.png", import.meta.url).pathname);
await sharp(source).resize(180, 180).png().toFile(new URL("../public/apple-touch-icon.png", import.meta.url).pathname);
console.log("Prepared transparent favicon.ico (16–256px), favicon.png and apple-touch-icon.png.");
