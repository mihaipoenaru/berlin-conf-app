<script lang="ts">
	import type { StateData, StateName } from '$lib/model/africa/states';
	import { getConfContext, getClaimsContext } from '$lib/components/cards/StateCard.svelte';
	import {
		getConferenceForRoom,
		getCurrentPlayer,
		getPlayers,
		toggleClaim
	} from '$lib/remotes/conference.remote';

	const {
		svgCoords,
		name,
		onHighlight
	}: Pick<StateData, 'svgCoords' | 'name'> & {
		onHighlight: (name: StateName) => void;
	} = $props();

	const conf = getConfContext();
	const claims = $derived(getClaimsContext());
	const claimants: Set<string> = $derived(claims.get(name) ?? new Set());
	const pP = $derived(getCurrentPlayer(conf()));
	const plsP = $derived(getPlayers(conf()));
	const player = $derived(await pP);
	const players = $derived(await plsP);

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

		await toggleClaim(name).updates(
			getConferenceForRoom(conf()).withOverride((current) =>
				updateClaimant(current, name, player.name)
			)
		);
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
