'use client';

import { lazy, memo, Suspense, type ComponentType } from 'react';
import { Checkbox } from '@constructive-io/ui/checkbox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { RadioGroup, RadioGroupItem } from '@constructive-io/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Skeleton } from '@constructive-io/ui/skeleton';
import { Switch } from '@constructive-io/ui/switch';
import { Textarea } from '@constructive-io/ui/textarea';
import { Button } from '@constructive-io/ui/button';
import { EyeOff, Mail, Link, Phone } from 'lucide-react';

import type { UINode, UINodeType } from '@/lib/form-builder';
import { cn } from '@/lib/utils';

import { useFormRenderer } from './context';
import type { NodeProps, NodeWithChildrenProps } from './types';

const CodeEditor = lazy(() => import('@/components/ui/code-editor').then((m) => ({ default: m.CodeEditor })));
const MarkdownEditor = lazy(() => import('@/components/ui/markdown-editor').then((m) => ({ default: m.MarkdownEditor })));

function EditorSkeleton({ height = 150 }: { height?: number }) {
	return <Skeleton className='w-full rounded-md' style={{ height }} />;
}

/** Convert value to boolean (handles string "true"/"false" from database) */
function toBool(value: unknown): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value === 'true';
	return false;
}

function HiddenBadge() {
	return (
		<span className='bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium'>
			<EyeOff className='h-3 w-3' />
			Hidden
		</span>
	);
}

function FieldWrapper({
	node,
	children,
	hideLabel,
}: {
	node: UINode;
	children: React.ReactNode;
	hideLabel?: boolean;
}) {
	const { mode } = useFormRenderer();
	const props = node.props ?? {};
	const isHidden = props.hidden;
	const isRequired = props.required;
	const label = (props.label as string) || (props.name as string) || '';
	const description = props.description as string | undefined;

	if (isHidden && mode === 'preview') return null;

	return (
		<div className={cn('space-y-1.5', isHidden && 'opacity-50')}>
			{!hideLabel && label && (
				<div className='flex items-center gap-1.5'>
					<Label className='text-sm font-medium'>
						{label}
						{isRequired && <span className='text-destructive ml-1'>*</span>}
					</Label>
					{isHidden && mode === 'edit' && <HiddenBadge />}
				</div>
			)}
			{children}
			{description && <p className='text-muted-foreground text-xs'>{description}</p>}
		</div>
	);
}

function BooleanFieldWrapper({
	node,
	children,
	onToggle,
}: {
	node: UINode;
	children: React.ReactNode;
	onToggle?: () => void;
}) {
	const { mode } = useFormRenderer();
	const props = node.props ?? {};
	const isHidden = props.hidden;
	const isRequired = props.required;
	const label = (props.label as string) || (props.name as string) || '';
	const description = props.description as string | undefined;

	if (isHidden && mode === 'preview') return null;

	return (
		<div className={cn('flex items-start justify-between gap-4', isHidden && 'opacity-50')}>
			<button type='button' onClick={onToggle} className='flex-1 space-y-0.5 text-left'>
				<div className='flex items-center gap-1.5'>
					<Label className='text-sm font-medium'>
						{label}
						{isRequired && <span className='text-destructive ml-1'>*</span>}
					</Label>
					{isHidden && mode === 'edit' && <HiddenBadge />}
				</div>
				{description && <p className='text-muted-foreground text-xs'>{description}</p>}
			</button>
			{children}
		</div>
	);
}

export const FormNode = memo(function FormNode({ node, children }: NodeWithChildrenProps) {
	const { schema, onAction } = useFormRenderer();
	const props = node.props ?? {};

	const title = (props.title as string) ?? schema.meta?.title;
	const description = (props.description as string) ?? schema.meta?.description;
	const formId = (props.id as string) ?? schema.id ?? 'form-renderer';

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (node.actions?.submit) {
			onAction?.(node.actions.submit, 'submit');
		}
	};

	return (
		<form id={formId} onSubmit={handleSubmit} className={cn('space-y-6', props.className as string)}>
			{(title || description) && (
				<div className='mb-8'>
					{title && <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>}
					{description && <p className='text-muted-foreground mt-2'>{description}</p>}
				</div>
			)}
			{children}
		</form>
	);
});

export const GridNode = memo(function GridNode({ node, children }: NodeWithChildrenProps) {
	const props = node.props ?? {};
	const columns = (props.columns as number) || 2;
	const gridColsClass = {
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
	}[columns] || 'grid-cols-2';

	return <div className={cn('mt-6 grid gap-4', gridColsClass, props.className as string)}>{children}</div>;
});

export const GridColumnNode = memo(function GridColumnNode({ node, children }: NodeWithChildrenProps) {
	const props = node.props ?? {};
	return <div className={cn('space-y-4', props.className as string)}>{children}</div>;
});

export const SectionNode = memo(function SectionNode({ node, children }: NodeWithChildrenProps) {
	const props = node.props ?? {};
	const title = props.title as string | undefined;

	return (
		<section className={cn('space-y-4', props.className as string)}>
			{title && <h2 className='text-lg font-semibold'>{title}</h2>}
			{children}
		</section>
	);
});

export const InputNode = memo(function InputNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const inputType = (props.inputType as string) || 'text';
	const placeholder = props.placeholder as string | undefined;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	const isEmail = inputType === 'email';
	const isUrl = inputType === 'url';
	const Icon = isEmail ? Mail : isUrl ? Link : null;

	const input = (
		<Input
			type={inputType}
			value={value}
			onChange={(e) => setValue(name, e.target.value)}
			placeholder={placeholder}
			disabled={props.disabled as boolean}
			className={cn(Icon && 'pl-10', error && 'border-destructive')}
		/>
	);

	return (
		<FieldWrapper node={node}>
			{Icon ? (
				<div className='relative'>
					<Icon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
					{input}
				</div>
			) : (
				input
			)}
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const TextareaNode = memo(function TextareaNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const placeholder = props.placeholder as string | undefined;
	const rows = (props.rows as number) || 3;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Textarea
				value={value}
				onChange={(e) => setValue(name, e.target.value)}
				placeholder={placeholder}
				rows={rows}
				disabled={props.disabled as boolean}
				className={cn('resize-none', error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const NumberInputNode = memo(function NumberInputNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const placeholder = props.placeholder as string | undefined;
	const constraints = props.constraints as { minValue?: number; maxValue?: number; step?: number } | undefined;
	const value = (values[name] as number) ?? (props.defaultValue as number) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Input
				type='number'
				value={value}
				onChange={(e) => setValue(name, e.target.value ? Number(e.target.value) : '')}
				placeholder={placeholder}
				disabled={props.disabled as boolean}
				min={constraints?.minValue}
				max={constraints?.maxValue}
				step={constraints?.step ?? (props.step as number)}
				className={cn(error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const SelectNode = memo(function SelectNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const options = (props.options as string[]) || [];
	const placeholder = (props.placeholder as string) || 'Select an option';
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Select value={value} onValueChange={(v) => setValue(name, v)} disabled={props.disabled as boolean}>
				<SelectTrigger className={cn(error && 'border-destructive')}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.length > 0 ? (
						options.map((opt, idx) => (
							<SelectItem key={idx} value={opt || `__empty_${idx}__`}>
								{opt || <span className='text-muted-foreground italic'>Empty option</span>}
							</SelectItem>
						))
					) : (
						<SelectItem value='__empty__' disabled>
							No options defined
						</SelectItem>
					)}
				</SelectContent>
			</Select>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const RadioGroupNode = memo(function RadioGroupNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const options = (props.options as string[]) || [];
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<RadioGroup
				value={value}
				onValueChange={(v) => setValue(name, v)}
				disabled={props.disabled as boolean}
				className='gap-2'
			>
				{options.length > 0 ? (
					options.map((opt, idx) => (
						<div key={idx} className='flex items-center gap-2'>
							<RadioGroupItem value={opt} id={`${name}-${idx}`} />
							<Label htmlFor={`${name}-${idx}`} className='text-sm font-normal'>
								{opt || <span className='text-muted-foreground italic'>Empty option</span>}
							</Label>
						</div>
					))
				) : (
					<div className='text-muted-foreground text-sm italic'>No options defined</div>
				)}
			</RadioGroup>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const CheckboxNode = memo(function CheckboxNode({ node }: NodeProps) {
	const { values, setValue, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const isHidden = props.hidden;
	const isRequired = props.required;
	const label = (props.label as string) || (props.name as string) || '';
	const description = props.description as string | undefined;
	const checked = toBool(values[name] ?? props.defaultValue);

	if (isHidden && mode === 'preview') return null;

	return (
		<div className={cn('flex items-start gap-3', isHidden && 'opacity-50')}>
			<Checkbox
				id={`checkbox-${name}`}
				checked={checked}
				onCheckedChange={(c) => setValue(name, c === true)}
				disabled={props.disabled as boolean}
				className='mt-0.5'
			/>
			<button type='button' onClick={() => setValue(name, !checked)} className='flex-1 space-y-0.5 text-left'>
				<div className='flex items-center gap-1.5'>
					<Label className='cursor-pointer text-sm font-medium'>
						{label}
						{isRequired && <span className='text-destructive ml-1'>*</span>}
					</Label>
					{isHidden && mode === 'edit' && <HiddenBadge />}
				</div>
				{description && <p className='text-muted-foreground text-xs'>{description}</p>}
			</button>
		</div>
	);
});

export const SwitchNode = memo(function SwitchNode({ node }: NodeProps) {
	const { values, setValue, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const checked = toBool(values[name] ?? props.defaultValue);

	return (
		<BooleanFieldWrapper node={node} onToggle={() => setValue(name, !checked)}>
			<Switch
				id={`switch-${name}`}
				checked={checked}
				onCheckedChange={(c) => setValue(name, c)}
				disabled={props.disabled as boolean}
			/>
		</BooleanFieldWrapper>
	);
});

export const DatePickerNode = memo(function DatePickerNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Input
				type='date'
				value={value}
				onChange={(e) => setValue(name, e.target.value)}
				disabled={props.disabled as boolean}
				className={cn(error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const DateTimePickerNode = memo(function DateTimePickerNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Input
				type='datetime-local'
				value={value}
				onChange={(e) => setValue(name, e.target.value)}
				disabled={props.disabled as boolean}
				className={cn(error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const TimePickerNode = memo(function TimePickerNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Input
				type='time'
				value={value}
				onChange={(e) => setValue(name, e.target.value)}
				disabled={props.disabled as boolean}
				className={cn(error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const PhoneInputNode = memo(function PhoneInputNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const placeholder = (props.placeholder as string) || '+1 (555) 123-4567';
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<div className='relative'>
				<Phone className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
				<Input
					type='tel'
					value={value}
					onChange={(e) => setValue(name, e.target.value)}
					placeholder={placeholder}
					disabled={props.disabled as boolean}
					className={cn('pl-10', error && 'border-destructive')}
				/>
			</div>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const CodeEditorNode = memo(function CodeEditorNode({ node }: NodeProps) {
	const { values, setValue, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const language = (props.language as string) || 'plain_text';
	const allowedLanguages = (props.allowedLanguages as string[]) || [];
	const showLineNumbers = props.showLineNumbers !== false;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Suspense fallback={<EditorSkeleton height={200} />}>
				<CodeEditor
					value={value}
					onChange={(v) => setValue(name, v)}
					defaultLanguage={language}
					allowedLanguages={allowedLanguages}
					showLineNumbers={showLineNumbers}
				/>
			</Suspense>
		</FieldWrapper>
	);
});

export const MarkdownEditorNode = memo(function MarkdownEditorNode({ node }: NodeProps) {
	const { values, setValue, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const placeholder = (props.placeholder as string) || 'Write markdown here...';
	const minHeight = (props.minHeight as number) || 150;
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Suspense fallback={<EditorSkeleton height={minHeight} />}>
				<MarkdownEditor
					value={value}
					onChange={(v) => setValue(name, v)}
					placeholder={placeholder}
					minHeight={minHeight}
				/>
			</Suspense>
		</FieldWrapper>
	);
});

export const JsonEditorNode = memo(function JsonEditorNode({ node }: NodeProps) {
	const { values, setValue, errors, mode } = useFormRenderer();
	const props = node.props ?? {};
	const name = props.name as string;
	const placeholder = (props.placeholder as string) || '{}';
	const value = (values[name] as string) ?? (props.defaultValue as string) ?? '';
	const error = errors[name];
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<Textarea
				value={value}
				onChange={(e) => setValue(name, e.target.value)}
				placeholder={placeholder}
				rows={5}
				disabled={props.disabled as boolean}
				className={cn('resize-none font-mono text-sm', error && 'border-destructive')}
			/>
			{error && <p className='text-destructive text-xs'>{error}</p>}
		</FieldWrapper>
	);
});

export const FileUploadNode = memo(function FileUploadNode({ node }: NodeProps) {
	const { mode } = useFormRenderer();
	const props = node.props ?? {};
	const isHidden = props.hidden;

	if (isHidden && mode === 'preview') return null;

	return (
		<FieldWrapper node={node}>
			<div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
				Click to upload or drag and drop
			</div>
		</FieldWrapper>
	);
});

export const ButtonNode = memo(function ButtonNode({ node }: NodeProps) {
	const { onAction } = useFormRenderer();
	const props = node.props ?? {};
	const text = (props.text as string) || 'Submit';
	const buttonType = (props.buttonType as 'submit' | 'button' | 'reset') || 'submit';
	const variant = (props.variant as 'default' | 'outline' | 'ghost' | 'destructive') || 'default';

	const handleClick = () => {
		if (node.actions?.click) {
			onAction?.(node.actions.click, 'click');
		}
	};

	return (
		<Button
			type={buttonType}
			variant={variant}
			disabled={props.disabled as boolean}
			onClick={buttonType !== 'submit' ? handleClick : undefined}
			className={props.className as string}
		>
			{text}
		</Button>
	);
});

function UnknownNode({ type }: { type: string }) {
	return (
		<div className='border-destructive/50 bg-destructive/5 rounded-md border p-3 text-sm'>
			Unknown component: <code className='font-mono'>{type}</code>
		</div>
	);
}

export const nodeRegistry: Record<UINodeType, ComponentType<NodeProps | NodeWithChildrenProps>> = {
	Form: FormNode,
	Grid: GridNode,
	GridColumn: GridColumnNode,
	Section: SectionNode,
	Input: InputNode,
	Textarea: TextareaNode,
	Select: SelectNode,
	RadioGroup: RadioGroupNode,
	Checkbox: CheckboxNode,
	Switch: SwitchNode,
	NumberInput: NumberInputNode,
	DatePicker: DatePickerNode,
	DateTimePicker: DateTimePickerNode,
	TimePicker: TimePickerNode,
	PhoneInput: PhoneInputNode,
	CodeEditor: CodeEditorNode,
	MarkdownEditor: MarkdownEditorNode,
	JsonEditor: JsonEditorNode,
	FileUpload: FileUploadNode,
	Button: ButtonNode,
};

export { UnknownNode };
