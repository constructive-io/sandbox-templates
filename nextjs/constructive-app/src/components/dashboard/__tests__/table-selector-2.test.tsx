/**
 * Test suite for TableSelector2 component
 * Tests the new table editor UI design and functionality
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TableCategory } from '@/components/shared/category-filter';
import { TableSelector, type TableWithCategory } from '../data-grid/data-grid.table-selector';

// Mock the app store
const mockStarredTables = ['users', 'posts'];
const mockToggleStarredTable = vi.fn();
const mockToggleSidebarSection = vi.fn();

vi.mock('@/store/app-store', () => ({
	useStarredTables: () => mockStarredTables,
	useStarredTableActions: () => ({
		toggleStarredTable: mockToggleStarredTable,
	}),
	useSidebarSections: () => ({
		app: true,
		system: true,
	}),
	useSidebarSectionActions: () => ({
		toggleSidebarSection: mockToggleSidebarSection,
	}),
}));

describe('TableSelector', () => {
	const mockTables = ['users', 'posts', 'comments', 'categories', 'tags'];
	const mockOnTableChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Loading State', () => {
		it('should show loading skeleton when isLoading is true', () => {
			render(<TableSelector tables={mockTables} activeTable='' onTableChange={mockOnTableChange} isLoading={true} />);

			// Check for skeleton elements
			expect(screen.getAllByRole('generic').some((el) => el.className.includes('animate-pulse'))).toBe(true);
		});
	});

	describe('Empty State', () => {
		it('should show empty state when no tables are provided', () => {
			render(<TableSelector tables={[]} activeTable='' onTableChange={mockOnTableChange} isLoading={false} />);

			expect(screen.getByText('No tables found')).toBeInTheDocument();
			expect(screen.getByText('No tables available in this schema')).toBeInTheDocument();
		});
	});

	describe('Category Filtering', () => {
		const mockTablesWithCategories: TableWithCategory[] = [
			{ name: 'users', category: 'CORE' },
			{ name: 'posts', category: 'APP' },
			{ name: 'comments', category: 'APP' },
			{ name: 'memberships', category: 'MODULE' },
			{ name: 'settings', category: 'CORE' },
		];

		it('should not show category filter when categoriesEnabled is false', () => {
			render(
				<TableSelector
					tables={mockTablesWithCategories}
					activeTable=''
					onTableChange={mockOnTableChange}
					categoriesEnabled={false}
				/>,
			);

				expect(screen.getByText('Your Tables')).toBeInTheDocument();
				expect(screen.queryByText('System Tables')).not.toBeInTheDocument();
		});

		it('should show category filter when categoriesEnabled is true', () => {
			render(
				<TableSelector
					tables={mockTablesWithCategories}
					activeTable=''
					onTableChange={mockOnTableChange}
					categoriesEnabled={true}
				/>,
			);

				expect(screen.getByText('Your Tables')).toBeInTheDocument();
				expect(screen.getByText('System Tables')).toBeInTheDocument();
		});

			it('should display section counts next to titles', () => {
			render(
				<TableSelector
					tables={mockTablesWithCategories}
					activeTable=''
					onTableChange={mockOnTableChange}
					categoriesEnabled={true}
				/>,
			);

				const yourTablesLabel = screen.getByText('Your Tables');
				const yourTablesTrigger = yourTablesLabel.closest('button');
				expect(yourTablesTrigger).not.toBeNull();
				expect(yourTablesTrigger).toHaveTextContent('2');

				const systemTablesLabel = screen.getByText('System Tables');
				const systemTablesTrigger = systemTablesLabel.closest('button');
				expect(systemTablesTrigger).not.toBeNull();
				expect(systemTablesTrigger).toHaveTextContent('3');
		});

			it('should call toggleSidebarSection when section header is clicked', async () => {
			render(
				<TableSelector
					tables={mockTablesWithCategories}
					activeTable=''
					onTableChange={mockOnTableChange}
					categoriesEnabled={true}
				/>,
			);

				const systemTablesLabel = screen.getByText('System Tables');
				const systemTablesTrigger = systemTablesLabel.closest('button');
				expect(systemTablesTrigger).not.toBeNull();

				fireEvent.click(systemTablesTrigger!);

				await waitFor(() => {
					expect(mockToggleSidebarSection).toHaveBeenCalledWith('system');
				});
		});

		it('should not show category filter for string array tables (no category data)', () => {
			render(
				<TableSelector
					tables={mockTables}
					activeTable=''
					onTableChange={mockOnTableChange}
					categoriesEnabled={true}
				/>,
			);

				// Should not show system section since tables have no category data
				expect(screen.queryByText('System Tables')).not.toBeInTheDocument();
		});
	});
});
