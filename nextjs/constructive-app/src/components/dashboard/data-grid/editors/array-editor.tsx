import React, { useCallback, useMemo, useState } from 'react';

import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';

import { EditorFocusTrap } from './editor-focus-trap';

// Minimal editor component for scalar arrays using tag chips UI
// It works with Glide's provideEditor by emitting a Text cell with JSON string

type Props = {
	value: unknown[];
	onChange: (next: unknown[]) => void;
	onFinished: (next?: unknown[]) => void;
};

export function ArrayEditor({ value, onChange, onFinished }: Props) {
	const items = useMemo(() => (Array.isArray(value) ? value : []), [value]);
	const [list, setList] = useState<unknown[]>(items);
	const [input, setInput] = useState('');

	const handleCancel = useCallback(() => onFinished(undefined), [onFinished]);
	const handleSave = useCallback(() => onFinished(list), [onFinished, list]);

	const add = useCallback(() => {
		const text = input.trim();
		if (!text) return;
		const next = [...list, text];
		setList(next);
		setInput('');
		onChange(next);
	}, [input, list, onChange]);

	const remove = useCallback(
		(idx: number) => {
			const next = list.filter((_, i) => i !== idx);
			setList(next);
			onChange(next);
		},
		[list, onChange],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				add();
			}
			if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey)) || (e.key === 's' && (e.metaKey || e.ctrlKey))) {
				e.preventDefault();
				handleSave();
			}
		},
		[add, handleSave],
	);

	return (
		<EditorFocusTrap onEscape={handleCancel} className='bg-background max-w-[560px] min-w-[320px] rounded-md border p-3 shadow-xl'>
			<div className='mb-2 flex flex-wrap gap-1'>
				{list.map((item, i) => (
					<Badge key={i} variant='secondary' className='group'>
						<span className='mr-1 max-w-[160px] truncate'>{String(item)}</span>
						<button
							className='text-muted-foreground/70 hover:text-foreground ml-1'
							onClick={() => remove(i)}
							aria-label='Remove'
						>
							×
						</button>
					</Badge>
				))}
			</div>
			<div className='flex gap-2'>
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='Add item...'
				/>
				<Button onClick={add} variant='secondary'>
					Add
				</Button>
				<Button onClick={handleSave}>Save</Button>
			</div>
		</EditorFocusTrap>
	);
}
