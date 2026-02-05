export type UINodeType =
	| 'Form'
	| 'Grid'
	| 'GridColumn'
	| 'Section'
	| 'Input'
	| 'Textarea'
	| 'Select'
	| 'RadioGroup'
	| 'Checkbox'
	| 'Switch'
	| 'NumberInput'
	| 'DatePicker'
	| 'DateTimePicker'
	| 'TimePicker'
	| 'PhoneInput'
	| 'CodeEditor'
	| 'MarkdownEditor'
	| 'JsonEditor'
	| 'FileUpload'
	| 'Button';

export type InputType = 'text' | 'email' | 'url' | 'password' | 'tel' | 'search';

export interface UINodeConstraints {
	minLength?: number;
	maxLength?: number;
	minValue?: number;
	maxValue?: number;
	pattern?: string;
	precision?: number;
	scale?: number;
}

export interface UINodePropsBase {
	fieldId?: string;
	name?: string;
	label?: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	hidden?: boolean;
	disabled?: boolean;
	defaultValue?: string | number | boolean | null;
	constraints?: UINodeConstraints;
	className?: string;
}

export interface FormNodeProps extends UINodePropsBase {
	title?: string;
}

export interface GridNodeProps extends UINodePropsBase {
	columns: 2 | 3 | 4;
}

export interface GridColumnNodeProps extends UINodePropsBase {}

export interface SectionNodeProps extends UINodePropsBase {
	title?: string;
}

export interface InputNodeProps extends UINodePropsBase {
	inputType?: InputType;
}

export interface TextareaNodeProps extends UINodePropsBase {
	rows?: number;
}

export interface SelectNodeProps extends UINodePropsBase {
	options?: string[];
}

export interface RadioGroupNodeProps extends UINodePropsBase {
	options?: string[];
}

export interface CheckboxNodeProps extends UINodePropsBase {}

export interface SwitchNodeProps extends UINodePropsBase {}

export interface NumberInputNodeProps extends UINodePropsBase {
	step?: number;
}

export interface DatePickerNodeProps extends UINodePropsBase {}

export interface DateTimePickerNodeProps extends UINodePropsBase {}

export interface TimePickerNodeProps extends UINodePropsBase {}

export interface PhoneInputNodeProps extends UINodePropsBase {}

export interface CodeEditorNodeProps extends UINodePropsBase {
	language?: string;
	allowedLanguages?: string[];
	showLineNumbers?: boolean;
}

export interface MarkdownEditorNodeProps extends UINodePropsBase {
	minHeight?: number;
}

export interface JsonEditorNodeProps extends UINodePropsBase {}

export interface FileUploadNodeProps extends UINodePropsBase {
	accept?: string;
	multiple?: boolean;
}

export interface ButtonNodeProps extends UINodePropsBase {
	text?: string;
	buttonType?: 'submit' | 'button' | 'reset';
	variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export type UINodeProps =
	| FormNodeProps
	| GridNodeProps
	| GridColumnNodeProps
	| SectionNodeProps
	| InputNodeProps
	| TextareaNodeProps
	| SelectNodeProps
	| RadioGroupNodeProps
	| CheckboxNodeProps
	| SwitchNodeProps
	| NumberInputNodeProps
	| DatePickerNodeProps
	| DateTimePickerNodeProps
	| TimePickerNodeProps
	| PhoneInputNodeProps
	| CodeEditorNodeProps
	| MarkdownEditorNodeProps
	| JsonEditorNodeProps
	| FileUploadNodeProps
	| ButtonNodeProps;

export interface UIBinding {
	[propName: string]: string;
}

export interface UIAction {
	type: 'flow' | 'handler';
	flowId?: string;
	handler?: string;
	inputMapping?: Record<string, string>;
	params?: Record<string, unknown>;
}

export interface UIActions {
	[eventName: string]: UIAction;
}

export interface UINode {
	type: UINodeType;
	key: string;
	props: UINodePropsBase & Record<string, unknown>;
	children: UINode[];
	bindings?: UIBinding;
	actions?: UIActions;
}

export interface UISchemaMetadata {
	title?: string;
	description?: string;
}

export interface UISchema {
	formatVersion: '1.0';
	type: 'UISchema';
	id: string;
	meta?: UISchemaMetadata;
	page: UINode;
}

export function isUISchema(obj: unknown): obj is UISchema {
	if (!obj || typeof obj !== 'object') return false;
	const schema = obj as Record<string, unknown>;
	return schema.type === 'UISchema' && schema.formatVersion === '1.0' && !!schema.page;
}

export function isContainerNode(node: UINode): boolean {
	return ['Form', 'Grid', 'GridColumn', 'Section'].includes(node.type);
}

export function isInputNode(node: UINode): boolean {
	return [
		'Input',
		'Textarea',
		'Select',
		'RadioGroup',
		'Checkbox',
		'Switch',
		'NumberInput',
		'DatePicker',
		'DateTimePicker',
		'TimePicker',
		'PhoneInput',
		'CodeEditor',
		'MarkdownEditor',
		'JsonEditor',
		'FileUpload',
	].includes(node.type);
}

export function isGridNode(node: UINode): node is UINode & { props: GridNodeProps } {
	return node.type === 'Grid';
}

export function isGridColumnNode(node: UINode): node is UINode & { props: GridColumnNodeProps } {
	return node.type === 'GridColumn';
}
