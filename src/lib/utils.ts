import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateTime } from 'luxon';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

type TimestampedEntry<T> = { timestamp: DateTime; value: T };

export class Table<T, K = string> {
	private readonly map = new Map<K, TimestampedEntry<T>>();

	set(key: K, value: T) {
		this.map.set(key, { timestamp: DateTime.now(), value });
	}

	get(key: K): T | undefined {
		return this.map.get(key)?.value;
	}

	delete(key: K) {
		this.map.delete(key);
	}

	entries(): [K, T][] {
		return this.map
			.entries()
			.map(([k, v]): [K, T] => [k, v.value])
			.toArray();
	}

	timestampedEntries(): [K, TimestampedEntry<T>][] {
		return this.map.entries().toArray();
	}
}
export const confCacheKey = 'confCache';
export const hostTokenKey = 'hostToken';
export const playerTokenKey = 'playerToken';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const kickedSchema = z.object({
	kicked: z.boolean().default(false)
})