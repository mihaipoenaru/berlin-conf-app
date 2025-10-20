import type { PageServerLoad } from './$types';
import { confCacheKey } from '$lib/utils';
import { cleanup, getConference } from '$lib/server/conferences';

export const load: PageServerLoad = async ({ cookies }) => {
	const prevConference = cookies.get(confCacheKey);

	if (!prevConference) return {};
	if (!getConference(prevConference)) {
		cookies.delete(confCacheKey, { path: '/' });
		cleanup(prevConference, cookies);
	}

	return { prevConference };
};
