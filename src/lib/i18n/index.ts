import { en } from './en';
import { ar } from './ar';
import { languageStore, type SupportedLocale } from '$lib/store/language';

const translations = { en, ar } as const;

export function t(key: keyof typeof en): string {
  return (
    translations[languageStore.state.current as SupportedLocale][key] ?? key
  );
}

export function createI18n() {
  return {
    t,
    locale: languageStore,
  };
}
