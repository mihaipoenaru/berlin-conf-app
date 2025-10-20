import { command, form, getRequestEvent, query } from '$app/server';
import { deleteExHost, getConference, newConference } from '$lib/server/conferences';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { resolve } from '$app/paths';
import { type StateName, states } from '$lib/model/africa/states';
import { confCacheKey, hostTokenKey, playerTokenKey } from '$lib/utils';
import {
	addNewPlayer,
	getPlayerByToken,
	getPlayersForConference,
	type Player
} from '$lib/server/players';

const playerSchema = z.object({
	name: z.string().min(1, 'Mandatory').max(20, 'Max 20'),
	color: z.string().min(1, 'Mandatory')
});

export const hostNewConference = form(async () => {
	const { cookies } = getRequestEvent();
	const oldToken = cookies.get(hostTokenKey);
	if (oldToken) deleteExHost(oldToken);

	cookies.delete(hostTokenKey, { path: '/' });

	const [conferenceCode, hostToken] = newConference();
	cookies.set(hostTokenKey, hostToken, { path: '/' });

	redirect(303, `/${conferenceCode}`);
});

export const getConferenceForRoom = query(z.string(), async (cid: string) => {
	const conference = getConference(cid);
	if (!conference) redirect(300, resolve('/'));
	return conference;
});

export const getPlayers = query(z.string(), async (cid: string) => {
	const pl = getPlayersForConference(cid);
	if (!pl) redirect(300, resolve('/'));
	return pl;
});

export const addPlayer = form(playerSchema, async (p: Player, invalid) => {
	const confId = confFromCookie();
	const players = await getPlayers(confId);
	const colorTaken = !!players.values().find((v) => v.color === p.color);
	const nameTaken = !!players.values().find((v) => v.name === p.name);
	const issues: ReturnType<typeof invalid.color>[] = [];

	if (colorTaken) issues.push(invalid.color('Color already taken'));
	if (nameTaken) issues.push(invalid.name('Name already taken'));
	if (issues.length > 0) return invalid(...issues);

	const playerToken = addNewPlayer(confId, p);
	const { cookies } = getRequestEvent();
	cookies.set(playerTokenKey, playerToken, { path: '/' });
});

export const getCurrentPlayer = query(z.string(), async (cid: string) => {
	const { cookies } = getRequestEvent();
	const playerToken = cookies.get(playerTokenKey);
	if (!playerToken) return null;

	return getPlayerByToken(cid, playerToken) ?? null;
});

export const toggleClaim = command(z.enum(states), async (state: StateName) => {
	const confId = confFromCookie();
	const player = await getCurrentPlayer(confId);
	if (!player) throw new Error('No player found');

	const conference = await getConferenceForRoom(confId);
	const claims = conference.get(state)!;

	if (claims.has(player.name)) {
		claims.delete(player.name);
	} else {
		claims.add(player.name);
	}
});

function confFromCookie() {
	const { cookies } = getRequestEvent();
	const confId = cookies.get(confCacheKey);
	if (!confId) redirect(300, resolve('/'));
	return confId;
}
