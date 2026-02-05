'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

// Dynamic import for Ace Editor with all language modes
const AceEditor = dynamic(
	async () => {
		const ace = await import('react-ace');
		// Themes
		await import('ace-builds/src-noconflict/theme-textmate');
		await import('ace-builds/src-noconflict/theme-cloud9_night');
		// Modes
		await import('ace-builds/src-noconflict/mode-javascript');
		await import('ace-builds/src-noconflict/mode-typescript');
		await import('ace-builds/src-noconflict/mode-python');
		await import('ace-builds/src-noconflict/mode-json');
		await import('ace-builds/src-noconflict/mode-html');
		await import('ace-builds/src-noconflict/mode-css');
		await import('ace-builds/src-noconflict/mode-sql');
		await import('ace-builds/src-noconflict/mode-markdown');
		await import('ace-builds/src-noconflict/mode-yaml');
		await import('ace-builds/src-noconflict/mode-xml');
		await import('ace-builds/src-noconflict/mode-sh');
		await import('ace-builds/src-noconflict/mode-plain_text');
		// Extensions
		await import('ace-builds/src-noconflict/ext-language_tools');
		return ace;
	},
	{
		ssr: false,
		loading: () => (
			<div className='flex h-32 items-center justify-center rounded-md border'>
				<Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
			</div>
		),
	},
);

export const SUPPORTED_LANGUAGES = [
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'python', label: 'Python' },
	{ value: 'json', label: 'JSON' },
	{ value: 'html', label: 'HTML' },
	{ value: 'css', label: 'CSS' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'yaml', label: 'YAML' },
	{ value: 'xml', label: 'XML' },
	{ value: 'sh', label: 'Shell' },
	{ value: 'plain_text', label: 'Plain Text' },
] as const;

export type CodeLanguage = (typeof SUPPORTED_LANGUAGES)[number]['value'];

export interface CodeEditorProps {
	/** Current value (controlled mode) */
	value?: string;
	/** Default value (uncontrolled mode) */
	defaultValue?: string;
	/** Change handler */
	onChange?: (value: string) => void;
	/** Default language */
	defaultLanguage?: string;
	/** Allowed languages (empty = all) */
	allowedLanguages?: string[];
	/** Show line numbers */
	showLineNumbers?: boolean;
	/** Minimum lines */
	minLines?: number;
	/** Maximum lines */
	maxLines?: number;
	/** Read only mode */
	readOnly?: boolean;
}

/** Code editor component with syntax highlighting and language selector */
export function CodeEditor({
	value: controlledValue,
	defaultValue = '',
	onChange,
	defaultLanguage = 'plain_text',
	allowedLanguages = [],
	showLineNumbers = true,
	minLines = 6,
	maxLines = 20,
	readOnly = false,
}: CodeEditorProps) {
	const { theme } = useTheme();
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selectTriggerRef = useRef<HTMLButtonElement>(null);

	// Controlled mode if onChange is provided, otherwise uncontrolled
	const isControlled = onChange !== undefined;
	const value = isControlled ? (controlledValue ?? '') : internalValue;
	const handleChange = (newValue: string) => {
		if (!isControlled) {
			setInternalValue(newValue);
		}
		onChange?.(newValue);
	};

	// Get available languages - if allowedLanguages is empty, show all
	const availableLanguages =
		allowedLanguages.length > 0
			? SUPPORTED_LANGUAGES.filter((lang) => allowedLanguages.includes(lang.value))
			: [...SUPPORTED_LANGUAGES];

	// Compute valid language based on current props
	const getValidLanguage = () =>
		availableLanguages.some((lang) => lang.value === defaultLanguage)
			? defaultLanguage
			: availableLanguages[0]?.value || 'plain_text';

	const [selectedLanguage, setSelectedLanguage] = useState(getValidLanguage);

	// Sync selectedLanguage when allowedLanguages or defaultLanguage props change
	useEffect(() => {
		setSelectedLanguage(getValidLanguage());
	}, [defaultLanguage, allowedLanguages.join(',')]);

	// Get label for current language
	const currentLanguageLabel =
		SUPPORTED_LANGUAGES.find((lang) => lang.value === selectedLanguage)?.label || selectedLanguage;

	return (
		<div className='overflow-hidden rounded-md border'>
			{/* Language selector header */}
			<div className='bg-muted/50 flex items-center border-b px-3 py-1.5'>
				{availableLanguages.length === 1 ? (
					<span className='text-muted-foreground text-xs font-medium'>{currentLanguageLabel}</span>
				) : (
					<Select
						value={selectedLanguage}
						onValueChange={setSelectedLanguage}
						onOpenChange={(open) => {
							if (!open) {
								selectTriggerRef.current?.blur();
							}
						}}
					>
						<SelectTrigger
							ref={selectTriggerRef}
							className='h-6 w-auto gap-1.5 border-0 bg-transparent p-0 text-xs font-medium shadow-none focus:ring-0
								focus-visible:ring-0'
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{availableLanguages.map((lang) => (
								<SelectItem key={lang.value} value={lang.value}>
									{lang.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>
			<AceEditor
				mode={selectedLanguage}
				theme={theme === 'light' ? 'textmate' : 'cloud9_night'}
				value={value}
				onChange={handleChange}
				readOnly={readOnly}
				width='100%'
				minLines={minLines}
				maxLines={maxLines}
				showGutter={showLineNumbers}
				showPrintMargin={false}
				highlightActiveLine={!readOnly}
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: false,
					showLineNumbers: showLineNumbers,
					tabSize: 2,
					useWorker: false,
				}}
				editorProps={{ $blockScrolling: true }}
				style={{ background: 'transparent' }}
			/>
		</div>
	);
}
