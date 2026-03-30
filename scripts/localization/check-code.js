#!/usr/bin/env node
/**
 * check-code.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans Angular component HTML and TypeScript files for localization
 * anti-patterns, based on the app's own Automation Checklist (section 17).
 *
 * HTML rules (*.component.html):
 *   HARDCODED_DATE_PIPE         – | date:'...'  instead of | localizeDate
 *   HARDCODED_CURRENCY_SYMBOL   – literal $, €, £, ¥, ₹, ₩, ฿ in templates
 *   DOLLAR_BEFORE_INTERPOLATION – ${{ value }}
 *
 * TypeScript rules (*.component.ts, *.service.ts):
 *   TOFIXED_USAGE               – .toFixed(n) instead of .customToFixed()
 *   HARDCODED_MOMENT_FORMAT     – moment(x).format('MM/DD/YYYY') etc.
 *   PARSEFLOAT_ON_INPUT         – parseFloat() on likely user-input variables
 *                                 without currencyToSQLFormat
 *
 * Severity:
 *   error  → exits 1, blocks PR
 *   warn   → logged but does not exit 1
 *
 * Writes  l10n-code-report.json
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ── Rule definitions ──────────────────────────────────────────────────────────

const HTML_RULES = [
  {
    id:          "HARDCODED_DATE_PIPE",
    severity:    "error",
    description: "Angular | date: pipe with hardcoded format – use | localizeDate instead",
    // Matches:  | date:'MM/dd/yyyy'   |  date: "LLL"
    pattern:     /\|\s*date\s*:\s*['"][^'"]{2,}['"]/,
  },
  {
    id:          "HARDCODED_CURRENCY_SYMBOL",
    severity:    "error",
    description: "Hardcoded currency symbol – use | Currency pipe or localizeCurrency()",
    // Matches a currency symbol NOT inside a comment and NOT inside a class/id attr value
    pattern:     /(?<!=["'a-zA-Z])[$€£¥₹₩฿](?=\s*[\d{])/,
  },
  {
    id:          "DOLLAR_BEFORE_INTERPOLATION",
    severity:    "error",
    description: "$ hardcoded before {{ interpolation }} – symbol should come from localizeCurrency()",
    pattern:     /\$\s*\{\{/,
  },
];

const TS_RULES = [
  {
    id:          "TOFIXED_USAGE",
    severity:    "error",
    description: ".toFixed() used instead of .customToFixed() – breaks Bankers rounding & noOfDecimalDigits config",
    // Matches .toFixed( but NOT .customToFixed(
    pattern:     /(?<!custom)\.toFixed\(\d*\)/,
  },
  {
    id:          "HARDCODED_MOMENT_FORMAT",
    severity:    "error",
    description: "Hardcoded date format in moment().format() – use localization.dateFormat or LocalizeShortDate()",
    // Matches moment(...).format('MM/DD/YYYY') style – letters, slashes, dashes, dots
    pattern:     /moment\([^)]*\)\.format\(\s*['"][A-Za-z\/\-\.]{4,}['"]\s*\)/,
  },
  {
    id:          "PARSEFLOAT_ON_INPUT",
    severity:    "warn",
    description: "parseFloat() on a likely user-facing value – should pass through currencyToSQLFormat() first",
    // Heuristic: parseFloat on a variable whose name suggests it's money/amount
    pattern:     /parseFloat\(\s*(?:this\.)?\w*(?:amount|currency|price|cost|total|balance|rate|value|fee|charge|tax)\w*\s*\)/i,
  },
];

// ── File walker ───────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "coverage",
  "eatecui",   // eatecui uses @ngx-translate – different rules apply
]);

function walkDir(dir, exts, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkDir(full, exts, results);
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// ── Per-file scanner ──────────────────────────────────────────────────────────

/**
 * Returns an array of finding objects for a single file.
 */
function scanFile(filePath, rules) {
  const content  = fs.readFileSync(filePath, "utf8");
  const lines    = content.split("\n");
  const findings = [];

  for (const rule of rules) {
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Skip obvious comment lines
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("<!--")
      ) return;

      if (rule.pattern.test(line)) {
        const match = line.match(rule.pattern);
        findings.push({
          ruleId:      rule.id,
          severity:    rule.severity,
          description: rule.description,
          lineNumber:  idx + 1,
          matchedText: match ? match[0].trim() : "",
          snippet:     trimmed.slice(0, 120),
        });
      }
    });
  }
  return findings;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const APP_DIR = path.resolve("src/app");
const fileIssues = [];
const stats = {
  htmlScanned: 0,
  tsScanned:   0,
  errors:      0,
  warnings:    0,
};

// HTML
for (const f of walkDir(APP_DIR, [".component.html"])) {
  const findings = scanFile(f, HTML_RULES);
  if (findings.length) {
    fileIssues.push({ file: path.relative(process.cwd(), f), findings });
    findings.forEach(x => x.severity === "error" ? stats.errors++ : stats.warnings++);
  }
  stats.htmlScanned++;
}

// TypeScript
for (const f of walkDir(APP_DIR, [".component.ts", ".service.ts"])) {
  if (f.endsWith(".spec.ts")) continue;
  const findings = scanFile(f, TS_RULES);
  if (findings.length) {
    fileIssues.push({ file: path.relative(process.cwd(), f), findings });
    findings.forEach(x => x.severity === "error" ? stats.errors++ : stats.warnings++);
  }
  stats.tsScanned++;
}

// ── Write report ──────────────────────────────────────────────────────────────

fs.writeFileSync(
  "l10n-code-report.json",
  JSON.stringify({ check: "code-patterns", stats, issues: fileIssues }, null, 2)
);

// ── Console output ────────────────────────────────────────────────────────────

console.log(`\n[check-code] ${stats.htmlScanned} HTML + ${stats.tsScanned} TS files scanned`);
console.log(`  Errors:   ${stats.errors}`);
console.log(`  Warnings: ${stats.warnings}`);

const SHOW_LIMIT = 12;
const shown = fileIssues.slice(0, SHOW_LIMIT);
for (const { file, findings } of shown) {
  console.log(`\n  ${file}`);
  for (const f of findings) {
    const icon = f.severity === "error" ? "⛔" : "⚠️ ";
    console.log(`    ${icon}  L${f.lineNumber} [${f.ruleId}]: ${f.matchedText}`);
  }
}
if (fileIssues.length > SHOW_LIMIT) {
  console.log(`\n  … and ${fileIssues.length - SHOW_LIMIT} more files (see l10n-code-report.json)`);
}

process.exit(stats.errors > 0 ? 1 : 0);
