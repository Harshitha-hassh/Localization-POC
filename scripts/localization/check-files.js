#!/usr/bin/env node
/**
 * check-files.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies that every locale discovered in src/assets/i18n/ has the three
 * required companion files:
 *
 *   src/assets/errors/error.{locale}.json          ← hard requirement
 *   src/assets/userAlerts/alerts.{locale}.json     ← hard requirement
 *   src/assets/i18n/DataSource/{locale}.ContactTypes.json  ← warn only
 *
 * Also validates:
 *   - Error/alert files are valid JSON
 *   - Alert files are arrays (as the app expects)
 *   - No orphan error/alert files whose locale has no main i18n file
 *
 * Exit 1  if any hard-requirement files are missing.
 * Writes  l10n-files-report.json
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ── Paths ─────────────────────────────────────────────────────────────────────

const I18N_DIR      = path.resolve("src/assets/i18n");
const ERRORS_DIR    = path.resolve("src/assets/errors");
const ALERTS_DIR    = path.resolve("src/assets/userAlerts");
const DS_DIR        = path.resolve("src/assets/i18n/DataSource");

// ── Discover locales ──────────────────────────────────────────────────────────

/**
 * All *.json files directly in I18N_DIR, excluding special files.
 */
const localeFiles = fs
  .readdirSync(I18N_DIR)
  .filter(f =>
    f.endsWith(".json") &&
    !f.includes("Countries") &&
    !f.includes("DataSource")
  )
  .sort();

const locales = localeFiles.map(f => f.replace(".json", ""));

// ── Helper ────────────────────────────────────────────────────────────────────

function tryParseJSON(filePath) {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const issues = [];
const stats  = {
  localesChecked:        0,
  missingErrorFiles:     0,
  missingAlertFiles:     0,
  invalidJSON:           0,
  alertNotArray:         0,
  missingContactTypes:   0,   // warn-only
  orphanErrorFiles:      0,
  orphanAlertFiles:      0,
};

for (const locale of locales) {
  const locIssues = { locale, problems: [] };

  // ── error.{locale}.json ────────────────────────────────────────────────────
  const errorPath = path.join(ERRORS_DIR, `error.${locale}.json`);
  if (!fs.existsSync(errorPath)) {
    locIssues.problems.push({
      severity: "error",
      type:     "MISSING_ERROR_FILE",
      path:     `src/assets/errors/error.${locale}.json`,
      message:  "Error captions file not found – 404 at runtime",
    });
    stats.missingErrorFiles++;
  } else {
    const { ok, error } = tryParseJSON(errorPath);
    if (!ok) {
      locIssues.problems.push({
        severity: "error",
        type:     "INVALID_JSON",
        path:     errorPath,
        message:  error,
      });
      stats.invalidJSON++;
    }
  }

  // ── alerts.{locale}.json ───────────────────────────────────────────────────
  const alertsPath = path.join(ALERTS_DIR, `alerts.${locale}.json`);
  if (!fs.existsSync(alertsPath)) {
    locIssues.problems.push({
      severity: "error",
      type:     "MISSING_ALERTS_FILE",
      path:     `src/assets/userAlerts/alerts.${locale}.json`,
      message:  "Alert messages file not found – 404 at runtime",
    });
    stats.missingAlertFiles++;
  } else {
    const { ok, data, error } = tryParseJSON(alertsPath);
    if (!ok) {
      locIssues.problems.push({
        severity: "error",
        type:     "INVALID_JSON",
        path:     alertsPath,
        message:  error,
      });
      stats.invalidJSON++;
    } else if (!Array.isArray(data)) {
      locIssues.problems.push({
        severity: "error",
        type:     "ALERTS_NOT_ARRAY",
        path:     alertsPath,
        message:  `getUserAlerts() expects an array, found ${typeof data}`,
      });
      stats.alertNotArray++;
    }
  }

  // ── {locale}.ContactTypes.json ─────────────────────────────────────────────
  const ctPath = path.join(DS_DIR, `${locale}.ContactTypes.json`);
  if (!fs.existsSync(ctPath)) {
    locIssues.problems.push({
      severity: "warn",
      type:     "MISSING_CONTACT_TYPES",
      path:     `src/assets/i18n/DataSource/${locale}.ContactTypes.json`,
      message:  "Contact type dropdown will be empty or use en-US fallback",
    });
    stats.missingContactTypes++;
  }

  if (locIssues.problems.length > 0) issues.push(locIssues);
  stats.localesChecked++;
}

// ── Orphan error files ────────────────────────────────────────────────────────

const localeSet = new Set(locales);

for (const f of fs.readdirSync(ERRORS_DIR)) {
  if (!f.startsWith("error.") || !f.endsWith(".json")) continue;
  const locale = f.replace("error.", "").replace(".json", "");
  if (!localeSet.has(locale)) {
    issues.push({
      locale,
      problems: [{
        severity: "warn",
        type:     "ORPHAN_ERROR_FILE",
        path:     `src/assets/errors/${f}`,
        message:  "Error file exists but no matching i18n locale JSON",
      }],
    });
    stats.orphanErrorFiles++;
  }
}

for (const f of fs.readdirSync(ALERTS_DIR)) {
  if (!f.startsWith("alerts.") || !f.endsWith(".json")) continue;
  const locale = f.replace("alerts.", "").replace(".json", "");
  if (!localeSet.has(locale)) {
    issues.push({
      locale,
      problems: [{
        severity: "warn",
        type:     "ORPHAN_ALERTS_FILE",
        path:     `src/assets/userAlerts/${f}`,
        message:  "Alert file exists but no matching i18n locale JSON",
      }],
    });
    stats.orphanAlertFiles++;
  }
}

// ── Write report ──────────────────────────────────────────────────────────────

fs.writeFileSync(
  "l10n-files-report.json",
  JSON.stringify({ check: "file-coverage", stats, issues }, null, 2)
);

// ── Console output ────────────────────────────────────────────────────────────

console.log(`\n[check-files] ${stats.localesChecked} locales checked`);
console.log(`  Missing error files:      ${stats.missingErrorFiles}  ← hard error`);
console.log(`  Missing alerts files:     ${stats.missingAlertFiles}  ← hard error`);
console.log(`  Invalid JSON files:       ${stats.invalidJSON}  ← hard error`);
console.log(`  Alerts not array:         ${stats.alertNotArray}  ← hard error`);
console.log(`  Missing ContactTypes:     ${stats.missingContactTypes}  (warn – only 8 of 55 supported)`);
console.log(`  Orphan error/alert files: ${stats.orphanErrorFiles + stats.orphanAlertFiles}  (warn)`);

if (issues.length) {
  for (const { locale, problems } of issues) {
    console.log(`\n  [${locale}]`);
    for (const p of problems) {
      const icon = p.severity === "error" ? "⛔" : "⚠️ ";
      console.log(`    ${icon}  ${p.type}: ${p.message}`);
    }
  }
}

const hardErrors = stats.missingErrorFiles + stats.missingAlertFiles +
                   stats.invalidJSON + stats.alertNotArray;
process.exit(hardErrors > 0 ? 1 : 0);
