import crypto from 'crypto';

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateAlphanumeric(length: number): string {
	return Array.from(crypto.getRandomValues(new Uint8Array(length)))
		.map((x) => ALPHANUMERIC[x % ALPHANUMERIC.length])
		.join('');
}