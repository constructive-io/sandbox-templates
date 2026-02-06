'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@constructive-io/ui/input';
import { useUpdateTable } from '@/lib/gql/hooks/schema-builder';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

interface InlineEditableNameProps {
	tableId: string;
	tableName: string;
	className?: string;
}

const DOUBLE_CLICK_DELAY = 300;

export function InlineEditableName({ tableId, tableName, className }: InlineEditableNameProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(tableName);
	const inputRef = useRef<HTMLInputElement>(null);
	const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const clickCountRef = useRef(0);
	const updateTableMutation = useUpdateTable();

	// Reset edit value when tableName changes
	useEffect(() => {
		setEditValue(tableName);
	}, [tableName]);

	// Focus input when editing starts
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
			}
		};
	}, []);

	// Custom double-click detection using pointerdown to bypass ReactFlow's event handling
	// ReactFlow uses onPointerDown for node interactions, so we need to intercept early
	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			// Stop propagation to prevent ReactFlow from handling this
			e.stopPropagation();

			clickCountRef.current += 1;

			if (clickCountRef.current === 1) {
				// First click - start timer
				clickTimeoutRef.current = setTimeout(() => {
					clickCountRef.current = 0;
				}, DOUBLE_CLICK_DELAY);
			} else if (clickCountRef.current === 2) {
				// Second click within delay - trigger edit
				if (clickTimeoutRef.current) {
					clearTimeout(clickTimeoutRef.current);
				}
				clickCountRef.current = 0;
				setIsEditing(true);
			}
		},
		[],
	);

	// Keep the native handler as backup
	const handleDoubleClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setIsEditing(true);
	}, []);

	const handleSave = useCallback(async () => {
		const trimmedValue = editValue.trim();

		// Don't save if empty or unchanged
		if (!trimmedValue || trimmedValue === tableName) {
			setEditValue(tableName);
			setIsEditing(false);
			return;
		}

		try {
			await updateTableMutation.mutateAsync({
				id: tableId,
				name: trimmedValue,
			});
			showSuccessToast({
				message: 'Table renamed',
				description: `Table renamed to "${trimmedValue}"`,
			});
			setIsEditing(false);
		} catch (error) {
			showErrorToast({
				message: 'Failed to rename table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
			setEditValue(tableName);
			setIsEditing(false);
		}
	}, [editValue, tableName, tableId, updateTableMutation]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				handleSave();
			} else if (e.key === 'Escape') {
				setEditValue(tableName);
				setIsEditing(false);
			}
		},
		[handleSave, tableName],
	);

	const handleBlur = useCallback(() => {
		handleSave();
	}, [handleSave]);

	if (isEditing) {
		return (
			<Input
				ref={inputRef}
				value={editValue}
				onChange={(e) => setEditValue(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				className={cn(
					// nodrag/nopan: ReactFlow classes to prevent node drag/pan on this element
					'nodrag nopan',
					'h-auto border-none bg-transparent p-0 text-[13px] font-medium shadow-none',
					'focus-visible:ring-0 focus-visible:ring-offset-0',
					className,
				)}
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}

	return (
		<span
			onPointerDown={handlePointerDown}
			onDoubleClick={handleDoubleClick}
			// nodrag/nopan: ReactFlow classes to prevent node drag/pan on this element
			className={cn('nodrag nopan cursor-text font-medium select-none', className)}
			title='Double-click to edit'
		>
			{tableName}
		</span>
	);
}
