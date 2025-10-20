<script lang="ts">
	import { groupedStates, type StateName } from '$lib/model/africa/states';
	import { Badge } from '$lib/components/ui/badge/index.js';

	const { claims }: { claims: Map<StateName, Set<string>> } = $props();

	const claimsCounts = $derived(
		claims
			.entries()
			.filter(([, claims]) => claims.size > 1)
			.map(([state, claims]) => ({ state: groupedStates.get(state)!.formattedName, count: claims.size }))
	);
</script>

<div>
	<h3 class="text-lg font-semibold mb-5">Contested States</h3>
	<div class="flex flex-wrap gap-3">
		{#each claimsCounts as { state, count }}
			<Badge variant="outline" class="text-xs">{state} ({count})</Badge>
		{/each}
	</div>
</div>
