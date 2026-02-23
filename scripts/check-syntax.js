const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set([".git", "node_modules", "actions-runner", "git", "dist", "artifacts"]);

function shouldSkip(relPath) {
  return relPath.split(path.sep).some((part) => EXCLUDED_DIRS.has(part));
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (shouldSkip(rel)) continue;

    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && full.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT).sort();
const failures = [];

for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    failures.push({ file, message: String(error.stderr || error.message) });
  }
}

if (failures.length > 0) {
  console.error("Syntax check failed:");
  for (const f of failures) {
    console.error(`- ${path.relative(ROOT, f.file)}\n${f.message}`);
  }
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
