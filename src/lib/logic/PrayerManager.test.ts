import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PrayerManager } from './PrayerManager.svelte';
import { selectedLocation } from '$lib/store/selectedLocation';
import { calculationSettings } from '$lib/store/calculationSettings';
import { selectedTimes } from '$lib/store/selectedTimes';
import { timeRemaining } from '$lib/store/timeRemaining';
import { selectedAlert } from '$lib/store/selectedAlert';
import { isPermissionGranted } from '@tauri-apps/plugin-notification';

// Mock all external dependencies
const mockLocation = vi.hoisted(() => ({
  state: {
    latitude: -6.2088,
    longitude: 106.8456,
    label: 'Jakarta',
    id: 'jakarta-1',
  },
}));

vi.mock('$lib/store/selectedLocation', () => ({
  selectedLocation: mockLocation,
}));
vi.mock('$lib/store/calculationSettings', () => ({
  calculationSettings: {
    state: {
      method: 'NU',
      dhuhrMinutes: 0,
      asrMethod: 'Standard',
      highLatitudes: 'NightMiddle',
    },
  },
}));
vi.mock('$lib/store/selectedTimes', () => ({
  selectedTimes: {
    state: {
      format: '24h',
      daily: {
        fajr: true,
        sunrise: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
    },
  },
}));
vi.mock('$lib/store/timeRemaining', () => ({
  timeRemaining: { state: { minutes: 5 } },
}));
vi.mock('$lib/store/selectedAlert', () => ({
  selectedAlert: {
    state: {
      alert: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
      sound: {
        fajr: 'fajr.mp3',
        dhuhr: 'dhuhr.mp3',
        asr: 'solemn.mp3',
        maghrib: 'maghrib.mp3',
        isha: 'solemn.mp3',
      },
    },
  },
  alertPrayerKeys: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
}));
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-notification', () => ({
  isPermissionGranted: vi.fn(() => Promise.resolve(true)),
  requestPermission: vi.fn(() => Promise.resolve('granted')),
}));
vi.mock('$lib/sound', () => ({
  playSound: vi.fn(),
}));

describe('PrayerManager', () => {
  let manager: PrayerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-28T12:00:00Z'));
    selectedAlert.state.alert.fajr = true;
    selectedAlert.state.alert.dhuhr = true;
    selectedAlert.state.alert.asr = true;
    selectedAlert.state.alert.maghrib = true;
    selectedAlert.state.alert.isha = true;
    selectedAlert.state.sound.fajr = 'fajr.mp3';
    selectedAlert.state.sound.dhuhr = 'dhuhr.mp3';
    selectedAlert.state.sound.asr = 'solemn.mp3';
    selectedAlert.state.sound.maghrib = 'maghrib.mp3';
    selectedAlert.state.sound.isha = 'solemn.mp3';
    manager = new PrayerManager();
  });

  afterEach(() => {
    manager.destroy();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with current time', () => {
    expect(manager.currentTime).toBeInstanceOf(Date);
    expect(manager.currentTime.toISOString()).toBe('2026-02-28T12:00:00.000Z');
  });

  it('should derive formatted date correctly', () => {
    // localized string might vary by environment, let's just check if it's a non-empty string
    expect(typeof manager.formattedDate).toBe('string');
    expect(manager.formattedDate).toContain('2026');
  });

  it('should calculate prayer times for today', () => {
    const times = manager.todaysPrayerTimes;
    expect(times).toHaveProperty('fajr');
    expect(times).toHaveProperty('dhuhr');
    expect(times).toHaveProperty('maghrib');
  });

  it('should identify the next prayer correctly', () => {
    // Set time to morning
    vi.setSystemTime(new Date('2026-02-28T08:00:00Z'));
    // Re-initialize or trigger reactivity
    manager.currentTime = new Date('2026-02-28T08:00:00Z');

    const next = manager.nextPrayer;
    expect(next).not.toBeNull();
    expect(next?.isToday).toBe(true);
  });

  it('should calculate countdown string correctly', () => {
    vi.setSystemTime(new Date('2026-02-28T11:00:00Z'));
    manager.currentTime = new Date('2026-02-28T11:00:00Z');

    const countdown = manager.countdownString;
    expect(countdown).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('should generate monthly schedule', () => {
    const schedule = manager.getMonthSchedule(2026, 1); // Feb 2026
    expect(schedule).toHaveLength(28);
    expect(schedule[0]).toHaveProperty('day', 1);
    expect(schedule[0]).toHaveProperty('prayers');
  });

  it('should trigger notification at exact prayer time', async () => {
    const invokeMock = vi.mocked(await import('@tauri-apps/api/core')).invoke;

    // Find a prayer time for today
    const prayer = manager.enabledPrayers[0]; // e.g., Fajr
    const prayerTime = (manager as any).parseTime(prayer.time);

    // Set time to exactly that time
    const prev = new Date(prayerTime.getTime() - 1000);
    const current = prayerTime;
    vi.setSystemTime(current);
    manager.currentTime = new Date(current);

    // Manually trigger check
    await (manager as any).checkNotifications(prev, current);

    expect(invokeMock).toHaveBeenCalledWith(
      'send_native_notification',
      expect.objectContaining({
        title: expect.stringContaining(prayer.name),
      })
    );
  });

  it('should NOT miss notification if a second is skipped (ensuring robustness)', async () => {
    const invokeMock = vi.mocked(await import('@tauri-apps/api/core')).invoke;
    invokeMock.mockClear();

    const prayer = manager.enabledPrayers[0];
    const prayerTime = (manager as any).parseTime(prayer.time);

    // Simulating skip: prev is 1s before, current is 1s after
    const prev = new Date(prayerTime.getTime() - 1000);
    const current = new Date(prayerTime.getTime() + 1000);
    vi.setSystemTime(current);
    manager.currentTime = new Date(current);

    await (manager as any).checkNotifications(prev, current);

    // We now EXPECT this to have been called because target falls between prev and current
    expect(invokeMock).toHaveBeenCalledWith(
      'send_native_notification',
      expect.objectContaining({
        title: expect.stringContaining(prayer.name),
      })
    );
  });

  it('should detect when setup is required (empty location)', () => {
    // 1. Initially Jakarta (from beforeEach), setup NOT required
    expect(manager.isSetupRequired).toBe(false);

    // 2. Set label to empty and create new manager to pick up change
    mockLocation.state.label = '';
    let manager2 = new PrayerManager();
    expect(manager2.isSetupRequired).toBe(true);
    manager2.destroy();

    // 3. Reset and check again
    mockLocation.state.label = 'Jakarta';
    manager2 = new PrayerManager();
    expect(manager2.isSetupRequired).toBe(false);
    manager2.destroy();

    // 4. Set ID to empty
    mockLocation.state.id = '';
    manager2 = new PrayerManager();
    expect(manager2.isSetupRequired).toBe(true);
    manager2.destroy();

    // Clean up mock for other tests
    mockLocation.state.id = 'jakarta-1';
  });

  it('should play the selected sound file for an enabled prayer alert', async () => {
    const { playSound } = await import('$lib/sound');

    selectedAlert.state.sound.fajr = 'adhan-fajr.mp3';

    await (manager as any).sendPrayerNotification('Fajr', '05:00');

    expect(playSound).toHaveBeenCalledWith('adhan-fajr.mp3');
  });

  it('should fall back to the default sound when the prayer alert is disabled', async () => {
    const { playSound } = await import('$lib/sound');

    selectedAlert.state.alert.asr = false;

    await (manager as any).sendPrayerNotification('Asr', '15:30');

    expect(playSound).toHaveBeenCalledWith('solemn.mp3');
  });
});
