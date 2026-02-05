import type { CustomCell, CustomRenderer } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { buttonVariants } from '@constructive-io/ui/button';

export type DraftActionCellStatus = 'idle' | 'saving' | 'error';

interface DraftActionCellData {
	kind: 'draft-action-cell';
	disabled: boolean;
	status: DraftActionCellStatus;
	label: string;
	errored: boolean;
}

export interface DraftActionCell extends CustomCell {
	kind: GridCellKind.Custom;
	readonly data: DraftActionCellData;
}

interface DraftActionCellOptions {
	status?: DraftActionCellStatus;
	disabled?: boolean;
	errored?: boolean;
}

interface ButtonPaintSnapshot {
	background: string;
	textColor: string;
	borderColor: string;
	borderWidth: number;
	borderRadius: number;
	fontSize: number;
	fontFamily: string;
	fontWeight: string;
	paddingX: number;
	paddingY: number;
	height: number;
	width: number;
	boxShadow?: {
		color: string;
		offsetX: number;
		offsetY: number;
		blur: number;
		spread: number;
	};
}

interface RgbaColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

type ButtonStyleCacheKey = 'outline' | 'outline-disabled';

const BUTTON_STYLE_CACHE = new Map<ButtonStyleCacheKey, ButtonPaintSnapshot>();

const FALLBACK_BUTTON_STYLE: ButtonPaintSnapshot = {
	background: '#ffffff',
	textColor: '#111827',
	borderColor: '#e4e4e7',
	borderWidth: 1,
	borderRadius: 6,
	fontSize: 13,
	fontFamily: 'Inter, system-ui, sans-serif',
	fontWeight: '500',
	paddingX: 12,
	paddingY: 6,
	height: 32,
	width: 88,
	boxShadow: {
		color: 'rgba(15,23,42,0.06)',
		offsetX: 0,
		offsetY: 1,
		blur: 2,
		spread: 0,
	},
};

function parsePx(value: string | null): number {
	if (!value) return 0;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function parseBoxShadow(shadow: string | null): ButtonPaintSnapshot['boxShadow'] {
	if (!shadow) return undefined;
	const parts = shadow.split(',');
	if (!parts.length) return undefined;
	const primary = parts[0]!.trim();
	const regex = /(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})\s+(-?\d*\.?\d+)px\s+(-?\d*\.?\d+)px(?:\s+(\d*\.?\d+)px)?(?:\s+(\d*\.?\d+)px)?/;
	const match = primary.match(regex);
	if (!match) return undefined;
	const [, color, offsetX, offsetY, blur = '0', spread = '0'] = match;
	return {
		color,
		offsetX: Number.parseFloat(offsetX),
		offsetY: Number.parseFloat(offsetY),
		blur: Number.parseFloat(blur),
		spread: Number.parseFloat(spread),
	};
}

function parseColor(color: string): RgbaColor {
	const trimmed = color.trim();
	if (trimmed.startsWith('#')) {
		const hex = trimmed.slice(1);
		if (hex.length === 3 || hex.length === 4) {
			const r = Number.parseInt(hex[0]! + hex[0], 16);
			const g = Number.parseInt(hex[1]! + hex[1], 16);
			const b = Number.parseInt(hex[2]! + hex[2], 16);
			const a = hex.length === 4 ? Number.parseInt(hex[3]! + hex[3], 16) / 255 : 1;
			return { r, g, b, a };
		}
		if (hex.length === 6 || hex.length === 8) {
			const r = Number.parseInt(hex.slice(0, 2), 16);
			const g = Number.parseInt(hex.slice(2, 4), 16);
			const b = Number.parseInt(hex.slice(4, 6), 16);
			const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
			return { r, g, b, a };
		}
	}
	const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/);
	if (rgbaMatch) {
		const parts = rgbaMatch[1]!
			.split(',')
			.map((segment) => segment.trim())
			.filter(Boolean);
		if (parts.length >= 3) {
			const [r, g, b] = parts.slice(0, 3).map((component) => Number.parseFloat(component));
			const alphaPart = parts[3];
			const a = alphaPart !== undefined ? Number.parseFloat(alphaPart) : 1;
			return { r, g, b, a: Number.isFinite(a) ? a : 1 };
		}
	}
	return { r: 37, g: 99, b: 235, a: 1 };
}

function toColorString({ r, g, b, a }: RgbaColor): string {
	const clamp = (value: number, max = 255) => Math.max(0, Math.min(max, Math.round(value)));
	const alpha = Math.max(0, Math.min(1, Number.isFinite(a) ? a : 1));
	return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${alpha.toFixed(alpha === 1 ? 0 : 2)})`;
}

function mixColors(baseColor: string, mixColor: string, amount: number): string {
	const t = Math.max(0, Math.min(1, amount));
	const c1 = parseColor(baseColor);
	const c2 = parseColor(mixColor);
	return toColorString({
		r: c1.r + (c2.r - c1.r) * t,
		g: c1.g + (c2.g - c1.g) * t,
		b: c1.b + (c2.b - c1.b) * t,
		a: c1.a + (c2.a - c1.a) * t,
	});
}

function captureButtonStyle(disabled: boolean): ButtonPaintSnapshot {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		const fallback = FALLBACK_BUTTON_STYLE;
		return {
			...fallback,
			boxShadow: fallback.boxShadow ? { ...fallback.boxShadow } : undefined,
		};
	}

	const button = document.createElement('button');
	button.type = 'button';
	button.className = buttonVariants({ variant: 'outline', size: 'sm' });
	button.textContent = 'Save';
	if (disabled) {
		button.disabled = true;
	}
	button.style.position = 'absolute';
	button.style.visibility = 'hidden';
	button.style.pointerEvents = 'none';
	button.style.top = '-9999px';
	button.style.left = '-9999px';

	document.body.appendChild(button);

	const rect = button.getBoundingClientRect();
	const computed = window.getComputedStyle(button);

	const snapshot: ButtonPaintSnapshot = {
		background: computed.backgroundColor || FALLBACK_BUTTON_STYLE.background,
		textColor: computed.color || FALLBACK_BUTTON_STYLE.textColor,
		borderColor: computed.borderColor || FALLBACK_BUTTON_STYLE.borderColor,
		borderWidth: parsePx(computed.borderWidth) || FALLBACK_BUTTON_STYLE.borderWidth,
		borderRadius: parsePx(computed.borderRadius) || FALLBACK_BUTTON_STYLE.borderRadius,
		fontSize: parsePx(computed.fontSize) || FALLBACK_BUTTON_STYLE.fontSize,
		fontFamily: computed.fontFamily || FALLBACK_BUTTON_STYLE.fontFamily,
		fontWeight: computed.fontWeight || FALLBACK_BUTTON_STYLE.fontWeight,
		paddingX: parsePx(computed.paddingLeft) || FALLBACK_BUTTON_STYLE.paddingX,
		paddingY: parsePx(computed.paddingTop) || FALLBACK_BUTTON_STYLE.paddingY,
		height: rect.height || parsePx(computed.height) || FALLBACK_BUTTON_STYLE.height,
		width: rect.width || parsePx(computed.width) || FALLBACK_BUTTON_STYLE.width,
		boxShadow: parseBoxShadow(computed.boxShadow) ?? FALLBACK_BUTTON_STYLE.boxShadow,
	};

	document.body.removeChild(button);

	return snapshot;
}

function getButtonStyle(disabled: boolean): ButtonPaintSnapshot {
	const key: ButtonStyleCacheKey = disabled ? 'outline-disabled' : 'outline';
	const cached = BUTTON_STYLE_CACHE.get(key);
	if (cached) return cached;
	const snapshot = captureButtonStyle(disabled);
	BUTTON_STYLE_CACHE.set(key, snapshot);
	return snapshot;
}

export function createDraftActionCell(options: DraftActionCellOptions = {}): DraftActionCell {
	const status = options.status ?? 'idle';
	const disabled = options.disabled ?? false;
	const errored = options.errored ?? false;
	const label = 'Save';

	return {
		kind: GridCellKind.Custom,
		allowOverlay: false,
		copyData: label,
		data: {
			kind: 'draft-action-cell',
			disabled,
			status,
			label,
			errored,
		},
	};
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
	const r = Math.min(radius, height / 2, width / 2);
	ctx.beginPath();
	const ctxWithRoundRect = ctx as CanvasRenderingContext2D & {
		roundRect?: (x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]) => void;
	};
	if (typeof ctxWithRoundRect.roundRect === 'function') {
		ctxWithRoundRect.roundRect(x, y, width, height, r);
		ctx.closePath();
		return;
	}
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + width - r, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + r);
	ctx.lineTo(x + width, y + height - r);
	ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
	ctx.lineTo(x + r, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}

const DraftActionRenderer: CustomRenderer<DraftActionCell> = {
	kind: GridCellKind.Custom,
	isMatch: (cell): cell is DraftActionCell =>
		(cell.data as DraftActionCellData | undefined)?.kind === 'draft-action-cell',
	draw: (args, cell) => {
		const { ctx, rect } = args;
		const { disabled, status, label, errored } = cell.data;

		const buttonStyle = getButtonStyle(disabled);
		const hoverAmount = Math.max(0, Math.min(1, args.hoverAmount ?? 0));
		const baseHeight = Math.max(buttonStyle.height, buttonStyle.fontSize + buttonStyle.paddingY * 2);
		const scale = Math.max(0.72, Math.min(1, (rect.height - 8) / baseHeight));
		const buttonHeight = Math.max(24, baseHeight * scale);
		const paddingX = buttonStyle.paddingX * scale;
		const paddingY = buttonStyle.paddingY * scale;
		const fontSize = Math.max(10, buttonStyle.fontSize * scale);
		const font = `${buttonStyle.fontWeight} ${fontSize}px ${buttonStyle.fontFamily}`;
		const hasSpinner = status === 'saving' && !disabled;
		const spinnerDiameter = hasSpinner ? Math.min(buttonHeight - paddingY * 2, fontSize * 1.1) : 0;
		const spinnerGap = hasSpinner ? Math.max(6, spinnerDiameter * 0.45) : 0;

		ctx.save();
		ctx.font = font;
		ctx.textBaseline = 'middle';
		const displayLabel = hasSpinner ? 'Saving…' : label;
		const textMetrics = ctx.measureText(displayLabel);
		const contentWidth = textMetrics.width + (hasSpinner ? spinnerDiameter + spinnerGap : 0);
		const minButtonWidth = buttonStyle.width * scale;
		const maxButtonWidth = Math.max(48, rect.width - 8);
		const buttonWidth = Math.max(
			Math.min(maxButtonWidth, contentWidth + paddingX * 2),
			Math.min(minButtonWidth, maxButtonWidth),
		);
		const buttonX = rect.x + (rect.width - buttonWidth) / 2;
		const buttonY = rect.y + (rect.height - buttonHeight) / 2;
		const radius = Math.min(buttonHeight / 2, buttonStyle.borderRadius * scale);

		let fillColor = buttonStyle.background;
		let borderColor = buttonStyle.borderColor;
		const borderWidth = Math.max(0.5, buttonStyle.borderWidth * scale);
		let textColor = buttonStyle.textColor;

		if (disabled) {
			fillColor = mixColors(fillColor, '#f4f4f5', 0.65);
			borderColor = mixColors(borderColor, '#e4e4e7', 0.5);
			textColor = mixColors(textColor, '#6b7280', 0.55);
		} else {
			if (status === 'saving') {
				fillColor = mixColors(fillColor, borderColor, 0.3);
				textColor = mixColors(textColor, borderColor, 0.3);
			}
			if (hoverAmount > 0) {
				const mixAmount = 0.2 + hoverAmount * 0.1;
				fillColor = mixColors(fillColor, borderColor, mixAmount);
				borderColor = mixColors(borderColor, textColor, 0.2 * hoverAmount);
				textColor = mixColors(textColor, borderColor, 0.12 * hoverAmount);
			}
		}

		args.overrideCursor?.(disabled ? 'not-allowed' : 'pointer');

		if (buttonStyle.boxShadow && !disabled) {
			ctx.shadowColor = buttonStyle.boxShadow.color;
			ctx.shadowBlur = buttonStyle.boxShadow.blur * scale;
			ctx.shadowOffsetX = buttonStyle.boxShadow.offsetX * scale;
			ctx.shadowOffsetY = buttonStyle.boxShadow.offsetY * scale;
		}

		drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius);
		ctx.fillStyle = fillColor;
		if (disabled) {
			ctx.globalAlpha = 0.82;
		}
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		if (borderWidth > 0) {
			ctx.lineWidth = borderWidth;
			ctx.strokeStyle = borderColor;
			ctx.stroke();
		}

		const contentStartX = buttonX + (buttonWidth - contentWidth) / 2;
		const textX = contentStartX + (hasSpinner ? spinnerDiameter + spinnerGap : 0);
		const textY = buttonY + buttonHeight / 2;
		ctx.fillStyle = textColor;
		ctx.fillText(displayLabel, textX, textY);
		ctx.restore();

		if (hasSpinner) {
			args.requestAnimationFrame();
			const spinnerCenterX = contentStartX + spinnerDiameter / 2;
			const spinnerCenterY = buttonY + buttonHeight / 2;
			const spinnerThickness = Math.max(2, spinnerDiameter * 0.14);
			ctx.save();
			ctx.lineWidth = spinnerThickness;
			ctx.strokeStyle = textColor;
			ctx.lineCap = 'round';
			const progress = ((Date.now() % 1200) / 1200) * Math.PI * 2;
			ctx.beginPath();
			ctx.arc(spinnerCenterX, spinnerCenterY, spinnerDiameter / 2 - spinnerThickness / 2, progress, progress + Math.PI * 1.2);
			ctx.stroke();
			ctx.restore();
		}

		if (errored) {
			const dotRadius = Math.max(3, buttonHeight * 0.12);
			ctx.save();
			ctx.fillStyle = '#ef4444';
			ctx.beginPath();
			ctx.arc(buttonX + buttonWidth - dotRadius * 1.6, buttonY + dotRadius * 1.6, dotRadius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	},
	measure: () => {
		const base = BUTTON_STYLE_CACHE.get('outline') ?? FALLBACK_BUTTON_STYLE;
		return Math.ceil(base.width + base.paddingX * 2);
	},
};

export default DraftActionRenderer;
