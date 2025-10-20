<script lang="ts">
	import {
		groupedStates,
		type StateData,
		stateList,
		type StateName
	} from '$lib/model/africa/states';
	import State from '$lib/components/State.svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index';
	import { Copy, CopyCheck, LoaderCircle } from '@lucide/svelte';
	import {
		addPlayer,
		getConferenceForRoom,
		getCurrentPlayer,
		getPlayers
	} from '$lib/remotes/conference.remote';
	import { SvelteMap } from 'svelte/reactivity';
	import { watch } from 'runed';
	import StateCard, {
		setClaimsContext,
		setConfContext
	} from '$lib/components/cards/StateCard.svelte';
	import { onMount } from 'svelte';
	import { confCacheKey } from '$lib/utils';
	import { type Player } from '$lib/server/players';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import * as Field from '$lib/components/ui/field/index';
	import { Input } from '$lib/components/ui/input/index';
	import Select from '$lib/components/ui/Select.svelte';
	import PlayerHeading from '$lib/components/PlayerHeading.svelte';
	import PlayerList from '$lib/components/PlayerList.svelte';
	import ContestedStates from '$lib/components/ContestedStates.svelte';

	const colorList = [
		['#7B0E1D', 'Deep Red'],
		['#93aaff', 'Sky Blue'],
		['#544B3D', 'Dark Tan'],
		['#FFD700', 'Imperial Gold'],
		['#006B3C', 'Deep Green'],
		['#8B4513', 'Saddle Brown'],
		['#800080', 'Royal Purple'],
		['#FF4F00', 'Orange'],
		['#4B0082', 'Indigo'],
		['#DAA520', 'Golden Rod'],
		['#DC143C', 'Crimson'],
		['#CD853F', 'Peru Brown'],
		['#2E8B57', 'Sea Green'],
		['#8B0000', 'Dark Red'],
		['#4B5320', 'Army Green'],
		['#B8860B', 'Dark Goldenrod'],
		['#483D8B', 'Dark Slate Blue'],
		['#556B2F', 'Dark Olive Green']
	];

	const confId = $derived(page.params.confId)!;
	let showPopover = $state(false);
	let copyActivated = $state(false);
	let claims = new SvelteMap<StateName, Set<string>>();

	setClaimsContext(claims);
	setConfContext(() => confId);

	const scP = $derived(getConferenceForRoom(confId));
	const plsP = $derived(getPlayers(confId));
	const plP = $derived(getCurrentPlayer(confId));

	const conferenceClaims = $derived(await scP);
	const players = $derived(await plsP);
	const player: Player | null = $derived(await plP);

	let activeState: StateData | null = $state(null);
	const takenColors = $derived(new Set(players.values().map((p) => p.color)));
	const availableColorOptions = $derived(
		colorList
			.filter(([c]) => !takenColors.has(c))
			.map(([color, desc]) => ({
				label: desc,
				value: color
			}))
	);
	let openDialog = $state(false);
	let submittingPlayer = $state(false);

	const { color, name } = addPlayer.fields;
	let iid: NodeJS.Timeout | undefined = undefined;

	onMount(() => {
		document.cookie = `${confCacheKey}=${confId}; path=/`;
		restartRefresh();

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				clearInterval(iid);
			} else {
				restartRefresh();
			}
		});

		return () => {
			clearInterval(iid);
			document.removeEventListener('visibilitychange', () => {});
		};
	});

	$effect(() => {
		conferenceClaims.forEach((value, key) => claims.set(key, new Set(value)));
	});

	watch(
		() => conferenceClaims,
		() => {
			conferenceClaims.forEach((value, key) => claims.set(key, new Set(value)));
		}
	);

	function restartRefresh() {
		clearInterval(iid);
		iid = setInterval(() => {
			getPlayers(confId).refresh();
			getConferenceForRoom(confId).refresh();
		}, 10_000);
	}

	function onCopy() {
		copyActivated = true;
		navigator.clipboard.writeText(page.url.href);

		setTimeout(() => {
			copyActivated = false;
		}, 2000);
	}
</script>

<PlayerList {players} />

<h1 class="flex items-center justify-center gap-2 text-center text-3xl font-bold">
	Room code: {confId}

	<Button variant="outline" size="icon" onclick={onCopy} class={[copyActivated && 'scale-120']}>
		{#if copyActivated || showPopover}
			<CopyCheck />
		{:else}
			<Copy />
		{/if}
	</Button>
</h1>

<h2 class="mt-2 flex items-center justify-center gap-2 text-center text-2xl">
	{#if !player}
		<div>No country selected</div>
		<Button onclick={() => (openDialog = true)}>Select a country</Button>
	{:else}
		<PlayerHeading {player} />
	{/if}
</h2>

<div class="mt-10 grid grid-cols-1 gap-x-10 gap-y-15 p-15 md:grid-cols-3 xl:grid-cols-2">
	<svg
		id="africa-map"
		viewBox="475 255 400 90"
		class={[
			'w-full',
			'rounded-full',
			'aspect-square',
			player && '[&>*]:hover:fill-secondary-foreground',
			'transition',
			'bg-blue-500 dark:bg-blue-900',
			'stroke-foreground',
			'md:row-span-2',
			'md:col-span-2',
			'xl:col-span-1'
		]}
	>
		{#each stateList as state}
			<State {...state} onHighlight={(name) => (activeState = groupedStates.get(name)!)} />
		{/each}
	</svg>
	<StateCard state={activeState} />
	<ContestedStates claims={conferenceClaims}/>
</div>

<Dialog bind:open={openDialog}>
	{#snippet children(close: () => void)}
		<form
			{...addPlayer.enhance(async ({ submit }) => {
				submittingPlayer = true;
				await submit();
				submittingPlayer = false;
				close();
			})}
		>
			<Field.Group>
				<Field.Field>
					<Field.Label for="tag">Country tag</Field.Label>
					<Input {...name.as('text')} placeholder="Japan" />
					{@const issue = name.issues()?.[0].message}
					{#if issue}
						<Field.Error>{issue}</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.Label for="tag">Color</Field.Label>
					<!--				eslint-disable-next-line @typescript-eslint/no-unused-vars-->
					{@const issue = color.issues()?.[0].message}
					<Select
						options={availableColorOptions}
						{...color.as('text')}
						placeholder="Select a color"
					>
						{#snippet labelSnippet(value)}
							<div class="size-4 rounded-full" style="background: {value}"></div>
						{/snippet}
					</Select>
					{#if issue}
						<Field.Error>{issue}</Field.Error>
					{/if}
				</Field.Field>
			</Field.Group>

			<Button type="submit" class="mt-10" disabled={submittingPlayer}>
				Confirm
				{#if submittingPlayer}
					<LoaderCircle class="animate-spin" />
				{/if}
			</Button>
		</form>
	{/snippet}
</Dialog>
