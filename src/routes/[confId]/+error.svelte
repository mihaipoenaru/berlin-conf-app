<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
</script>

{JSON.stringify(page.error)}

<Button href={resolve('/')}>Home</Button>
