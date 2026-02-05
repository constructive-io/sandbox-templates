import { describe, expect, it } from 'vitest';

import type { RelationInfo } from '@/store/data-grid-slice';

import { prepareDraftSubmissionPayload } from '../data-grid.utils';

const relationInfo: Record<string, RelationInfo> = {
	roleTypeByType: {
		foreignKeyField: 'type',
		relationField: 'roleTypeByType',
		kind: 'belongsTo',
		displayCandidates: [],
	},
};

describe('prepareDraftSubmissionPayload', () => {
	it('filters out id and nullish fields', () => {
		const result = prepareDraftSubmissionPayload({
			id: 'user-1',
			username: 'alice',
			nickname: null,
			bio: undefined,
		});

		expect(result).toEqual({ username: 'alice' });
	});

	it('filters fields not allowed by metadata', () => {
		const result = prepareDraftSubmissionPayload(
			{
				username: 'alice',
				nickname: 'ally',
			},
			{
				allowedColumns: new Set(['username']),
			},
		);

		expect(result).toEqual({ username: 'alice' });
	});

	it('skips relation display fields', () => {
		const result = prepareDraftSubmissionPayload(
			{
				roleTypeByType: { id: 1, name: 'User' },
			},
			{ relationInfoByKey: relationInfo },
		);

		expect(result).toEqual({});
	});

	it('normalizes relation foreign key fields', () => {
		const result = prepareDraftSubmissionPayload(
			{
				type: { id: 1, name: 'User' },
			},
			{
				relationInfoByKey: {
					type: relationInfo.roleTypeByType,
				},
			},
		);

		expect(result).toEqual({ type: 1 });
	});

	it('normalizes relation arrays', () => {
		const result = prepareDraftSubmissionPayload(
			{
				roleIds: [{ id: 'a' }, { id: 'b' }, null],
			},
			{
				relationInfoByKey: {
					roleIds: {
						foreignKeyField: 'roleIds',
						relationField: 'roles',
						kind: 'hasMany',
						displayCandidates: [],
					},
				},
			},
		);

		expect(result).toEqual({ roleIds: ['a', 'b'] });
	});

	it('preserves scalar fields', () => {
		const result = prepareDraftSubmissionPayload({
			username: 'alice',
			isActive: true,
			age: 30,
		});

		expect(result).toEqual({ username: 'alice', isActive: true, age: 30 });
	});
});
