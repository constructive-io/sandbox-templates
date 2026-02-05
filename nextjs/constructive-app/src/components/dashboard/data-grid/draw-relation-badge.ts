import type { GridCell, Rectangle, Theme } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import type { RelationInfo } from '@/store/data-grid-slice';

interface DrawRelationBadgeArgs {
	ctx: CanvasRenderingContext2D;
	cell: GridCell;
	theme: Theme;
	rect: Rectangle;
	col: number;
	columnKey: string;
	relationInfoByField: Map<string, RelationInfo>;
}

const BADGE_PADDING_X = 4;
const BADGE_PADDING_Y = 2;
const BADGE_MARGIN_LEFT = 6;
const BADGE_BORDER_RADIUS = 4;
const BADGE_FONT_SIZE = 10;

function getRelationCount(cell: GridCell): number | null {
	if (cell.kind === GridCellKind.Bubble) {
		const data = (cell as any).data;
		if (!Array.isArray(data)) return null;
		// Check for "+N" pattern in the last element (overflow indicator)
		const lastItem = data[data.length - 1];
		if (typeof lastItem === 'string' && lastItem.startsWith('+')) {
			const overflow = parseInt(lastItem.slice(1), 10);
			if (!isNaN(overflow)) {
				return data.length - 1 + overflow;
			}
		}
		return data.length;
	}

	if (cell.kind === GridCellKind.Text) {
		const displayData = (cell as any).displayData || (cell as any).data;
		if (!displayData || displayData === '') return 0;
		return 1;
	}

	return null;
}

export function drawRelationBadge(
	args: DrawRelationBadgeArgs,
	drawContent: () => void,
): boolean {
	const { ctx, cell, theme, rect, columnKey, relationInfoByField } = args;

	const relationInfo = relationInfoByField.get(columnKey);
	if (!relationInfo) {
		return false;
	}

	const isMultiRelation = relationInfo.kind === 'hasMany' || relationInfo.kind === 'manyToMany';
	if (!isMultiRelation) {
		return false;
	}

	const count = getRelationCount(cell);
	if (count === null || count === 0) {
		return false;
	}

	ctx.save();

	const badgeText = String(count);
	ctx.font = `500 ${BADGE_FONT_SIZE}px ${theme.fontFamily}`;
	const textMetrics = ctx.measureText(badgeText);
	const textWidth = textMetrics.width;
	const badgeWidth = textWidth + BADGE_PADDING_X * 2;
	const badgeHeight = BADGE_FONT_SIZE + BADGE_PADDING_Y * 2;

	const badgeX = rect.x + BADGE_MARGIN_LEFT;
	const badgeY = rect.y + (rect.height - badgeHeight) / 2;

	// Badge background - using muted/secondary colors from theme
	ctx.fillStyle = theme.bgBubble || theme.bgCellMedium || '#f3f4f6';
	ctx.beginPath();
	ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, BADGE_BORDER_RADIUS);
	ctx.fill();

	// Badge border
	ctx.strokeStyle = theme.borderColor || '#e5e7eb';
	ctx.lineWidth = 1;
	ctx.stroke();

	// Badge text
	ctx.fillStyle = theme.textMedium || theme.textDark || '#6b7280';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

	ctx.restore();

	// Offset the content area to account for the badge
	const contentOffset = badgeWidth + BADGE_MARGIN_LEFT + 4;

	ctx.save();
	ctx.beginPath();
	ctx.rect(rect.x + contentOffset, rect.y, rect.width - contentOffset, rect.height);
	ctx.clip();

	// Translate context so default content draws offset
	ctx.translate(contentOffset, 0);
	drawContent();

	ctx.restore();

	return true;
}

export function createDrawCellCallback(
	columnKeys: string[],
	relationInfoByField: Map<string, RelationInfo>,
) {
	return (
		args: {
			ctx: CanvasRenderingContext2D;
			cell: GridCell;
			theme: Theme;
			rect: Rectangle;
			col: number;
			row: number;
			hoverAmount: number;
			hoverX: number | undefined;
			hoverY: number | undefined;
			highlighted: boolean;
			imageLoader: unknown;
		},
		drawContent: () => void,
	): void => {
		const columnKey = columnKeys[args.col];
		if (!columnKey) {
			drawContent();
			return;
		}

		const handled = drawRelationBadge(
			{
				ctx: args.ctx,
				cell: args.cell,
				theme: args.theme,
				rect: args.rect,
				col: args.col,
				columnKey,
				relationInfoByField,
			},
			drawContent,
		);

		if (!handled) {
			drawContent();
		}
	};
}
