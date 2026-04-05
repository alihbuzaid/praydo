<script lang="ts">
  import { timeRemaining } from '$lib/store/timeRemaining';
  import {
    createToaster,
    Switch,
    Tabs,
    Toaster,
  } from '@skeletonlabs/skeleton-svelte';
  import {
    MapPin,
    CalendarCheck,
    BellRing,
    ChevronLeft,
    ChevronRight,
    Calculator,
    Search,
  } from '@lucide/svelte';
  import { selectedLocation } from '$lib/store/selectedLocation';
  import { geocode } from '$lib/api/location/GeocodeApi';
  import { onMount } from 'svelte';
  import { getVersion } from '@tauri-apps/api/app';
  import { selectedTimes } from '$lib/store/selectedTimes';
  import { selectedAlert, type AlertPrayerKey } from '$lib/store/selectedAlert';
  import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
  import { Settings } from '@lucide/svelte';
  import {
    calculationSettings,
    calculationMethods,
    asrMethods,
    midnightMethods,
    highLatitudeMethods,
  } from '$lib/store/calculationSettings';
  import { goto } from '$app/navigation';
  import Lightswitch from '$lib/components/Lightswitch.svelte';
  import {
    formatSoundLabel,
    getAvailableSoundFiles,
    uploadCustomSound,
  } from '$lib/sound';
  import { t } from '$lib/i18n';
  import { languageStore, type SupportedLocale } from '$lib/store/language';

  const options = [
    { value: 5, label: '5 ' + t('minutes') },
    { value: 10, label: '10 ' + t('minutes') },
    { value: 15, label: '15 ' + t('minutes') },
    { value: 20, label: '20 ' + t('minutes') },
    { value: 25, label: '25 ' + t('minutes') },
    { value: 30, label: '30 ' + t('minutes') },
  ];

  const prayerAlertOptions: Array<{ labelKey: string; key: AlertPrayerKey }> = [
    { labelKey: 'fajr', key: 'fajr' },
    { labelKey: 'dhuhr', key: 'dhuhr' },
    { labelKey: 'asr', key: 'asr' },
    { labelKey: 'maghrib', key: 'maghrib' },
    { labelKey: 'isha', key: 'isha' },
  ];

  let autostartEnabled = $state(false);
  let appVersion = $state('');
  let availableSoundFiles = $state<string[]>([]);
  let isUploadingSound = $state(false);

  let searchQuery = $state('');

  let group = $state('location');
  let isRtl = $derived(languageStore.state.current === 'ar');

  const languageOptions: Array<{ value: SupportedLocale; label: string }> = [
    { value: 'en', label: t('english') },
    { value: 'ar', label: t('arabic') },
  ];

  function handleLanguageChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    languageStore.state.current = target.value as SupportedLocale;
  }

  const toaster = createToaster({
    placement: 'top-end',
  });

  // Debounce function to limit API calls
  let debounceTimer: ReturnType<typeof setTimeout>;
  let lastRequestTime = $state(0);

  let maghribPlaceholder = $derived(
    `Enter the ${calculationSettings.state.maghribMode === 'degrees' ? t('degrees') : t('minutes')} value ${calculationSettings.state.maghribMode === 'degrees' ? '' : `after ${t('sunrise').toLowerCase()}`}`
  );
  let ishaPlaceholder = $derived(
    `Enter the ${calculationSettings.state.ishaMode === 'degrees' ? t('degrees') : t('minutes')} value ${calculationSettings.state.ishaMode === 'degrees' ? '' : `after ${t('maghrib').toLowerCase()}`}`
  );

  function debounceSearch(query: string) {
    // Clear any existing debounce timer
    clearTimeout(debounceTimer);

    // Set a new timer with 500ms delay for user input
    debounceTimer = setTimeout(() => {
      // Check if we can make a request (1 per second limit)
      const now = Date.now();
      if (now - lastRequestTime >= 1000) {
        // We can make the request now
        searchLocation(query);
        lastRequestTime = now;
      } else {
        // If we're too fast, schedule the request for when we can make it
        const timeToWait = 1000 - (now - lastRequestTime);
        setTimeout(() => {
          searchLocation(query);
          lastRequestTime = Date.now();
        }, timeToWait);
      }
    }, 500);
  }

  async function searchLocation(query: string) {
    if (!query) {
      return;
    }

    try {
      const response = await geocode(query);
      const data = await response.json();

      if (response.status === 200 && data.length > 0) {
        // Automatically select the first (and only) result
        const item = data[0];
        selectedLocation.state.id = item.place_id;
        selectedLocation.state.label = item.display_name;
        selectedLocation.state.latitude = parseFloat(item.lat);
        selectedLocation.state.longitude = parseFloat(item.lon);
        searchQuery = item.display_name;
      } else {
        // Only show error if query is substantial
        if (query.length > 2) {
          toaster.error({ title: t('noLocationsFoundToast') });
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      toaster.error({ title: t('errorFetchingLocationToast') });
    }
  }

  function handleLocationSearch() {
    debounceSearch(searchQuery);
  }

  async function toggleAutostart(event: { checked: boolean }) {
    try {
      autostartEnabled = event.checked;
      if (autostartEnabled) {
        toaster.success({ title: t('autostartEnabled') });
        await enable();
      } else {
        toaster.warning({ title: t('autostartDisabled') });
        await disable();
      }
    } catch (error) {
      autostartEnabled = !autostartEnabled;
      toaster.error({ title: t('failedToUpdateAutostart') });
    }
  }

  function handleInputMaghribChange(e: Event) {
    const target = e.target as HTMLInputElement;
    calculationSettings.state.maghrib = Number(target.value);
  }

  function handleInputIshaChange(e: Event) {
    const target = e.target as HTMLInputElement;
    calculationSettings.state.isha = Number(target.value);
  }

  function handleInputDhuhrChange(e: Event) {
    const target = e.target as HTMLInputElement;
    calculationSettings.state.dhuhrMinutes = Number(target.value);
  }

  function getSoundOptions(prayerKey: AlertPrayerKey) {
    const selectedSound = selectedAlert.state.sound[prayerKey];
    const sounds = new Set(availableSoundFiles);

    if (!sounds.size) {
      sounds.add(selectedSound);
    } else if (!sounds.has(selectedSound)) {
      sounds.add(selectedSound);
    }

    return Array.from(sounds).sort((left, right) => left.localeCompare(right));
  }

  async function loadAvailableSoundFiles() {
    try {
      availableSoundFiles = await getAvailableSoundFiles();
    } catch (e) {
      console.error('Failed to load sound assets', e);
      availableSoundFiles = Array.from(
        new Set(Object.values(selectedAlert.state.sound))
      ).sort((left, right) => left.localeCompare(right));
    }
  }

  async function handleSoundUpload(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    isUploadingSound = true;

    try {
      const uploadedFileName = await uploadCustomSound(file);
      await loadAvailableSoundFiles();

      toaster.success({
        title: 'Sound uploaded',
        description: `${formatSoundLabel(uploadedFileName)} ${t('soundReady')}`,
      });
    } catch (error) {
      console.error(t('failedToUploadSound'), error);
      toaster.error({
        title: t('failedToUploadSound'),
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      isUploadingSound = false;
      target.value = '';
    }
  }

  onMount(() => {
    const setup = async () => {
      autostartEnabled = await isEnabled();
      if (selectedLocation.state.label) {
        searchQuery = selectedLocation.state.label;
      }
      lastRequestTime = Date.now() - 1000;

      try {
        appVersion = await getVersion();
      } catch (e) {
        console.error('Failed to get app version', e);
        appVersion = 'Unknown';
      }

      await loadAvailableSoundFiles();
    };

    setup();
  });
</script>

<Toaster {toaster}></Toaster>
<div
  class="p-4 max-w-3xl mx-auto pt-10"
  style:direction={isRtl ? 'rtl' : 'ltr'}
>
  <div class="flex items-center mb-6 space-x-4">
    <button
      type="button"
      class="btn-icon hover:preset-tonal-primary"
      title={t('back')}
      aria-label={t('back')}
      onclick={() => goto('/')}
    >
      {#if isRtl}
        <ChevronRight size={24} />
      {:else}
        <ChevronLeft size={24} />
      {/if}
    </button>
    <h2 class="h2 font-bold">{t('settings')}</h2>
  </div>
  <div class="card p-4">
    <Tabs value={group} onValueChange={(e) => (group = e.value)}>
      {#snippet list()}
        <Tabs.Control value="location">
          {#snippet lead()}<MapPin size={20} />{/snippet}
          {t('location')}
        </Tabs.Control>
        <Tabs.Control value="calculation">
          {#snippet lead()}<Calculator size={20} />{/snippet}
          {t('calculation')}
        </Tabs.Control>
        <Tabs.Control value="prayer">
          {#snippet lead()}<CalendarCheck size={20} />{/snippet}
          {t('prayerTimes')}
        </Tabs.Control>
        <Tabs.Control value="alert">
          {#snippet lead()}<BellRing size={20} />{/snippet}
          {t('notifications')}
        </Tabs.Control>
        <Tabs.Control value="general">
          {#snippet lead()}<Settings size={20} />{/snippet}
          {t('general')}
        </Tabs.Control>
      {/snippet}
      {#snippet content()}
        <Tabs.Panel value="location">
          <div class="px-4">
            <label class="label">
              <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="ig-cell preset-tonal">
                  <Search size={16} />
                </div>
                <input
                  class="ig-input"
                  type="search"
                  placeholder={t('enterCityOrAddress')}
                  bind:value={searchQuery}
                />
                <button
                  class="ig-btn preset-filled"
                  onclick={handleLocationSearch}>{t('submit')}</button
                >
              </div>
            </label>
            {#if selectedLocation.state.label}
              <div class="mt-4 p-3 bg-surface-500 rounded dark:bg-surface-800">
                <p class="font-medium">{t('selectedLocation')}</p>
                <p>{selectedLocation.state.label}</p>
                <p class="text-sm text-surface-700 dark:text-surface-600">
                  {t('coordinates')}
                  {selectedLocation.state.latitude}, {selectedLocation.state
                    .longitude}
                </p>
              </div>
            {/if}
            <!-- OpenStreetMap Attribution -->
            <div class="p-1 rounded text-sm text-surface-800 text-right">
              <span>{t('locationDataProvidedBy')}</span>
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                OpenStreetMap (© OpenStreetMap contributors)
              </a>
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="calculation">
          <form class="w-full space-y-4 px-4">
            <label class="label">
              <span class="label-text">{t('calculationMethod')}</span>
              <select
                bind:value={calculationSettings.state.method}
                class="select"
              >
                {#each calculationMethods as method}
                  <option value={method.value}>{method.label}</option>
                {/each}
              </select>
            </label>
            {#if calculationSettings.state.method === 'custom'}
              <label class="label">
                <span class="label-text">{t('fajr')}</span>
                <div class="input-group grid-cols-[1fr_auto]">
                  <input
                    type="number"
                    bind:value={calculationSettings.state.fajrAngle}
                    class="ig-input"
                    placeholder={t('enterDegreesValue')}
                  />
                  <div class="ig-cell preset-tonal">{t('degrees')}</div>
                </div>
              </label>
              <label class="label">
                <span class="label-text">{t('maghrib')}</span>
                <div class="input-group grid-cols-[1fr_auto]">
                  <input
                    class="ig-input"
                    type="number"
                    value={calculationSettings.state.maghrib}
                    onchange={handleInputMaghribChange}
                    placeholder={maghribPlaceholder}
                  />
                  <select
                    class="ig-select preset-tonal-tertiary"
                    bind:value={calculationSettings.state.maghribMode}
                  >
                    <option value="degrees">{t('degrees')}</option>
                    <option value="minutes">{t('minutes')}</option>
                  </select>
                </div>
              </label>
              <label class="label">
                <span class="label-text">{t('ishaLabel')}</span>
                <div class="input-group grid-cols-[1fr_auto]">
                  <input
                    class="ig-input"
                    type="number"
                    value={calculationSettings.state.isha}
                    onchange={handleInputIshaChange}
                    placeholder={ishaPlaceholder}
                  />
                  <select
                    class="ig-select preset-tonal-tertiary"
                    bind:value={calculationSettings.state.ishaMode}
                  >
                    <option value="degrees">{t('degrees')}</option>
                    <option value="minutes">{t('minutes')}</option>
                  </select>
                </div>
              </label>
              <label class="label">
                <span class="label-text">{t('midnightMethod')}</span>
                <select
                  bind:value={calculationSettings.state.midnight}
                  class="select"
                >
                  {#each midnightMethods as method}
                    <option value={method.value}>{method.label}</option>
                  {/each}
                </select>
              </label>
            {/if}
            <label class="label">
              <span class="label-text">{t('dhuhr')}</span>
              <div class="input-group grid-cols-[1fr_auto]">
                <input
                  class="ig-input"
                  type="number"
                  value={calculationSettings.state.dhuhrMinutes}
                  onchange={handleInputDhuhrChange}
                  placeholder={t('enterMinutesAfterMidday')}
                />
                <div class="ig-cell preset-tonal">{t('minutes')}</div>
              </div>
            </label>
            <label class="label">
              <span class="label-text">{t('asr')}</span>
              <select
                bind:value={calculationSettings.state.asrMethod}
                class="select"
              >
                {#each asrMethods as method}
                  <option value={method.value}>{method.label}</option>
                {/each}
              </select>
            </label>
            <label class="label">
              <span class="label-text">{t('higherLatitudesAdjustment')}</span>
              <select
                bind:value={calculationSettings.state.highLatitudes}
                class="select"
              >
                {#each highLatitudeMethods as method}
                  <option value={method.value}>{method.label}</option>
                {/each}
              </select>
            </label>
          </form>
        </Tabs.Panel>
        <Tabs.Panel value="prayer">
          <div class="px-4">
            <h6 class="h6 mb-4">{t('showPrayerTimes')}</h6>
            <div class="grid grid-cols-2 gap-4 mb-8">
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.fajr}
                />
                <p>{t('fajr')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.sunrise}
                />
                <p>{t('sunrise')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.dhuhr}
                />
                <p>{t('dhuhr')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.asr}
                />
                <p>{t('asr')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.maghrib}
                />
                <p>{t('maghrib')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="checkbox"
                  type="checkbox"
                  bind:checked={selectedTimes.state.daily.isha}
                />
                <p>{t('isha')}</p>
              </label>
            </div>
            <h6 class="h6 mb-4">{t('playAdzanAt')}</h6>
            <div
              class="mb-6 rounded-lg border border-surface-200 p-4 dark:border-surface-700"
            >
              <div class="space-y-2">
                <div>
                  <p class="font-medium">{t('uploadAzanSound')}</p>
                  <p class="text-sm text-surface-600 dark:text-surface-400">
                    {t('addAudioFile')}
                  </p>
                </div>

                <label class="label">
                  <input
                    class="input"
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,audio/*"
                    disabled={isUploadingSound}
                    onchange={handleSoundUpload}
                  />
                </label>

                {#if isUploadingSound}
                  <p class="text-sm text-surface-600 dark:text-surface-400">
                    {t('uploading')}
                  </p>
                {/if}
              </div>
            </div>
            <div class="space-y-3 mb-8">
              {#each prayerAlertOptions as prayer}
                <div
                  class="grid grid-cols-1 gap-3 rounded-lg border border-surface-200 p-3 md:grid-cols-[minmax(0,1fr)_220px] dark:border-surface-700"
                >
                  <label class="flex items-center space-x-2">
                    <input
                      class="checkbox"
                      type="checkbox"
                      bind:checked={selectedAlert.state.alert[prayer.key]}
                    />
                    <p>{t(prayer.labelKey)}</p>
                  </label>

                  <label class="label p-0">
                    <span class="label-text sr-only">
                      {t(prayer.labelKey)}
                      {t('azanSound')}
                    </span>
                    <select
                      bind:value={selectedAlert.state.sound[prayer.key]}
                      class="select"
                      aria-label={`${t(prayer.labelKey)} ${t('azanSound')}`}
                    >
                      {#each getSoundOptions(prayer.key) as soundFile}
                        <option value={soundFile}>
                          {formatSoundLabel(soundFile)}
                        </option>
                      {/each}
                    </select>
                  </label>
                </div>
              {/each}
            </div>
            <h6 class="h6 mb-4">{t('timeFormat')}</h6>
            <form class="space-y-2">
              <label class="flex items-center space-x-2">
                <input
                  class="radio"
                  type="radio"
                  checked
                  name="radio-direct"
                  bind:group={selectedTimes.state.format}
                  value="12h"
                />
                <p>{t('hour12')}</p>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  class="radio"
                  type="radio"
                  name="radio-direct"
                  bind:group={selectedTimes.state.format}
                  value="24h"
                />
                <p>{t('hour24')}</p>
              </label>
            </form>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="alert">
          <div class="px-4 space-y-4">
            <label class="flex items-center space-x-2">
              <div dir="ltr">
                <Switch
                  name="notifications-enabled"
                  controlActive="preset-tonal-primary"
                  controlInactive="bg-secondary-50"
                  controlWidth="w-12"
                  controlHeight="h-6"
                  thumbTranslateX="translate-x-4"
                  checked={selectedAlert.state.enabled}
                  onCheckedChange={(e) =>
                    (selectedAlert.state.enabled = e.checked)}
                />
              </div>
              <p>{t('enableNotifications')}</p>
            </label>
            <label class="label">
              <span class="label-text">{t('notificationBeforePrayerTime')}</span
              >
              <select bind:value={timeRemaining.state.minutes} class="select">
                {#each options as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="general">
          <div class="space-y-4">
            <label class="flex items-center space-x-2 px-4">
              <div dir="ltr">
                <Switch
                  name="autostart"
                  controlActive="preset-tonal-primary"
                  controlInactive="bg-secondary-50"
                  controlWidth="w-12"
                  controlHeight="h-6"
                  thumbTranslateX="translate-x-4"
                  checked={autostartEnabled}
                  onCheckedChange={toggleAutostart}
                />
              </div>
              <p>{t('autostartAtSystemStartup')}</p>
            </label>
            <label class="flex items-center space-x-2 px-4">
              <Lightswitch />
              <p>{t('darkMode')}</p>
            </label>
            <label class="flex items-center space-x-2 px-4">
              <span>{t('language')}</span>
              <select
                class="select max-w-[160px]"
                value={languageStore.state.current}
                onchange={handleLanguageChange}
              >
                {#each languageOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </label>
            <div
              class="flex items-center justify-between px-4 pt-4 border-t border-surface-900/20"
            >
              <p
                class="text-sm font-medium text-surface-900 dark:text-surface-300"
              >
                {t('appVersion')}
              </p>
              <p
                class="text-sm font-mono text-surface-900 dark:text-surface-300"
              >
                {appVersion || '...'}
              </p>
            </div>
          </div>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
  </div>
</div>
