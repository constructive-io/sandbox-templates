// Every row a query matches, read page by page.
//
// The API caps one page at MAX_PAGE_SIZE rows: asking for more fails the whole
// request ("The requested page size is too large"). fetchAll asks for pages of
// at most that size and follows `pageInfo.endCursor`, which the generated
// ORM's findMany always selects.
//
//   const shifts = await fetchAll((page) =>
//     db.shift.findMany({ select: { id: true, startsAt: true }, where, orderBy: ['STARTS_AT_ASC'], ...page }),
//   );

import type { QueryResult } from '@constructive-io/graphql-query/runtime';

export const MAX_PAGE_SIZE = 1000;

/** Spread into findMany's arguments. */
export type PageArgs = { first: number; after?: string };

type PageInfo = { hasNextPage?: boolean | null; endCursor?: string | null } | null | undefined;

/** The node type of the connection a findMany result holds, e.g. `{ shifts: { nodes: Shift[] } }` → `Shift`. */
export type NodeOf<T> = {
	[K in keyof T]: T[K] extends { nodes: Array<infer N> } ? N : never;
}[keyof T];

export type FetchAllOptions = {
	/** Rows per request; capped at MAX_PAGE_SIZE. */
	pageSize?: number;
	/** Stop after this many rows. Default 50,000, so a mistaken query can't read forever. */
	limit?: number;
};

export async function fetchAll<T>(
	query: (page: PageArgs) => { execute(): Promise<QueryResult<T>> },
	options: FetchAllOptions = {},
): Promise<NodeOf<T>[]> {
	const pageSize = Math.max(1, Math.min(options.pageSize ?? MAX_PAGE_SIZE, MAX_PAGE_SIZE));
	const limit = options.limit ?? 50_000;
	const rows: NodeOf<T>[] = [];
	let after: string | undefined;
	while (rows.length < limit) {
		const result = await query({ first: Math.min(pageSize, limit - rows.length), ...(after ? { after } : {}) }).execute();
		if (!result.ok) throw new Error(result.errors.map((error) => error.message).join('; ') || 'Request failed.');
		const connection = Object.values(result.data as Record<string, unknown>)[0] as
			| { nodes?: NodeOf<T>[]; pageInfo?: PageInfo }
			| null
			| undefined;
		rows.push(...(connection?.nodes ?? []));
		const { hasNextPage, endCursor } = connection?.pageInfo ?? {};
		if (!hasNextPage || !endCursor) break;
		after = endCursor;
	}
	return rows;
}
