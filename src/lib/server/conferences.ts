import { type StateName, states } from '$lib/model/africa/states';
import { confCacheKey, hostTokenKey, playerTokenKey, Table } from '$lib/utils';
import { players, playerTokens } from '$lib/server/players';
import type { Cookies } from '@sveltejs/kit';
import { generateAlphanumeric } from '$lib/server/server-utils';
import { DateTime } from 'luxon';

const conferences = new Table<Map<StateName, Set<string>>>();
const hostTokens = new Table<string>();

export function newConference(): [string, string] {
	const conferenceId = generateAlphanumeric(6);
	const hostToken = generateAlphanumeric(10);
	const conf = new Map<StateName, Set<string>>();
	conferences.set(conferenceId, conf);
	hostTokens.set(hostToken, conferenceId);
	players.set(conferenceId, new Set());
	playerTokens.set(conferenceId, new Map());

	states.forEach((state) => conf.set(state, new Set()));

	return [conferenceId, hostToken];
}

export function getConference(conferenceId: string): Map<StateName, Set<string>> | undefined {
	return conferences.get(conferenceId);
}

export function deleteExHost(hostToken: string) {
	hostTokens.delete(hostToken);
}

export function getHostConference(hostToken: string) {
	return hostTokens.get(hostToken);
}

export function cleanup(confId: string, cookies?: Cookies) {
	conferences.delete(confId);
	const entry = hostTokens.entries().find(([, v]) => v === confId);
	if (entry) hostTokens.delete(entry[0]);
	players.delete(confId);
	playerTokens.delete(confId);

	cookies?.delete(confCacheKey, { path: '/' });
	cookies?.delete(hostTokenKey, { path: '/' });
	cookies?.delete(playerTokenKey, { path: '/' });
}

export function purgeExpiredConferences() {
	console.log(`${DateTime.now().toISO()}: Purging expired conferences`);
	conferences
		.timestampedEntries()
		.filter(([, v]) => v.timestamp.diffNow('days').days > 7)
		.forEach(([k]) => cleanup(k));
}
