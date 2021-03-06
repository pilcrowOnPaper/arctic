import type { Promise_Status } from '$lib/types';
import type { Filter } from '$lib/types/filter';
import type { Listing, Post } from '$lib/types/reddit';

export const getPostListing = async (
	subreddit: string,
	after?: string,
	filter?: Filter
): Promise<Promise_Status<Listing<Post>>> => {
	try {
		const url = getPostRequestUrl(subreddit, after, filter);
		const response = await fetch(url);
		if (!response.ok) {
			return {
				success: false
			};
		}
		const result = (await response.json()) as Listing<Post>;
		return {
			success: true,
			data: result
		};
	} catch {
		return {
			success: false
		};
	}
};

export const getPostRequestUrl = (subreddit: string, after?: string, filter?: Filter): string => {
	let base_url = `https://www.reddit.com/r/${subreddit}`;
	if (filter && filter.sort) {
		base_url = base_url + `/${filter.sort}`;
	}
	let url = base_url + '.json?raw_json=1';
	if (filter && filter.time) {
		url = url + `&t=${filter.time}`;
	}
	if (after) {
		url = url + `&after=${after}`;
	}
	return url;
};

export const getPostPathname = (subreddit: string, filter?: Filter): string => {
	let base = `/r/${subreddit}?`;
	if (filter.sort) {
		base = base + `&sort=${filter.sort}`;
	}
	let pathname = base;
	if (filter.time) {
		pathname = pathname + `&time=${filter.time}`;
	}
	return pathname;
};
