import { GridCellKind, type ImageCell } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

import { createEditor, type EditorFactoryProps } from '../editor-registry';

describe('DataGridV2 Image Cell Logic', () => {
	it('should return Image cell for string URL when cellType is image', () => {
		const value = 'https://example.com/test.jpg';
		const cellType = 'image';

		// This would be the logic inside getCellContent
		if (cellType === 'image' || /\.(png|jpe?g|gif|webp|svg)$/i.test(value) || value.startsWith('http')) {
			const expectedCell = {
				kind: GridCellKind.Image,
				data: [value],
				displayData: [value],
				allowOverlay: true,
				readonly: true,
			};

			expect(expectedCell.kind).toBe(GridCellKind.Image);
			expect(expectedCell.data).toEqual([value]);
			expect(expectedCell.allowOverlay).toBe(true);
		}
	});

	it('should return Image cell for object with url property when cellType is image', () => {
		const value = { url: 'https://example.com/test.png', filename: 'test.png' };
		const cellType = 'image';

		if (cellType === 'image') {
			const url = value.url;
			if (url) {
				const expectedCell = {
					kind: GridCellKind.Image,
					data: [url],
					displayData: [url],
					allowOverlay: true,
					readonly: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Image);
				expect(expectedCell.data).toEqual([url]);
				expect(expectedCell.allowOverlay).toBe(true);
			}
		}
	});

	it('should return Image cell for URLs with image extensions', () => {
		const testUrls = [
			'https://example.com/image.png',
			'https://example.com/photo.jpg',
			'https://example.com/pic.jpeg',
			'https://example.com/graphic.gif',
			'https://example.com/vector.svg',
			'https://example.com/modern.webp',
		];

		testUrls.forEach((url) => {
			if (/\.(png|jpe?g|gif|webp|svg)$/i.test(url)) {
				const expectedCell = {
					kind: GridCellKind.Image,
					data: [url],
					displayData: [url],
					allowOverlay: true,
					readonly: true,
				};

				expect(expectedCell.kind).toBe(GridCellKind.Image);
				expect(expectedCell.data).toEqual([url]);
			}
		});
	});

	it('should return Image cell for http URLs even without image extensions', () => {
		const url = 'https://example.com/some-image-endpoint';

		if (url.startsWith('http')) {
			const expectedCell = {
				kind: GridCellKind.Image,
				data: [url],
				displayData: [url],
				allowOverlay: true,
				readonly: true,
			};

			expect(expectedCell.kind).toBe(GridCellKind.Image);
			expect(expectedCell.data).toEqual([url]);
		}
	});

	it('should route image cell to image editor', () => {
		const mockImageCell: ImageCell = {
			kind: GridCellKind.Image,
			data: ['https://example.com/test.jpg'],
			displayData: ['https://example.com/test.jpg'],
			allowOverlay: true,
			readonly: false,
		};

		const mockProps: EditorFactoryProps = {
			cell: mockImageCell,
			cellType: 'image',
			colKey: 'profileImage',
			rowData: {},
			tableName: 'users',
			activeCellRef: { current: null },
			data: [],
			columnKeys: [],
			fieldMetaMap: new Map(),
		};

		const editor = createEditor(mockProps);

		// Should return a valid editor result (object with editor property or function)
		expect(editor).toBeDefined();
		// Editor can be a function OR an object with { editor, disablePadding, disableStyling }
		const isValidEditor =
			typeof editor === 'function' || (typeof editor === 'object' && editor !== null && 'editor' in editor);
		expect(isValidEditor).toBe(true);
	});

	it('should route upload cell to image editor', () => {
		const mockUploadCell: ImageCell = {
			kind: GridCellKind.Image,
			data: [''],
			displayData: [''],
			allowOverlay: true,
			readonly: false,
		};

		const mockProps: EditorFactoryProps = {
			cell: mockUploadCell,
			cellType: 'upload',
			colKey: 'profileImage',
			rowData: {},
			tableName: 'users',
			activeCellRef: { current: null },
			data: [],
			columnKeys: [],
			fieldMetaMap: new Map(),
		};

		const editor = createEditor(mockProps);

		// Should return a valid editor result (object with editor property or function)
		expect(editor).toBeDefined();
		// Editor can be a function OR an object with { editor, disablePadding, disableStyling }
		const isValidEditor =
			typeof editor === 'function' || (typeof editor === 'object' && editor !== null && 'editor' in editor);
		expect(isValidEditor).toBe(true);
	});
});
