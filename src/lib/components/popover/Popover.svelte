<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { Placement } from '@floating-ui/dom';
	import type { ClassValue } from 'svelte/elements';
	import { SvelteMap } from 'svelte/reactivity';

	export type PopoverProps = {
		children: Snippet<[() => void | undefined]>;
		open?: boolean;
		placement?: Placement;
		trigger?: 'click' | 'hover' | 'manual';
		anchorQuery?: string;
		class?: ClassValue;
		hoverOutDelay?: number;
		hoverInDelay?: number;
		showArrow?: boolean;
		actualPlacement?: Placement;
		onClose?: () => void;
		group?: string;
		matchWidth?: boolean;
		onmouseover?: () => void;
		onmouseleave?: () => void;
	};

	let activeId = new SvelteMap<string, string>();
</script>

<script lang="ts">
	import {
		arrow,
		computePosition,
		flip,
		type MiddlewareData,
		offset,
		shift,
		autoPlacement,
		autoUpdate
	} from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let {
		children,
		open = $bindable(false),
		placement,
		trigger = 'hover',
		anchorQuery,
		class: clazz,
		hoverOutDelay = 500,
		hoverInDelay = 0,
		showArrow = true,
		actualPlacement = $bindable(),
		onClose,
		group = '@default@',
		matchWidth = false,
		onmouseover: omo,
		onmouseleave
	}: PopoverProps = $props();

	const id =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let floatingElem: HTMLDivElement | undefined = $state();
	let arrowElem: HTMLDivElement | undefined = $state();
	let referenceDiv: HTMLDivElement | undefined = $state();
	let hoverDelayCancel: NodeJS.Timeout | undefined;
	let switchDelayCancel: NodeJS.Timeout | undefined;

	let anchorElem: HTMLElement | null = $derived.by(() => {
		if (anchorQuery && browser) return document.querySelector(anchorQuery);

		return (referenceDiv?.previousElementSibling ??
			floatingElem?.previousElementSibling) as HTMLElement | null;
	});

	let cleanup: () => void | undefined;

	onMount(() => {
		return () => {
			cleanup?.();
			document.removeEventListener('click', onClickOutside);
			anchorElem?.removeEventListener('click', onClick);
			anchorElem?.removeEventListener('mouseenter', mouseIn);
			anchorElem?.removeEventListener('mouseleave', mouseOut);
		};
	});

	$effect(() => {
		if (open) activeId.set(group, id);
		else {
			onClose?.();
			if (activeId.get(group) === id) activeId.delete(group);
		}
	});

	$effect(() => {
		if (open && activeId.get(group) !== id && trigger === 'hover') open = false;
	});

	$effect(() => {
		if (!anchorElem) return;

		anchorElem.addEventListener('click', onClick);
		anchorElem.addEventListener('mouseenter', mouseIn);
		anchorElem.addEventListener('mouseleave', mouseOut);
	});

	$effect(() => {
		cleanup?.();
		if (open && anchorElem && floatingElem) {
			cleanup = autoUpdate(anchorElem, floatingElem, updatePopoverPosition, {
				animationFrame: true
			});
		} else if (floatingElem) {
			if (!open && matchWidth) {
				floatingElem.style.width = '';
			}
		}
	});

	async function updatePopoverPosition() {
		if (!anchorElem || !floatingElem) throw new Error('Missing elements for popover');

		if (matchWidth) {
			const { width } = anchorElem.getBoundingClientRect();
			floatingElem.style.width = `${width}px`;
		} else {
			floatingElem.style.width = '';
		}

		const {
			x,
			y,
			middlewareData,
			placement: finalPlacement
		} = await computePosition(anchorElem, floatingElem, {
			middleware: [
				offset(8),
				placement ? flip() : autoPlacement(),
				shift({ padding: 5 }),
				arrow({ element: arrowElem! })
			],
			placement
		});

		Object.assign(floatingElem.style, {
			left: `${x}px`,
			top: `${y}px`
		});

		actualPlacement = finalPlacement;

		if (arrowElem) calculateArrowPos(middlewareData, finalPlacement, arrowElem);
	}

	function calculateArrowPos(
		middlewareData: MiddlewareData,
		finalPlacement: Placement,
		arrowRef: HTMLElement
	) {
		const { x: arrowX, y: arrowY } = middlewareData.arrow!;

		const staticSide = {
			top: 'bottom',
			right: 'left',
			bottom: 'top',
			left: 'right'
		}[finalPlacement.split('-')[0]];

		let rotation: number;

		if (finalPlacement.includes('top')) rotation = 180;
		else if (finalPlacement.includes('right')) rotation = 270;
		else if (finalPlacement.includes('bottom')) rotation = 0;
		else rotation = 90;

		Object.assign(arrowRef.style, {
			left: arrowX != null ? `${arrowX}px` : '',
			top: arrowY != null ? `${arrowY}px` : '',
			right: '',
			bottom: '',
			transform: `rotate(${rotation}deg)`,
			[staticSide!]: '-12px'
		});
	}

	function mouseIn() {
		if (trigger !== 'hover') return;
		if (hoverDelayCancel) clearTimeout(hoverDelayCancel);
		switchDelayCancel = setTimeout(() => (open = true), hoverInDelay);
	}

	function cancelClose() {
		clearTimeout(hoverDelayCancel);
		omo?.();
	}

	function mouseOut() {
		onmouseleave?.();
		if (trigger !== 'hover') return;
		if (switchDelayCancel) clearTimeout(switchDelayCancel);
		hoverDelayCancel = setTimeout(() => (open = false), hoverOutDelay);
	}

	function onClick() {
		if (trigger !== 'click') return;
		open = !open;
		if (open) document.addEventListener('click', onClickOutside);
		else document.removeEventListener('click', onClickOutside);
	}

	function onClickOutside(event: MouseEvent) {
		if (trigger !== 'click') return;
		if (
			anchorElem &&
			!anchorElem.contains(event.target as Node) &&
			!floatingElem?.contains(event.target as Node)
		)
			open = false;
	}

	function close() {
		open = false;
	}

	// noinspection JSUnusedGlobalSymbols
	export function getAnchorElem() {
		return anchorElem;
	}
</script>

{#if open}
	<div
		class={[
			'absolute',
			'top-0',
			'left-0',
			'p-2',
			'rounded-md',
			'border',
			'border-primary-foreground',
			'shadow',
			'bg-popover',
			'z-200',
			'text-sm',
			'font-normal',
			clazz
		]}
		bind:this={floatingElem}
		onmouseover={cancelClose}
		onmouseout={mouseOut}
		onfocus={cancelClose}
		onfocusout={mouseOut}
		onblur={mouseOut}
		role="tooltip"
	>
		{@render children(close)}
		{#if showArrow}
			<div bind:this={arrowElem} class="absolute h-4 w-4">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 6L18 18H6L12 6Z" fill="currentColor" class="fill-current" />
				</svg>
			</div>
		{/if}
	</div>
{:else}
	<div bind:this={referenceDiv} hidden></div>
{/if}
