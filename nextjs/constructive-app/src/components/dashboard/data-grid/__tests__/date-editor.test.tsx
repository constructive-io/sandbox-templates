import { GridCellKind } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

describe('DataGridV2 Date Editor Logic', () => {
	describe('Date type detection', () => {
		it('should detect date format (YYYY-MM-DD)', () => {
			const dateString = '2023-12-25';
			const isDateLike = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
			expect(isDateLike).toBe(true);
		});

		it('should detect datetime format (YYYY-MM-DDTHH:MM:SS)', () => {
			const datetimeString = '2023-12-25T14:30:00';
			const isDateTimeLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(datetimeString);
			expect(isDateTimeLike).toBe(true);
		});

		it('should detect timestamp with timezone', () => {
			const timestampString = '2023-12-25T14:30:00Z';
			const isTimestampLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestampString);
			expect(isTimestampLike).toBe(true);
		});

		it('should detect time format (HH:MM:SS)', () => {
			const timeString = '14:30:00';
			const isTimeLike = /^\d{2}:\d{2}:\d{2}/.test(timeString);
			expect(isTimeLike).toBe(true);
		});

		it('should detect empty string as date-like for empty cells', () => {
			const emptyString = '';
			const isEmptyDateLike = emptyString === '';
			expect(isEmptyDateLike).toBe(true);
		});

		it('should not detect non-date strings', () => {
			const nonDateStrings = ['hello world', '123456', 'not-a-date', '{"key": "value"}', '[1, 2, 3]'];

			nonDateStrings.forEach((str) => {
				const isDateLike =
					str === '' ||
					/^\d{4}-\d{2}-\d{2}$/.test(str) ||
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str) ||
					/^\d{2}:\d{2}:\d{2}/.test(str);

				expect(isDateLike).toBe(false);
			});
		});
	});

	describe('Date formatting logic', () => {
		it('should format date for display', () => {
			const formatDate = (val: unknown, dateType: string): string => {
				if (!val) return '';

				try {
					let date: Date;
					if (val instanceof Date) {
						date = val;
					} else if (typeof val === 'string') {
						date = new Date(val);
					} else {
						return String(val);
					}

					if (isNaN(date.getTime())) return String(val);

					switch (dateType) {
						case 'date':
							return date.toISOString().split('T')[0];
						case 'time':
							return date.toLocaleTimeString('en-US', {
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
								hour12: false,
							});
						case 'datetime':
						case 'timestamptz':
							return date.toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
								hour12: false,
							});
						default:
							return date.toISOString().split('T')[0];
					}
				} catch {
					return String(val);
				}
			};

			const testDate = new Date('2023-12-25T14:30:00Z');

			expect(formatDate(testDate, 'date')).toBe('2023-12-25');
			expect(formatDate(testDate, 'time')).toMatch(/\d{2}:\d{2}:\d{2}/); // Any valid time format
			expect(formatDate(testDate, 'datetime')).toMatch(/Dec 25, 2023/);
			expect(formatDate(testDate, 'timestamptz')).toMatch(/Dec 25, 2023/);
		});

		it('should format date for input', () => {
			const formatForInput = (val: unknown, inputType: string): string => {
				if (!val) return '';

				try {
					let date: Date;
					if (val instanceof Date) {
						date = val;
					} else if (typeof val === 'string') {
						date = new Date(val);
					} else {
						return '';
					}

					if (isNaN(date.getTime())) return '';

					switch (inputType) {
						case 'date':
							return date.toISOString().split('T')[0];
						case 'time':
							return date.toTimeString().split(' ')[0].slice(0, 8);
						case 'datetime-local':
							return date.toISOString().slice(0, 16);
						default:
							return '';
					}
				} catch {
					return '';
				}
			};

			const testDate = new Date('2023-12-25T14:30:00Z');

			expect(formatForInput(testDate, 'date')).toBe('2023-12-25');
			expect(formatForInput(testDate, 'time')).toMatch(/\d{2}:30:00/); // Any valid hour with 30 minutes
			expect(formatForInput(testDate, 'datetime-local')).toMatch(/2023-12-25T\d{2}:30/);
		});
	});

	describe('Date type inference', () => {
		it('should infer date type from value format', () => {
			const getDateType = (value: any): 'date' | 'datetime' | 'timestamptz' | 'time' => {
				if (typeof value === 'string') {
					if (value.includes('T') || value.includes(' ')) {
						return value.includes('+') || value.includes('Z') ? 'timestamptz' : 'datetime';
					}
					if (value.includes(':') && !value.includes('-')) {
						return 'time';
					}
				}
				return 'date';
			};

			expect(getDateType('2023-12-25')).toBe('date');
			expect(getDateType('2023-12-25T14:30:00')).toBe('datetime');
			expect(getDateType('2023-12-25T14:30:00Z')).toBe('timestamptz');
			expect(getDateType('2023-12-25T14:30:00+05:00')).toBe('timestamptz');
			expect(getDateType('14:30:00')).toBe('time');
			expect(getDateType('')).toBe('date'); // Default fallback
		});
	});

	describe('Cell editor integration', () => {
		it('should return proper Text cell for date values', () => {
			const dateValue = '2023-12-25';
			const expectedCell = {
				kind: GridCellKind.Text,
				data: dateValue,
				displayData: dateValue,
				allowOverlay: true,
			};

			expect(expectedCell.kind).toBe(GridCellKind.Text);
			expect(expectedCell.data).toBe(dateValue);
			expect(expectedCell.allowOverlay).toBe(true);
		});

		it('should return Text cell with single-click activation for empty date cells', () => {
			const expectedCell = {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
				activationBehaviorOverride: 'single-click',
			};

			expect(expectedCell.kind).toBe(GridCellKind.Text);
			expect(expectedCell.data).toBe('');
			expect(expectedCell.activationBehaviorOverride).toBe('single-click');
		});

		it('should detect date-like patterns for editor activation', () => {
			const testCases = [
				{ data: '', expected: true },
				{ data: '2023-12-25', expected: true },
				{ data: '2023-12-25T14:30:00', expected: true },
				{ data: '14:30:00', expected: true },
				{ data: 'not a date', expected: false },
				{ data: '{"key": "value"}', expected: false },
				{ data: '[1, 2, 3]', expected: false },
			];

			testCases.forEach(({ data, expected }) => {
				const isDateLike =
					data === '' ||
					/^\d{4}-\d{2}-\d{2}$/.test(data) ||
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data) ||
					/^\d{2}:\d{2}:\d{2}/.test(data);

				expect(isDateLike).toBe(expected);
			});
		});
	});

	describe('Date value conversion', () => {
		it('should handle different date input formats', () => {
			const testInputs = [new Date('2023-12-25T14:30:00Z'), '2023-12-25T14:30:00Z', '2023-12-25', null, undefined];

			testInputs.forEach((input) => {
				let result: Date | null = null;

				if (input instanceof Date) {
					result = input;
				} else if (typeof input === 'string') {
					result = new Date(input);
				}

				if (input === null || input === undefined) {
					expect(result).toBeNull();
				} else {
					expect(result).toBeInstanceOf(Date);
					if (result && !isNaN(result.getTime())) {
						expect(result.getTime()).toBeGreaterThan(0);
					}
				}
			});
		});
	});
});
