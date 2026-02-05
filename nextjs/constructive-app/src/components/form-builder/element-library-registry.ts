import type { ComponentType } from 'react';
import {
	AlignLeft,
	Calendar,
	CheckSquare,
	ChevronsUpDown,
	Code,
	FileText,
	Hash,
	ListChecks,
	Mail,
	Phone,
	ToggleLeft,
	Type,
} from 'lucide-react';

import type { CellType } from '@/lib/types/cell-types';

import type { FieldConstraints, FieldDefinition, FieldTypeInfo } from '@/lib/schema';
import { getAllFieldTypes, getDefaultConstraintsForType, getFieldTypeInfo } from '@/lib/schema';

export type FormBuilderWidget = 'select' | 'radio';

export type FormBuilderCategory = 'basic' | 'advanced';

export interface FormBuilderTemplate {
	/** Stable identifier for the Form Builder template (UI layer) */
	id: string;
	/** The canonical schema CellType this template creates */
	cellType: CellType;
	/** Optional display overrides (otherwise derived from canonical FieldTypeInfo) */
	label?: string;
	description?: string;
	icon?: ComponentType<{ className?: string }>;
	category: FormBuilderCategory;
	/** Template-level constraints that override canonical defaults */
	constraintOverrides?: Partial<FieldConstraints>;
	/** Template-level smartTags (stored in FieldDefinition.metadata.smartTags) */
	smartTagDefaults?: Record<string, unknown>;
}

export interface FormElementCategory {
	name: FormBuilderCategory;
	label: string;
	templateIds: string[];
}

const DEFAULT_FORM_CONSTRAINTS: FieldConstraints = { nullable: true };

// Curated Form Builder templates.
// Every schema CellType will also receive a derived default template.
const EXPLICIT_TEMPLATES: FormBuilderTemplate[] = [
	{
		id: 'text.short',
		cellType: 'text',
		label: 'Short Text',
		description: 'Single line input',
		icon: Type,
		category: 'basic',
		constraintOverrides: { maxLength: 255 },
	},
	{
		id: 'text.long',
		cellType: 'text',
		label: 'Paragraph',
		description: 'Multi-line text area',
		icon: AlignLeft,
		category: 'basic',
		constraintOverrides: { maxLength: 2000 },
		smartTagDefaults: { ui: 'textarea' },
	},
	{
		id: 'choice.select',
		cellType: 'text',
		label: 'Dropdown',
		description: 'Select from a list',
		icon: ChevronsUpDown,
		category: 'basic',
		smartTagDefaults: { ui: 'select' as FormBuilderWidget, enum: [] as string[] },
	},
	{
		id: 'choice.radio',
		cellType: 'text',
		label: 'Radio',
		description: 'Choose one option',
		icon: ListChecks,
		category: 'basic',
		smartTagDefaults: { ui: 'radio' as FormBuilderWidget, enum: [] as string[] },
	},
	{
		id: 'input.toggle',
		cellType: 'boolean',
		label: 'Toggle',
		description: 'On or off switch',
		icon: ToggleLeft,
		category: 'basic',
		constraintOverrides: { defaultValue: false },
		smartTagDefaults: { ui: 'toggle' },
	},
	{
		id: 'input.checkbox',
		cellType: 'boolean',
		label: 'Checkbox',
		description: 'Yes or no confirmation',
		icon: CheckSquare,
		category: 'basic',
		constraintOverrides: { defaultValue: false },
		smartTagDefaults: { ui: 'checkbox' },
	},
	{
		id: 'input.date',
		cellType: 'date',
		label: 'Date',
		description: 'Pick a date',
		icon: Calendar,
		category: 'basic',
	},
	{
		id: 'input.email',
		cellType: 'email',
		label: 'Email',
		description: 'Email address input',
		icon: Mail,
		category: 'basic',
		constraintOverrides: { maxLength: 255 },
	},
	{
		id: 'input.phone',
		cellType: 'text',
		label: 'Phone',
		description: 'Phone number input',
		icon: Phone,
		category: 'basic',
		constraintOverrides: { maxLength: 20 },
		smartTagDefaults: { ui: 'phone', pattern: '^[+]?[0-9\\s\\-().]+$' },
	},
	{
		id: 'input.number',
		cellType: 'number',
		label: 'Number',
		description: 'Numeric value',
		icon: Hash,
		category: 'basic',
	},
	{
		id: 'text.markdown',
		cellType: 'text',
		label: 'Markdown',
		description: 'Rich text with GitHub-style formatting',
		icon: FileText,
		category: 'advanced',
		constraintOverrides: { maxLength: 50000 },
		smartTagDefaults: { ui: 'markdown' },
	},
	{
		id: 'input.code',
		cellType: 'text',
		label: 'Code',
		description: 'Code editor with syntax highlighting',
		icon: Code,
		category: 'advanced',
		constraintOverrides: { maxLength: 65535 },
		smartTagDefaults: { ui: 'code', language: 'plain_text', allowedLanguages: [], showLineNumbers: true },
	},
	{
		id: 'type.uuid',
		cellType: 'uuid',
		category: 'advanced',
	},
	{
		id: 'type.jsonb',
		cellType: 'jsonb',
		category: 'advanced',
	},
	{
		id: 'type.timestamptz',
		cellType: 'timestamptz',
		category: 'advanced',
	},
];

function buildDefaultTemplateId(type: CellType): string {
	return `type.${type}`;
}

function getExplicitTemplateIds(): Set<string> {
	return new Set(EXPLICIT_TEMPLATES.map((t) => t.id));
}

function getCellTypesWithExplicitTemplates(): Set<CellType> {
	return new Set(EXPLICIT_TEMPLATES.map((t) => t.cellType));
}

function buildDerivedTemplates(): FormBuilderTemplate[] {
	const explicitIds = getExplicitTemplateIds();
	const explicitCellTypes = getCellTypesWithExplicitTemplates();
	const allTypes = getAllFieldTypes().map((t) => t.type);

	// All derived templates go to advanced - basic elements are explicitly curated
	const derived = allTypes
		.map((cellType): FormBuilderTemplate => {
			const overrides = DERIVED_TEMPLATE_OVERRIDES[cellType];
			return {
				id: buildDefaultTemplateId(cellType),
				cellType,
				label: overrides?.label,
				description: overrides?.description,
				category: 'advanced',
			};
		})
		.filter((t) => !explicitIds.has(t.id))
		.filter((t) => !explicitCellTypes.has(t.cellType));

	return [...EXPLICIT_TEMPLATES, ...derived];
}

// Label and description overrides for derived templates (advanced types)
const DERIVED_TEMPLATE_OVERRIDES: Partial<Record<CellType, { label: string; description?: string }>> = {
	// Numeric types
	integer: { label: 'Integer', description: 'Whole number (32-bit)' },
	smallint: { label: 'Small Integer', description: 'Whole number (16-bit)' },
	decimal: { label: 'Decimal', description: 'Fixed precision number' },
	// Date/Time types
	timestamptz: { label: 'Date & Time', description: 'Date with timezone' },
	time: { label: 'Time', description: 'Time of day' },
	interval: { label: 'Interval', description: 'Time duration' },
	// Text types
	url: { label: 'URL', description: 'Web address' },
	citext: { label: 'Case-Insensitive Text', description: 'Text ignoring case' },
	bpchar: { label: 'Fixed Char', description: 'Fixed-length text' },
	// Special types
	uuid: { label: 'UUID', description: 'Unique identifier' },
	json: { label: 'JSON', description: 'JSON text data' },
	jsonb: { label: 'JSONB', description: 'Binary JSON data' },
	inet: { label: 'IP Address', description: 'IPv4 or IPv6 address' },
	bit: { label: 'Bit String', description: 'Binary bit sequence' },
	tsvector: { label: 'Text Search', description: 'Full-text search vector' },
	// Geometry types
	geometry: { label: 'Geometry', description: 'Geometric shape' },
	'geometry-point': { label: 'Point', description: 'Geographic coordinates' },
	'geometry-collection': { label: 'Geometry Collection', description: 'Multiple shapes' },
	// Array types
	'text-array': { label: 'Text Array', description: 'List of text values' },
	'integer-array': { label: 'Integer Array', description: 'List of integers' },
	'number-array': { label: 'Number Array', description: 'List of numbers' },
	'uuid-array': { label: 'UUID Array', description: 'List of UUIDs' },
	'date-array': { label: 'Date Array', description: 'List of dates' },
	array: { label: 'Array', description: 'Generic list' },
	// Media types
	image: { label: 'Image', description: 'Image file upload' },
	upload: { label: 'File Upload', description: 'Generic file upload' },
};

const ALL_TEMPLATES: FormBuilderTemplate[] = buildDerivedTemplates();

export const FORM_ELEMENT_LIBRARY: FormElementCategory[] = [
	{
		name: 'basic',
		label: 'BASIC',
		templateIds: ALL_TEMPLATES.filter((t) => t.category === 'basic').map((t) => t.id),
	},
	{
		name: 'advanced',
		label: 'ADVANCED',
		templateIds: ALL_TEMPLATES.filter((t) => t.category === 'advanced').map((t) => t.id),
	},
];

export function getAllFormBuilderTemplates(): FormBuilderTemplate[] {
	return ALL_TEMPLATES;
}

export function getFormBuilderTemplateById(templateId: string): FormBuilderTemplate | undefined {
	return ALL_TEMPLATES.find((t) => t.id === templateId);
}

export function getBasicFormBuilderTemplates(): FormBuilderTemplate[] {
	return ALL_TEMPLATES.filter((t) => t.category === 'basic');
}

export function getAdvancedFormBuilderTemplates(): FormBuilderTemplate[] {
	return ALL_TEMPLATES.filter((t) => t.category === 'advanced');
}

export function searchFormBuilderTemplates(query: string): FormBuilderTemplate[] {
	const lowercaseQuery = query.toLowerCase();

	return ALL_TEMPLATES.filter((template) => {
		const info = getFormBuilderFieldTypeInfo(template.id);
		return (
			(info?.label ?? '').toLowerCase().includes(lowercaseQuery) ||
			(info?.description ?? '').toLowerCase().includes(lowercaseQuery) ||
			template.id.toLowerCase().includes(lowercaseQuery)
		);
	});
}

export function getFormBuilderFieldTypeInfo(templateId: string): FieldTypeInfo | undefined {
	const template = getFormBuilderTemplateById(templateId);
	if (!template) return undefined;
	const base = getFieldTypeInfo(template.cellType);
	if (!base) return undefined;

	return {
		...base,
		label: template.label ?? base.label,
		description: template.description ?? base.description,
		icon: template.icon ?? base.icon,
		isBasic: template.category === 'basic',
	};
}

export function applyFormBuilderTemplateToField(
	templateId: string,
	field: Omit<FieldDefinition, 'id'> | FieldDefinition,
): Omit<FieldDefinition, 'id'> | FieldDefinition {
	const template = getFormBuilderTemplateById(templateId);
	if (!template) return field;

	const baseConstraints = getDefaultConstraintsForType(template.cellType);
	const mergedConstraints: FieldConstraints = {
		...baseConstraints,
		...DEFAULT_FORM_CONSTRAINTS,
		...(template.constraintOverrides ?? {}),
	};

	// When switching templates, replace smartTags entirely with template defaults
	// This prevents stale tags (like 'enum' from choice types) from persisting
	const smartTags = template.smartTagDefaults ?? {};

	return {
		...field,
		type: template.cellType,
		label: field.label || template.label,
		constraints: mergedConstraints,
		metadata: {
			...(field.metadata ?? {}),
			smartTags,
		},
	};
}

export function getAllMappedSchemaTypes(): CellType[] {
	return getAllFieldTypes().map((t) => t.type);
}
