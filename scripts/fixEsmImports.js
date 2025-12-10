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

  // Handle imports using the alias '@/...'
  // Map '@/foo/bar' -> relative path from current file to dist/foo/bar.js (or /index.js if directory)
  content = content.replace(/from\s+["']@\/(.+?)["']/g, (match, aliasPath) => {
    const targetPathNoExt = path.join(distDir, aliasPath);
    let targetFull = "";
    if (fs.existsSync(targetPathNoExt) && fs.statSync(targetPathNoExt).isDirectory()) {
      targetFull = path.join(targetPathNoExt, "index.js");
    } else if (fs.existsSync(targetPathNoExt + ".js")) {
      targetFull = targetPathNoExt + ".js";
    } else if (fs.existsSync(targetPathNoExt + ".ts")) {
      // If only .ts exists in dist (unlikely), point to .js sibling
      targetFull = targetPathNoExt + ".js";
    } else {
      // Fallback: assume .js at target
      targetFull = targetPathNoExt + ".js";
    }

    let rel = path.relative(path.dirname(filePath), targetFull);
    // Use POSIX style for imports
    rel = rel.split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return `from "${rel}"`;
  });

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
