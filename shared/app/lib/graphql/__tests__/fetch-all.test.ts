import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RequestFailure } from '../errors.ts';
import { fetchAll, MAX_PAGE_SIZE, type PageArgs } from '../fetch-all.ts';

/** A findMany stand-in over `total` rows that pages by cursor like the API. */
function fakeQuery(total: number, requests: PageArgs[]) {
	return (page: PageArgs) => ({
		execute: async () => {
			requests.push(page);
			const start = page.after ? Number(page.after) : 0;
			const end = Math.min(start + page.first, total);
			const nodes = Array.from({ length: end - start }, (_, index) => ({ id: start + index }));
			return {
				ok: true as const,
				data: { shifts: { nodes, totalCount: total, pageInfo: { hasNextPage: end < total, endCursor: String(end) } } },
				errors: undefined,
			};
		},
	});
}

describe('fetchAll', () => {
	it('follows the cursor across pages and never asks for more than the API allows', async () => {
		const requests: PageArgs[] = [];
		const rows = await fetchAll(fakeQuery(2500, requests), { pageSize: 5000 });
		assert.equal(rows.length, 2500);
		assert.deepEqual(rows.at(-1), { id: 2499 });
		assert.deepEqual(requests, [
			{ first: MAX_PAGE_SIZE },
			{ first: MAX_PAGE_SIZE, after: '1000' },
			{ first: MAX_PAGE_SIZE, after: '2000' },
		]);
	});

	it('stops at the limit, asking only for what is left', async () => {
		const requests: PageArgs[] = [];
		const rows = await fetchAll(fakeQuery(5000, requests), { pageSize: 400, limit: 1000 });
		assert.equal(rows.length, 1000);
		assert.deepEqual(
			requests.map((page) => page.first),
			[400, 400, 200],
		);
	});

	it('throws the API error instead of returning a partial list', async () => {
		const failing = () => ({
			execute: async () => ({
				ok: false as const,
				data: null,
				errors: [{ message: 'The requested page size is too large.' }],
			}),
		});
		await assert.rejects(fetchAll(failing), /page size is too large/);
	});

	it('keeps the error codes on what it throws', async () => {
		const suspended = () => ({
			execute: async () => ({
				ok: false as const,
				data: null,
				errors: [{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED', httpStatus: 403 } }],
			}),
		});
		await assert.rejects(fetchAll(suspended), (error: RequestFailure) => {
			assert.ok(error instanceof RequestFailure);
			assert.equal(error.kind, 'unavailable');
			assert.equal(error.errors[0].extensions?.code, 'ACCESS_SUSPENDED');
			return true;
		});
	});
});
