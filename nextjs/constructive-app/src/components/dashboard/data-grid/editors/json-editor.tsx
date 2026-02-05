import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@constructive-io/ui/button';
import { Textarea } from '@constructive-io/ui/textarea';

import { EditorFocusTrap } from './editor-focus-trap';

// Persistent popover-style JSON editor content for Glide overlay

type Props = {
	value: unknown;
	onChange: (next: unknown) => void;
	onFinished: (next?: unknown) => void;
};

export function JsonEditor({ value, onChange, onFinished }: Props) {
	const [text, setText] = useState(() => (typeof value === 'string' ? value : JSON.stringify(value, null, 2)));
	const [valid, setValid] = useState(true);

	useEffect(() => {
		try {
			JSON.parse(text);
			setValid(true);
		} catch {
			setValid(false);
		}
	}, [text]);

	const parsed = useMemo(() => {
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	}, [text]);

	useEffect(() => {
		if (valid) {
			onChange(parsed);
		}
	}, [parsed, valid, onChange]);

	const handleCancel = useCallback(() => onFinished(undefined), [onFinished]);
	const handleSave = useCallback(() => onFinished(parsed), [onFinished, parsed]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				if (valid) handleSave();
			}
		},
		[valid, handleSave],
	);

	return (
		<EditorFocusTrap onEscape={handleCancel} className='bg-background max-w-[720px] min-w-[480px] rounded-md border p-3 shadow-xl'>
			<div onKeyDown={handleKeyDown}>
				<Textarea
					className={!valid ? 'border-destructive' : ''}
					rows={18}
					value={text}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
				/>
				<div className='mt-3 flex justify-between gap-2'>
					<div className='text-muted-foreground text-xs'>{valid ? 'Valid JSON' : 'Invalid JSON'}</div>
					<div className='flex gap-2'>
						<Button variant='ghost' onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!valid}>
							Save
						</Button>
					</div>
				</div>
			</div>
		</EditorFocusTrap>
	);
}
