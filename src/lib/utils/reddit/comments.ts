import type { Promise_Status } from '$lib/types';
import type { Listing, Post, Comment, Listing_List } from '$lib/types/reddit';
import type { Filter } from '$lib/types/filter';

export const getCommentsListing = async (
	subreddit: string,
	post_id: string,
	filter?: Filter,
	comment_id?: string
): Promise<Promise_Status<Listing_List>> => {
	try {
		const url = getCommentsRequestUrl(subreddit, post_id, filter, comment_id);
		const response = await fetch(url);
		if (!response.ok) {
			return {
				success: false
			};
		}
		const result = await response.json();
		const post_listing = result[0] as Listing<Post>;
		const comment_listing = result[1] as Listing<Comment>;
		return {
			success: true,
			data: {
				post: post_listing,
				comment: comment_listing
			}
		};
	} catch {
		return {
			success: false
		};
	}
};

export const getCommentsRequestUrl = (
	subreddit: string,
	post_id: string,
	filter?: Filter,
	comment_id?: string
): string => {
	if (!subreddit || !post_id) return;
	let base: string = `https://www.reddit.com/r/${subreddit}/comments/${post_id}`;
	if (comment_id) {
		base = base + `/_/${comment_id}`;
	}
	let url = base + '.json?raw_json=1';
	if (filter.sort) {
		url = url + `&sort=${filter.sort}`;
	}
	return url;
};

export const getCommentContents = async (
	subreddit: string,
	post_link: string,
	id_list: string[]
): Promise<Promise_Status<Comment[]>> => {
	const comments_list = await Promise.all(
		id_list.map(async (val) => {
			const response = await fetch(
				`https://www.reddit.com/r/${subreddit}/comments/${post_link}/_/${val}.json?raw_json=1`
			);
			const comment_result = (await response.json()) as [Listing<Post>, Listing<Comment>];
			const comments = comment_result[1].data.children;
			return comments;
		})
	);
	const result = comments_list.reduce((a, b) => [...a, ...b]);
	return {
		success: true,
		data: result
	};
};
