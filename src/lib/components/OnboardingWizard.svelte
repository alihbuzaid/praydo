<script lang="ts">
  import { OnboardingManager } from '$lib/logic/OnboardingManager.svelte';
  import { fade } from 'svelte/transition';
  import { Search, MapPin, Calculator, BellRing } from '@lucide/svelte';
  import { geocode } from '$lib/api/location/GeocodeApi';
  import { selectedLocation } from '$lib/store/selectedLocation';
  import {
    calculationSettings,
    calculationMethods,
  } from '$lib/store/calculationSettings';
  import { selectedAlert } from '$lib/store/selectedAlert';
  import {
    isPermissionGranted,
    requestPermission,
  } from '@tauri-apps/plugin-notification';
  import { t } from '$lib/i18n';

  let { manager }: { manager: OnboardingManager } = $props();

  let searchQuery = $state('');
  let isSearching = $state(false);
  let searchError = $state('');

  async function handleLocationSearch() {
    if (!searchQuery) return;
    isSearching = true;
    searchError = '';

    try {
      const response = await geocode(searchQuery);
      const data = await response.json();

      if (response.status === 200 && data.length > 0) {
        const item = data[0];
        selectedLocation.state.id = item.place_id;
        selectedLocation.state.label = item.display_name;
        selectedLocation.state.latitude = parseFloat(item.lat);
        selectedLocation.state.longitude = parseFloat(item.lon);
      } else {
        searchError = t('noLocationsFound');
      }
    } catch (error) {
      console.error(t('errorFetchingLocation'), error);
      searchError = t('errorFetchingLocation');
    } finally {
      isSearching = false;
    }
  }

  async function ensureNotificationPermission() {
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === 'granted';
    }
    return granted;
  }

  async function toggleAllAlerts(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      await ensureNotificationPermission();
    }

    selectedAlert.state.alert.fajr = checked;
    selectedAlert.state.alert.dhuhr = checked;
    selectedAlert.state.alert.asr = checked;
    selectedAlert.state.alert.maghrib = checked;
    selectedAlert.state.alert.isha = checked;
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/90 backdrop-blur-sm"
  transition:fade
>
  <div
    class="card w-full max-w-xl p-8 shadow-xl bg-surface-100 dark:bg-surface-800"
  >
    <header class="mb-6">
      <h2 class="h2 font-bold text-primary-500">{t('welcome')}</h2>
      <p class="text-surface-600 dark:text-surface-400">
        {t('letsGetYouSetup')}
      </p>
    </header>

    <div class="min-h-[320px]">
      {#if manager.currentStep === 0}
        <div transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <MapPin size={24} />
            {t('step1SetLocation')}
          </h3>
          <p class="mb-6 opacity-70">
            {t('searchForCity')}
          </p>

          <div class="space-y-4">
            <div class="input-group grid-cols-[auto_1fr_auto]">
              <div class="ig-cell preset-tonal">
                <Search size={16} />
              </div>
              <input
                class="ig-input"
                type="search"
                placeholder={t('enterCityPlaceholder')}
                bind:value={searchQuery}
                onkeydown={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <button
                class="ig-btn preset-filled-primary"
                disabled={isSearching}
                onclick={handleLocationSearch}
              >
                {isSearching ? t('searching') : t('search')}
              </button>
            </div>

            {#if searchError}
              <p class="text-error-500 text-sm">{searchError}</p>
            {/if}

            {#if selectedLocation.state.label}
              <div
                class="card p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg animate-in fade-in duration-300"
              >
                <p
                  class="text-xs uppercase font-bold tracking-wider opacity-60"
                >
                  {t('selectedLocationLabel')}
                </p>
                <p class="font-bold text-lg">{selectedLocation.state.label}</p>
                <p class="text-sm opacity-70">
                  Coordinates: {selectedLocation.state.latitude.toFixed(4)}, {selectedLocation.state.longitude.toFixed(
                    4
                  )}
                </p>
              </div>
            {/if}
          </div>
        </div>
      {:else if manager.currentStep === 1}
        <div transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <Calculator size={24} />
            {t('step2CalculationMethod')}
          </h3>
          <p class="mb-6 opacity-70">Select the method used in your region.</p>

          <label class="label">
            <span class="label-text">{t('calculationMethodLabel')}</span>
            <select
              bind:value={calculationSettings.state.method}
              class="select"
            >
              {#each calculationMethods as method}
                <option value={method.value}>{method.label}</option>
              {/each}
            </select>
          </label>

          <div class="mt-6 p-4 bg-surface-200 dark:bg-surface-700 rounded-lg">
            <p class="text-sm opacity-80 italic">
              {t('tipKeepDefault')}
              later in Settings.
            </p>
          </div>
        </div>
      {:else if manager.currentStep === 2}
        <div transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <BellRing size={24} />
            {t('step3Notifications')}
          </h3>
          <p class="mb-6 opacity-70">
            {t('enableAlerts')}
          </p>

          <div class="space-y-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                class="checkbox"
                checked={Object.values(selectedAlert.state.alert).every(
                  (v) => v
                )}
                onchange={toggleAllAlerts}
              />
              <span class="font-bold">{t('enableAllPrayerAlerts')}</span>
            </label>

            <div class="grid grid-cols-2 gap-4 pl-8">
              {#each [t('fajr'), t('dhuhr'), t('asr'), t('maghrib'), t('isha')] as prayerName}
                {@const key =
                  prayerName.toLowerCase() as keyof typeof selectedAlert.state.alert}
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="checkbox"
                    bind:checked={selectedAlert.state.alert[key]}
                    onchange={async (e) => {
                      if ((e.target as HTMLInputElement).checked) {
                        await ensureNotificationPermission();
                      }
                    }}
                  />
                  <p>{prayerName}</p>
                </label>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <footer class="mt-8 flex justify-between items-center">
      <div class="flex gap-2">
        {#each Array(manager.totalSteps) as _, i}
          <div
            class="h-2 w-8 rounded-full transition-all {i ===
            manager.currentStep
              ? 'bg-primary-500'
              : 'bg-surface-300 dark:bg-surface-600'}"
          ></div>
        {/each}
      </div>

      <div class="flex gap-2">
        {#if !manager.isFirstStep}
          <button class="btn preset-outline" onclick={() => manager.prevStep()}>
            {t('back')}
          </button>
        {/if}

        {#if !manager.isLastStep}
          <button
            class="btn preset-filled"
            disabled={manager.currentStep === 0 &&
              !selectedLocation.state.label}
            onclick={() => manager.nextStep()}
          >
            {t('next')}
          </button>
        {:else}
          <button
            class="btn preset-filled-primary"
            disabled={!selectedLocation.state.label}
            onclick={() => {
              // The isSetupRequired derived state in PrayerManager will automatically update
              // because selectedLocation.state is now populated.
            }}
          >
            {t('finish')}
          </button>
        {/if}
      </div>
    </footer>
  </div>
</div>
