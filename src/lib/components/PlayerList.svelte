<script lang="ts">
	import type { Player } from '$lib/server/players';
	import * as Item from '$lib/components/ui/item';
	import PlayerHeading from '$lib/components/PlayerHeading.svelte';

	const { players }: { players: Set<Player> } = $props();
	let hovering = $state(false);
</script>

<Item.Root
	variant="outline"
	size="sm"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	class="fixed top-3 left-3"
>
	<Item.Content>
		<Item.Title>{players.size} players connected</Item.Title>
		{#if hovering}
			<Item.Description>
				<div class="grid  grid-cols-3 gap-2">
					{#each players as player}
						<PlayerHeading {player} />
					{/each}
				</div>
			</Item.Description>
		{/if}
	</Item.Content>
</Item.Root>
