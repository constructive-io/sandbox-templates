import {
	GridCellKind,
	type BooleanCell,
	type BubbleCell,
	type CustomCell,
	type GridCell,
	type ImageCell,
	type NumberCell,
	type TextCell,
	type UriCell,
} from '@glideapps/glide-data-grid';

// Re-export library cell types for convenience
export type { ImageCell, TextCell, NumberCell, BooleanCell, BubbleCell, UriCell, CustomCell };

// Type guards using the library's GridCellKind values
export function isImageCell(cell: GridCell): cell is ImageCell {
	return cell.kind === GridCellKind.Image;
}

export function isTextCell(cell: GridCell): cell is TextCell {
	return cell.kind === GridCellKind.Text;
}

export function isNumberCell(cell: GridCell): cell is NumberCell {
	return cell.kind === GridCellKind.Number;
}

export function isBooleanCell(cell: GridCell): cell is BooleanCell {
	return cell.kind === GridCellKind.Boolean;
}

export function isBubbleCell(cell: GridCell): cell is BubbleCell {
	return cell.kind === GridCellKind.Bubble;
}

export function isUriCell(cell: GridCell): cell is UriCell {
	return cell.kind === GridCellKind.Uri;
}

export function isCustomCell(cell: GridCell): cell is CustomCell {
	return cell.kind === GridCellKind.Custom;
}

// Metadata used when creating cells from values
export interface CellCreationMetadata {
	cellType: string;
	fieldName: string;
	fieldMeta?: any;
	canEdit: boolean;
	isReadonly: boolean;
	activationBehavior: 'single-click' | 'double-click';
}
