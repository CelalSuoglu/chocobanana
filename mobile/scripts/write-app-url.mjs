// Writes the site URL the offline page retries against, so test builds that
// point at a Vercel Preview retry the same address (no secrets here).
import { writeFileSync } from "node:fs";
const url = (process.env.CHOCO_APP_URL || "https://thechocobananaclub.com").replace(/\/$/, "");
writeFileSync(new URL("../www/app-url.js", import.meta.url), `window.CHOCO_APP_URL = ${JSON.stringify(url)};\n`);
console.log(`App URL: ${url}`);
