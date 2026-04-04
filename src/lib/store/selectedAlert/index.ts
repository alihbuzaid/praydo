import { RuneStore } from '@tauri-store/svelte';

export const alertPrayerKeys = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
] as const;

export type AlertPrayerKey = (typeof alertPrayerKeys)[number];

export interface AlertState {
  alert: Record<AlertPrayerKey, boolean>;
  sound: Record<AlertPrayerKey, string>;
  [key: string]: unknown;
}

const defaultAlertState: AlertState = {
  alert: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },
  sound: {
    fajr: 'fajr.mp3',
    dhuhr: 'dhuhr.mp3',
    asr: 'solemn.mp3',
    maghrib: 'maghrib.mp3',
    isha: 'solemn.mp3',
  },
};

export const selectedAlert = new RuneStore<AlertState>(
  'alert',
  defaultAlertState,
  {
    saveOnChange: true,
    saveStrategy: 'debounce',
    saveInterval: 1000,
    autoStart: true,
  }
);

selectedAlert.state.alert = {
  ...defaultAlertState.alert,
  ...(selectedAlert.state.alert as Partial<Record<AlertPrayerKey, boolean>>),
};

selectedAlert.state.sound = {
  ...defaultAlertState.sound,
  ...(selectedAlert.state.sound as Partial<Record<AlertPrayerKey, string>>),
};
