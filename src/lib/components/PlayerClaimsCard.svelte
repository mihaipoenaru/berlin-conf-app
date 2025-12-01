<script lang="ts">
	import type { Player } from '$lib/server/players';
	import type { StateName } from '$lib/model/africa/states';
	import PlayerHeading from '$lib/components/PlayerHeading.svelte';
	import { Button } from '$lib/components/ui/button';
	import { kickPlayer } from '$lib/remotes/conference.remote';
	import { Badge } from '$lib/components/ui/badge';
	import { groupedStates } from '$lib/model/africa/states';

	type PlayerClaims = { player: Player, claims: StateName[] };

	const { claims, canKick, currentPlayer }: {
		claims: PlayerClaims,
		canKick?: boolean,
		currentPlayer: Player | null
	} = $props();
</script>

<div class="rounded border w-70 h-40 p-2 overflow-y-auto">
	<div class="flex justify-between items-center">
		<PlayerHeading player={claims.player} />
		{#if canKick && currentPlayer && currentPlayer.name !== claims.player.name}
			<Button variant="destructive" onclick={async () => await kickPlayer(claims.player.name)}>Kick</Button>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2">
		{#each claims.claims as claim}
			<Badge variant="outline" class="text-xs">{groupedStates.get(claim)!.formattedName}</Badge>
		{/each}
	</div>
</div>
