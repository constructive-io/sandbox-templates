'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';
import { Textarea } from '@constructive-io/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import DOMPurify from 'dompurify';
import {
	Bold,
	Code,
	FileCode,
	Heading1,
	Heading2,
	Heading3,
	Image,
	Italic,
	Link,
	List,
	ListOrdered,
	ListTodo,
	Minus,
	Quote,
	Strikethrough,
	Table,
} from 'lucide-react';
import { marked } from 'marked';

import { cn } from '@/lib/utils';

// Configure marked for GFM
marked.setOptions({
	gfm: true,
	breaks: true,
});

export interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	disabled?: boolean;
	minHeight?: number;
	className?: string;
	'aria-describedby'?: string;
	'aria-invalid'?: boolean;
}

interface ToolbarAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	shortcut?: string;
	action: (textarea: HTMLTextAreaElement, value: string, onChange: (v: string) => void) => void;
}

// Helper to wrap selected text with markers
function wrapSelection(
	textarea: HTMLTextAreaElement,
	value: string,
	onChange: (v: string) => void,
	before: string,
	after: string,
) {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selectedText = value.substring(start, end);
	const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
	onChange(newText);

	// Restore cursor position after React re-render
	requestAnimationFrame(() => {
		textarea.focus();
		if (selectedText) {
			textarea.setSelectionRange(start + before.length, end + before.length);
		} else {
			textarea.setSelectionRange(start + before.length, start + before.length);
		}
	});
}

// Helper to insert text at cursor and handle line prefixes
function insertAtLineStart(
	textarea: HTMLTextAreaElement,
	value: string,
	onChange: (v: string) => void,
	prefix: string,
) {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;

	// Find line start
	let lineStart = start;
	while (lineStart > 0 && value[lineStart - 1] !== '\n') {
		lineStart--;
	}

	const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart);
	onChange(newText);

	requestAnimationFrame(() => {
		textarea.focus();
		textarea.setSelectionRange(start + prefix.length, end + prefix.length);
	});
}

// Helper to insert block template
function insertBlock(
	textarea: HTMLTextAreaElement,
	value: string,
	onChange: (v: string) => void,
	template: string,
	cursorOffset: number = 0,
) {
	const start = textarea.selectionStart;
	const needsNewlineBefore = start > 0 && value[start - 1] !== '\n';
	const prefix = needsNewlineBefore ? '\n' : '';
	const newText = value.substring(0, start) + prefix + template + value.substring(start);
	onChange(newText);

	requestAnimationFrame(() => {
		textarea.focus();
		const newPos = start + prefix.length + cursorOffset;
		textarea.setSelectionRange(newPos, newPos);
	});
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
	{
		icon: Bold,
		label: 'Bold',
		shortcut: 'Ctrl+B',
		action: (t, v, o) => wrapSelection(t, v, o, '**', '**'),
	},
	{
		icon: Italic,
		label: 'Italic',
		shortcut: 'Ctrl+I',
		action: (t, v, o) => wrapSelection(t, v, o, '*', '*'),
	},
	{
		icon: Strikethrough,
		label: 'Strikethrough',
		action: (t, v, o) => wrapSelection(t, v, o, '~~', '~~'),
	},
	{
		icon: Heading1,
		label: 'Heading 1',
		action: (t, v, o) => insertAtLineStart(t, v, o, '# '),
	},
	{
		icon: Heading2,
		label: 'Heading 2',
		action: (t, v, o) => insertAtLineStart(t, v, o, '## '),
	},
	{
		icon: Heading3,
		label: 'Heading 3',
		action: (t, v, o) => insertAtLineStart(t, v, o, '### '),
	},
	{
		icon: Link,
		label: 'Link',
		shortcut: 'Ctrl+K',
		action: (t, v, o) => {
			const start = t.selectionStart;
			const end = t.selectionEnd;
			const selectedText = v.substring(start, end);
			if (selectedText) {
				wrapSelection(t, v, o, '[', '](url)');
			} else {
				const newText = v.substring(0, start) + '[link text](url)' + v.substring(end);
				o(newText);
				requestAnimationFrame(() => {
					t.focus();
					t.setSelectionRange(start + 1, start + 10);
				});
			}
		},
	},
	{
		icon: Image,
		label: 'Image',
		action: (t, v, o) => {
			const start = t.selectionStart;
			const selectedText = v.substring(start, t.selectionEnd);
			if (selectedText) {
				wrapSelection(t, v, o, '![', '](url)');
			} else {
				const newText = v.substring(0, start) + '![alt text](url)' + v.substring(t.selectionEnd);
				o(newText);
				requestAnimationFrame(() => {
					t.focus();
					t.setSelectionRange(start + 2, start + 10);
				});
			}
		},
	},
	{
		icon: List,
		label: 'Bullet List',
		action: (t, v, o) => insertAtLineStart(t, v, o, '- '),
	},
	{
		icon: ListOrdered,
		label: 'Numbered List',
		action: (t, v, o) => insertAtLineStart(t, v, o, '1. '),
	},
	{
		icon: ListTodo,
		label: 'Task List',
		action: (t, v, o) => insertAtLineStart(t, v, o, '- [ ] '),
	},
	{
		icon: Code,
		label: 'Inline Code',
		action: (t, v, o) => wrapSelection(t, v, o, '`', '`'),
	},
	{
		icon: FileCode,
		label: 'Code Block',
		action: (t, v, o) => insertBlock(t, v, o, '```\n\n```\n', 4),
	},
	{
		icon: Quote,
		label: 'Blockquote',
		action: (t, v, o) => insertAtLineStart(t, v, o, '> '),
	},
	{
		icon: Minus,
		label: 'Horizontal Rule',
		action: (t, v, o) => insertBlock(t, v, o, '---\n', 4),
	},
	{
		icon: Table,
		label: 'Table',
		action: (t, v, o) =>
			insertBlock(
				t,
				v,
				o,
				'| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n',
				2,
			),
	},
];

function ToolbarButton({
	action,
	textarea,
	value,
	onChange,
	disabled,
}: {
	action: ToolbarAction;
	textarea: HTMLTextAreaElement | null;
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
}) {
	const Icon = action.icon;

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Prevent button from stealing focus from textarea
			e.preventDefault();
			if (textarea) {
				action.action(textarea, value, onChange);
			}
		},
		[action, textarea, value, onChange],
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type='button'
					variant='ghost'
					size='xs'
					onMouseDown={handleMouseDown}
					disabled={disabled}
					className='h-7 w-7 p-0'
				>
					<Icon className='h-4 w-4' />
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{action.label}
				{action.shortcut && <span className='text-muted-foreground ml-2'>{action.shortcut}</span>}
			</TooltipContent>
		</Tooltip>
	);
}

export function MarkdownEditor({
	value,
	onChange,
	onBlur,
	placeholder = 'Write your content here...',
	disabled = false,
	minHeight = 200,
	className,
	'aria-describedby': ariaDescribedBy,
	'aria-invalid': ariaInvalid,
}: MarkdownEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [activeTab, setActiveTab] = useState<string>('write');

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (!textareaRef.current) return;

			const isMod = e.ctrlKey || e.metaKey;

			if (isMod && e.key === 'b') {
				e.preventDefault();
				wrapSelection(textareaRef.current, value, onChange, '**', '**');
			} else if (isMod && e.key === 'i') {
				e.preventDefault();
				wrapSelection(textareaRef.current, value, onChange, '*', '*');
			} else if (isMod && e.key === 'k') {
				e.preventDefault();
				const start = textareaRef.current.selectionStart;
				const end = textareaRef.current.selectionEnd;
				const selectedText = value.substring(start, end);
				if (selectedText) {
					wrapSelection(textareaRef.current, value, onChange, '[', '](url)');
				} else {
					const newText = value.substring(0, start) + '[link text](url)' + value.substring(end);
					onChange(newText);
					requestAnimationFrame(() => {
						textareaRef.current?.focus();
						textareaRef.current?.setSelectionRange(start + 1, start + 10);
					});
				}
			}
		},
		[value, onChange],
	);

	// Render markdown preview with XSS protection
	const renderPreview = useCallback(() => {
		if (!value) {
			return <p className='text-muted-foreground italic'>Nothing to preview</p>;
		}
		try {
			const rawHtml = marked.parse(value) as string;
			const sanitizedHtml = DOMPurify.sanitize(rawHtml);
			return (
				<div
					className='prose prose-sm prose-neutral dark:prose-invert max-w-none'
					dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
				/>
			);
		} catch {
			return <p className='text-destructive'>Error rendering markdown</p>;
		}
	}, [value]);

	return (
		<div className={cn('@container rounded-md border', className)}>
			<Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col'>
				{/* Header with tabs and toolbar - stacked on small containers, inline on larger */}
				<div className='bg-muted/30 border-b'>
					<div className='flex flex-wrap items-center px-2 @md:flex-nowrap @md:justify-between'>
						<TabsList className='h-9 shrink-0 bg-transparent p-0'>
							<TabsTrigger
								value='write'
								className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-3 py-2
									data-[state=active]:bg-transparent'
							>
								Write
							</TabsTrigger>
							<TabsTrigger
								value='preview'
								className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-3 py-2
									data-[state=active]:bg-transparent'
							>
								Preview
							</TabsTrigger>
						</TabsList>

						{/* Toolbar - only show in write mode */}
						{activeTab === 'write' && (
							<div
								className='border-border/50 flex w-full flex-wrap items-center gap-0.5 border-t py-1 @md:w-auto
									@md:border-t-0 @md:py-0'
							>
								{TOOLBAR_ACTIONS.slice(0, 3).map((action) => (
									<ToolbarButton
										key={action.label}
										action={action}
										textarea={textareaRef.current}
										value={value}
										onChange={onChange}
										disabled={disabled}
									/>
								))}
								<div className='bg-border mx-1 h-4 w-px' />
								{TOOLBAR_ACTIONS.slice(3, 6).map((action) => (
									<ToolbarButton
										key={action.label}
										action={action}
										textarea={textareaRef.current}
										value={value}
										onChange={onChange}
										disabled={disabled}
									/>
								))}
								<div className='bg-border mx-1 h-4 w-px' />
								{TOOLBAR_ACTIONS.slice(6, 8).map((action) => (
									<ToolbarButton
										key={action.label}
										action={action}
										textarea={textareaRef.current}
										value={value}
										onChange={onChange}
										disabled={disabled}
									/>
								))}
								<div className='bg-border mx-1 h-4 w-px' />
								{TOOLBAR_ACTIONS.slice(8, 11).map((action) => (
									<ToolbarButton
										key={action.label}
										action={action}
										textarea={textareaRef.current}
										value={value}
										onChange={onChange}
										disabled={disabled}
									/>
								))}
								<div className='bg-border mx-1 h-4 w-px' />
								{TOOLBAR_ACTIONS.slice(11).map((action) => (
									<ToolbarButton
										key={action.label}
										action={action}
										textarea={textareaRef.current}
										value={value}
										onChange={onChange}
										disabled={disabled}
									/>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Write tab content */}
				<TabsContent value='write' className='mt-0 flex-1'>
					<Textarea
						ref={textareaRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onBlur}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled}
						className='min-h-0 resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
						style={{ minHeight }}
						aria-describedby={ariaDescribedBy}
						aria-invalid={ariaInvalid}
					/>
				</TabsContent>

				{/* Preview tab content */}
				<TabsContent value='preview' className='mt-0 flex-1'>
					<div className='overflow-auto p-4' style={{ minHeight }}>
						{renderPreview()}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
