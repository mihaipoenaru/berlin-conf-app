import type { PageServerLoad } from './$types';
import { cleanup, getConference } from '$lib/server/conferences';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies }) => {
	if (!getConference(params.confId)) {
		cleanup(params.confId, cookies);
		error(404, 'No conference found');
	}
};
