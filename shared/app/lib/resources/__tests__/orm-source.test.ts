import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { friendlyError, listArgs, orderByValue, ormSource, type OrmModel } from '../orm-source.ts';

const options = { select: { id: true, title: true }, searchFields: ['title', 'notes'], bigNumbers: ['amount'] };

describe('listArgs', () => {
	it('maps search, filters, sort and paging onto findMany', () => {
		const args = listArgs(
			{
				search: '  bread ',
				filters: { status: 'open', amount: 12.5, closedAt: null },
				sort: { field: 'startTime', direction: 'desc' },
				offset: 40,
				limit: 20,
			},
			options,
		);
		assert.deepEqual(args, {
			select: options.select,
			where: {
				and: [
					{ or: [{ title: { includesInsensitive: 'bread' } }, { notes: { includesInsensitive: 'bread' } }] },
					{ status: { equalTo: 'open' } },
					{ amount: { equalTo: '12.5' } },
					{ closedAt: { isNull: true } },
				],
			},
			orderBy: ['START_TIME_DESC', 'PRIMARY_KEY_ASC'],
			first: 20,
			offset: 40,
		});
	});

	it('sends no where clause for an empty query and keeps a stable order', () => {
		const args = listArgs({ search: '   ', offset: 0, limit: 25 }, options);
		assert.equal('where' in args, false);
		assert.deepEqual(args.orderBy, ['PRIMARY_KEY_ASC']);
	});

	it('spells orderBy values the way the API does', () => {
		assert.equal(orderByValue('createdAt', 'asc'), 'CREATED_AT_ASC');
		assert.equal(orderByValue('addressLine1', 'desc'), 'ADDRESS_LINE1_DESC');
		assert.equal(orderByValue('name', 'asc'), 'NAME_ASC');
	});
});

type Call = { method: string; args: Record<string, any> };

function fakeModel(calls: Call[], data: (method: string, args: Record<string, any>) => unknown): OrmModel {
	const method = (name: string) => (args: Record<string, any>) => ({
		execute: async () => {
			calls.push({ method: name, args });
			return { ok: true as const, data: data(name, args) };
		},
	});
	return { findMany: method('findMany'), create: method('create'), update: method('update'), delete: method('delete') };
}

describe('ormSource', () => {
	it('reads big numbers as numbers and writes them as strings', async () => {
		const calls: Call[] = [];
		const model = fakeModel(calls, (method) =>
			method === 'findMany'
				? { deals: { nodes: [{ id: 'd1', amount: '1200.50' }], totalCount: 7 } }
				: { createDeal: { deal: { id: 'd2', amount: '99' } } },
		);
		const source = ormSource(model, { select: { id: true, amount: true } as never, bigNumbers: ['amount'] });

		assert.deepEqual(await source.list({ offset: 0, limit: 10 }), { rows: [{ id: 'd1', amount: 1200.5 }], totalCount: 7 });
		assert.deepEqual(await source.create({ amount: 99, unknownField: 'x' }), { id: 'd2', amount: 99 });
		assert.deepEqual(calls[1].args.data, { amount: '99' });
	});

	it('fills required owner keys with the signed-in user on create, keeping a value the form sent', async () => {
		const calls: Call[] = [];
		const model = fakeModel(calls, () => ({ createDeal: { deal: { id: 'd1' } } }));
		const source = ormSource(model, {
			select: { id: true, title: true, entityId: true } as never,
			userKeys: ['entityId'],
			currentUserId: () => 'user-1',
		});
		await source.create({ title: 'A' });
		await source.create({ title: 'B', entityId: 'org-9' });
		assert.deepEqual(calls[0].args.data, { title: 'A', entityId: 'user-1' });
		assert.equal(calls[1].args.data.entityId, 'org-9');
	});

	it('sends create defaults for empty fields and keeps create-only fields out of updates', async () => {
		const calls: Call[] = [];
		const model = fakeModel(calls, (method) => (method === 'create' ? { createThread: { thread: { id: 't1' } } } : { updateThread: { thread: { id: 't1' } } }));
		const source = ormSource(model, {
			select: { id: true, title: true, mode: true, threadId: true } as never,
			createDefaults: { mode: 'ask' },
			createOnly: ['threadId'],
		});
		await source.create({ title: 'A', mode: '' });
		await source.update('t1', { title: 'B', threadId: 'x' });
		assert.deepEqual(calls[0].args.data, { title: 'A', mode: 'ask' });
		assert.deepEqual(calls[1].args.data, { title: 'B' });
	});

	it('lets the database default win over an empty choice, and never nulls a NOT NULL default', async () => {
		const calls: Call[] = [];
		const model = fakeModel(calls, (method) => ({ [`${method}Shift`]: { shift: { id: 's1' } } }));
		const source = ormSource(model, {
			select: { id: true, status: true, slots: true, notes: true } as never,
			serverDefaults: ['status', 'slots'],
			keepWhenEmpty: ['status'],
		});
		await source.create({ status: null, slots: '', notes: null });
		await source.update('s1', { status: null, slots: null, notes: null });
		assert.deepEqual(calls[0].args.data, { notes: null }, 'create: defaults apply');
		assert.deepEqual(calls[1].args.data, { slots: null, notes: null }, 'update: a nullable default can be cleared');
	});

	it('replaces a many-to-many set by deleting and creating junction rows', async () => {
		const calls: Call[] = [];
		const junction = fakeModel(calls, (method) =>
			method === 'findMany'
				? {
						contactTags: {
							nodes: [
								{ id: 'j1', tagId: 't1' },
								{ id: 'j2', tagId: 't2' },
							],
						},
					}
				: {},
		);
		const contacts = fakeModel([], () => ({}));
		const source = ormSource(contacts, {
			select: { id: true } as never,
			manyToMany: { tags: { junction, sourceKey: 'contactId', targetKey: 'tagId' } },
		});

		assert.deepEqual(await source.linked?.('c1', 'tags'), ['t1', 't2']);
		calls.length = 0;
		await source.link?.('c1', 'tags', ['t2', 't3']);

		assert.deepEqual(calls[0].args.where, { contactId: { equalTo: 'c1' } });
		const writes = calls.slice(1).map((call) => ({ method: call.method, where: call.args.where, data: call.args.data }));
		assert.deepEqual(writes, [
			{ method: 'delete', where: { id: 'j1' }, data: undefined },
			{ method: 'create', where: undefined, data: { contactId: 'c1', tagId: 't3' } },
		]);
	});

	it('changes only the links when an update carries nothing else, since the API rejects an empty patch', async () => {
		const calls: Call[] = [];
		const junction = fakeModel(calls, () => ({ contactTags: { nodes: [] } }));
		const contacts = fakeModel(calls, () => ({ contacts: { nodes: [{ id: 'c1' }] } }));
		const source = ormSource(contacts, {
			select: { id: true } as never,
			manyToMany: { tags: { junction, sourceKey: 'contactId', targetKey: 'tagId' } },
		});
		assert.deepEqual(await source.update('c1', { tags: ['t1'] }), { id: 'c1' });
		assert.ok(!calls.some((call) => call.method === 'update'));
		assert.deepEqual(calls.at(-1), { method: 'create', args: { data: { contactId: 'c1', tagId: 't1' }, select: { id: true } } });
	});
});

describe('errors shown to people', () => {
	const known = ['title', 'startsAt', 'locationId', 'status', 'email'];

	it('ties database errors to fields and keeps constraint and table names out of the message', () => {
		const cases: Array<[string, Record<string, unknown> | undefined, string, Record<string, string> | undefined]> = [
			['null value in column "starts_at" of relation "shifts" violates not-null constraint', undefined, 'Fill in the required fields.', { startsAt: 'Required.' }],
			['duplicate key value violates unique constraint "volunteers_email_key"', { detail: 'Key (email)=(a@b.c) already exists.' }, 'A record with the same values already exists.', { email: 'Already used by another record.' }],
			['new row for relation "shifts" violates check constraint "shifts_status_check"', undefined, "One of the values isn't allowed.", { status: 'Not an allowed value.' }],
			['insert or update on table "shifts" violates foreign key constraint "shifts_location_id_fkey"', { detail: 'Key (location_id)=(x) is not present in table "locations".' }, 'A related record is missing or was deleted.', { locationId: 'That record no longer exists.' }],
			['update or delete on table "locations" violates foreign key constraint "shifts_location_id_fkey" on table "shifts"', undefined, 'Other records still point to this one. Remove or change them first.', undefined],
			['permission denied for table shifts', undefined, "You don't have permission to do that.", undefined],
			// As the live API answers: input validation, and a foreign key error without a detail.
			['Field "ShiftInput.locationId" of required type "UUID!" was not provided.', undefined, 'Fill in the required fields.', { locationId: 'Required.' }],
			['insert or update on table "shifts" violates foreign key constraint "shifts_location_id_fkey"', { code: 'FOREIGN_KEY_VIOLATION' }, 'A related record is missing or was deleted.', { locationId: 'That record no longer exists.' }],
			['duplicate key value violates unique constraint "categories_name_key"', { code: 'UNIQUE_VIOLATION', context: { constraint: 'categories_name_key', table: 'categories' } }, 'A record with the same values already exists.', undefined],
			['update or delete on table "categories" violates RESTRICT setting of foreign key constraint "items_category_id_fkey" on table "items"', { code: 'INTERNAL_SERVER_ERROR' }, 'Other records still point to this one. Remove or change them first.', undefined],
		];
		for (const [message, extensions, friendly, fields] of cases) {
			const error = friendlyError([{ message, extensions }], known);
			assert.equal(error.userMessage, friendly, message);
			assert.equal(error.message, friendly, message);
			assert.deepEqual(error.fields, fields, message);
			assert.ok(!/_key|_fkey|_check|relation "|table "/.test(error.message), message);
		}
	});

	it('passes through a plain message it does not recognize, and hides one that names internals', () => {
		const plain = friendlyError([{ message: 'Shift is full.' }], known);
		assert.equal(plain.message, 'Shift is full.');
		assert.equal(plain.userMessage, undefined, 'the kit leads with its own sentence');

		for (const message of [
			'relation "app_public.shifts" does not exist',
			'function app_private.notify_shift(uuid) does not exist',
			'deadlock detected on shift_signups_pkey',
		]) {
			const error = friendlyError([{ message, extensions: { code: 'XX000', context: { table: 'shifts' } } }], known);
			assert.equal(error.message, 'The server rejected the change.', message);
		}
	});

	it('puts nothing but the message, userMessage and fields on the error', () => {
		const error = friendlyError(
			[{ message: 'duplicate key value violates unique constraint "volunteers_email_key"', extensions: { code: '23505', context: { constraint: 'volunteers_email_key', table: 'volunteers' } } }],
			known,
		);
		assert.deepEqual(Object.keys(error).sort(), ['fields', 'userMessage']);
		assert.ok(!/volunteers_|constraint|table/.test(`${error.message} ${error.userMessage} ${JSON.stringify(error.fields)}`));
	});

	it('rejects a failed create with the fields the form can mark', async () => {
		const model = {
			findMany: () => ({ execute: async () => ({ ok: true as const, data: {} }) }),
			create: () => ({ execute: async () => ({ ok: false as const, data: null, errors: [{ message: 'null value in column "title" violates not-null constraint' }] }) }),
			update: () => ({ execute: async () => ({ ok: true as const, data: {} }) }),
			delete: () => ({ execute: async () => ({ ok: true as const, data: {} }) }),
		} as unknown as OrmModel;
		const source = ormSource(model, { select: { id: true, title: true } as never });
		await assert.rejects(source.create({}), (error: Error & { fields?: Record<string, string> }) => {
			assert.deepEqual(error.fields, { title: 'Required.' });
			return true;
		});
	});
});
