#!/usr/bin/env node
/**
 * check-numbers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates the app's Localization class numeric logic in plain Node.js and
 * tests it exhaustively for every supported locale.
 *
 * Tests:
 *   1. Decimal separator detection
 *   2. Thousand separator detection (including narrow no-break space)
 *   3. Currency format + round-trip parse (localizeCurrency → currencyToSQLFormat)
 *   4. Negative value handling
 *   5. Zero-decimal currency handling (JPY, KRW, …)
 *   6. Arabic numeral detection & arabicToWestern conversion
 *   7. Space-based thousand separator cleanup (fr-FR, pt-PT, …)
 *
 * Exit 1  if any locale has a round-trip mismatch or NaN result.
 * Writes  l10n-numbers-report.json
 */

"use strict";
const fs = require("fs");

// ── Locale → currency map (mirrors what the backend returns per property) ─────

const LOCALE_CURRENCY = {
  "ar-AE": "AED", "ar-BH": "BHD", "ar-EG": "EGP", "ar-JO": "JOD",
  "ar-KW": "KWD", "ar-MA": "MAD", "ar-OM": "OMR", "ar-QA": "QAR",
  "ar-SA": "SAR", "ar-TN": "TND",
  "az-AZ": "AZN",
  "zh-CN": "CNY", "zh-SG": "SGD", "zh-TW": "TWD",
  "cs-CZ": "CZK", "da-DK": "DKK",
  "en-AU": "AUD", "en-BS": "BSD", "en-BZ": "BZD", "en-CH": "CHF",
  "en-GB": "GBP", "en-IN": "INR", "en-KN": "XCD", "en-MU": "MUR",
  "en-NZ": "NZD", "en-PH": "PHP", "en-SC": "SCR", "en-SG": "SGD",
  "en-TZ": "TZS", "en-UK": "GBP", "en-US": "USD", "en-ZA": "ZAR",
  "fi-FI": "EUR", "fr-CH": "CHF", "fr-FR": "EUR", "fr-PF": "XPF", "fr-SC": "SCR",
  "de-CH": "CHF", "de-DE": "EUR", "de-IT": "EUR",
  "el-GR": "EUR", "hu-HU": "HUF", "id-ID": "IDR",
  "it-CH": "CHF", "it-IT": "EUR",
  "ja-JA": "JPY", "ja-JP": "JPY",
  "ko-KR": "KRW",
  "ms-MY": "MYR", "pt-PT": "EUR",
  "es-AR": "ARS", "es-CO": "COP", "es-CR": "CRC", "es-DO": "DOP",
  "es-ES": "EUR", "es-PR": "USD",
  "sw-TZ": "TZS", "th-TH": "THB", "tr-TR": "TRY",
  "vi-VN": "VND",
};

// Currencies that use 0 decimal places
const ZERO_DECIMAL = new Set([
  "JPY", "KRW", "VND", "IDR", "TZS", "XPF", "MUR", "HUF",
]);

// ── Replicated app logic (must stay in sync with localization.ts) ─────────────

function isArabic(value) {
  return /[\u0660-\u0669\u06F0-\u06F9٫٬]/.test(value);
}

function arabicToWestern(str) {
  return str
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",");
}

function getDecimalSep(locale) {
  const s = (1.1).toLocaleString(locale);
  // Remove all digits; what remains is the separator
  return s.replace(/\d/g, "")[0] || ".";
}

function getThousandSep(locale) {
  const s = (1000).toLocaleString(locale);
  return s.replace(/\d/g, "")[0] || "";
}

function isSpaceSep(sep) {
  return sep === "" ? false : /[\s\u00A0\u202F]/.test(sep);
}

/**
 * Mirrors the app's currencyToSQLFormat().
 */
function currencyToSQLFormat(display, locale) {
  let v = String(display);

  // Strip Unicode directional marks
  v = v.replace(/[\u200E\u200F\u202A-\u202E]/g, "");

  if (isArabic(v)) {
    // Arabic path: keep only Arabic digits + separators + minus
    v = arabicToWestern(v.replace(/[^\u0660-\u0669\u06F0-\u06F9٫٬\-]/g, ""));
    // After arabicToWestern the string may now be "1,234.56"
    // strip commas (thousand sep converted from ٬)
    v = v.replace(/,/g, "");
    return parseFloat(v);
  }

  const decSep   = getDecimalSep(locale);
  const thouSep  = getThousandSep(locale);
  const spaceSep = isSpaceSep(thouSep);

  // Strip thousand separator
  if (spaceSep) {
    v = v.replace(/[\s\u00A0\u202F]/g, "");
  } else if (thouSep) {
    const escaped = thouSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    v = v.replace(new RegExp(escaped, "g"), "");
  }

  // Strip currency symbols, letters, extra punctuation
  const escapedDec = decSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  v = v.replace(new RegExp(`[^\\d${escapedDec}\\-]`, "g"), "");

  // Normalise decimal to "."
  if (decSep !== ".") v = v.replace(decSep, ".");

  return parseFloat(v);
}

// ── Test values ────────────────────────────────────────────────────────────────

const TEST_VALUES = [
  1234.56,
  1000000.99,
  0.5,
  -500.25,
  1.0,
  0.01,
];

// ── Run tests ─────────────────────────────────────────────────────────────────

const issues = [];
const stats  = { localesChecked: 0, passed: 0, failed: 0 };

for (const [locale, currency] of Object.entries(LOCALE_CURRENCY)) {
  const fraction   = ZERO_DECIMAL.has(currency) ? 0 : 2;
  const locIssues  = [];

  // ── 1. Separator detection ──────────────────────────────────────────────────
  const decSep  = getDecimalSep(locale);
  const thouSep = getThousandSep(locale);

  if (!decSep) {
    locIssues.push({ type: "DECIMAL_SEP_UNDETECTED", message: "Could not detect decimal separator" });
  }

  // ── 2. Currency round-trip ──────────────────────────────────────────────────
  for (const rawVal of TEST_VALUES) {
    // Zero-decimal currencies can't represent fractional values
    if (fraction === 0 && rawVal !== Math.trunc(rawVal)) continue;

    let displayed;
    try {
      displayed = rawVal.toLocaleString(locale, {
        style:                 "currency",
        currency,
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      });
    } catch (e) {
      locIssues.push({ type: "FORMAT_ERROR", value: rawVal, message: e.message });
      continue;
    }

    const parsed   = currencyToSQLFormat(displayed, locale);
    const expected = parseFloat(rawVal.toFixed(fraction));

    if (Number.isNaN(parsed)) {
      locIssues.push({
        type:      "PARSE_NAN",
        value:     rawVal,
        displayed,
        message:   `currencyToSQLFormat returned NaN`,
      });
    } else if (Math.abs(parsed - expected) > 0.001) {
      locIssues.push({
        type:     "ROUND_TRIP_MISMATCH",
        value:    rawVal,
        displayed,
        parsed,
        expected,
        message:  `Expected ${expected}, got ${parsed}`,
      });
    }
  }

  // ── 3. Space-sep cleanup verification ──────────────────────────────────────
  if (isSpaceSep(thouSep)) {
    const formatted = (1500.5).toLocaleString(locale, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    const stripped = formatted.replace(/[\s\u00A0\u202F]/g, "");
    const afterDec = stripped.replace(getDecimalSep(locale) !== "." ? getDecimalSep(locale) : ".", ".");
    if (Number.isNaN(parseFloat(afterDec))) {
      locIssues.push({
        type:      "SPACE_SEP_CLEANUP_FAILED",
        formatted,
        stripped,
        message:   `Space-based thousand separator not cleanable`,
      });
    }
  }

  // ── 4. Arabic numeral round-trip ────────────────────────────────────────────
  if (locale.startsWith("ar-")) {
    const arabicFormatted = (1234.56).toLocaleString(locale, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    if (isArabic(arabicFormatted)) {
      const converted = arabicToWestern(
        arabicFormatted.replace(/[^\u0660-\u0669\u06F0-\u06F9٫٬\-]/g, "")
      );
      const result = parseFloat(converted.replace(",", ".").replace(/,/g, ""));
      if (Number.isNaN(result) || Math.abs(result - 1234.56) > 0.01) {
        locIssues.push({
          type:           "ARABIC_CONVERSION_FAILED",
          arabicFormatted,
          converted,
          result,
          message:        `arabicToWestern did not yield 1234.56`,
        });
      }
    }
  }

  // ── 5. Separator metadata (always record for report) ───────────────────────
  stats.localesChecked++;
  const meta = {
    locale,
    currency,
    decimalSep:   JSON.stringify(decSep),
    thousandSep:  JSON.stringify(thouSep),
    isSpaceSep:   isSpaceSep(thouSep),
    isArabic:     locale.startsWith("ar-"),
    zeroDecimal:  ZERO_DECIMAL.has(currency),
    sampleFormat: (1234.56).toLocaleString(locale, {
      style: "currency", currency,
      minimumFractionDigits: fraction, maximumFractionDigits: fraction,
    }),
  };

  if (locIssues.length > 0) {
    stats.failed++;
    issues.push({ ...meta, issues: locIssues });
  } else {
    stats.passed++;
    // Include clean entries too so Layer 2 / humans can review the full picture
    issues.push({ ...meta, issues: [] });
  }
}

// ── Write report ──────────────────────────────────────────────────────────────

const failingLocales = issues.filter(i => i.issues.length > 0);
fs.writeFileSync(
  "l10n-numbers-report.json",
  JSON.stringify({ check: "number-formatting", stats, issues }, null, 2)
);

// ── Console output ────────────────────────────────────────────────────────────

console.log(`\n[check-numbers] ${stats.localesChecked} locales tested`);
console.log(`  Passed: ${stats.passed}`);
console.log(`  Failed: ${stats.failed}`);

for (const { locale, currency, issues: li } of failingLocales) {
  console.log(`\n  [${locale} / ${currency}]`);
  for (const issue of li) {
    console.log(`    ⛔  ${issue.type}: ${issue.message}`);
    if (issue.displayed) {
      console.log(`         displayed="${issue.displayed}"  parsed=${issue.parsed}  expected=${issue.expected}`);
    }
  }
}

process.exit(stats.failed > 0 ? 1 : 0);
