/**
 * Tests for stable cache key generation.
 *
 * Bug context: Data disappeared on route changes because stableOptionsKey
 * used object reference comparison instead of deep value comparison.
 * Fix: JSON.stringify for deep comparison.
 */
import { describe, it, expect } from 'vitest';

function createStableOptionsKey(options: {
	pageSize: number;
	orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }> | null;
	where?: Record<string, unknown> | null;
	fieldSelection?: unknown;
}): string {
	return JSON.stringify({
		pageSize: options.pageSize,
		orderBy: options.orderBy ?? null,
		where: options.where ?? null,
		fieldSelection: options.fieldSelection ?? null,
	});
}

describe('stableOptionsKey', () => {
	it('produces identical keys for equivalent options with different object references', () => {
		const options1 = {
			pageSize: 100,
			orderBy: [{ field: 'name', direction: 'asc' as const }],
			where: { status: 'active' },
		};
		const options2 = {
			pageSize: 100,
			orderBy: [{ field: 'name', direction: 'asc' as const }],
			where: { status: 'active' },
		};

		// Different references, same key
		expect(options1).not.toBe(options2);
		expect(createStableOptionsKey(options1)).toBe(createStableOptionsKey(options2));
	});

	it('produces different keys when values change', () => {
		const base = { pageSize: 100, orderBy: [{ field: 'name', direction: 'asc' as const }] };
		const changed = { pageSize: 100, orderBy: [{ field: 'name', direction: 'desc' as const }] };

		expect(createStableOptionsKey(base)).not.toBe(createStableOptionsKey(changed));
	});

	it('normalizes undefined to null for consistent keys', () => {
		const withUndefined = { pageSize: 100, orderBy: undefined, where: undefined };
		const withNull = { pageSize: 100, orderBy: null, where: null };
		const minimal = { pageSize: 100 };

		const key1 = createStableOptionsKey(withUndefined);
		const key2 = createStableOptionsKey(withNull);
		const key3 = createStableOptionsKey(minimal);

		expect(key1).toBe(key2);
		expect(key1).toBe(key3);
	});
});

describe('enabledRelations key stability', () => {
	it('produces same key for same values regardless of array order', () => {
		const createKey = (arr: string[]) => JSON.stringify([...arr].sort());

		expect(createKey(['a', 'b', 'c'])).toBe(createKey(['c', 'a', 'b']));
		expect(createKey(['a', 'b'])).not.toBe(createKey(['a', 'b', 'c']));
	});
});
