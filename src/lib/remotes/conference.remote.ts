import { command, form, getRequestEvent, query } from '$app/server';
import {
	deleteExHost,
	getConference,
	getConferenceHost,
	newConference,
	purgePlayerFromConference
} from '$lib/server/conferences';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { resolve } from '$app/paths';
import { type StateName, states } from '$lib/model/africa/states';
import { confCacheKey, hostTokenKey, playerTokenKey } from '$lib/utils';
import {
	addNewPlayer,
	getPlayerByToken,
	getPlayersForConference,
	kickPlayerFromConference,
	type Player,
	playerIsKicked
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

export const addPlayer = form(playerSchema, async (p: Player, invalid) => {
	const confId = confFromCookie();
	const players = await getPlayers(confId);
	const colorTaken = !!players.values().find((v) => v.color === p.color);
	const nameTaken = !!players.values().find((v) => v.name === p.name);
	const issues: ReturnType<typeof invalid.color>[] = [];

	if (colorTaken) issues.push(invalid.color('Color already taken'));
	if (nameTaken) issues.push(invalid.name('Name already taken'));
	// @ts-expect-error idk why this is wrong
	if (issues.length > 0) return invalid(...issues);

	const playerToken = addNewPlayer(confId, p);
	const { cookies } = getRequestEvent();
	cookies.set(playerTokenKey, playerToken, { path: '/' });
});

export const getCurrentPlayer = query(z.string(), async (cid: string) => {
	const { cookies } = getRequestEvent();
	const playerToken = cookies.get(playerTokenKey);
	if (!playerToken) return null;

	if (playerIsKicked(cid, playerToken)) {
		redirect(300, resolve('/kicked'));
	}

	const player = getPlayerByToken(cid, playerToken);
	if (!player) return null;

	return player;
});

export const toggleClaim = command(z.enum(states), async (state: StateName) => {
	const confId = confFromCookie();
	let player: Player | null;
	try {
		player = await getCurrentPlayer(confId);
	} catch {
		return { kicked: true };
	}
	if (!player) throw new Error('No player found');

	const conference = await getConferenceForRoom(confId);
	const claims = conference.get(state)!;

	if (claims.has(player.name)) {
		claims.delete(player.name);
	} else {
		claims.add(player.name);
	}

	return { kicked: false };
});

export const isHost = query(z.string(), async (cid: string) => {
	const player = await getCurrentPlayer(cid);
	const { cookies } = getRequestEvent();
	const hostToken = cookies.get(hostTokenKey);

	return !!player && getConferenceHost(cid) === hostToken;
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

export const kickPlayer = command(z.string(), async (name: string) => {
	const cid = confFromCookie();
	const player = await getCurrentPlayer(cid);

	if (!player) throw new Error('No player found');
	if (!(await isHost(cid))) throw new Error('Not host');

	const kickedPlayer = kickPlayerFromConference(cid, name);
	if (!kickedPlayer) return;
	purgePlayerFromConference(cid, kickedPlayer.name);

	await getConferenceForRoom(cid).refresh();
	await getPlayers(cid).refresh();
});

function confFromCookie() {
	const { cookies } = getRequestEvent();
	const confId = cookies.get(confCacheKey);
	if (!confId) redirect(300, resolve('/'));
	return confId;
}
