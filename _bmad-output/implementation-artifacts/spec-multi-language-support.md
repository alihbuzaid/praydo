---
title: 'Add Multi-Language Support with Language Setting'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application only displays UI text in English, limiting accessibility for Arabic-speaking users.

**Approach:** Add i18n infrastructure with English and Arabic translations, expose language selection in the Settings page under a new "Language" tab, and apply RTL layout when Arabic is selected.

## Boundaries & Constraints

**Always:**
- Language preference persists across app restarts via RuneStore (same pattern as `modeLightSwitch`)
- All user-facing strings are externalized into translation files — no hardcoded UI text in components
- Language change applies immediately without requiring page reload
- Arabic selection triggers RTL document direction

**Ask First:**
- Should Arabic use the "General" tab or get its own "Language" tab? (Recommend: new tab for discoverability)

**Never:**
- Do not machine-translate; provide actual English and Arabic translations
- Do not break existing store patterns or persistence mechanisms
- Do not add translation loading waterfalls — translations are bundled statically

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | English selected, any page | All UI labels in English, LTR layout | N/A |
| ARABIC_SELECTED | Arabic selected, any page | All UI labels in Arabic, RTL layout | N/A |
| PERSISTENCE | App restart | Previously selected language is restored | Default to English if stored value is invalid |

</frozen-after-approval>

## Code Map

- `src/lib/i18n/index.ts` -- i18n setup with `t` function and locale state
- `src/lib/i18n/en.ts` -- English translation strings
- `src/lib/i18n/ar.ts` -- Arabic translation strings
- `src/lib/store/language/index.ts` -- RuneStore for persisting language preference
- `src/routes/settings/+page.svelte` -- Add "Language" tab to settings
- `src/routes/+page.svelte` -- Use `t()` for all user-visible strings
- `src/routes/+layout.svelte` -- Apply `dir` attribute based on locale

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/store/language/index.ts` -- Create RuneStore for language preference ('en' | 'ar'), default 'en'
- [x] `src/lib/i18n/en.ts` -- Export English translation object with all UI strings
- [x] `src/lib/i18n/ar.ts` -- Export Arabic translation object with all UI strings
- [x] `src/lib/i18n/index.ts` -- Create `createI18n()` returning reactive `t` function and `locale` derived store
- [x] `src/routes/+layout.svelte` -- Reactively set `document.documentElement.dir` based on locale
- [x] `src/routes/settings/+page.svelte` -- Add Language tab with dropdown (English / العربية)
- [x] `src/routes/+page.svelte` -- Replace all hardcoded strings with `t()` calls

**Acceptance Criteria:**
- Given no saved language preference, when app loads, then language defaults to English
- Given English is selected in settings, when user views any page, then all UI text is in English and layout is LTR
- Given Arabic is selected in settings, when user views any page, then all UI text is in Arabic and layout is RTL
- Given Arabic is selected, when app is restarted, then Arabic remains selected (persistence works)

## Suggested Review Order

**i18n core**

- Translation store with reactive `t()` function and null-coalescing fallback for missing keys
  [`src/lib/i18n/index.ts`](../../src/lib/i18n/index.ts#L7)
- English translation strings (57 keys, all lowercase prayer names + UI labels)
  [`src/lib/i18n/en.ts`](../../src/lib/i18n/en.ts#L1)
- Arabic translation strings (same 57 keys, RTL text)
  [`src/lib/i18n/ar.ts`](../../src/lib/i18n/ar.ts#L1)

**Language persistence**

- RuneStore persisting `current: 'en' | 'ar'` to disk via tauri-store
  [`src/lib/store/language/index.ts`](../../src/lib/store/language/index.ts#L5)

**Layout RTL binding**

- `$effect` sets `dir` and `lang` on `<html>` reactively; SSR guard prevents errors
  [`src/routes/+layout.svelte`](../../src/routes/+layout.svelte#L18)

**Settings page — General tab includes Language**

- Language selector inline in General tab with label + dropdown
  [`src/routes/settings/+page.svelte:552`](../../src/routes/settings/+page.svelte#L552)

**Main page — all strings externalized**

- `prayerLabel()` helper translates prayer names with fallback to original
  [`src/routes/+page.svelte:22`](../../src/routes/+page.svelte#L22)
- All UI strings replaced with `t()` calls (`nextPrayer`, `remainingUntil`, `today`, `locationLabel`, `calendar`, `settings`)
  [`src/routes/+page.svelte:65`](../../src/routes/+page.svelte#L65)

## Design Notes

### Translation Object Shape

```ts
// src/lib/i18n/en.ts
export const en = {
  // Navigation & Shared
  settings: 'Settings',
  back: 'Back',
  general: 'General',
  location: 'Location',
  calculation: 'Calculation',
  prayerTimes: 'Prayer Times',
  notifications: 'Notifications',
  language: 'Language',

  // Main page
  nextPrayer: 'Next Prayer',
  remainingUntil: 'Remaining until',
  today: 'Today',
  locationLabel: 'Location',
  calendar: 'Calendar',

  // Settings tabs
  enterCityOrAddress: 'Enter a city or address...',
  submit: 'Submit',
  selectedLocation: 'Selected Location:',
  coordinates: 'Coordinates:',
  autostartAtSystemStartup: 'Autostart at system startup',
  darkMode: 'Dark Mode',
  appVersion: 'App Version',

  // Calculation
  calculationMethod: 'Calculation Method',
  fajr: 'Fajr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  midnightMethod: 'Midnight Method',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  higherLatitudesAdjustment: 'Higher Latitudes Adjustment',
  degrees: 'degrees',
  minutes: 'minutes',

  // Prayer times
  showPrayerTimes: 'Show Prayer Times',
  playAdzanAt: 'Play Adzan At',
  timeFormat: 'Time Format',
  hour12: '12 Hour',
  hour24: '24 Hour',

  // Notifications
  notificationBeforePrayerTime: 'Notification before prayer time',

  // Language
  selectLanguage: 'Select Language',
  english: 'English',
  arabic: 'العربية',
};
```

### i18n Store Pattern (Svelte 5 Runes)

```ts
// src/lib/i18n/index.ts
import { locale } from '$lib/store/language';

const translations = { en, ar } as const;
type Locale = keyof typeof translations;

export function t(key: keyof typeof en): string {
  return translations[locale.state.current][key];
}

export function createI18n() {
  return {
    t,
    locale, // derived store with current locale
  };
}
```

RTL is applied in layout via:
```svelte
<script>
  locale.subscribe(val => {
    document.documentElement.dir = val === 'ar' ? 'rtl' : 'ltr';
  });
</script>
```

</frozen-after-approval>

## Verification

**Commands:**
- `npm run check` -- expected: TypeScript and Svelte checks pass with no errors

**Manual checks (if no CLI):**
- Open settings page → verify "Language" tab appears and dropdown shows English/العربية
- Select Arabic → verify all text on main page and settings changes to Arabic, layout shifts to RTL
- Restart app → verify Arabic selection persists