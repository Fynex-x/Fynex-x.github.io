#!/usr/bin/env node
/* build-data.js — regenerate the bundled reagents-data.json snapshot from a
 * local fish-station clone, using ONLY Node.js (no Python).
 *
 * Usage:
 *   node build-data.js [path-to-fs-repo] [output.json]
 *
 * If no repo path is given, the script does a shallow sparse clone of
 * https://github.com/makura-games/fish-station into ./fs-repo first.
 *
 * Reuses fs-parser.js (the same isomorphic parser the browser uses), so the
 * snapshot is guaranteed to match what the runtime fetch produces.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const FsParser = require("./fs-parser.js");

const REPO_URL = "https://github.com/makura-games/fish-station.git";
const REAGENT_DIR = "Resources/Prototypes/Reagents";
const REACTION_DIR = "Resources/Prototypes/Recipes/Reactions";
const LOCALE_DIRS = [
  "Resources/Locale/ru-RU/_strings/reagents/meta",
  "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta",
  "Resources/Locale/ru-RU/_strings/_fish/reagents",
];

// Recursively collect files under a directory (no external deps).
function walk(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function sh(cmd, cwd) {
  return execSync(cmd, { cwd: cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function ensureRepo(repoArg) {
  if (repoArg && fs.existsSync(path.join(repoArg, REAGENT_DIR))) return repoArg;
  const target = repoArg || path.join(process.cwd(), "fs-repo");
  if (!fs.existsSync(path.join(target, REAGENT_DIR))) {
    console.log("Sparse-cloning fish-station into", target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    execSync(`git clone --depth 1 --filter=blob:none --sparse "${REPO_URL}" "${target}"`,
      { stdio: "inherit" });
    execSync(
      `git sparse-checkout set ${REAGENT_DIR} ${REACTION_DIR} Resources/Locale/ru-RU`,
      { cwd: target, stdio: "inherit" });
  }
  return target;
}

function main() {
  const repoArg = process.argv[2];
  const outPath = process.argv[3] || path.join(__dirname, "reagents-data.json");
  const repo = ensureRepo(repoArg);

  // commit info
  let commit = "unknown", commitFull = "unknown", commitDate = "";
  try {
    commitFull = sh("git rev-parse HEAD", repo);
    commit = commitFull.substring(0, 7);
    commitDate = sh("git log -1 --format=%ci", repo);
  } catch (e) { /* git not available */ }

  // gather files
  const reagentFiles = walk(path.join(repo, REAGENT_DIR))
    .filter(f => f.endsWith(".yml"))
    .map(f => ({ path: path.relative(repo, f).replace(/\\/g, "/"), text: fs.readFileSync(f, "utf-8") }));
  const reactionFiles = walk(path.join(repo, REACTION_DIR))
    .filter(f => f.endsWith(".yml"))
    .map(f => ({ path: path.relative(repo, f).replace(/\\/g, "/"), text: fs.readFileSync(f, "utf-8") }));
  const localeFiles = LOCALE_DIRS
    .flatMap(d => walk(path.join(repo, d)))
    .filter(f => f.endsWith(".ftl"))
    .map(f => ({ path: path.relative(repo, f).replace(/\\/g, "/"), text: fs.readFileSync(f, "utf-8") }));

  console.log(`Files: ${reagentFiles.length} reagents, ${reactionFiles.length} reactions, ${localeFiles.length} locale`);

  const data = FsParser.buildData(
    { reagentFiles: reagentFiles, reactionFiles: reactionFiles, localeFiles: localeFiles },
    { commit: commit, commitDate: commitDate }
  );

  fs.writeFileSync(outPath, JSON.stringify(data, null, 1), "utf-8");
  console.log(`Wrote ${outPath}`);
  console.log(`  reagents: ${data.meta.reagentCount}, reactions: ${data.meta.reactionCount}, recipes: ${data.meta.recipeCount}, skipped: ${data.meta.skippedNonCrafting}`);
  console.log(`  categories: ${data.categoryOrder.join(", ")}`);
  console.log(`  commit: ${commit} (${commitDate})`);
}

main();