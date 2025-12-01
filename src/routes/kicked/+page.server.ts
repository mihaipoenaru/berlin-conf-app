import type { PageServerLoad } from './$types';
import { confCacheKey, playerTokenKey } from '$lib/utils';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.delete(playerTokenKey, { path: '/' });
	cookies.delete(confCacheKey, { path: '/' });
	redirect(307, resolve('/?kicked=true'));
};
