#!/usr/bin/env node
/**
 * Post-build script: Add .js extensions to relative imports in ESM output.
 * This ensures Node.js can resolve ESM imports at runtime.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../server/dist");

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Match relative imports and add .js if not already present
  // Handles: from "../functions/scrape" -> from "../functions/scrape.js"
  content = content.replace(
    /from\s+["'](\.[./][^"']*?)(?<!\.js)(?<!\.json)["']/g,
    'from "$1.js"',
  );

  fs.writeFileSync(filePath, content, "utf-8");
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith(".js")) {
      fixImportsInFile(fullPath);
    }
  }
}

walkDir(distDir);
console.log("✓ ESM imports fixed with .js extensions");
