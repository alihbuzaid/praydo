<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { ChevronLeft, ChevronRight, Home } from '@lucide/svelte';
  import type { PrayerManager } from '$lib/logic/PrayerManager.svelte';
  import { selectedTimes } from '$lib/store/selectedTimes';
  import { languageStore } from '$lib/store/language';
  import type { PrayerTimes } from '$lib/logic/types';
  import { t } from '$lib/i18n';

  const manager = getContext('prayerManager') as PrayerManager;
  const now = new Date();

  let currentYear = $state(now.getFullYear());
  let currentMonth = $state(now.getMonth());
  let schedule = $state<{ day: number; prayers: PrayerTimes }[]>([]);
  let isRtl = $derived(languageStore.state.current === 'ar');

  // Month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let currentMonthName = $derived(monthNames[currentMonth]);

  // Fetch schedule when month/year changes
  $effect(() => {
    schedule = manager.getMonthSchedule(currentYear, currentMonth);
  });

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }

  function prevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }

  function isToday(day: number) {
    return (
      day === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  }

  // Columns to display (based on user settings + Date)
  const columns = [
    { key: 'date', label: t('date'), labelKey: 'date' },
    {
      key: 'fajr',
      label: t('fajr'),
      labelKey: 'fajr',
      enabled: selectedTimes.state.daily.fajr,
    },
    {
      key: 'sunrise',
      label: t('sunrise'),
      labelKey: 'sunrise',
      enabled: selectedTimes.state.daily.sunrise,
    },
    {
      key: 'dhuhr',
      label: t('dhuhr'),
      labelKey: 'dhuhr',
      enabled: selectedTimes.state.daily.dhuhr,
    },
    {
      key: 'asr',
      label: t('asr'),
      labelKey: 'asr',
      enabled: selectedTimes.state.daily.asr,
    },
    {
      key: 'maghrib',
      label: t('maghrib'),
      labelKey: 'maghrib',
      enabled: selectedTimes.state.daily.maghrib,
    },
    {
      key: 'isha',
      label: t('isha'),
      labelKey: 'isha',
      enabled: selectedTimes.state.daily.isha,
    },
  ].filter((c) => c.key === 'date' || c.enabled);

  onMount(() => {
    //
  });
</script>

<div class="w-full h-screen flex flex-col p-6 gap-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
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
      <h2 class="h2 font-bold text-surface-900 dark:text-surface-50">
        {t('prayerCalendar')}
      </h2>
    </div>

    <div class="flex items-center gap-4 bg-surface-200-800 p-1 rounded-full">
      <button
        type="button"
        class="btn-icon btn-icon-sm hover:preset-filled-primary-500"
        onclick={prevMonth}
      >
        {#if isRtl}
          <ChevronRight size={18} />
        {:else}
          <ChevronLeft size={18} />
        {/if}
      </button>
      <span
        class="font-mono font-bold min-w-[140px] text-center text-surface-900 dark:text-surface-50"
      >
        {currentMonthName}
        {currentYear}
      </span>
      <button
        type="button"
        class="btn-icon btn-icon-sm hover:preset-filled-primary-500"
        onclick={nextMonth}
      >
        {#if isRtl}
          <ChevronLeft size={18} />
        {:else}
          <ChevronRight size={18} />
        {/if}
      </button>
    </div>
  </div>

  <!-- Table Container -->
  <div
    class="table-container flex-1 border border-surface-500/20 bg-surface-50-950 rounded-lg overflow-hidden shadow-sm overflow-y-auto"
  >
    <table class="table-hover w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <thead
        class="bg-surface-200-800 text-surface-900 dark:text-surface-50 sticky top-0 z-10"
      >
        <tr>
          {#each isRtl ? [...columns].reverse() : columns as col}
            <th
              class="p-3 font-bold uppercase text-xs tracking-wider bg-surface-200 dark:bg-surface-800 text-center"
              >{col.label}</th
            >
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each schedule as row}
          <tr
            class="border-b border-surface-500/10 {isToday(row.day)
              ? 'bg-primary-500/10'
              : ''}"
          >
            {#each isRtl ? [...columns].reverse() : columns as col}
              <td
                class="p-3 font-mono text-sm {col.key === 'date'
                  ? 'text-center'
                  : 'text-center'} {isToday(row.day)
                  ? 'font-bold text-primary-700 dark:text-primary-400'
                  : 'text-surface-900 dark:text-surface-200'}"
              >
                {#if col.key === 'date'}
                  <span
                    class="inline-block w-8 h-8 leading-8 rounded-full {isToday(
                      row.day
                    )
                      ? 'bg-primary-500 text-white'
                      : ''}"
                  >
                    {row.day}
                  </span>
                {:else}
                  {row.prayers[col.key]}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  table {
    border-collapse: collapse;
  }
</style>
