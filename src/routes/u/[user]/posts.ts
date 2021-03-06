import { getUserRequestUrl } from '$lib/utils/reddit/users';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params, url }) => {
	const user = params.user;
	if (!user) return { status: 404 };
	const sort = url.searchParams.get('sort') || null;
	const time = url.searchParams.get('time') || null;
	const filter = { sort, time };
	const request_url = getUserRequestUrl(user, 'submitted', null, filter);
	const data_promise = fetch(request_url);
	const about_promise = fetch(`https://www.reddit.com/user/${user}/about.json?raw_json=1`);
	try {
		const response = (await Promise.allSettled([data_promise, about_promise])) as {
			status: string;
			value?: Response;
		}[];
		if (response.filter((val) => val.status !== 'fulfilled').length > 0) {
			return { status: 404 };
		}
		const listing: any = await response[0].value.json();
		const about: any = await response[1].value.json();
		if (about.error || listing.error) throw Error();
		if (about.kind !== 't2') return { status: 404 };
		return {
			body: {
				initial_listing: listing,
				about,
				filter
			}
		};
	} catch (e) {
		console.log(e);
		return { status: 500 };
	}
};
