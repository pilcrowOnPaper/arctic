<script lang="ts">
	export let initial_listing: Listing<Post>;
	export let about: User;
	export let filter: Filter = {
		sort: null,
		time: null
	};

	import Header from '$lib/components/user/Header.svelte';
	import Filter_Select from '$lib/components/subreddit/Filter.svelte';
	import Cards from '$lib/components/subreddit/Cards.svelte';
	import Large from '$lib/components/cards/Large.svelte';
	import Compact from '$lib/components/cards/Compact.svelte';
	import Loading from '$lib/components/utils/Loading.svelte';

	import type { User, Listing, Post } from '$lib/types/reddit';
	import type { Filter } from '$lib/types/filter';

	import { getUserListing, getUserPathname } from '$lib/utils/reddit/users';
	import { page } from '$app/stores';
	import selected_post from '$lib/stores/post';
	import { onMount } from 'svelte';

	let posts = initial_listing.data.children;
	let latest_post_in_view: number = 0;
	let after_id = initial_listing.data.after;
	let batch_count = initial_listing.data.dist;
	let loading = false;
	const user = $page.params.user;

	let card = 'large';

	const updateLatestPostInView = (id: number) => {
		if (id > latest_post_in_view) {
			latest_post_in_view = id;
			getNextPostBatch(latest_post_in_view);
		}
	};

	const getNextPostBatch = async (id: number) => {
		if (id > 0) {
			if ((id + 1) % batch_count !== 0) return;
			if (!after_id) return;
		}
		loading = true;
		const initial_sort = filter.sort ? filter.sort.valueOf() : null;
		const initial_time = filter.time ? filter.time.valueOf() : null;
		const result = await getUserListing(user, 'submitted', after_id, filter);
		if (!result.success) return (loading = false);
		if (initial_sort !== filter.sort || initial_time !== filter.time) return (loading = false);
		const listing = result.data;
		const new_posts = listing.data.children as Post[];
		posts = [...posts, ...new_posts];
		after_id = result.data.data.after;
		batch_count = new_posts.length;
		loading = false;
	};

	const handleFilter = (e: CustomEvent) => {
		filter = e.detail.options as Filter;
		getNewPosts(true);
	};

	const handleCardTypeChange = (e: CustomEvent) => {
		card = e.detail.value;
	};

	const getNewPosts = async (update_history: boolean) => {
		loading = true;
		posts = [];
		const new_url = $page.url.origin + getUserPathname(user, 'posts', filter);
		if (update_history) {
			window.history.replaceState({}, document.title, new_url);
		}
		const initial_sort = filter.sort.valueOf();
		const initial_time = filter.time.valueOf();
		let result = await getUserListing(user, 'submitted', null, filter);
		if (initial_sort !== filter.sort || initial_time !== filter.time) return (loading = false);
		if (!result.success) return (loading = false);
		const listing = result.data;
		posts = listing.data.children as Post[];
		latest_post_in_view = 0;
		after_id = listing.data.after;
		batch_count = listing.data.dist;
		loading = false;
	};

	const openPost = (e: CustomEvent) => {
		selected_post.set(e.detail.post as Post);
	};

	onMount(() => {
		getNextPostBatch(0);
	});
</script>

<svelte:head>
	{#if $selected_post}
		<title>{$selected_post.data.title}</title>
	{:else}
		<title>u/{user}</title>
	{/if}
</svelte:head>

<Header user={about} />
<div class="mt-12">
	<div class="flex w-full text-sm">
		<a
			href="/u/{$page.params.user}/posts"
			class="border-b-2 border-blue-500 px-3 font-medium hover:opacity-70">Posts</a
		>
		<a href="/u/{$page.params.user}/comments" class="px-3 font-medium hover:opacity-70">Comments</a>
	</div>
	<div class="w-full border-t" style:margin="-0.05rem" />
	<div class="mt-2 flex place-content-between">
		<Filter_Select {filter} on:select={handleFilter} />
		<Cards bind:type={card} on:select={handleCardTypeChange} />
	</div>
</div>
<div class="flex flex-col divide-y">
	{#each posts as post, i}
		{#if card === 'compact'}
			<Compact
				{post}
				on:display={() => {
					updateLatestPostInView(i);
				}}
				on:open={openPost}
				show={['subreddit']}
			/>
		{:else if card === 'large'}
			<Large
				{post}
				on:display={() => {
					updateLatestPostInView(i);
				}}
				on:open={openPost}
				show={['subreddit']}
				id={i}
			/>
		{/if}
	{/each}
	{#if loading}
		<div class="flex w-full place-content-center py-12">
			<Loading />
		</div>
	{/if}
</div>
