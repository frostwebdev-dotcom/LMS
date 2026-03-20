import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = join(root, "public", "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.warn("copy-pdf-worker: pdf.worker.min.mjs not found (skip)");
  process.exit(0);
}
mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(src, dest);
console.log("copy-pdf-worker: public/pdf.worker.min.mjs updated");
