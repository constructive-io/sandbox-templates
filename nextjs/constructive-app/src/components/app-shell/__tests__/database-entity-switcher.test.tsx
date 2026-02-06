import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DatabaseEntitySwitcher } from '../database-entity-switcher';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useEntityParams } from '@/lib/navigation';

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
	usePathname: vi.fn(),
	useSearchParams: vi.fn(),
}));

// Mock the card stack hook
vi.mock('@constructive-io/ui/stack', () => ({
	useCardStack: vi.fn(() => ({
		push: vi.fn(),
		pop: vi.fn(),
		replace: vi.fn(),
		clear: vi.fn(),
		cards: [],
		activeCard: null,
	})),
}));

vi.mock('@/lib/gql/hooks/schema-builder', () => ({
	useSchemaBuilderSelectors: vi.fn(),
}));

vi.mock('@/lib/gql/hooks/schema-builder/use-create-database-provision', () => ({
	useCreateDatabaseProvision: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('@/lib/gql/hooks/schema-builder/use-update-database', () => ({
	useUpdateDatabase: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('@/lib/gql/hooks/schema-builder/use-delete-database', () => ({
	useDeleteDatabase: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('@/lib/navigation', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/navigation')>();
	return {
		...actual,
		useEntityParams: vi.fn(),
	};
});

const mockPush = vi.fn();
const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>;
const mockUsePathname = usePathname as unknown as ReturnType<typeof vi.fn>;
const mockUseSearchParams = useSearchParams as unknown as ReturnType<typeof vi.fn>;
const mockUseSchemaBuilderSelectors = useSchemaBuilderSelectors as unknown as ReturnType<typeof vi.fn>;
const mockUseEntityParams = useEntityParams as unknown as ReturnType<typeof vi.fn>;

describe('DatabaseEntitySwitcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseRouter.mockReturnValue({ push: mockPush });
		mockUseEntityParams.mockReturnValue({ orgId: 'org-1' });

		mockUseSchemaBuilderSelectors.mockReturnValue({
			availableSchemas: [
				{
					key: 'schema-1',
					name: 'Alpha',
					source: 'database',
					databaseInfo: { id: 'db-1', ownerId: 'org-1' },
					dbSchema: { tables: [{ id: 't1' }] },
				},
				{
					key: 'schema-2',
					name: 'Beta',
					source: 'database',
					databaseInfo: { id: 'db-2', ownerId: 'org-1' },
					dbSchema: { tables: [{ id: 't2' }] },
				},
			],
			selectedSchemaKey: 'schema-1',
			selectSchema: vi.fn(),
			selectTable: vi.fn(),
			isLoading: false,
		});
	});

	it('clears query params when switching databases from /data', async () => {
		mockUsePathname.mockReturnValue('/orgs/org-1/databases/db-1/data');
		mockUseSearchParams.mockReturnValue({ toString: () => 'table=xyz' });

		render(<DatabaseEntitySwitcher />);

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /alpha/i }));

		// Wait for the dropdown menu content to appear
		const betaOption = await waitFor(() => screen.getByText('Beta'));
		await user.click(betaOption);

		expect(mockPush).toHaveBeenCalledWith('/orgs/org-1/databases/db-2/data');
	});

	it('preserves query params when switching databases from non-/data sections', async () => {
		mockUsePathname.mockReturnValue('/orgs/org-1/databases/db-1/schemas');
		mockUseSearchParams.mockReturnValue({ toString: () => 'search=foo&page=2' });

		render(<DatabaseEntitySwitcher />);

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /alpha/i }));

		// Wait for the dropdown menu content to appear
		const betaOption = await waitFor(() => screen.getByText('Beta'));
		await user.click(betaOption);

		expect(mockPush).toHaveBeenCalledWith('/orgs/org-1/databases/db-2/schemas?search=foo&page=2');
	});
});
