<script lang="ts">
	import Horizontal from '$lib/components/voting/post/Horizontal.svelte';

	import { formatTime, removeEmoji } from '$lib/utils/format';
	import { inViewport } from '$lib/utils/actions';
	import { createEventDispatcher } from 'svelte';
	import postsToLoad, { newPostInView, newPostOutsideView } from "$lib/stores/viewport"
	import { validateGif, convertGif } from '$lib/utils/media';
	import selected_post from '$lib/stores/post';;

	import Slideshow from '../utils/Slideshow.svelte';
	import Image from '$lib/components/utils/Image.svelte';
	import Video from '../utils/Video.svelte';
	import Iframe from '$lib/components/utils/Iframe.svelte';
	
	import type { Post } from '$lib/types/reddit';

	export let post: Post;
	export let show: string[];
	export let id : number
	export let show_nsfw = false

	const dispatch = createEventDispatcher();

	export let show_media = false;
	let insideViewport = false

	const openPost = () => {
		dispatch('open', {
			post
		});
	};

	const onDisplayHandle = () => {
		dispatch('display');
		newPostInView(id)
		insideViewport = true
	};

	const onHiddenHandle = () => {
		newPostOutsideView(id)
		insideViewport = false
	};

	let inner_height: number;
	let max_height: number;
	$: max_height = (inner_height * 2) / 3;
	let max_width: number;

	$:show_media = $postsToLoad.includes(id)

	let censor = (post.data.over_18 && !show_nsfw) || post.data.spoiler
</script>

<svelte:window bind:innerHeight={inner_height} />

<div
	class="cursor-pointer py-4 group"
	on:click={openPost}
	use:inViewport
	on:display={onDisplayHandle}
	on:hidden={onHiddenHandle}
>
	<div class="flex grow flex-col gap-4 overflow-hidden">
		<div class="flex flex-col gap-2">
			<div>
				<h2 class="break-words text-lg font-medium leading-tight md:text-xl md:leading-tight group-hover:text-blue-500">
					{post.data.title}
					{#if post.data.link_flair_text}
						<span
							class="w-fit rounded px-2 text-xs font-medium text-white"
							style:background-color={post.data.link_flair_background_color}
							class:text-white={post.data.link_flair_text_color === 'light'}
							class:text-black={post.data.link_flair_text_color === 'dark'}
						>
							{removeEmoji(post.data.link_flair_text)}
						</span>
					{/if}
				</h2>
				<div class="flex flex-wrap gap-x-3 whitespace-nowrap text-xs">
					{#if show.includes('subreddit')}
						<a
							class="font-medium hover:underline"
							href="/r/{post.data.subreddit}"
							on:click|stopPropagation={() => {}}>r/{post.data.subreddit}</a
						>
					{/if}
					{#if show.includes('user')}
						<a
							class="font-medium hover:underline"
							href="/u/{post.data.author}"
							on:click|stopPropagation={() => {}}>u/{post.data.author}</a
						>
					{/if}
					<p class="text-gray-400">{formatTime(new Date().getTime() - post.data.created_utc * 1000)} ago</p>
					{#if post.data.over_18}
					<p class="text-red-400 text-xs">nsfw</p>
					{/if}
					{#if post.data.spoiler}
					<p class="text-gray-400 text-xs">spoiler</p>
					{/if}
				</div>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-y-4">
			<div class="flex flex-col place-items-center pb-2" bind:clientWidth={max_width}>
				{#if post.data.post_hint === 'image'}
					<Image
						src={post.data.url}
						alt={post.data.title}
						{max_height}
						{max_width}
						width={post.data.preview.images[0].source.width}
						height={post.data.preview.images[0].source.height}
						show={show_media && !$selected_post}
						{censor}
					/>
				{:else if post.data.post_hint === 'rich:video'}
					<Iframe
						src={post.data.media_embed.content.split('"').find((val) => val.includes('https'))}
						{max_height}
						{max_width}
						width={post.data.media_embed.width}
						height={post.data.media_embed.height}
						title={post.data.title}
						show={show_media && !$selected_post}
						{censor}
					/>
				{:else if post.data.domain === 'v.redd.it' && post.data.media}
					<Video
						src="{post.data.url}/HLSPlaylist.m3u8"
						fallback={post.data.media.reddit_video.fallback_url}
						alt={post.data.title}
						{max_height}
						{max_width}
						width={post.data.media.reddit_video.width}
						height={post.data.media.reddit_video.height}
						show={show_media && !$selected_post}
						autoplay={true}
						play={insideViewport}
						censor={post.data.over_18 && !show_nsfw}
					/>
				{:else if post.data.post_hint === 'link' && validateGif(post.data.url)}
					<Video
						src={convertGif(post.data.url)}
						alt={post.data.title}
						{max_height}
						{max_width}
						width={post.data.preview.images[0].source.width}
						height={post.data.preview.images[0].source.height}
						autoplay={true}
						loop={true}
						show={show_media && !$selected_post}
						play={insideViewport}
						{censor}
					/>
				{:else if post.data.is_self}
					{#if post.data.selftext_html}
						<div class="w-full overflow-hidden relative" style:max-height="8rem">
							<div
								class="absolute bottom-0 h-20 bg-white w-full"
								style="-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, 
                                from(rgba(0,0,0,0)), to(rgba(0,0,0,1)));"
							/>
							{@html post.data.selftext_html}
						</div>
					{/if}
				{:else if post.data.url.includes('https://www.reddit.com/gallery/')}
					<Slideshow
						media_metadata={post.data.media_metadata}
						max_height={(max_height / 3) * 2}
						show={show_media && !$selected_post}
					/>
				{:else if post.data.domain}
					<div class="rounded-md h-12 bg-gray-100 flex w-full">
						{#if post.data.thumbnail === 'default' || !post.data.thumbnail}
							<div
								class="h-full w-16 rounded-l-md object-cover bg-blue-500 flex place-items-center place-content-center"
							>
								<p class="text-white text-2xl">{post.data.domain.charAt(0)}</p>
							</div>
						{:else}
							<img
								src={post.data.thumbnail}
								class="h-full w-16 rounded-l-md object-cover"
								alt="thumbnail"
							/>
						{/if}
						<div class="self-center px-2">
							<a
								class="text-sm text-blue-500 hover:underline cursor-pointer ellipsis"
								href={post.data.url}
								on:click|stopPropagation={() => {}}
							>
								{post.data.domain}
							</a>
						</div>
					</div>
				{/if}
			</div>
			<div class="flex gap-x-4">
				<Horizontal {post} />
				<p class="text-xs">{post.data.num_comments} comments</p>
			</div>
		</div>
	</div>
</div>
