<script lang="ts">
	export let options: string[] | number[];
	export let values: string[] | number[] = options;
	export let id = 0;
	export let accent: string = 'text-blue-500';
	export let align = "left"
	export let size = "base"

	import Expand from '../icons/Expand.svelte';

	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '$lib/utils/actions';

	const dispatch = createEventDispatcher();

	let toggle = 0;

	const select = (selected_id: number) => {
		id = selected_id;
		dispatch('select', {
			value: values[id]
		});
		toggle = 0;
	};
</script>

<div
	use:clickOutside
	on:outclick={() => {
		toggle = 0;
	}}
	class:text-sm={size === "sm"}
	class:text-base={size === "base"}
>
	<button
		on:click={() => {
			toggle++;
		}}
		class="flex place-items-center font-medium {toggle % 2 === 1 ? accent : ''}"
	>
		{options[id]}
		<Expand size={5} color={toggle % 2 === 1 ? accent : 'text-black'} />
	</button>
	<div class="relative" class:hidden={toggle % 2 === 0}>
		<ul class="absolute z-50 rounded bg-white shadow" class:right-0={align === "right"}>
			{#each options as option, i}
				<li on:click={() => select(i)}>{option}</li>
			{/each}
		</ul>
	</div>
</div>

<style lang="postcss">
	li {
		@apply cursor-pointer whitespace-nowrap py-1 px-2 hover:bg-gray-100;
	}
</style>
