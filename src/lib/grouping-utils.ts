export function groupBy<T extends object, K extends keyof T>(array: T[], key: K): Map<T[K], T[]>;
export function groupBy<T extends object, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]>;
export function groupBy<T extends object, K extends keyof T | unknown>(
	array: T[],
	keyOrFn: K extends keyof T ? K : (item: T) => K
): Map<K extends keyof T ? T[K] : K, T[]> {
	return array.reduce((result, item) => {
		const currentKey = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn as keyof T];
		if (!result.has(currentKey)) {
			result.set(currentKey, []);
		}
		result.get(currentKey).push(item);
		return result;
	}, new Map());
}

export function flatGroupBy<T extends object, K extends keyof T>(array: T[], key: K): Map<T[K], T>;
export function flatGroupBy<T extends object, K>(array: T[], keyFn: (item: T) => K): Map<K, T>;
export function flatGroupBy<T extends object, K, R>(
	array: T[],
	keyFn: (item: T) => K,
	fn: (list: T[]) => R
): Map<K, R>;
export function flatGroupBy<T extends object, K extends keyof T, R>(
	array: T[],
	key: K,
	fn: (list: T[]) => R
): Map<T[K], R>;
export function flatGroupBy<T extends object, K extends keyof T | unknown, R = T>(
	array: T[],
	keyOrFn: K extends keyof T ? K : (item: T) => K,
	fn?: (list: T[]) => R
): Map<K extends keyof T ? T[K] : K, R | T> {
	const groups = groupBy(array, keyOrFn as never);
	return new Map(
		Array.from(groups.entries()).map(([key, value]) => [key, fn ? fn(value) : value[0]])
	);
}