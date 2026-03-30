#!/usr/bin/env node
/**
 * check-keys.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Compares en-US.json (the source of truth) against every other locale JSON.
 *
 * Detects:
 *   MISSING_KEY      – key exists in en-US but is absent in the locale file
 *   ORPHAN_KEY       – key exists in locale file but not in en-US (stale)
 *   UNTRANSLATED     – value still ends with the scaffold suffix (_de, _fr …)
 *   PARSE_ERROR      – locale JSON file is malformed
 *
 * Exit 1  if any MISSING or ORPHAN keys are found.
 * Writes  l10n-keys-report.json
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ── Config ───────────────────────────────────────────────────────────────────

const I18N_DIR        = path.resolve("src/assets/i18n");
const REFERENCE       = "en-US";
const REFERENCE_FILE  = path.join(I18N_DIR, `${REFERENCE}.json`);

// These keys hold format masks, not translatable text – exclude from diffing.
const SKIP_KEYS = new Set(["PhoneFormat", "ExtensionFormat"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively flatten a nested JSON object into dotted-path key → value pairs.
 * Arrays are represented as a single entry with value "__array__".
 */
function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SKIP_KEYS.has(k)) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      out[key] = "__array__";
    } else if (v !== null && typeof v === "object") {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

/**
 * Derive the expected scaffold suffix for a locale code.
 * e.g.  de-DE → _de   |   ar-SA → _ar   |   zh-CN → _zh
 */
function suffixFor(localeCode) {
  return `_${localeCode.split("-")[0].toLowerCase()}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(REFERENCE_FILE)) {
  console.error(`[FATAL] Reference file not found: ${REFERENCE_FILE}`);
  process.exit(1);
}

const refData  = JSON.parse(fs.readFileSync(REFERENCE_FILE, "utf8"));
const refKeys  = flatten(refData);
const refSet   = new Set(Object.keys(refKeys));

const localeFiles = fs
  .readdirSync(I18N_DIR)
  .filter(f => f.endsWith(".json") && !f.startsWith(REFERENCE) && !f.includes("/"));

const issues = [];
const stats  = {
  localesChecked:    0,
  totalMissingKeys:  0,
  totalOrphanKeys:   0,
  totalUntranslated: 0,
};

for (const file of localeFiles.sort()) {
  const localeCode = file.replace(".json", "");
  const filePath   = path.join(I18N_DIR, file);

  // ── Parse ─────────────────────────────────────────────────────────────────
  let localeData;
  try {
    localeData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    issues.push({
      locale:  localeCode,
      type:    "PARSE_ERROR",
      message: `${filePath}: ${e.message}`,
    });
    continue;
  }

  const localeKeys = flatten(localeData);
  const localeSet  = new Set(Object.keys(localeKeys));
  const suffix     = suffixFor(localeCode);
  const isEnglish  = localeCode.startsWith("en-"); // en-* shares en-US values legitimately

  const localeMissing      = [];
  const localeOrphans      = [];
  const localeUntranslated = [];

  // Missing keys
  for (const key of refSet) {
    if (!localeSet.has(key)) {
      localeMissing.push(key);
      stats.totalMissingKeys++;
    }
  }

  // Orphan keys
  for (const key of localeSet) {
    if (!refSet.has(key)) {
      localeOrphans.push(key);
      stats.totalOrphanKeys++;
    }
  }

  // Untranslated (scaffold suffix still present) – skip en-* locales
  if (!isEnglish) {
    for (const [key, val] of Object.entries(localeKeys)) {
      if (val !== "__array__" && String(val).endsWith(suffix)) {
        localeUntranslated.push({ key, value: val });
        stats.totalUntranslated++;
      }
    }
  }

  if (localeMissing.length || localeOrphans.length || localeUntranslated.length) {
    issues.push({
      locale:       localeCode,
      missing:      localeMissing,
      orphan:       localeOrphans,
      untranslated: localeUntranslated,
    });
  }

  stats.localesChecked++;
}

// ── Write report ──────────────────────────────────────────────────────────────

fs.writeFileSync(
  "l10n-keys-report.json",
  JSON.stringify({ check: "key-coverage", stats, issues }, null, 2)
);

// ── Console output ────────────────────────────────────────────────────────────

console.log(`\n[check-keys] ${stats.localesChecked} locales checked`);
console.log(`  Missing keys:    ${stats.totalMissingKeys}`);
console.log(`  Orphan keys:     ${stats.totalOrphanKeys}`);
console.log(`  Untranslated:    ${stats.totalUntranslated}  (scaffold suffix still present)`);

if (issues.length) {
  for (const issue of issues) {
    if (issue.type === "PARSE_ERROR") {
      console.log(`\n  ⛔  ${issue.message}`);
      continue;
    }
    console.log(`\n  [${issue.locale}]`);
    if (issue.missing?.length) {
      console.log(`    Missing (${issue.missing.length}): ${issue.missing.slice(0, 8).join(", ")}${issue.missing.length > 8 ? " …" : ""}`);
    }
    if (issue.orphan?.length) {
      console.log(`    Orphan  (${issue.orphan.length}): ${issue.orphan.slice(0, 8).join(", ")}${issue.orphan.length > 8 ? " …" : ""}`);
    }
    if (issue.untranslated?.length) {
      console.log(`    Untranslated: ${issue.untranslated.length} values`);
    }
  }
}

const hardErrors = stats.totalMissingKeys + stats.totalOrphanKeys;
process.exit(hardErrors > 0 ? 1 : 0);
