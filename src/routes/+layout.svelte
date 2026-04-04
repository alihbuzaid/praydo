<script lang="ts">
  import { setContext, onDestroy } from 'svelte';
  import { PrayerManager } from '$lib/logic/PrayerManager.svelte';
  import { OnboardingManager } from '$lib/logic/OnboardingManager.svelte';
  import OnboardingWizard from '$lib/components/OnboardingWizard.svelte';
  import { languageStore } from '$lib/store/language';
  import '../app.css';

  const prayerManager = new PrayerManager();
  const onboardingManager = new OnboardingManager();

  // Provide the manager to all child routes
  setContext('prayerManager', prayerManager);

  let { children } = $props();

  // Reactively apply RTL direction and lang attribute based on language
  $effect(() => {
    if (typeof document === 'undefined') return;
    const currentLocale = languageStore.state.current;
    document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLocale;
  });

  onDestroy(() => {
    prayerManager.destroy();
  });
</script>

{#if prayerManager.isSetupRequired}
  <OnboardingWizard manager={onboardingManager} />
{:else}
  {@render children()}
{/if}
