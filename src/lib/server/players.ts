import { Table } from '$lib/utils';
import { generateAlphanumeric } from '$lib/server/server-utils';

export type Player = {
	name: string;
	color: string;
};

export const players = new Table<Set<Player>>();
export const playerTokens = new Table<Map<string, Player>>();
export const kickedPlayers = new Table<string>();

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

export function kickPlayerFromConference(confId: string, playerName: string) {
	const confPlayers = playerTokens.get(confId);
	if (!confPlayers) return null;

	const [token, kickedPlayer] = confPlayers.entries().find(([, v]) => v.name === playerName) ?? [];
	if (!kickedPlayer || !token) return null;

	kickedPlayers.set(confId, token);
	const playerSet = players.get(confId)!;
	const toDelete = playerSet.values().find((p) => p.name === playerName)!;

	playerSet.delete(toDelete);
	return kickedPlayer;
}

export function playerIsKicked(confId: string, playerToken: string) {
	return !!kickedPlayers.get(confId)?.includes(playerToken);
}
