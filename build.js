const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const UPSTREAM_DIR = path.join(ROOT, "upstream");
const DIST_DIR = path.join(ROOT, "dist");
const PATCHES_DIR = path.join(ROOT, "patches");

function log(msg) {
  console.log(`[build] ${msg}`);
}

function clean() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  log("Cleaned dist/");
}

function getUpstreamVersion() {
  const pkgPath = path.join(UPSTREAM_DIR, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      return JSON.parse(fs.readFileSync(pkgPath, "utf8")).version || "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function applyPatches() {
  if (!fs.existsSync(PATCHES_DIR)) return;
  const patches = fs
    .readdirSync(PATCHES_DIR)
    .filter((f) => f.endsWith(".json"));
  for (const patchFile of patches) {
    const patch = JSON.parse(
      fs.readFileSync(path.join(PATCHES_DIR, patchFile), "utf8"),
    );
    log(`Applying patch: ${patchFile}`);
    for (const op of patch.operations) {
      const targetPath = path.join(UPSTREAM_DIR, op.file);
      if (op.action === "replace") {
        fs.writeFileSync(targetPath, op.content);
        log(`  Replaced: ${op.file}`);
      } else if (op.action === "merge-json") {
        const existing = JSON.parse(fs.readFileSync(targetPath, "utf8"));
        const merged = deepMerge(existing, op.content);
        fs.writeFileSync(targetPath, JSON.stringify(merged, null, 4));
        log(`  Merged JSON: ${op.file}`);
      }
    }
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (Array.isArray(source[key])) {
      result[key] = [...new Set([...(result[key] || []), ...source[key]])];
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function buildWithEsbuild() {
  log("Building with esbuild...");
  try {
    execSync(
      "npx esbuild src/content/index.js --bundle --outfile=dist/content.js --keep-names --minify-syntax",
      { cwd: UPSTREAM_DIR, stdio: "inherit" },
    );
    execSync(
      "npx esbuild src/background/background.js --bundle --outfile=dist/background.js --keep-names --minify-syntax",
      { cwd: UPSTREAM_DIR, stdio: "inherit" },
    );
    log("esbuild complete");
  } catch (e) {
    log("esbuild failed, copying source directly");
    copyDir(path.join(UPSTREAM_DIR, "src"), path.join(DIST_DIR, "src"));
  }
}

function compileScss() {
  log("Compiling SCSS...");
  const cssDir = path.join(UPSTREAM_DIR, "src", "css");
  if (!fs.existsSync(cssDir)) return;

  try {
    execSync(
      `npx sass src/css/main.scss:dist/css/rovalra.css src/css/sitewide.scss:dist/css/sitewide.css --style=compressed --no-source-map`,
      { cwd: UPSTREAM_DIR, stdio: "inherit" },
    );
    log("SCSS compiled");
  } catch (e) {
    log("SCSS compile failed (non-fatal)");
  }
}

function copyStaticAssets() {
  log("Copying static assets...");

  const dirs = ["public", "assets", "rules"];
  for (const d of dirs) {
    const src = path.join(ROOT, d);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(DIST_DIR, d));
    }
  }

  const upstreamDirs = ["public", "assets"];
  for (const d of upstreamDirs) {
    const src = path.join(UPSTREAM_DIR, d);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(DIST_DIR, d));
    }
  }
}

function writeFirefoxManifest() {
  log("Writing Firefox manifest...");
  const ffManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"),
  );
  const version = getUpstreamVersion();
  ffManifest.version = version;

  const dnrPath = path.join(ROOT, "rules", "csp-bypass.json");
  if (fs.existsSync(dnrPath)) {
    const rulesDir = path.join(DIST_DIR, "rules");
    if (!fs.existsSync(rulesDir)) fs.mkdirSync(rulesDir, { recursive: true });
    fs.copyFileSync(dnrPath, path.join(rulesDir, "csp-bypass.json"));
  }

  const contentScripts = ffManifest.content_scripts || [];
  contentScripts.unshift({
    matches: ["*://*.roblox.com/*"],
    js: ["src/content/core/firefox/compat.js"],
    run_at: "document_start",
    all_frames: false,
  });

  fs.writeFileSync(
    path.join(DIST_DIR, "manifest.json"),
    JSON.stringify(ffManifest, null, 4),
  );
}

function build() {
  clean();

  if (!fs.existsSync(UPSTREAM_DIR)) {
    log("No upstream source found. Run: git clone https://github.com/NotValra/RoValra upstream");
    log("Or the CI workflow will handle this automatically.");
    process.exit(1);
  }

  applyPatches();
  buildWithEsbuild();
  compileScss();
  copyStaticAssets();
  writeFirefoxManifest();

  log(`Build complete! Version: ${getUpstreamVersion()}`);
  log(`Output: ${DIST_DIR}`);
}

build();
