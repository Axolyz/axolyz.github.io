import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Work directly from the supplied JPEG: no generated/redrawn artwork.
const reference = fileURLToPath(new URL("../src/assets/brand/reference.jpeg", import.meta.url));
const { data, info } = await sharp(reference)
  .extract({ left: 530, top: 22, width: 235, height: 410 })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const background = new Uint8Array(width * height);
const queue = [];
function white(pixel) {
  const i = pixel * 4;
  return Math.min(data[i], data[i + 1], data[i + 2]) >= 240
    && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 18;
}
function neighbors(pixel, visit) {
  if (pixel % width) visit(pixel - 1);
  if (pixel % width < width - 1) visit(pixel + 1);
  if (pixel >= width) visit(pixel - width);
  if (pixel < width * (height - 1)) visit(pixel + width);
}
function addBackground(pixel) {
  if (!background[pixel] && white(pixel)) { background[pixel] = 1; queue.push(pixel); }
}
for (let x = 0; x < width; x++) { addBackground(x); addBackground((height - 1) * width + x); }
for (let y = 0; y < height; y++) { addBackground(y * width); addBackground(y * width + width - 1); }
for (let i = 0; i < queue.length; i++) neighbors(queue[i], addBackground);
// Keep the connected doll, excluding fragments of the large figure at left.
// Interior whites (collar/apron) are not edge-connected and remain opaque.
const doll = new Uint8Array(width * height);
const foreground = [(180 - 22) * width + (650 - 530)];
doll[foreground[0]] = 1;
for (let i = 0; i < foreground.length; i++) neighbors(foreground[i], pixel => {
  if (!background[pixel] && !doll[pixel]) { doll[pixel] = 1; foreground.push(pixel); }
});
for (let pixel = 0; pixel < doll.length; pixel++) data[pixel * 4 + 3] = doll[pixel] ? 255 : 0;
const cutout = await sharp(data, { raw: info }).png().toBuffer();
await writeFile(new URL("../src/assets/brand/doll.png", import.meta.url), cutout);
// Retain the bow, head, hands, torso and apron; omit the small legs/feet.
const source = await sharp(cutout).extract({ left: 0, top: 0, width, height: 355 })
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
