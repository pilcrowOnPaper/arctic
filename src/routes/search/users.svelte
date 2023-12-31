<script lang="ts">
	export let initial_listing: Listing<User>;
	export let query_text: string;

	import type { Listing, User } from '$lib/types/reddit';

	import { getSearchListing } from '$lib/utils/reddit/search';
	import { inViewport } from '$lib/utils/actions';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from "$lib/components/utils/Loading.svelte"

	let users = initial_listing.data.children;
	let latest_post_in_view: number = 0;
	let after_id = initial_listing.data.after;
	let batch_count = initial_listing.data.dist;
	let loading = false

	const updateLatestPostInView = (id: number) => {
		if (id > latest_post_in_view) {
			latest_post_in_view = id;
			getNextItemBatch(latest_post_in_view);
		}
	};

	const getNextItemBatch = async (id: number) => {
		if (id > 0) {
			if ((id + 1) % batch_count !== 0) return;
			if (!after_id) return;
		}
		if (batch_count < 25) return;
		loading = true
		const result = await getSearchListing(query_text, 'user', null, after_id);
		if (!result.success) return loading = false;
		const listing = result.data;
		const new_users = listing.data.children as User[];
		users = [...users, ...new_users];
		after_id = result.data.data.after;
		batch_count = new_users.length;
		loading = false
	};

	onMount(() => {
		getNextItemBatch(0);
	});
</script>

<div class="mt-2 flex flex-col divide-y">
	{#each users as user, i}
		<div
			class="flex gap-x-4 py-2 group"
			use:inViewport
			on:display={() => {
				updateLatestPostInView(i);
			}}
			on:click={() => {
				if (user.data.is_suspended) return;
				goto(`/u/${user.data.name}`);
			}}
			class:cursor-pointer={!user.data.is_suspended}
		>
			{#if user.data.icon_img}
				<img class="h-8 rounded-full" src={user.data.icon_img} alt={user.data.name} />
			{:else}
				<div
					class="h-8 w-8 flex-shrink-0 rounded-full bg-blue-500 flex place-items-center place-content-center text-white text-lg font-semibold"
				>
					{user.data.name.charAt(0).toLocaleLowerCase()}
				</div>
			{/if}

			<div>
				<p class="text-sm font-medium group-hover:text-blue-500">{user.data.name}</p>
				{#if user.data.subreddit}
					<p class="text-xs">{user.data.subreddit.public_description}</p>
				{/if}
				{#if user.data.is_suspended}
					<p class="text-xs text-red-500">user suspended</p>
				{/if}
			</div>
		</div>
	{/each}
	{#if loading}
		<div class="flex w-full place-content-center py-12">
			<Loading />
		</div>
	{/if}
</div>
