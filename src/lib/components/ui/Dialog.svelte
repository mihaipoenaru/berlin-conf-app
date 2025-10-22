<script lang="ts">
	import type { Snippet } from 'svelte';

	let { open = $bindable(false), children }: { open: boolean; children: Snippet<[() => void]> } =
		$props();

	function close() {
		open = false;
	}
</script>

{#if open}
	<!--	 svelte-ignore a11y_click_events_have_key_events-->
	<!--	 svelte-ignore a11y_no_static_element_interactions-->
	<div
		class="fixed top-0 left-0 flex h-dvh w-dvw items-center justify-center bg-black/75"
		onclick={() => (open = false)}
	>
		<div
			class="h-1/2 w-8/12 rounded-2xl bg-background p-5 lg:w-1/4"
			onclick={(e) => e.stopPropagation()}
		>
			{@render children(close)}
		</div>
	</div>
{/if}
