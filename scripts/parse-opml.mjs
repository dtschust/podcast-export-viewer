#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { parseOpmlToPodcasts } from "../src/utils/parseOpml.mjs";

const [, , filePath] = process.argv;

if (!filePath) {
  console.error("Usage: node scripts/parse-opml.mjs <path-to-opml>");
  process.exit(1);
}

try {
  const opmlText = await readFile(filePath, "utf8");
  const podcasts = parseOpmlToPodcasts(opmlText);
  console.log(JSON.stringify(podcasts, null, 2));
} catch (error) {
  console.error(`Failed to parse OPML: ${error.message}`);
  process.exitCode = 1;
}
