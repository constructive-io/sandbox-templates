import type { ComponentType } from 'react';
import { Columns2, Columns3, Columns4 } from 'lucide-react';

import type { FormLayoutColumns } from '@/lib/schema';

export interface LayoutTemplate {
	id: string;
	columns: FormLayoutColumns;
	label: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
	{
		id: 'layout.2col',
		columns: 2,
		label: '2 Columns',
		description: 'Two equal columns',
		icon: Columns2,
	},
	{
		id: 'layout.3col',
		columns: 3,
		label: '3 Columns',
		description: 'Three equal columns',
		icon: Columns3,
	},
	{
		id: 'layout.4col',
		columns: 4,
		label: '4 Columns',
		description: 'Four equal columns',
		icon: Columns4,
	},
];

export function getLayoutTemplateById(templateId: string): LayoutTemplate | undefined {
	return LAYOUT_TEMPLATES.find((t) => t.id === templateId);
}

export function isLayoutTemplateId(templateId: string): boolean {
	return templateId.startsWith('layout.');
}

export function getLayoutTemplates(): LayoutTemplate[] {
	return LAYOUT_TEMPLATES;
}
