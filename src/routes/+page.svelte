<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HandshakeIcon, LoaderCircle, Undo } from '@lucide/svelte';
	import { hostNewConference } from '$lib/remotes/conference.remote';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import type { RemoteForm } from '@sveltejs/kit';

	const { data }: PageProps = $props();

	let loading = $state(false);

	const toggleLoading: Parameters<RemoteForm<void, { confId: number }>['enhance']>[0] = async ({
		submit
	}) => {
		loading = true;
		try {
			await submit();
		} catch (e) {
			console.error(e);
			loading = false;
		}
	};
</script>

<section class="mx-auto max-w-7xl py-16 md:py-24">
	<div class="flex flex-col justify-center gap-6 md:gap-8">
		<p class="text-sm font-medium text-foreground/70">Victoria 3 multiplayer tool</p>
		<div class="text-5xl font-extrabold leading-tight md:text-6xl">
			Real-time claims map for Victoria 3
		</div>
		<div class="max-w-prose space-y-2 text-lg leading-relaxed text-foreground/80">
			<p>
				Host a colonial congress for your Victoria 3 multiplayer campaign on a live interactive map of Africa.
			</p>
			<p>Contest states, stake claims, strike deals.</p>
		</div>
	</div>
</section>

<section class="bg-secondary/60 py-6 md:py-8">
	<form
		class="mx-auto flex max-w-7xl flex-wrap items-center gap-4 md:gap-5"
		{...hostNewConference.enhance(toggleLoading)}
	>
		<div class="text-sm text-foreground/80">Free & no sign-up needed. Jump straight in!</div>
		<Button type="submit" disabled={loading}>
			{#if loading}
				<LoaderCircle class="animate-spin" />
				Creating…
			{:else}
				Host a conference <HandshakeIcon />
			{/if}
		</Button>
	</form>
	<svelte:boundary>
		{#if data.prevConference}
			<div class="mx-auto mt-6 flex max-w-7xl flex-wrap items-center gap-4 md:mt-8 md:gap-5">
				<div class="text-sm text-foreground/80">Or jump back into your previous room:</div>
				<Button href={resolve(`/${data.prevConference}`)} variant="outline">
					Resume <Undo />
				</Button>
			</div>
		{/if}
	</svelte:boundary>
</section>
