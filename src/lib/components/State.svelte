<script lang="ts">
	import type { StateData, StateName } from '$lib/model/africa/states';
	import { getConfContext } from '$lib/components/cards/StateCard.svelte';
	import { getConferenceForRoom, toggleClaim } from '$lib/remotes/conference.remote';
	import type { Player } from '$lib/server/players';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const {
		svgCoords,
		name,
		onHighlight,
		claims,
		players,
		player
	}: Pick<StateData, 'svgCoords' | 'name'> & {
		onHighlight: (name: StateName) => void;
		claims: Map<StateName, Set<string>>;
		players: Set<Player>
		player?: Player | null
	} = $props();

	const conf = getConfContext();
	const claimants: Set<string> = $derived(claims.get(name) ?? new Set());

	const claimStatus: 'none' | 'singular' | 'multiple' = $derived.by(() => {
		if (claimants.size === 0) return 'none';
		if (claimants.size === 1) return 'singular';
		return 'multiple';
	});

	export function updateClaimant(
		current: Map<StateName, Set<string>>,
		name: StateName,
		player: string
	) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const updated = new Map(current);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const claimants = new Set(updated.get(name))!;

		if (claimants.has(player)) claimants.delete(player);
		else claimants.add(player);

		updated.set(name, claimants);

		return updated;
	}

	async function onclick() {
		if (!player) return;

		const { kicked } = await toggleClaim(name).updates(
			getConferenceForRoom(conf()).withOverride((current) =>
				updateClaimant(current, name, player.name)
			)
		);

		if (kicked) goto(resolve('/kicked'));
	}

	function getClaimantColor(claimant: string) {
		return players.values().find((v) => v.name === claimant)?.color ?? '';
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<path
	id={name}
	d={svgCoords}
	class={[
		'duration-500',
		player && 'cursor-pointer',
		claimStatus === 'none' && 'fill-background',
		claimStatus === 'multiple' && 'animate-pulse fill-destructive'
	]}
	onmouseover={() => {
		onHighlight(name);
	}}
	{onclick}
	role="button"
	aria-label={`Select ${name}`}
	tabindex="0"
	style="fill: {claimStatus === 'singular'
		? getClaimantColor(claimants.values().toArray()[0])
		: ''}"
></path>
