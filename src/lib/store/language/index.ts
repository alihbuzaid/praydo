import { RuneStore } from '@tauri-store/svelte';

export type SupportedLocale = 'en' | 'ar';

export const languageStore = new RuneStore(
  'language',
  { current: 'en' as SupportedLocale },
  {
    saveOnChange: true,
    saveStrategy: 'debounce',
    saveInterval: 1000,
    autoStart: true,
  }
);
