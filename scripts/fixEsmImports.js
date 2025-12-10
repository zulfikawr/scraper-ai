#!/usr/bin/env node
/**
 * Post-build script: Add .js extensions to relative imports in ESM output.
 * This ensures Node.js can resolve ESM imports at runtime.
 * Also converts directory imports to ./dir/index.js format.
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
    (match, importPath) => {
      // Check if the import path (without .js) is a directory in dist
      const fullPath = path.join(path.dirname(filePath), importPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        // It's a directory, import from index.js
        return `from "${importPath}/index.js"`;
      }
      // It's a file, add .js extension
      return `from "${importPath}.js"`;
    },
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
console.log("✓ ESM imports fixed with .js extensions and directory/index.js paths");
