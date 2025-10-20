<script module lang="ts">
	import { createContext } from 'svelte';
	import type { StateName } from '$lib/model/africa/states';
	import type { SvelteMap } from 'svelte/reactivity';

	export const [getClaimsContext, setClaimsContext] =
		createContext<SvelteMap<StateName, Set<string>>>();

	export const [getConfContext, setConfContext] = createContext<() => string>();
</script>

<script lang="ts">
	import type { StateData } from '$lib/model/africa/states';
	import { getPlayers } from '$lib/remotes/conference.remote';
	import PlayerHeading from '$lib/components/PlayerHeading.svelte';

	const { state }: { state: StateData | null } = $props();

	const confId = getConfContext();

	const claims = $derived(getClaimsContext());
	const playersP = $derived(getPlayers(confId()));
	const title = $derived(state?.formattedName ?? 'No state selected');
	const claimants: Set<string> = $derived(
		state ? (claims.get(state.name) ?? new Set()) : new Set()
	);
	const players = $derived(await playersP);
	const claimantPlayers = $derived(
		players
			.values()
			.toArray()
			.filter((player) => {
				return claimants.has(player.name);
			})
	);
</script>

<div
	class="h-full rounded-2xl border border-accent-foreground bg-background p-4 shadow shadow-accent-foreground min-h-44"
>
	<div class="flex h-full flex-col justify-between">
		<h3 class="text-2xl">
			{title}
		</h3>

		<div class="flex items-center justify-between">
			<h4 class="text-xl">Claimaints</h4>
			<div class="flex flex-wrap">
				{#each claimantPlayers as player}
					<PlayerHeading {player} />
				{/each}
			</div>
		</div>
	</div>
</div>
