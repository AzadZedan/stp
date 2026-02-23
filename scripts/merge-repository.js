const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDED_DIR_NAMES = new Set([
  ".git",
  "node_modules",
  "actions-runner",
  "git",
  "dist"
]);

function isExcluded(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  if (parts.includes("artifacts") && parts.includes("merged")) return true;
  return parts.some((p) => EXCLUDED_DIR_NAMES.has(p));
}

function listFilesRecursively(dir, bucket = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, "/");
    if (isExcluded(rel)) continue;

    if (entry.isDirectory()) {
      listFilesRecursively(full, bucket);
      continue;
    }

    if (!entry.isFile()) continue;
    bucket.push({ full, rel });
  }
  return bucket;
}

function readUtf8File(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function sha256(content) {
  return require("crypto").createHash("sha256").update(content).digest("hex");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function detectExtension(rel) {
  const ext = path.extname(rel).toLowerCase();
  return ext || "[noext]";
}

function main() {
  const now = new Date().toISOString();
  const outputRoot = path.join(ROOT, "artifacts", "merged");
  const extensionRoot = path.join(outputRoot, "extensions");
  ensureDir(extensionRoot);

  const includeExtensions = new Set([
    ".js",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".toml",
    ".sh",
    ".ps1",
    ".txt",
    ".html",
    ".css",
    ".py",
    ".ts",
    ".tf",
    ".hcl",
    ".cjs",
    ".bat",
    "[noext]"
  ]);

  const allFiles = listFilesRecursively(ROOT)
    .filter((f) => includeExtensions.has(detectExtension(f.rel)))
    .sort((a, b) => a.rel.localeCompare(b.rel));

  const byExtension = new Map();
  const records = [];

  for (const file of allFiles) {
    let content;
    try {
      content = readUtf8File(file.full);
    } catch (_e) {
      continue;
    }

    const ext = detectExtension(file.rel);
    if (!byExtension.has(ext)) byExtension.set(ext, []);

    const stat = fs.statSync(file.full);
    const record = {
      path: file.rel,
      extension: ext,
      size: stat.size,
      hash: sha256(content),
      content
    };

    byExtension.get(ext).push(record);
    records.push(record);
  }

  const mergedFiles = [];

  for (const [ext, items] of Array.from(byExtension.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const extName = ext === "[noext]" ? "noext" : ext.slice(1);
    const outPath = path.join(extensionRoot, `${extName}.merged.txt`);

    let merged = "";
    merged += `# Merged extension: ${ext}\n`;
    merged += `# Generated at: ${now}\n`;
    merged += `# File count: ${items.length}\n\n`;

    for (const item of items) {
      merged += `\n\n===== FILE: ${item.path} =====\n`;
      merged += item.content;
      if (!item.content.endsWith("\n")) merged += "\n";
    }

    fs.writeFileSync(outPath, merged, "utf8");
    mergedFiles.push(path.relative(ROOT, outPath).replace(/\\/g, "/"));
  }

  const pullRequestCandidates = records.filter((r) => {
    const p = r.path.toLowerCase();
    return (
      p.includes("pull_request") ||
      /(^|\/)pr\d+/.test(p) ||
      p.includes("merge_resolution") ||
      p.includes("resolution_summary")
    );
  });

  let prDocument = "# Pull Request and Merge Records\n\n";
  prDocument += `Generated at: ${now}\n\n`;

  if (pullRequestCandidates.length === 0) {
    prDocument += "No PR-related files were detected in the selected scope.\n";
  } else {
    for (const pr of pullRequestCandidates.sort((a, b) => a.path.localeCompare(b.path))) {
      prDocument += `\n\n## ${pr.path}\n\n`;
      prDocument += pr.content;
      if (!pr.content.endsWith("\n")) prDocument += "\n";
    }
  }

  fs.writeFileSync(path.join(outputRoot, "pull-requests.md"), prDocument, "utf8");

  const unifiedRepository = {
    generatedAt: now,
    scope: {
      root: ROOT,
      includedExtensions: Array.from(includeExtensions),
      excludedDirectoryNames: Array.from(EXCLUDED_DIR_NAMES),
      excludedGeneratedPath: "artifacts/merged"
    },
    stats: {
      files: records.length,
      extensions: Array.from(byExtension.keys()).sort(),
      mergedFiles: mergedFiles.length,
      prFiles: pullRequestCandidates.length
    },
    pullRequests: pullRequestCandidates.map((r) => ({
      path: r.path,
      extension: r.extension,
      size: r.size,
      hash: r.hash,
      content: r.content
    })),
    files: records
  };

  fs.writeFileSync(
    path.join(outputRoot, "repository-unified.json"),
    JSON.stringify(unifiedRepository, null, 2),
    "utf8"
  );

  const summary = {
    generatedAt: now,
    mergedFiles,
    totalFiles: records.length,
    byExtension: Array.from(byExtension.entries())
      .map(([ext, files]) => ({ extension: ext, count: files.length }))
      .sort((a, b) => b.count - a.count)
  };

  fs.writeFileSync(path.join(outputRoot, "merge-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  console.log("Merge completed.");
  console.log(`Files indexed: ${records.length}`);
  console.log(`Extension bundles: ${mergedFiles.length}`);
  console.log(`PR files merged: ${pullRequestCandidates.length}`);
}

main();
