import { useParams } from 'next/navigation';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOrganizations, useSchemaBuilderDataSelector } from '@/lib/gql/hooks/schema-builder';

import { useEntityParams } from '../use-entity-params';

vi.mock('next/navigation', () => ({
	useParams: vi.fn(),
}));

vi.mock('@/lib/gql/hooks/schema-builder', () => ({
	useSchemaBuilderDataSelector: vi.fn(),
	useOrganizations: vi.fn(),
}));

const mockUseParams = useParams as ReturnType<typeof vi.fn>;
const mockUseSchemaBuilderDataSelector = useSchemaBuilderDataSelector as ReturnType<typeof vi.fn>;
const mockUseOrganizations = useOrganizations as ReturnType<typeof vi.fn>;

const setSchemas = (remoteSchemas: any[]) => {
	mockUseSchemaBuilderDataSelector.mockImplementation((selector) =>
		selector({
			availableSchemas: remoteSchemas,
			selectedSchemaKey: '',
			currentSchemaInfo: null,
			currentSchema: null,
			currentTable: null,
			selectedTableId: null,
			isLoading: false,
			isFetching: false,
			error: null,
			refetch: vi.fn(),
			selectTable: vi.fn(),
		}),
	);
};

describe('useEntityParams', () => {
	it('returns valid org+database when database belongs to org', () => {
		mockUseParams.mockReturnValue({ orgId: 'org-1', databaseId: 'db-1' });

		mockUseOrganizations.mockReturnValue({
			organizations: [{ id: 'org-1', displayName: 'Org 1', username: 'org1', role: 'member', memberCount: 1 }],
			isLoading: false,
		});

		setSchemas([{ key: 'db-db-1', source: 'database', databaseInfo: { id: 'db-1', ownerId: 'org-1' } }]);

		const { result } = renderHook(() => useEntityParams());
		expect(result.current.validation.isValid).toBe(true);
		expect(result.current.databaseSchemaKey).toBe('db-db-1');
		expect(result.current.database?.databaseInfo?.id).toBe('db-1');
	});

	it('rejects org+database when database belongs to a different org', () => {
		mockUseParams.mockReturnValue({ orgId: 'org-1', databaseId: 'db-1' });

		mockUseOrganizations.mockReturnValue({
			organizations: [{ id: 'org-1', displayName: 'Org 1', username: 'org1', role: 'member', memberCount: 1 }],
			isLoading: false,
		});

		setSchemas([{ key: 'db-db-1', source: 'database', databaseInfo: { id: 'db-1', ownerId: 'org-2' } }]);

		const { result } = renderHook(() => useEntityParams());
		expect(result.current.validation.isValid).toBe(false);
		expect(result.current.validation.redirectTo).toBe('/orgs/org-1/databases');
	});

	it('allows direct database route without org context when database exists', () => {
		mockUseParams.mockReturnValue({ databaseId: 'db-1' });

		mockUseOrganizations.mockReturnValue({
			organizations: [],
			isLoading: false,
		});

		setSchemas([{ key: 'db-db-1', source: 'database', databaseInfo: { id: 'db-1' } }]);

		const { result } = renderHook(() => useEntityParams());
		expect(result.current.validation.isValid).toBe(true);
		expect(result.current.level).toBe('database');
	});
});
