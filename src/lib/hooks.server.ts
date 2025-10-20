import type { ServerInit } from '@sveltejs/kit';
import { purgeExpiredConferences } from '$lib/server/conferences';

export const init: ServerInit = () => {

	setInterval(purgeExpiredConferences, 1000 * 3600 * 24)
};
