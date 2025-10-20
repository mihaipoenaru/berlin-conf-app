<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import Popover from '$lib/components/popover/Popover.svelte';
	import type { FocusEventHandler, KeyboardEventHandler } from 'svelte/elements';
	import { watch } from 'runed';
	import { Button } from '$lib/components/ui/button';

	let {
		value = $bindable(''),
		onfocus,
		onblur,
		options,
		labelSnippet,
		...others
	}: {
		options: { value: string; label: string }[];
		labelSnippet?: Snippet<[string]>;
	} & ComponentProps<typeof Input> = $props();

	let open = $state(false);
	let typedValue: string | undefined = $state();
	let mouseOverPopover = $state(false);
	let activeIndex = $state(-1);

	const filteredOptions = $derived(
		typedValue
			? options.filter((option) =>
					option.label.toLowerCase().includes(typedValue?.toLowerCase() ?? '')
				)
			: options
	);

	watch(
		() => value,
		() => {
			if (!value) return;
			typedValue = options.find((option) => option.value === value)?.label;
			mouseOverPopover = false;
			open = false;
			activeIndex = -1;
		}
	);

	const onFocus: FocusEventHandler<HTMLInputElement> = (e) => {
		open = true;
		onfocus?.(e);
	};

	const onBlur: FocusEventHandler<HTMLInputElement> = (e) => {
		if (mouseOverPopover) {
			e.preventDefault();
			return;
		}
		open = false;
		onblur?.(e);
	};

	function commitSelection() {
		if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
			value = filteredOptions[activeIndex].value;
		}
	}

	const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
		open = true;
		const len = filteredOptions.length;
		if (len === 0) return;

		switch (e.key) {
			case 'ArrowDown':
			case 'ArrowUp': {
				e.preventDefault();
				const delta = e.key === 'ArrowDown' ? 1 : -1;
				activeIndex = (activeIndex + delta + len) % len;
				break;
			}
			case 'Enter': {
				e.preventDefault();
				commitSelection();
				open = false;
				break;
			}
		}
	};
</script>

<!--improvising for how svelte remote form works-->
<input hidden {...others} {value}/>
<Input
	bind:value={typedValue}
	onfocus={onFocus}
	onblur={onBlur}
	onkeydown={onKeyDown}
	aria-invalid={others['aria-invalid']}
	placeholder={others.placeholder}
/>
<Popover
	matchWidth={true}
	placement="bottom-start"
	class="max-h-100 overflow-y-auto"
	showArrow={false}
	{open}
	trigger="manual"
	onmouseover={() => (mouseOverPopover = true)}
	onmouseleave={() => (mouseOverPopover = false)}
>
	<ul>
		{#each filteredOptions as option, i}
			<li>
				<Button
					variant="ghost"
					class={['w-full', i === activeIndex && 'bg-accent text-accent-foreground']}
					onclick={() => (value = option.value)}
					onmouseenter={() => (activeIndex = i)}
				>
					<Item.Root class="w-full">
						<Item.Content>
							<Item.Title>
								<div>{option.label}</div>
								{#if labelSnippet}
									{@render labelSnippet(option.value)}
								{/if}
							</Item.Title>
						</Item.Content>
					</Item.Root>
				</Button>
			</li>
		{/each}
	</ul>
</Popover>
