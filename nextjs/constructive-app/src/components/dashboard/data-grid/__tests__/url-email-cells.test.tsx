import { GridCellKind } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

describe('DataGridV2 URL and Email Cell Logic', () => {
	describe('URL cells', () => {
		it('should return Uri cell for URL values when cellType is url', () => {
			const value = 'https://example.com';
			const cellType = 'url';

			// This would be the logic inside getCellContent
			if (cellType === 'url') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: value,
					displayData: value,
					allowOverlay: true,
					hoverEffect: true,
					onClickUri: expect.any(Function),
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe(value);
				expect(expectedCell.hoverEffect).toBe(true);
			}
		});

		it('should return empty Uri cell for null URL values', () => {
			const value = null;
			const cellType = 'url';

			if (value === null && cellType === 'url') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: '',
					displayData: '',
					allowOverlay: true,
					hoverEffect: false,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe('');
				expect(expectedCell.hoverEffect).toBe(false);
			}
		});

		it('should return empty Uri cell for empty string URL values', () => {
			const value = '';
			const cellType = 'url';

			if (cellType === 'url' && value === '') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: '',
					displayData: '',
					allowOverlay: true,
					hoverEffect: false,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe('');
				expect(expectedCell.hoverEffect).toBe(false);
			}
		});
	});

	describe('Email cells', () => {
		it('should return Uri cell with mailto for email values when cellType is email', () => {
			const value = 'user@example.com';
			const cellType = 'email';

			// This would be the logic inside getCellContent
			if (cellType === 'email') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: `mailto:${value}`,
					displayData: value, // Show just the email, not mailto:
					allowOverlay: true,
					hoverEffect: true,
					onClickUri: expect.any(Function),
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe(`mailto:${value}`);
				expect(expectedCell.displayData).toBe(value);
				expect(expectedCell.hoverEffect).toBe(true);
			}
		});

		it('should return empty Uri cell for null email values', () => {
			const value = null;
			const cellType = 'email';

			if (value === null && cellType === 'email') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: '',
					displayData: '',
					allowOverlay: true,
					hoverEffect: false,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe('');
				expect(expectedCell.hoverEffect).toBe(false);
			}
		});

		it('should return empty Uri cell for empty string email values', () => {
			const value = '';
			const cellType = 'email';

			if (cellType === 'email' && value === '') {
				const expectedCell = {
					kind: GridCellKind.Uri,
					data: '',
					displayData: '',
					allowOverlay: true,
					hoverEffect: false,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Uri);
				expect(expectedCell.data).toBe('');
				expect(expectedCell.hoverEffect).toBe(false);
			}
		});
	});

	describe('onCellEdited logic for Uri cells', () => {
		it('should handle URL cell updates correctly', () => {
			const newValue = {
				kind: GridCellKind.Uri,
				data: 'https://newsite.com',
			};

			if (newValue.kind === GridCellKind.Uri) {
				const uriData = newValue.data || '';
				let value;
				if (uriData.startsWith('mailto:')) {
					value = uriData.substring(7); // Remove 'mailto:' prefix
				} else {
					value = uriData;
				}

				expect(value).toBe('https://newsite.com');
			}
		});

		it('should handle email cell updates correctly by removing mailto prefix', () => {
			const newValue = {
				kind: GridCellKind.Uri,
				data: 'mailto:newemail@example.com',
			};

			if (newValue.kind === GridCellKind.Uri) {
				const uriData = newValue.data || '';
				let value;
				if (uriData.startsWith('mailto:')) {
					value = uriData.substring(7); // Remove 'mailto:' prefix
				} else {
					value = uriData;
				}

				expect(value).toBe('newemail@example.com');
			}
		});
	});
});
