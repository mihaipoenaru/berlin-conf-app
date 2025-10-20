import { Table } from '$lib/utils';
import { generateAlphanumeric } from '$lib/server/server-utils';

export type Player = {
	name: string;
	color: string;
};

export const players = new Table<Set<Player>>();
export const playerTokens = new Table<Map<string, Player>>();

export function addNewPlayer(confId: string, player: Player) {
	const pl = getPlayersForConference(confId);
	if (!pl) throw new Error('Conference not found to add player');
	pl.add(player);

	const pt = playerTokens.get(confId)!;
	const code = generateAlphanumeric(10);

	pt.set(code, player);
	return code;
}

export function getPlayersForConference(confId: string) {
	return players.get(confId);
}

export function getPlayerByToken(confId: string, token: string) {
	return playerTokens.get(confId)?.get(token);
}