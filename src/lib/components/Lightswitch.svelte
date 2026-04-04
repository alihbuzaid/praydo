<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { modeLightSwitch } from '$lib/store/modeLightSwitch';

  let checked = $state(false);

  $effect(() => {
    const mode = modeLightSwitch.state.mode || 'light';
    checked = mode === 'dark';
  });

  const onCheckedChange = (event: { checked: boolean }) => {
    const mode = event.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mode', mode);
    modeLightSwitch.state.mode = mode;
    checked = event.checked;
  };
</script>

<div dir="ltr">
  <Switch
    controlActive="preset-tonal-primary"
    controlInactive="bg-secondary-50"
    controlWidth="w-12"
    controlHeight="h-6"
    thumbTranslateX="translate-x-4"
    {checked}
    {onCheckedChange}
  />
</div>
