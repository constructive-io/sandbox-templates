import type { FieldDefinition } from '@/lib/schema';

import type { UINode, UINodeType, UISchema } from './types';

let nodeIdCounter = 0;

function generateKey(prefix: string): string {
	return `${prefix}-${Date.now()}-${(++nodeIdCounter).toString(36)}`;
}

export function createEmptySchema(id?: string): UISchema {
	return {
		formatVersion: '1.0',
		type: 'UISchema',
		id: id ?? generateKey('form'),
		page: {
			type: 'Form',
			key: 'root',
			props: {},
			children: [],
		},
	};
}

export function createGridNode(columns: 2 | 3 | 4): UINode {
	const gridKey = generateKey('grid');
	return {
		type: 'Grid',
		key: gridKey,
		props: { columns },
		children: Array.from({ length: columns }, (_, i) => ({
			type: 'GridColumn' as UINodeType,
			key: `${gridKey}-col-${i}`,
			props: {},
			children: [],
		})),
	};
}

export function createGridColumnNode(gridKey: string, index: number): UINode {
	return {
		type: 'GridColumn',
		key: `${gridKey}-col-${index}`,
		props: {},
		children: [],
	};
}

export function getNodeTypeFromField(field: FieldDefinition): UINodeType {
	const smartTags = (field.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const ui = typeof smartTags.ui === 'string' ? smartTags.ui : undefined;
	const hasEnum = Array.isArray(smartTags.enum) && smartTags.enum.length > 0;

	if (field.type === 'text') {
		if (ui === 'textarea') return 'Textarea';
		if (ui === 'markdown') return 'MarkdownEditor';
		if (ui === 'code') return 'CodeEditor';
		if (ui === 'phone') return 'PhoneInput';
		if (ui === 'select' || hasEnum) return 'Select';
		if (ui === 'radio') return 'RadioGroup';
		return 'Input';
	}

	if (field.type === 'boolean') {
		if (ui === 'checkbox') return 'Checkbox';
		return 'Switch';
	}

	if (field.type === 'email') return 'Input';
	if (field.type === 'url') return 'Input';
	if (field.type === 'date') return 'DatePicker';
	if (field.type === 'timestamptz') return 'DateTimePicker';
	if (field.type === 'time') return 'TimePicker';
	if (field.type === 'number' || field.type === 'integer' || field.type === 'decimal' || field.type === 'smallint') {
		return 'NumberInput';
	}
	if (field.type === 'json' || field.type === 'jsonb') return 'JsonEditor';
	if (field.type === 'image' || field.type === 'upload') return 'FileUpload';

	return 'Input';
}

function getInputTypeFromField(field: FieldDefinition): string | undefined {
	if (field.type === 'email') return 'email';
	if (field.type === 'url') return 'url';
	return undefined;
}

export function createNodeFromField(field: FieldDefinition): UINode {
	const nodeType = getNodeTypeFromField(field);
	const smartTags = (field.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const enumValues = Array.isArray(smartTags.enum) ? smartTags.enum.map(String) : undefined;
	const placeholder = typeof smartTags.placeholder === 'string' ? smartTags.placeholder : undefined;

	const props: Record<string, unknown> = {
		fieldId: field.id,
		name: field.name,
		label: field.label || field.name,
		description: field.description,
		placeholder,
		required: field.isRequired ?? field.constraints.nullable === false,
		hidden: field.isHidden,
		defaultValue: field.constraints.defaultValue,
	};

	if (field.constraints.minLength || field.constraints.maxLength || field.constraints.minValue || field.constraints.maxValue || field.constraints.precision || field.constraints.scale) {
		props.constraints = {
			minLength: field.constraints.minLength,
			maxLength: field.constraints.maxLength,
			minValue: field.constraints.minValue,
			maxValue: field.constraints.maxValue,
			precision: field.constraints.precision,
			scale: field.constraints.scale,
		};
	}

	if (nodeType === 'Input') {
		const inputType = getInputTypeFromField(field);
		if (inputType) props.inputType = inputType;
	}

	if (nodeType === 'Select' || nodeType === 'RadioGroup') {
		props.options = enumValues ?? [];
	}

	if (nodeType === 'CodeEditor') {
		props.language = typeof smartTags.language === 'string' ? smartTags.language : 'plain_text';
		props.allowedLanguages = Array.isArray(smartTags.allowedLanguages) ? smartTags.allowedLanguages : [];
		props.showLineNumbers = smartTags.showLineNumbers !== false;
	}

	if (nodeType === 'MarkdownEditor') {
		props.minHeight = 150;
	}

	if (nodeType === 'Textarea') {
		props.rows = 3;
	}

	return {
		type: nodeType,
		key: field.id,
		props,
		children: [],
	};
}

export function nodeToFieldDefinition(node: UINode): FieldDefinition {
	const props = node.props;
	const smartTags: Record<string, unknown> = {};

	if (props.placeholder) smartTags.placeholder = props.placeholder;

	if (node.type === 'Textarea') smartTags.ui = 'textarea';
	if (node.type === 'MarkdownEditor') smartTags.ui = 'markdown';
	if (node.type === 'CodeEditor') {
		smartTags.ui = 'code';
		if (props.language) smartTags.language = props.language;
		if (props.allowedLanguages) smartTags.allowedLanguages = props.allowedLanguages;
		if (props.showLineNumbers !== undefined) smartTags.showLineNumbers = props.showLineNumbers;
	}
	if (node.type === 'PhoneInput') smartTags.ui = 'phone';
	if (node.type === 'Select') {
		smartTags.ui = 'select';
		if (props.options) smartTags.enum = props.options;
	}
	if (node.type === 'RadioGroup') {
		smartTags.ui = 'radio';
		if (props.options) smartTags.enum = props.options;
	}
	if (node.type === 'Checkbox') smartTags.ui = 'checkbox';
	if (node.type === 'Switch') smartTags.ui = 'toggle';

	const constraints = props.constraints as Record<string, unknown> | undefined;

	let fieldType: FieldDefinition['type'] = 'text';
	if (node.type === 'NumberInput') fieldType = 'number';
	if (node.type === 'DatePicker') fieldType = 'date';
	if (node.type === 'DateTimePicker') fieldType = 'timestamptz';
	if (node.type === 'TimePicker') fieldType = 'time';
	if (node.type === 'Checkbox' || node.type === 'Switch') fieldType = 'boolean';
	if (node.type === 'JsonEditor') fieldType = 'jsonb';
	if (node.type === 'FileUpload') fieldType = 'upload';
	if (node.type === 'Input' && props.inputType === 'email') fieldType = 'email';
	if (node.type === 'Input' && props.inputType === 'url') fieldType = 'url';

	return {
		id: (props.fieldId as string) || node.key,
		name: (props.name as string) || '',
		type: fieldType,
		label: props.label as string | undefined,
		description: props.description as string | undefined,
		isRequired: props.required as boolean | undefined,
		isHidden: props.hidden as boolean | undefined,
		constraints: {
			nullable: !(props.required as boolean),
			defaultValue: props.defaultValue as string | number | boolean | null | undefined,
			minLength: constraints?.minLength as number | undefined,
			maxLength: constraints?.maxLength as number | undefined,
			minValue: constraints?.minValue as number | undefined,
			maxValue: constraints?.maxValue as number | undefined,
			precision: constraints?.precision as number | undefined,
			scale: constraints?.scale as number | undefined,
		},
		metadata: Object.keys(smartTags).length > 0 ? { smartTags } : undefined,
	};
}

export function updateNodeFromFieldDefinition(node: UINode, field: FieldDefinition): UINode {
	const smartTags = (field.metadata?.smartTags ?? {}) as Record<string, unknown>;
	const enumValues = Array.isArray(smartTags.enum) ? smartTags.enum.map(String) : undefined;
	const placeholder = typeof smartTags.placeholder === 'string' ? smartTags.placeholder : undefined;

	const newType = getNodeTypeFromField(field);

	const props: Record<string, unknown> = {
		...node.props,
		fieldId: field.id,
		name: field.name,
		label: field.label,
		description: field.description,
		placeholder,
		required: field.isRequired ?? field.constraints.nullable === false,
		hidden: field.isHidden,
		defaultValue: field.constraints.defaultValue,
	};

	if (field.constraints.minLength || field.constraints.maxLength || field.constraints.minValue || field.constraints.maxValue || field.constraints.precision || field.constraints.scale) {
		props.constraints = {
			minLength: field.constraints.minLength,
			maxLength: field.constraints.maxLength,
			minValue: field.constraints.minValue,
			maxValue: field.constraints.maxValue,
			precision: field.constraints.precision,
			scale: field.constraints.scale,
		};
	}

	if (newType === 'Input') {
		props.inputType = getInputTypeFromField(field);
	}

	if (newType === 'Select' || newType === 'RadioGroup') {
		props.options = enumValues ?? [];
	}

	if (newType === 'CodeEditor') {
		props.language = typeof smartTags.language === 'string' ? smartTags.language : 'plain_text';
		props.allowedLanguages = Array.isArray(smartTags.allowedLanguages) ? smartTags.allowedLanguages : [];
		props.showLineNumbers = smartTags.showLineNumbers !== false;
	}

	return {
		...node,
		type: newType,
		props,
	};
}
