# Localization Architecture & Automation Guide

> **Purpose**: Complete reference for anyone who wants to understand, audit, or automate localization bug-finding and fixing in this Angular application.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Two Localization Systems](#2-two-localization-systems)
3. [Locale JSON Files – The Source of Truth](#3-locale-json-files--the-source-of-truth)
4. [How Locale / Country Is Determined at Runtime](#4-how-locale--country-is-determined-at-runtime)
5. [Numeric & Currency Value Handling](#5-numeric--currency-value-handling)
6. [Date & Time Handling](#6-date--time-handling)
7. [Alphabetic & Alphanumeric Text Handling](#7-alphabetic--alphanumeric-text-handling)
8. [Arabic / RTL Numeral Handling](#8-arabic--rtl-numeral-handling)
9. [How New Countries Are Added](#9-how-new-countries-are-added)
10. [Phone Format Handling](#10-phone-format-handling)
11. [Error & Alert Localization](#11-error--alert-localization)
12. [Contact Types & DataSource Localization](#12-contact-types--datasource-localization)
13. [Calendar / Day / Month Localization](#13-calendar--day--month-localization)
14. [Pipes & Directives Reference](#14-pipes--directives-reference)
15. [HTML Template Patterns – How Components Use Text](#15-html-template-patterns--how-components-use-text)
16. [The Build Script: prepare-build.js](#16-the-build-script-prepare-buildjs)
17. [Automation Checklist – Finding Localization Bugs](#17-automation-checklist--finding-localization-bugs)
18. [Automation Checklist – When Creating a New Component](#18-automation-checklist--when-creating-a-new-component)
19. [Automation Checklist – When Adding a New Country/Locale](#19-automation-checklist--when-adding-a-new-countrylocalee)
20. [Common Bug Patterns & How to Detect Them](#20-common-bug-patterns--how-to-detect-them)
21. [File Map & Quick Reference](#21-file-map--quick-reference)

---

## 1. Architecture Overview

This application (Agilysys PMS / Retail) is a large Angular monorepo with **three major modules** that handle localization differently:

| Module | Localization Mechanism | JSON Source |
|--------|----------------------|-------------|
| **Common** (PMS, Settings, Client, Audit) | `Localization` class – synchronous JSON load at startup | `src/assets/i18n/{locale}.json` |
| **Retail** (Shop, Inventory, Packages) | `RetailLocalization` extends `Localization` | Same `src/assets/i18n/{locale}.json` |
| **Eatecui** (F&B / Kitchen Management) | `@ngx-translate/core` `TranslateService` | `src/app/eatecui/assets/i18n/en.json`, `fr.json` |

### Key Libraries Used
- **moment.js** – date/time formatting, locale-aware calendar, short/long date formats
- **`Number.toLocaleString()`** – browser's native Intl API for currency & number formatting
- **`Intl.NumberFormat`** – used in eatecui's `CurrencyConverterPipe`
- **`@ngx-translate/core`** – used ONLY in the eatecui module
- **Custom `Number.prototype.customToFixed()`** – Bankers' rounding implementation

---

## 2. Two Localization Systems

### System A: Localization Class (PMS / Retail / Common)

**Files:**
- `src/app/common/localization/localization.ts` — abstract base class (used by Retail)
- `src/app/common/shared/localization/Localization.ts` — concrete injectable (used by Common/Settings)
- `src/app/retail/common/localization/retail-localization.ts` — Retail-specific extension

**How it works:**
1. On login, the backend returns property configuration including `languageCode`, `currencyCode`, `propTimeFormat`, `propDateFormat`, `startOfWeek`.
2. These are stored in `sessionStorage` as a semicolon-delimited string under the key `propertyInfo`:
   ```
   Language=en-US; Currency=USD; PropTimeFormat=2; PropDateFormat=en-US; StartOfWeek=0; UserLanguage=en-US; ...
   ```
3. The `Localization` class reads these via `GetPropertyInfo('Language')`, `GetPropertyInfo('Currency')`, etc.  
4. It then calls `SetLocaleBasedProperties()` which:
   - Sets `moment.locale(localeCode)` for date/time
   - Uses `Number.toLocaleString(localeCode, {...})` for currency/number formatting
   - Loads the correct JSON file (e.g., `en-US.json`) for UI text captions
   - Loads error file (`error.en-US.json`) and user alerts (`alerts.en-US.json`)

**Template usage pattern:**
```html
{{ localization.captions.common.Save }}
{{ localization.captions.setting.ReplaceMemberNumberWithAR }}
{{ localization.captions.alertPopup.yes }}
```

### System B: @ngx-translate (Eatecui Only)

**Files:**
- `src/app/eatecui/source/shared/shared.module.ts` — module setup
- `src/app/eatecui/assets/i18n/en.json` — English translations
- `src/app/eatecui/assets/i18n/fr.json` — French translations

**How it works:**
1. `TranslateHttpLoader` loads JSON from `app/eatecui/assets/i18n/{lang}.json`
2. Default language is `'en'`, with `'fr'` available
3. Language is determined from `sessionStorage._languageCode` or defaults to `'en'`

**Template usage pattern:**
```html
{{ 'Common.Save' | translate }}
{{ 'Common.' + breadcrumb.Name | translate }}
```

> **Critical difference**: Eatecui only supports `en`/`fr`. The PMS/Retail system supports 55+ locales.

---

## 3. Locale JSON Files – The Source of Truth

### Main Captions: `src/assets/i18n/{locale}.json`

**Currently supported locales (55 files):**

| Language Family | Locale Codes |
|----------------|-------------|
| **Arabic** | `ar-AE`, `ar-BH`, `ar-EG`, `ar-JO`, `ar-KW`, `ar-MA`, `ar-OM`, `ar-QA`, `ar-SA`, `ar-TN` |
| **Azerbaijani** | `az-AZ` |
| **Chinese** | `zh-CN`, `zh-SG`, `zh-TW` |
| **Czech** | `cs-CZ` |
| **Danish** | `da-DK` |
| **Dutch** | — (not present) |
| **English** | `en-AU`, `en-BS`, `en-BZ`, `en-CH`, `en-GB`, `en-IN`, `en-KN`, `en-MU`, `en-NZ`, `en-PH`, `en-SC`, `en-SG`, `en-TZ`, `en-UK`, `en-US`, `en-ZA` |
| **Finnish** | `fi-FI` |
| **French** | `fr-CH`, `fr-FR`, `fr-PF`, `fr-SC` |
| **German** | `de-CH`, `de-DE`, `de-IT` |
| **Greek** | `el-GR` |
| **Hungarian** | `hu-HU` |
| **Indonesian** | `id-ID` |
| **Italian** | `it-CH`, `it-IT` |
| **Japanese** | `ja-JA`, `ja-JP` |
| **Korean** | `ko-KR` |
| **Malay** | `ms-MY` |
| **Portuguese** | `pt-PT` |
| **Spanish** | `es-AR`, `es-CO`, `es-CR`, `es-DO`, `es-ES`, `es-PR` |
| **Swahili** | `sw-TZ` |
| **Thai** | `th-TH` |
| **Turkish** | `tr-TR` |
| **Vietnamese** | `vi-VN` |

### JSON Structure (top-level keys in `en-US.json`)

```
contactTypesOptions   — Phone/Email contact type dropdowns
PhoneFormat           — Input mask for phone numbers (locale-specific)
ExtensionFormat       — Input mask for phone + extension
alphabet              — A-Z array (used for alphabetical search tabs)
alertPopup            — Yes/No/Cancel/Continue button labels
login                 — Login form labels
common                — Shared labels (Save, Cancel, Country, etc.)
calendar              — Day/month names (overwritten at runtime by moment.js)
bookAppointment       — Appointment booking labels
shop                  — Retail shop labels
breakpoint            — Breakpoint/POS labels
header                — App header labels
setting               — Settings module labels
retailsetup           — Retail setup labels
retailInventory       — Inventory labels
reports               — Report labels
receipt               — Receipt configuration labels
dashBoard             — Dashboard labels
utilities             — Utility labels
guest                 — Guest management labels
inventory             — Inventory module labels
+ ~400 flat string keys (btn_save, lbl_email, err_missing, fiscal_authURL, etc.)
```

### Error Files: `src/assets/errors/error.{locale}.json`
- Keyed by numeric error code → localized error message string
- Fallback: `error.en-US.json`

### Alert Files: `src/assets/userAlerts/alerts.{locale}.json`
- Array of `{ id, message }` objects
- Used for user-facing alert/notification messages

### Contact Type DataSource: `src/assets/i18n/DataSource/{locale}.ContactTypes.json`
- Only 8 locale files exist (da-DK, de-DE, en-AU, en-GB, en-UK, en-US, fi-FI, fr-FR)
- **Gap**: Most locales lack ContactTypes files and will fail silently

### Country List: `src/assets/i18n/Countries/en-US.Countries.json`
- Master list of all countries with `CountryName`, `OfficialName`, `Alpha2Code`, `Alpha3Code`, `NumericCode`
- **Not localized** – always loaded from `en-US.Countries.json` regardless of locale

---

## 4. How Locale / Country Is Determined at Runtime

### Initialization Flow

```
User Login → Backend API returns property config
    ↓
login.component.ts / property.service.ts
    → Builds semicolon-delimited string:
      "Language=en-US; Currency=USD; PropTimeFormat=2; StartOfWeek=0; UserLanguage=en-US; PropDateFormat=en-US; ..."
    → sessionStorage.setItem('propertyInfo', PropertyValues)
    → sessionStorage.setItem('noOfDecimalDigits', maximumDecimalPlaces)
    ↓
Localization.SetLocaleBasedProperties()
    → setLocaleCode()      : reads Language from propertyInfo → sets moment.locale()
    → setLocaleCurrency()  : reads Currency from propertyInfo
    → setDecimalSeparator(): uses Number.toLocaleString(localeCode) to detect '.' vs ','
    → setThousandSeparator(): uses Number.toLocaleString(localeCode) to detect ',' vs '.' vs ' '
    → setCurrencySymbol()  : uses Number.toLocaleString(localeCode, {style:'currency'})
    → setDateTimeFormat()  : reads PropTimeFormat → 12/24 hour → moment localeData formats
    → getCaptions()        : loads ./assets/i18n/{UserLanguage}.json
    → getErrorCaptions()   : loads ./assets/errors/error.{UserLanguage}.json
    → getUserAlerts()      : loads ./assets/userAlerts/alerts.{UserLanguage}.json
    → fillCalenderObject() : maps moment.weekdays() / moment.months() to caption keys
```

### Key sessionStorage Keys
| Key | Description | Example |
|-----|-------------|---------|
| `propertyInfo` | Semicolon-delimited config string | `Language=fr-FR; Currency=EUR; ...` |
| `noOfDecimalDigits` | Max decimal places for currency | `2` |
| `language` | Redundant copy of locale code | `fr-FR` |
| `_userInfo` | User-specific settings including `language` preference | `language=en-US; ...` |

### Language Resolution Priority
1. **User language preference** (`_userInfo.language`) — if set by user
2. **Property's UserLanguage** (`propertyInfo.UserLanguage`) — server-configured
3. **Fallback**: `en-US`

---

## 5. Numeric & Currency Value Handling

### Core Methods in `Localization` class

#### `localizeCurrency(value, currencySymbolRequired, minFraction)`
**Purpose**: Convert a raw number to locale-formatted currency string for DISPLAY.

**Flow:**
```
Input: "1500.50" (always period-decimal from API)
    ↓
parseFloat(value).customToFixed(fractionLength)  → Bankers' rounding
    ↓
Number.toLocaleString(localeCode, {
    style: 'currency',          // or omit for no symbol
    currency: currencyCode,
    minimumFractionDigits: fractionLength
})
    ↓
Output (en-US): "$1,500.50"
Output (de-DE): "1.500,50 €"
Output (fr-FR): "1 500,50 €"
Output (ar-SA): "١٬٥٠٠٫٥٠ ر.س."
```

#### `currencyToSQLFormat(value)`
**Purpose**: Convert a DISPLAYED locale-formatted currency string back to a plain float for API/DB.

**Flow:**
```
Input (de-DE): "1.500,50 €"
    ↓
Strip RTL/LTR marks (\u200E, \u200F, \u202A-\u202E)
    ↓
Detect Arabic numerals? → Yes: strip non-Arabic chars, arabicToWestern()
                        → No:  strip non-numeric except .,- 
    ↓
removeThousandSeparator() → "1500,50"
    ↓
If decimalSeparator == ',': replace ',' with '.'
    ↓
parseFloat() → 1500.50
```

#### `localizePercentage(value)`
**Purpose**: Format a percentage value without thousand separator.
```
parseFloat(value).toLocaleString(localeCode, { minimumFractionDigits: 2 })
    → then strip thousand separators
```

### `customToFixed()` – Bankers' Rounding
**File**: `src/app/common/localization/localization.ts` (bottom of file, prototype extension)

```typescript
Number.prototype.customToFixed = function (noOfDigits = 2, skipBankers = false) {
    // If sessionStorage has 'noOfDecimalDigits', use that instead
    // If skipBankers: simple truncation (slice decimal digits)
    // Otherwise: bankersAlgorithm(this, noOfDigits) — rounds .5 to nearest even
}
```

The number of decimal digits is **property-configurable** via `sessionStorage.noOfDecimalDigits`. If not set, defaults to 2.

### Decimal and Thousand Separator Detection

These are auto-detected from the browser's `Number.toLocaleString()`:

```typescript
setDecimalSeparator() {
    this.decimalSeparator = (1.1).toLocaleString(this.localeCode).substring(1, 2);
    // en-US → "."   |   de-DE → ","   |   fr-FR → ","
}

setThousandSeparator() {
    this.thousandSeparator = (1000).toLocaleString(this.localeCode).substring(1, 2);
    // en-US → ","   |   de-DE → "."   |   fr-FR → " " (narrow no-break space)
}
```

### Space-like Thousand Separator Handling
Some locales (fr-FR, fr-CH, etc.) use a narrow no-break space (`\u202F`) or non-breaking space (`\u00A0`) as the thousand separator. The `trimThousandSeparator()` method handles this:

```typescript
if (this.thousandSeparator.trim() === '' || /\s/.test(this.thousandSeparator)) {
    return normalizedValue.replace(/[\s\u00A0\u202F]/g, '');
}
```

### Key Pipes for Currency/Numbers

| Pipe | File | Usage in HTML |
|------|------|---------------|
| `Currency` | `src/app/common/localization/currency.pipe.ts` | `{{ value \| Currency }}` |
| `Currency` (retail) | `src/app/retail/common/localization/currency.pipe.ts` | `{{ value \| Currency : false }}` (no symbol) |
| `loaddecimalvalue` | `src/app/common/shared/shared/pipes/load-decimal-value.pipe.ts` | Appends "`.00`" if missing decimal |
| `localizedDecimalValue` | `src/app/retail/retail-table-inline-edit/localized-decimal-value.pipe.ts` | `localizeCurrency(value, false)` |

### Key Directives for Currency Input

| Directive | File | Purpose |
|-----------|------|---------|
| `[CurrencyFormatter]` | `src/app/common/directives/currency.directive.ts` | Formats currency input on blur, strips formatting on focus |
| `[RetailCurrencyFormatter]` | `src/app/retail/common/localization/currency.directive.ts` | Same for Retail with extra decimal-length inputs |
| `[ExchangeConversionFormatter]` | `src/app/common/directives/exchangeconversion.directive.ts` | Exchange rate input with configurable precision |
| `[numFormat]` | `src/app/common/directives/num-formatter.directive.ts` | Numeric input limiter (max pre/post decimal digits) |
| `[percentinputtype]` | `src/app/common/directives/percentage.directive.ts` | Validates numbers, percentages, decimals using locale separator |

---

## 6. Date & Time Handling

### Date Format Detection
```typescript
setDateTimeFormat() {
    let propTimeFormat = this.GetPropertyInfo('PropTimeFormat');
    // PropTimeFormat: 1 = 12-hour, 2 = 24-hour, null = auto-detect from locale
    
    moment.localeData(this.propDateFormatlocaleCode).longDateFormat('L');  → "MM/DD/YYYY" (en-US)
    moment.localeData(this.propDateFormatlocaleCode).longDateFormat('ll'); → "Oct 5, 2024" (en-US)
    moment.localeData(this.propDateFormatlocaleCode).longDateFormat('LT'); → "2:30 PM" or "14:30"
}
```

### Time Format: 12-hour vs 24-hour
Determined by `PropTimeFormat` from server config:
- `PropTimeFormat = 1` → 12-hour (`h:mm A`)  
- `PropTimeFormat = 2` → 24-hour (`HH:mm`)
- `null` → auto-detect from locale's moment format (if contains 'a' → 12h, else 24h)

### Key Date Methods

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `LocalizeDate(value)` | JS Date | `"26 Mar 2026"` | `DD MMM YYYY` format |
| `LocalizeShortDate(value)` | JS Date | `"03/26/2026"` | Locale's `L` format |
| `LocalizeTime(value)` | JS Date | `"2:30 PM"` / `"14:30"` | Based on PropTimeFormat |
| `localizeDisplayDate(value)` | JS Date | `"Mar 26, 2026"` | Locale's `ll` format |
| `convertDateObjToAPIdate(value)` | JS Date | `"2026-3-26"` | API format `YYYY-M-D` |
| `DeLocalizeTime(value)` | `"2:30 PM"` | `"14:30"` | Converts display → 24h |
| `LocalizeDateMonth(value)` | JS Date | `"03/26/2026"` | Uses `inputDateFormat` |

### Date Pipe
```html
{{ someDate | localizeDate }}
```
**File**: `src/app/common/localization/localize-date.pipe.ts`
**Logic**: `moment(value).format(localization.inputDateFormat)`

---

## 7. Alphabetic & Alphanumeric Text Handling

### UI Caption Strings
All display text (labels, buttons, messages) comes from the locale JSON file. The structure is **key-based**:

```json
// en-US.json
{
  "common": {
    "Save": "Save",
    "Cancel": "Cancel",
    "country": "Country"
  },
  "setting": {
    "ReplaceMemberNumberWithAR": "Replace Member Number With AR"
  }
}
```

For non-English locales, the `prepare-build.js` script appends a **language suffix** to every string value:
```json
// de-DE.json (generated)
{
  "common": {
    "Save": "Save_de",
    "Cancel": "Cancel_de"
  }
}
```

> **Important**: The suffix (`_de`, `_fr`, etc.) is a **placeholder** for the actual translation. It indicates that the value needs to be translated by a human translator. This is NOT proper localization — it's a scaffolding mechanism.

### Special Text Replacements
- **en-AU and en-NZ**: "VAT" is automatically replaced with "GST" by `prepare-build.js`
- **PhoneFormat and ExtensionFormat**: Excluded from suffix appending, have locale-specific overrides

### Alphabet Array
The JSON contains an `alphabet` array `["A", "B", ..., "Z"]` used for alphabetical search/filter tabs. This is **not translated** (Latin alphabet only).

---

## 8. Arabic / RTL Numeral Handling

### Arabic Numeral Detection
```typescript
isArabicFormattedNumber(value: string): boolean {
    return /[\u0660-\u0669\u06F0-\u06F9٫٬]/.test(value);
}
```

### Arabic ↔ Western Conversion
```typescript
arabicToWestern(str: string) {
    return str
        .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))   // ٠-٩ → 0-9
        .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))   // ۰-۹ → 0-9
        .replace(/٫/g, '.')   // Arabic decimal separator → Western decimal
        .replace(/٬/g, ',');  // Arabic thousand separator → Western comma
}
```

### Arabic Date Normalization
```typescript
checkAndNormalizeArabicDate(value: string): string {
    // Converts Arabic-Indic digits in date strings to Western digits
}
```

### Arabic AM/PM Normalization
```typescript
normalizeArabicTimePeriod(value: string): string {
    // مساءً / مساء → PM
    // صباحاً / صباح → AM
    // م → PM, ص → AM
}
```

### RTL Currency Handling in `currencyToSQLFormat()`
- Strip RTL/LTR Unicode marks: `\u200E`, `\u200F`, `\u202A-\u202E`
- Arabic currency symbols contain periods (e.g., `د.ب.`) — these must NOT be treated as decimal points
- Solution: when Arabic numerals are detected, ONLY keep Arabic digits, Arabic decimal, Arabic thousand separator, and minus sign

### RTL Layout
**No explicit RTL CSS support was found.** The application does NOT have `dir="rtl"` handling or `direction: rtl` CSS rules. Arabic content is displayed in LTR layout but with Arabic numerals and text.

---

## 9. How New Countries Are Added

### Step-by-Step Process

#### Step 1: Add to `prepare-build.js`
Add a new entry to the `defaultLocalizations` array:
```javascript
{ code: "xx-XX", suffix: "_xx", name: "Country Name" }
```

- `code`: BCP 47 locale tag (e.g., `pt-BR`)
- `suffix`: Unique string appended to English values as translation placeholder
- `name`: Human-readable name (only for logging)

#### Step 2: Run the Build Script
```bash
node prepare-build.js
```
This generates three files:
1. `src/assets/i18n/xx-XX.json` — captions (English values + suffix)
2. `src/assets/errors/error.xx-XX.json` — error messages (English values + suffix)
3. `src/assets/userAlerts/alerts.xx-XX.json` — alert messages (English values + suffix)

#### Step 3: Replace Suffixed Values with Translations
All values will have the suffix appended (e.g., `"Save_xx"`). A translator must replace these with actual translations.

#### Step 4: Handle Phone Format
If the country has a different phone format, add a condition in `prepare-build.js`:
```javascript
if (langCode == 'xx-XX') {
    if (key == 'PhoneFormat') { data[key] = '(99) 99999-9999'; }
    if (key == 'ExtensionFormat') { data[key] = '(99) 99999-9999 ext: 9999'; }
}
```

#### Step 5: Create ContactTypes DataSource (if needed)
Create `src/assets/i18n/DataSource/xx-XX.ContactTypes.json` — currently only 8 locales have this file.

#### Step 6: Backend Configuration
The backend must be configured to return the new `languageCode` and `currencyCode` for properties using this locale. These are stored in `propertyInfo` session storage.

#### Step 7: Verify moment.js Support
Ensure `moment.js` has locale data for the BCP 47 code. Most common locales are supported. If not, a custom locale definition may be needed.

### Files That Need a New Entry Per Locale

| File Pattern | Count per locale | Content |
|-------------|-----------------|---------|
| `src/assets/i18n/{locale}.json` | 1 | UI captions |
| `src/assets/errors/error.{locale}.json` | 1 | Error messages |
| `src/assets/userAlerts/alerts.{locale}.json` | 1 | Alert messages |
| `src/assets/i18n/DataSource/{locale}.ContactTypes.json` | 1 (optional) | Contact type labels |

---

## 10. Phone Format Handling

Each locale JSON has a `PhoneFormat` and `ExtensionFormat` key:
```json
{
  "PhoneFormat": "(999) 999-9999",
  "ExtensionFormat": "(999) 999-9999 ext: 9999"
}
```

These are consumed by the `[textmask]` directive (`src/app/common/directives/mask.directive.ts`) to mask phone number inputs.

**Current overrides in `prepare-build.js`:**
- **UK/GB**: `(0) 9999999999` / `(0) 9999999999 ext: 99`
- **NZ**: `(9) 999 99999` / `(9) 999 99999 ext: 9999`
- **All others**: inherit US format `(999) 999-9999`

These keys are **excluded** from the generic suffix appending (`keysToBeExcluded`).

---

## 11. Error & Alert Localization

### Error Files
- Path: `src/assets/errors/error.{locale}.json`
- Format: `{ "errorCode": "Error message string" }`
- Loaded by: `getErrorCaptions()` → `jsonReader.getJSON('./assets/errors/error.' + locale + '.json')`
- Consumed by: `getError(code)` → returns localized error string or fallback "Unexpected Error"

### Alert Files
- Path: `src/assets/userAlerts/alerts.{locale}.json`
- Format: Array of `{ id: number, message: string }`
- Loaded by: `getUserAlerts()` → `jsonReader.getJSON('./assets/userAlerts/alerts.' + locale + '.json')`
- Consumed by: `getUserAlertObj(code)` → returns matching alert object

### Fallback Behavior
- If locale file doesn't exist: **silent failure** — `jsonReader.getJSON()` returns `null` or `undefined`
- Error display falls back to: `"An unexpected error occurred." + error code`

---

## 12. Contact Types & DataSource Localization

**File**: `src/assets/i18n/DataSource/{locale}.ContactTypes.json`

Only 8 locales have this file: `da-DK`, `de-DE`, `en-AU`, `en-GB`, `en-UK`, `en-US`, `fi-FI`, `fr-FR`

**Load path**: `./assets/i18n/DataSource/${userLanguage}.ContactTypes.json`

**Bug risk**: For the ~47 other supported locales, attempting to load this file will result in a 404. The code handles this silently, but contact type dropdowns may show empty or English defaults.

---

## 13. Calendar / Day / Month Localization

Calendar data is NOT stored in the JSON files. Instead, it's generated at runtime from `moment.js`:

```typescript
fillCalenderObject() {
    const ShortDaysOfWeek = moment.weekdaysShort(false);  // ["Sun", "Mon", ...]
    const LongDaysOfWeek = moment.weekdays(false);         // ["Sunday", "Monday", ...]
    const monthsShort = moment.monthsShort();               // ["Jan", "Feb", ...]
    const monthsLong = moment.months();                     // ["January", "February", ...]
    
    // Maps these to captions.calendar keys
    this.captions.calendar['Sunday'] = LongDaysOfWeek[0];  // = localized value from moment
}
```

The `calendar` section in the JSON contains English placeholder keys that are **overwritten** at runtime with moment's localized values.

### Start of Week
```typescript
this.startOfWeekValue = this.GetPropertyInfo('StartOfWeek') || 0;  // 0 = Sunday
```
This is a **property-level** setting, not locale-based.

---

## 14. Pipes & Directives Reference

### Pipes

| Pipe Name | Module | File | Input → Output |
|-----------|--------|------|----------------|
| `Currency` | Common | `src/app/common/localization/currency.pipe.ts` | `1500.50` → `$1,500.50` |
| `Currency` | Retail | `src/app/retail/common/localization/currency.pipe.ts` | Same, uses RetailLocalization |
| `loaddecimalvalue` | Common | `src/app/common/shared/shared/pipes/load-decimal-value.pipe.ts` | Appends `.00` if missing |
| `localizedDecimalValue` | Retail | `src/app/retail/retail-table-inline-edit/localized-decimal-value.pipe.ts` | Number → locale-formatted (no symbol) |
| `localizeDate` | Common | `src/app/common/localization/localize-date.pipe.ts` | Date → locale short date |
| `localizeDate` | Retail | `src/app/retail/common/localization/localize-date.pipe.ts` | Same, uses RetailLocalization |
| `localizeDateTime` | Retail | `src/app/retail/common/localization/localize-dateTime.pipe.ts` | Date → `"26-Jan-2026 - 2:30 PM"` |
| `formatText` | Common | `src/app/common/shared/shared/pipes/formatText-pipe.pipe.ts` | Formats phone numbers |
| `currencyConverter` | Eatecui | `src/app/eatecui/source/shared/pipes/currency-converter.pipe.ts` | Uses `Intl.NumberFormat` |
| `GlobalFormater` | Eatecui | `src/app/eatecui/source/shared/pipes/global-formater.pipe.ts` | Multi-format: date, currency, card mask |
| `getDayName` | Eatecui | `src/app/eatecui/source/shared/pipes/get-day-name.pipe.ts` | Day code → `translate('DeliveryRules.Sunday')` |

### Directives

| Directive | Module | File | Purpose |
|-----------|--------|------|---------|
| `[CurrencyFormatter]` | Common | `src/app/common/directives/currency.directive.ts` | Input formatting: focus strips, blur formats |
| `[RetailCurrencyFormatter]` | Retail | `src/app/retail/common/localization/currency.directive.ts` | Same + configurable decimal length |
| `[ExchangeConversionFormatter]` | Common | `src/app/common/directives/exchangeconversion.directive.ts` | Exchange rate input |
| `[numFormat]` | Common | `src/app/common/directives/num-formatter.directive.ts` | Pre/post decimal digit limiter |
| `[percentinputtype]` | Common | `src/app/common/directives/percentage.directive.ts` | Number/percent/decimal validation |
| `[textmask]` | Common | `src/app/common/directives/mask.directive.ts` | Input mask (phone format) |
| `[appMultiCurrencyConverter]` | Common | `src/app/common/directives/multi-currency-converter.directive.ts` | Cross-currency conversion display |

---

## 15. HTML Template Patterns – How Components Use Text

### Pattern 1: Direct Caption Binding (PMS/Retail) — **MOST COMMON**
```html
<label>{{ localization.captions.common.Save }}</label>
<span>{{ localization.captions.setting.TaxRate }}</span>
<button>{{ localization.captions.alertPopup.yes }}</button>
```
**Component class** must inject `Localization` (or `RetailLocalization`) and expose it as a public property.

### Pattern 2: Attribute Binding
```html
<input [placeholder]="localization.captions.common.Search">
<div [attr.data-on]="localization.captions.common.Yes" 
     [attr.data-off]="localization.captions.common.No">
```

### Pattern 3: Translate Pipe (Eatecui Only)
```html
<span>{{ 'Common.NoItemsFound' | translate }}</span>
<span>{{ 'Common.' + breadcrumb.Name | translate }}</span>
```

### Pattern 4: Currency Pipe
```html
<span>{{ price | Currency }}</span>           <!-- with symbol: $1,500.50 -->
<span>{{ price | Currency : false }}%</span>  <!-- without symbol: 1,500.50% -->
```

### Pattern 5: Date Pipe
```html
<span>{{ date | localizeDate }}</span>
```

### Pattern 6: Currency Directive on Inputs
```html
<input CurrencyFormatter [preDecimalLength]="10" [postDecimalLength]="2">
<input RetailCurrencyFormatter [preDecimalLength]="6">
```

### **ANTI-PATTERNS (Bugs)**
```html
<!-- BAD: Hardcoded English text -->
<label>Save</label>
<span>Total Amount</span>
<button>Cancel</button>

<!-- BAD: Hardcoded date format -->
<span>{{ date | date:'MM/dd/yyyy' }}</span>

<!-- BAD: Hardcoded currency symbol -->
<span>${{ amount }}</span>

<!-- BAD: Using JavaScript toFixed() instead of customToFixed() -->
{{ amount.toFixed(2) }}
```

---

## 16. The Build Script: prepare-build.js

**File**: `prepare-build.js` (project root)

### What It Does
1. Reads `en-US.json` as the reference file
2. For each locale in `defaultLocalizations`:
   - Clones the en-US JSON
   - Recursively appends the locale's suffix to every string value (e.g., `"Save"` → `"Save_de"`)
   - **Exception**: `PhoneFormat`, `ExtensionFormat`, `alphabets` are excluded
   - **Special case**: `en-AU` and `en-NZ` replace "VAT" with "GST" instead of appending suffix
   - **Phone format overrides**: UK/GB and NZ get custom phone masks
3. Writes the result to `src/assets/i18n/{locale}.json`
4. Repeats for error files and alert files

### Running It
```bash
node prepare-build.js
```

### Important Notes
- This script is for **scaffolding** only — generated files contain English + suffix, not real translations
- `hu-HU` is commented out because manual edits were made for pole display labels
- `en-PH` is commented out pending fiscal accreditation
- Running the script will **OVERWRITE** any manual translations in the locale files

---

## 17. Automation Checklist – Finding Localization Bugs

### A. Missing Translation Keys

**What to check**: Every key in `en-US.json` must exist in ALL other locale JSON files.

**Automation script logic**:
```
1. Parse en-US.json as reference
2. For each locale file (ar-SA.json, de-DE.json, etc.):
   a. Parse the locale file
   b. Recursively compare keys
   c. Report any key present in en-US.json but missing in locale file
   d. Report any key present in locale file but missing in en-US.json (orphan)
```

### B. Hardcoded Strings in HTML Templates

**What to check**: No raw English text should appear in `*.component.html` files.

**Automation regex patterns**:
```regex
# Detect hardcoded text in element content (not inside {{ }})
>([A-Z][a-z]{2,}(\s[A-Z]?[a-z]+)*)<

# Detect hardcoded placeholder text
placeholder="[A-Z][a-z]+"

# Detect hardcoded title/label attributes
title="[A-Z][a-z]+"
label="[A-Z][a-z]+"

# Detect hardcoded button text
<button[^>]*>([^{<]+[A-Za-z]{3,})</button>
```

**Files to scan**: `src/app/**/*.component.html`

**Exclude**: Third-party templates, test files, icon names, CSS classes.

### C. Hardcoded Date Formats

**What to check**: No use of `| date:'MM/dd/yyyy'` or similar hardcoded Angular date pipes.

```regex
\|\s*date\s*:\s*['"][^'"]+['"]
```

**Should use**: `| localizeDate` or `localization.LocalizeDate()` / `localization.LocalizeShortDate()`

### D. Hardcoded Currency Symbols

```regex
\$\{\{|\$\s*\{|['"]\\$['"]|currencySymbol.*=.*['"][\$€£¥]
```

**Should use**: `| Currency` pipe or `localization.localizeCurrency()`

### E. Incorrect Number Formatting

```regex
\.toFixed\(\d+\)
```
**Should use**: `.customToFixed()` (Bankers' rounding with configurable decimal places)

### F. Missing Error/Alert Files

**Check**: Every locale in `en-US` captions should have matching `error.{locale}.json` and `alerts.{locale}.json`.

### G. Missing ContactTypes DataSource

**Check**: Every supported locale should have a `DataSource/{locale}.ContactTypes.json` file (currently only 8 exist).

### H. Untranslated Suffix Strings

**Check**: Locale files should not contain values ending with suffixes like `_de`, `_fr`, `_sa` etc. in production.

```regex
":\s*"[^"]+_(de|fr|fi|kr|pt|it|cs|om|ma|es|qa|jp|th|vi|gr|tr|bh|za|kw|ae|sa|mu|sg|my|ar|co|cr|do|eg|pr|tw|jo|az|tn|zh-cn|zh-sg)"
```

---

## 18. Automation Checklist – When Creating a New Component

When a developer creates a new component, the following must be verified:

### 1. Inject Localization Service
```typescript
// PMS/Common component
constructor(public localization: Localization) {}

// Retail component
constructor(public localization: RetailLocalization) {}

// Eatecui component
constructor(private translateService: TranslateService) {}
```

### 2. No Hardcoded Text in HTML
Every visible string must use `localization.captions.{section}.{key}`:
```html
<!-- CORRECT -->
<label>{{ localization.captions.common.Save }}</label>

<!-- WRONG -->
<label>Save</label>
```

### 3. Add New Keys to en-US.json
If new text is needed, add it under the appropriate section:
```json
{
  "common": {
    "NewFeatureLabel": "New Feature Label"
  }
}
```

### 4. Run prepare-build.js
After adding new keys to `en-US.json`, run:
```bash
node prepare-build.js
```
This propagates new keys to all locale files (with suffix placeholders).

### 5. Use Correct Pipes/Directives for Values
| Data Type | Correct Approach |
|-----------|-----------------|
| Currency display | `{{ value \| Currency }}` |
| Currency input | `<input CurrencyFormatter>` |
| Date display | `{{ value \| localizeDate }}` |
| Percentage | `localization.localizePercentage(value)` |
| Number to API | `localization.currencyToSQLFormat(displayValue)` |
| Rounding | `value.customToFixed()` (not `.toFixed()`) |

### 6. No Hardcoded Date Formats
```typescript
// WRONG
moment(date).format('MM/DD/YYYY');

// CORRECT
moment(date).format(this.localization.dateFormat);
// or
this.localization.LocalizeShortDate(date);
```

### 7. Component Verification Checklist

- [ ] All visible text uses `localization.captions.*`
- [ ] All currency values use `| Currency` pipe or `localizeCurrency()`
- [ ] All date values use `| localizeDate` pipe or `LocalizeDate()`
- [ ] All numeric inputs use `[CurrencyFormatter]` or `[numFormat]` directive
- [ ] No `.toFixed()` — use `.customToFixed()`
- [ ] No hardcoded `$`, `€`, `£` symbols
- [ ] No hardcoded date format strings (`MM/DD/YYYY`)
- [ ] New JSON keys added to `en-US.json`
- [ ] `prepare-build.js` run to propagate keys

---

## 19. Automation Checklist – When Adding a New Country/Locale

### Pre-Implementation Verification

| # | Check | How to Verify |
|---|-------|--------------|
| 1 | Locale code follows BCP 47 | Format: `{language}-{COUNTRY}` (e.g., `pt-BR`) |
| 2 | moment.js supports the locale | `moment.locale('pt-BR')` should not fall back |
| 3 | Browser `toLocaleString` supports it | `(1000.5).toLocaleString('pt-BR')` should format correctly |
| 4 | Currency code is valid ISO 4217 | `BRL`, `EUR`, etc. |

### File Generation Checklist

| # | File | Status |
|---|------|--------|
| 1 | `src/assets/i18n/{locale}.json` | Run `prepare-build.js` |
| 2 | `src/assets/errors/error.{locale}.json` | Run `prepare-build.js` |
| 3 | `src/assets/userAlerts/alerts.{locale}.json` | Run `prepare-build.js` |
| 4 | `src/assets/i18n/DataSource/{locale}.ContactTypes.json` | **Manual creation** |
| 5 | Phone format override in `prepare-build.js` | **Manual if non-US format** |
| 6 | Entry in `defaultLocalizations` array | **Manual** |

### Post-Implementation Testing

| # | Test Scenario | Expected Behavior |
|---|--------------|------------------|
| 1 | Login with new locale property | All captions load without 404s |
| 2 | Currency display | Correct symbol, decimal separator, thousand separator |
| 3 | Currency input | Type `1234.56`, blur → locale-formatted; focus → stripped |
| 4 | Date display | Dates use locale's short/long format |
| 5 | Time display | 12h/24h based on PropTimeFormat |
| 6 | Calendar days/months | Localized via moment.js |
| 7 | Phone format | Input mask matches country's phone format |
| 8 | Error messages | Errors display in correct locale |
| 9 | Alert messages | Alerts display in correct locale |
| 10 | Negative currency | `-$1,234.56` or `(1,234.56)` depending on locale |
| 11 | Zero-decimal currency (e.g., JPY, KRW) | No decimal separator shown if `noOfDecimalDigits=0` |
| 12 | Paste handling on currency inputs | Pasted values are correctly reformatted |
| 13 | Arabic numeral entry (if Arabic locale) | Arabic digits convert correctly to Western for API |
| 14 | Arabic AM/PM markers (if Arabic locale) | `صباحاً`/`مساءً` correctly parsed |
| 15 | Space thousand separator (fr-FR, fr-CH) | Narrow no-break space handled in both display and parse |

---

## 20. Common Bug Patterns & How to Detect Them

### Bug 1: Missing Keys After Feature Addition
**Symptom**: New labels show as blank or `undefined` in non-en-US locales.  
**Cause**: Keys added to `en-US.json` but `prepare-build.js` not run.  
**Detection**: Compare key count between `en-US.json` and each locale file.

### Bug 2: Hardcoded English Text
**Symptom**: Text doesn't change when locale changes.  
**Detection**: Grep for raw English words in `*.component.html` that aren't inside `{{ }}` interpolation or `[attr]` bindings.

### Bug 3: Wrong Decimal/Thousand Separator in Calculations
**Symptom**: `1.500` (meaning 1,500 in de-DE) parsed as `1.5`.  
**Cause**: Using `parseFloat()` directly instead of `currencyToSQLFormat()`.  
**Detection**: Grep for `parseFloat` on user-input values that haven't been through `currencyToSQLFormat()`.

### Bug 4: Hardcoded `.toFixed(2)`
**Symptom**: Incorrect rounding (JavaScript default rounding vs Bankers' rounding) or wrong decimal count for properties with customized `noOfDecimalDigits`.  
**Detection**: `grep -r "\.toFixed(" src/app/ --include="*.ts"`

### Bug 5: `| date` Pipe Instead of `| localizeDate`
**Symptom**: Dates always show in US format regardless of locale.  
**Detection**: `grep -rn "| date" src/app/ --include="*.html"`

### Bug 6: Currency Symbol Placement Wrong
**Symptom**: Symbol appears on wrong side (`€100` vs `100 €`).  
**Cause**: Manual string concatenation instead of using `toLocaleString()`.  
**Detection**: Grep for string concatenation with `currencySymbol`.

### Bug 7: Arabic Number Parsing Failure  
**Symptom**: Currency fields show `NaN` or `0` for Arabic locale users.  
**Cause**: Code doesn't call `arabicToWestern()` before parsing.  
**Detection**: Search for `parseFloat` or `parseInt` calls on values that could contain Arabic numerals.

### Bug 8: Space Thousand Separator Breaks Input
**Symptom**: `1 500,50` (fr-FR format) fails to parse — the space isn't a regular space but `\u202F`.  
**Cause**: Using `.split(' ').join('')` instead of `trimThousandSeparator()`.  
**Detection**: Grep for `.split(' ').join` or `.replace(/ /g` in currency/number handling code.

### Bug 9: ContactTypes 404 Error
**Symptom**: Contact type dropdowns empty for most non-English locales.  
**Cause**: Only 8 `DataSource/*.ContactTypes.json` files exist.  
**Detection**: Cross-reference supported locales against available ContactTypes files.

### Bug 10: RTL/LTR Marks in Pasted/Input Values
**Symptom**: Invisible characters cause parsing failure.  
**Cause**: Arabic locales inject Unicode directional marks.  
**Detection**: Verify all currency/number parsing functions strip `\u200E-\u200F` and `\u202A-\u202E`.

---

## 21. File Map & Quick Reference

### Core Localization Files

| File | Purpose |
|------|---------|
| `src/app/common/localization/localization.ts` | Abstract base — ALL formatting methods (currency, date, time, Arabic) |
| `src/app/common/shared/localization/Localization.ts` | Injectable concrete class for Common module |
| `src/app/retail/common/localization/retail-localization.ts` | Retail extension of base Localization |
| `src/app/common/services/property.service.ts` | Builds `propertyInfo` session storage string |
| `src/app/login/login/login.component.ts` | Initial `propertyInfo` setup on login |
| `prepare-build.js` | Build script for generating locale JSONs |

### JSON Assets

| Path Pattern | Count | Purpose |
|-------------|-------|---------|
| `src/assets/i18n/{locale}.json` | 55+ | UI captions per locale |
| `src/assets/errors/error.{locale}.json` | 55+ | Error messages per locale |
| `src/assets/userAlerts/alerts.{locale}.json` | 55+ | Alert messages per locale |
| `src/assets/i18n/DataSource/{locale}.ContactTypes.json` | 8 | Contact type labels |
| `src/assets/i18n/Countries/en-US.Countries.json` | 1 | Country master list (not localized) |
| `src/app/eatecui/assets/i18n/{lang}.json` | 2 | Eatecui translations (en, fr) |

### Pipes

| File | Pipe Name |
|------|-----------|
| `src/app/common/localization/currency.pipe.ts` | `Currency` |
| `src/app/common/localization/localize-date.pipe.ts` | `localizeDate` |
| `src/app/common/localization/localize-dateTime.pipe.ts` | `localizeDateTime` |
| `src/app/retail/common/localization/currency.pipe.ts` | `Currency` (Retail) |
| `src/app/retail/common/localization/localize-date.pipe.ts` | `localizeDate` (Retail) |

### Directives

| File | Selector |
|------|----------|
| `src/app/common/directives/currency.directive.ts` | `[CurrencyFormatter]` |
| `src/app/common/directives/num-formatter.directive.ts` | `[numFormat]` |
| `src/app/common/directives/percentage.directive.ts` | `[percentinputtype]` |
| `src/app/common/directives/mask.directive.ts` | `[textmask]` |
| `src/app/common/directives/exchangeconversion.directive.ts` | `[ExchangeConversionFormatter]` |
| `src/app/common/directives/multi-currency-converter.directive.ts` | `[appMultiCurrencyConverter]` |

---

## Appendix A: Quick Automation Scripts

### Check for Missing Locale Keys
```bash
# Compare key counts between en-US.json and all locale files
for f in src/assets/i18n/*.json; do
  count=$(python3 -c "
import json, sys
def count_keys(obj, prefix=''):
    c = 0
    if isinstance(obj, dict):
        for k, v in obj.items():
            c += count_keys(v, f'{prefix}.{k}')
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            c += count_keys(v, f'{prefix}[{i}]')
    else:
        c = 1
    return c
with open('$f') as fh:
    print(count_keys(json.load(fh)))
")
  echo "$f: $count keys"
done
```

### Detect Hardcoded Text in HTML
```bash
# Find potential hardcoded English strings in component templates
grep -rn --include="*.component.html" -P '>[A-Z][a-z]{3,}(\s[A-Za-z]+)*</' src/app/ | \
  grep -v '{{' | grep -v 'class=' | grep -v 'icon' | grep -v 'mat-'
```

### Detect .toFixed() Usage
```bash
grep -rn --include="*.ts" '\.toFixed(' src/app/ | grep -v 'customToFixed' | grep -v 'node_modules' | grep -v '.spec.ts'
```

### Detect Hardcoded Date Pipes
```bash
grep -rn --include="*.html" "| date:" src/app/
```

### Find Files Without Localization Injection
```bash
# Find component .ts files that have corresponding .html with text but no localization injection
for html in src/app/**/*.component.html; do
  ts="${html%.html}.ts"
  if [ -f "$ts" ]; then
    if grep -q ">[A-Z]" "$html" && ! grep -q "localization\|translateService\|TranslateService" "$ts"; then
      echo "POTENTIAL ISSUE: $ts"
    fi
  fi
done
```

---

## Appendix B: Locale ↔ Formatting Cheat Sheet

| Locale | Decimal Sep | Thousand Sep | Currency | Date Format | Example Currency |
|--------|-------------|-------------|----------|-------------|-----------------|
| `en-US` | `.` | `,` | `USD` | `MM/DD/YYYY` | `$1,234.56` |
| `en-GB` | `.` | `,` | `GBP` | `DD/MM/YYYY` | `£1,234.56` |
| `de-DE` | `,` | `.` | `EUR` | `DD.MM.YYYY` | `1.234,56 €` |
| `fr-FR` | `,` | ` ` (nbsp) | `EUR` | `DD/MM/YYYY` | `1 234,56 €` |
| `ja-JP` | `.` | `,` | `JPY` | `YYYY/MM/DD` | `¥1,235` |
| `ar-SA` | `٫` | `٬` | `SAR` | `DD/MM/YYYY` | `١٬٢٣٤٫٥٦ ر.س.` |
| `ko-KR` | `.` | `,` | `KRW` | `YYYY. M. D.` | `₩1,235` |
| `pt-PT` | `,` | ` ` (nbsp) | `EUR` | `DD/MM/YYYY` | `1 234,56 €` |
| `zh-CN` | `.` | `,` | `CNY` | `YYYY/M/D` | `¥1,234.56` |
| `th-TH` | `.` | `,` | `THB` | `D/M/YYYY` | `฿1,234.56` |

---

*Document generated from codebase analysis. Last updated: March 2026.*
