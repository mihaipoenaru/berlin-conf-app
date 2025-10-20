<script lang="ts">
	import EPopover from './Popover.svelte';
	import type { ComponentProps, Snippet } from 'svelte';

	const {
		children,
		placement = 'top',
		anchorQuery
	}: { children: Snippet } & Pick<
		ComponentProps<typeof EPopover>,
		'placement' | 'hoverOutDelay' | 'anchorQuery'
	> = $props();
</script>

<EPopover {children} class="max-w-96 text-xs font-normal text-wrap" {placement} {anchorQuery} />
