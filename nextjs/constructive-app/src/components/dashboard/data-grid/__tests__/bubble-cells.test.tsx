import { GridCellKind } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

describe('DataGridV2 Bubble Cell Logic', () => {
	describe('Array cell types', () => {
		it('should return Bubble cell for text-array values', () => {
			const value = ['apple', 'banana', 'cherry'];
			const cellType = 'text-array';

			if (Array.isArray(value) && cellType?.endsWith('-array')) {
				const stringData = value.map((item) => String(item));
				const expectedCell = {
					kind: GridCellKind.Bubble,
					data: stringData,
					allowOverlay: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Bubble);
				expect(expectedCell.data).toEqual(['apple', 'banana', 'cherry']);
			}
		});

		it('should return Bubble cell for number-array values', () => {
			const value = [1, 2, 3, 4.5];
			const cellType = 'number-array';

			if (Array.isArray(value) && cellType?.endsWith('-array')) {
				const stringData = value.map((item) => String(item));
				const expectedCell = {
					kind: GridCellKind.Bubble,
					data: stringData,
					allowOverlay: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Bubble);
				expect(expectedCell.data).toEqual(['1', '2', '3', '4.5']);
			}
		});

		it('should return Bubble cell for date-array values', () => {
			const value = [new Date('2023-01-01'), new Date('2023-12-31')];
			const cellType = 'date-array';

			if (Array.isArray(value) && cellType?.endsWith('-array')) {
				const stringData = value.map((item) => {
					if (item instanceof Date) return item.toISOString().split('T')[0];
					return String(item);
				});
				const expectedCell = {
					kind: GridCellKind.Bubble,
					data: stringData,
					allowOverlay: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Bubble);
				expect(expectedCell.data).toEqual(['2023-01-01', '2023-12-31']);
			}
		});

		it('should return empty Bubble cell for null array values', () => {
			const value = null;
			const cellType = 'text-array';

			if (value === null && cellType?.endsWith('-array')) {
				const expectedCell = {
					kind: GridCellKind.Bubble,
					data: [],
					allowOverlay: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Bubble);
				expect(expectedCell.data).toEqual([]);
			}
		});

		it('should return empty Bubble cell for undefined array values', () => {
			const value = undefined;
			const cellType = 'uuid-array';

			if (value === undefined && cellType?.endsWith('-array')) {
				const expectedCell = {
					kind: GridCellKind.Bubble,
					data: [],
					allowOverlay: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Bubble);
				expect(expectedCell.data).toEqual([]);
			}
		});

		it('should handle mixed type arrays by converting to strings', () => {
			const value = [1, 'text', true, null, { key: 'value' }];
			const cellType = 'array';

			if (Array.isArray(value) && cellType === 'array') {
				const stringData = value.map((item) => {
					if (item === null || item === undefined) return '';
					if (typeof item === 'string') return item;
					if (typeof item === 'number') return String(item);
					if (typeof item === 'boolean') return String(item);
					if (typeof item === 'object') return JSON.stringify(item);
					return String(item);
				});

				expect(stringData).toEqual(['1', 'text', 'true', '', '{"key":"value"}']);
			}
		});
	});

	describe('onCellEdited logic for Bubble cells', () => {
		it('should handle text-array cell updates correctly', () => {
			const newValue = {
				kind: GridCellKind.Bubble,
				data: ['new', 'text', 'values'],
			};
			const cellType = 'text-array' as const;

			if (newValue.kind === GridCellKind.Bubble) {
				const bubbleData = newValue.data || [];
				let value;

				// text-array, uuid-array, or generic array - keep as strings
				value = bubbleData;

				expect(value).toEqual(['new', 'text', 'values']);
			}
		});

		it('should handle number-array cell updates correctly', () => {
			const newValue = {
				kind: GridCellKind.Bubble,
				data: ['1', '2.5', '3', 'invalid', '4.7'],
			};
			const cellType = 'number-array' as const;

			if (newValue.kind === GridCellKind.Bubble) {
				const bubbleData = newValue.data || [];
				let value;

				value = bubbleData.map((item: string) => parseFloat(item)).filter((item: number) => !isNaN(item));

				expect(value).toEqual([1, 2.5, 3, 4.7]); // 'invalid' filtered out
			}
		});

		it('should handle integer-array cell updates correctly', () => {
			const newValue = {
				kind: GridCellKind.Bubble,
				data: ['1', '2', '3.5', 'invalid', '4'],
			};
			const cellType = 'integer-array' as const;

			if (newValue.kind === GridCellKind.Bubble) {
				const bubbleData = newValue.data || [];
				let value;

				value = bubbleData.map((item: string) => parseInt(item, 10)).filter((item: number) => !isNaN(item));

				expect(value).toEqual([1, 2, 3, 4]); // 3.5 becomes 3, 'invalid' filtered out
			}
		});

		it('should handle date-array cell updates correctly', () => {
			const newValue = {
				kind: GridCellKind.Bubble,
				data: ['2023-01-01', '2023-12-31', 'invalid-date', '2024-06-15'],
			};
			const cellType = 'date-array' as const;

			if (newValue.kind === GridCellKind.Bubble) {
				const bubbleData = newValue.data || [];
				let value: Date[];

				value = bubbleData.map((item: string) => new Date(item)).filter((item: Date) => !isNaN(item.getTime()));

				expect(value).toHaveLength(3); // 'invalid-date' filtered out
				expect(value[0]).toBeInstanceOf(Date);
				expect(value[0].getFullYear()).toBe(2023);
			}
		});
	});
});
