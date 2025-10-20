<script lang="ts">
	import type { Player } from '$lib/server/players';
	import * as Item from '$lib/components/ui/item';

	const { player }: { player: Player } = $props();
</script>

<Item.Root>
	<Item.Media><div class="size-4 rounded" style="background: {player.color}"></div></Item.Media>
	<Item.Content>
		<Item.Title>{player.name}</Item.Title>
	</Item.Content>
</Item.Root>
