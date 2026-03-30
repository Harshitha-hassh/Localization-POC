#!/usr/bin/env node
/**
 * run-all.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Combines the four individual check reports and produces:
 *
 *   localization-report.json   – machine-readable combined report
 *   localization-report.md     – human-readable markdown (posted as PR comment)
 *   $GITHUB_STEP_SUMMARY       – written if running inside GitHub Actions
 *
 * Always exits 0.  Per-check scripts handle their own exit codes.
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ── Load sub-reports ──────────────────────────────────────────────────────────

function load(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return null; }
}

const keysRep    = load("l10n-keys-report.json");
const numbersRep = load("l10n-numbers-report.json");
const filesRep   = load("l10n-files-report.json");
const codeRep    = load("l10n-code-report.json");

// ── Count hard errors across all checks ───────────────────────────────────────

const keysErrors    = (keysRep?.stats?.totalMissingKeys   ?? 0) +
                      (keysRep?.stats?.totalOrphanKeys    ?? 0);
const numbersErrors = numbersRep?.stats?.failed           ?? 0;
const filesErrors   = (filesRep?.stats?.missingErrorFiles ?? 0) +
                      (filesRep?.stats?.missingAlertFiles ?? 0) +
                      (filesRep?.stats?.invalidJSON       ?? 0);
const codeErrors    = codeRep?.stats?.errors              ?? 0;
const codeWarnings  = codeRep?.stats?.warnings            ?? 0;

const totalIssues   = keysErrors + numbersErrors + filesErrors + codeErrors;
const hasIssues     = totalIssues > 0;

// ── Combined JSON report ──────────────────────────────────────────────────────

const combined = {
  timestamp:   new Date().toISOString(),
  hasIssues,
  totalIssues,
  breakdown: {
    keys:    { errors: keysErrors,    untranslated: keysRep?.stats?.totalUntranslated ?? 0 },
    numbers: { errors: numbersErrors },
    files:   { errors: filesErrors,   contactTypesGap: filesRep?.stats?.missingContactTypes ?? 0 },
    code:    { errors: codeErrors,    warnings: codeWarnings },
  },
  checks: { keys: keysRep, numbers: numbersRep, files: filesRep, code: codeRep },
};

fs.writeFileSync("localization-report.json", JSON.stringify(combined, null, 2));

// ── Markdown helpers ──────────────────────────────────────────────────────────

function statusIcon(n) {
  return n === 0 ? "✅" : "🔴";
}
function warnIcon(n) {
  return n === 0 ? "✅" : "⚠️";
}
function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// ── Build markdown ────────────────────────────────────────────────────────────

const md = [];

md.push("## 🌐 Localization Layer 1 Report");
md.push("");
md.push(`> Generated: ${new Date().toUTCString()}`);
md.push("");

// Summary table
md.push("### Summary");
md.push("");
md.push("| Check | Result | Details |");
md.push("|-------|--------|---------|");
md.push(
  `| JSON key coverage | ${statusIcon(keysErrors)} | ` +
  `${plural(keysErrors, "hard error")}` +
  (keysRep?.stats?.totalUntranslated
    ? `, ${plural(keysRep.stats.totalUntranslated, "untranslated value")} (warn)`
    : "") +
  ` |`
);
md.push(
  `| Number format round-trips | ${statusIcon(numbersErrors)} | ` +
  `${plural(numbersErrors, "locale")} failing |`
);
md.push(
  `| Asset file coverage | ${statusIcon(filesErrors)} | ` +
  `${plural(filesErrors, "hard error")}` +
  (filesRep?.stats?.missingContactTypes
    ? `, ${plural(filesRep.stats.missingContactTypes, "ContactTypes file")} missing (warn)`
    : "") +
  ` |`
);
md.push(
  `| Code anti-patterns | ${statusIcon(codeErrors)} | ` +
  `${plural(codeErrors, "error")}, ${plural(codeWarnings, "warning")} |`
);
md.push("");

// ── Key issues detail ─────────────────────────────────────────────────────────

if (keysErrors > 0 && keysRep?.issues?.length) {
  const problems = keysRep.issues.filter(i => i.missing?.length || i.orphan?.length);
  md.push("<details>");
  md.push(`<summary><strong>🔑 Key Coverage Issues (${keysErrors} errors)</strong></summary>`);
  md.push("");
  for (const issue of problems.slice(0, 15)) {
    md.push(`**\`${issue.locale}\`**`);
    if (issue.missing?.length) {
      const sample = issue.missing.slice(0, 6).map(k => `\`${k}\``).join(", ");
      const extra  = issue.missing.length > 6 ? ` … +${issue.missing.length - 6} more` : "";
      md.push(`- 🔴 **Missing** (${issue.missing.length}): ${sample}${extra}`);
    }
    if (issue.orphan?.length) {
      const sample = issue.orphan.slice(0, 6).map(k => `\`${k}\``).join(", ");
      const extra  = issue.orphan.length > 6 ? ` … +${issue.orphan.length - 6} more` : "";
      md.push(`- 🔴 **Orphan** (${issue.orphan.length}): ${sample}${extra}`);
    }
    if (issue.untranslated?.length) {
      md.push(`- ⚠️  **Untranslated scaffold** (${issue.untranslated.length} values still have suffix)`);
    }
  }
  if (problems.length > 15) {
    md.push(`\n_… and ${problems.length - 15} more locales — see full report artifact._`);
  }
  md.push("</details>");
  md.push("");
}

// ── Number format detail ──────────────────────────────────────────────────────

const failingLocales = (numbersRep?.issues ?? []).filter(i => i.issues?.length > 0);
if (failingLocales.length > 0) {
  md.push("<details>");
  md.push(`<summary><strong>🔢 Number Format Issues (${numbersErrors} locales failing)</strong></summary>`);
  md.push("");
  for (const { locale, currency, issues } of failingLocales) {
    md.push(`**\`${locale}\`** (${currency})`);
    for (const issue of issues) {
      md.push(`- 🔴 \`${issue.type}\`: ${issue.message}`);
      if (issue.displayed != null) {
        md.push(`  - Formatted: \`${issue.displayed}\``);
        md.push(`  - Parsed back: \`${issue.parsed}\` (expected \`${issue.expected}\`)`);
      }
    }
  }
  md.push("</details>");
  md.push("");
}

// ── File coverage detail ──────────────────────────────────────────────────────

if (filesErrors > 0 && filesRep?.issues?.length) {
  const hardProblems = filesRep.issues.filter(
    i => i.problems?.some(p => p.severity === "error")
  );
  md.push("<details>");
  md.push(`<summary><strong>📁 Missing Asset Files (${filesErrors} errors)</strong></summary>`);
  md.push("");
  for (const { locale, problems } of hardProblems.slice(0, 20)) {
    for (const p of problems.filter(x => x.severity === "error")) {
      md.push(`- 🔴 **\`${locale}\`** — \`${p.type}\`: \`${p.path}\``);
    }
  }
  if (hardProblems.length > 20) {
    md.push(`\n_… and ${hardProblems.length - 20} more — see full report artifact._`);
  }
  md.push("</details>");
  md.push("");
}

// ── Code pattern detail ───────────────────────────────────────────────────────

if ((codeErrors + codeWarnings) > 0 && codeRep?.issues?.length) {
  md.push("<details>");
  md.push(
    `<summary><strong>💻 Code Anti-Patterns` +
    ` (${codeErrors} errors, ${codeWarnings} warnings)</strong></summary>`
  );
  md.push("");

  const SHOW = 20;
  for (const { file, findings } of codeRep.issues.slice(0, SHOW)) {
    md.push(`**\`${file}\`**`);
    for (const f of findings) {
      const icon = f.severity === "error" ? "🔴" : "⚠️ ";
      md.push(`- ${icon} Line ${f.lineNumber}: \`${f.ruleId}\``);
      md.push(`  > ${f.description}`);
      if (f.matchedText) {
        md.push(`  \`\`\`\n  ${f.snippet}\n  \`\`\``);
      }
    }
  }
  if (codeRep.issues.length > SHOW) {
    md.push(`\n_… and ${codeRep.issues.length - SHOW} more files — see full report artifact._`);
  }
  md.push("</details>");
  md.push("");
}

// ── Footer ────────────────────────────────────────────────────────────────────

if (!hasIssues) {
  md.push("---");
  md.push("✅ **All Layer 1 localization checks passed.**");
} else {
  md.push("---");
  md.push("_This comment is auto-generated by the Localization Layer 1 workflow._");
  md.push("_Fix the issues above and push again. Layer 2 (AI deep analysis) will run next._");
}

const markdown = md.join("\n");
fs.writeFileSync("localization-report.md", markdown);

// ── GitHub Step Summary ───────────────────────────────────────────────────────

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  fs.appendFileSync(summaryFile, markdown + "\n");
}

// ── Console ───────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log("  Localization Layer 1 – Combined Report");
console.log("══════════════════════════════════════════");
console.log(`  Key errors:     ${keysErrors}`);
console.log(`  Number errors:  ${numbersErrors}`);
console.log(`  File errors:    ${filesErrors}`);
console.log(`  Code errors:    ${codeErrors}  warnings: ${codeWarnings}`);
console.log("──────────────────────────────────────────");
console.log(`  Total issues:   ${totalIssues}`);
console.log("══════════════════════════════════════════\n");

process.exit(0);
