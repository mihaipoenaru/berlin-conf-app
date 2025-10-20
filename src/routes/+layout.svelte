<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { mode, ModeWatcher, toggleMode } from 'mode-watcher';
	import { MoonIcon, SunIcon } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<svelte:boundary>
	{@render children()}
	{#snippet failed(error)}
		{error}
	{/snippet}
</svelte:boundary>

<Button onclick={toggleMode} variant="outline" size="icon" class="fixed top-3 right-3">
	{#if mode.current === 'light'}
		<SunIcon class="size-4" />
	{:else}
		<MoonIcon class="size-4" />
	{/if}
</Button>
