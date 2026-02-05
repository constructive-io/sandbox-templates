import React, { useCallback, useState } from 'react';
import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { Check, Globe, Info, Wifi, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';

import { EditorFocusTrap } from './editor-focus-trap';

interface InetEditorProps {
	value: GridCell;
	onFinishedEditing: (newValue?: GridCell) => void;
}

function isValidIPv4(ip: string): boolean {
	const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipv4Regex.test(ip);
}

function isValidIPv6(ip: string): boolean {
	const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
	const ipv6CompressedRegex =
		/^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::$/;
	return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
}

function isValidCIDR(cidr: string): boolean {
	const parts = cidr.split('/');
	if (parts.length !== 2) return false;

	const [ip, prefix] = parts;
	const prefixNum = parseInt(prefix, 10);

	if (isValidIPv4(ip)) {
		return prefixNum >= 0 && prefixNum <= 32;
	} else if (isValidIPv6(ip)) {
		return prefixNum >= 0 && prefixNum <= 128;
	}

	return false;
}

function isValidInet(value: string): boolean {
	if (!value || typeof value !== 'string') return false;

	const trimmed = value.trim();

	// Check if it's a CIDR notation
	if (trimmed.includes('/')) {
		return isValidCIDR(trimmed);
	}

	// Check if it's a plain IP address
	return isValidIPv4(trimmed) || isValidIPv6(trimmed);
}

function getInetType(value: string): string {
	if (!value) return '';

	const trimmed = value.trim();

	if (trimmed.includes('/')) {
		const [ip] = trimmed.split('/');
		if (isValidIPv4(ip)) return 'IPv4 Network';
		if (isValidIPv6(ip)) return 'IPv6 Network';
	} else {
		if (isValidIPv4(trimmed)) return 'IPv4 Address';
		if (isValidIPv6(trimmed)) return 'IPv6 Address';
	}

	return 'Invalid';
}

export const InetEditor: React.FC<InetEditorProps> = ({ value, onFinishedEditing }) => {
	// Extract current inet data from the cell
	const currentInetData = value.kind === GridCellKind.Text ? value.data : '';
	const [editingValue, setEditingValue] = useState<string>(currentInetData);
	const [validationError, setValidationError] = useState<string>('');

	const handleSave = useCallback(() => {
		// Validate inet before saving
		if (editingValue.trim() && !isValidInet(editingValue.trim())) {
			setValidationError('Please enter a valid IP address or CIDR notation');
			return;
		}

		const newCell: GridCell = {
			...value,
			data: editingValue.trim(),
		} as GridCell;
		onFinishedEditing(newCell);
	}, [editingValue, value, onFinishedEditing]);

	const handleCancel = useCallback(() => {
		onFinishedEditing();
	}, [onFinishedEditing]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setEditingValue(newValue);

			// Clear validation error when user starts typing
			if (validationError) {
				setValidationError('');
			}
		},
		[validationError],
	);

	// Handle Ctrl+Enter to save
	const handleEditorKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handleSave();
			}
		},
		[handleSave],
	);

	const isValid = !editingValue.trim() || isValidInet(editingValue.trim());
	const inetType = editingValue.trim() ? getInetType(editingValue.trim()) : '';

	return (
		<EditorFocusTrap onEscape={handleCancel} className='bg-background flex min-w-[400px] flex-col gap-4 rounded-lg border p-4 shadow-lg'>
			<div onKeyDown={handleEditorKeyDown}>
			{/* Header */}
			<div className='flex items-center gap-2'>
				<Globe className='text-muted-foreground h-4 w-4' />
				<h3 className='text-sm font-medium'>Edit IP Address</h3>
			</div>

			{/* IP Input */}
			<div className='space-y-2'>
				<Label htmlFor='inet' className='text-muted-foreground text-xs'>
					IP Address or Network
				</Label>
				<Input
					id='inet'
					type='text'
					value={editingValue}
					onChange={handleInputChange}
					placeholder='192.168.1.1 or 192.168.1.0/24'
					className={cn('font-mono text-sm', validationError && 'border-destructive focus-visible:ring-destructive')}
					autoFocus
				/>
				{validationError && <p className='text-destructive text-xs'>{validationError}</p>}
			</div>

			{/* Type Preview */}
			{editingValue.trim() && (
				<div className='space-y-2'>
					<Label className='text-muted-foreground text-xs'>Type</Label>
					<div className='bg-muted flex items-center gap-2 rounded p-2 text-sm'>
						<Wifi className='text-muted-foreground h-3 w-3 flex-shrink-0' />
						{isValid ? (
							<span className='text-primary font-medium'>{inetType}</span>
						) : (
							<span className='text-destructive'>Invalid format</span>
						)}
					</div>
				</div>
			)}

			{/* Format Help */}
			<div className='text-muted-foreground flex items-start gap-2 text-xs'>
				<Info className='mt-0.5 h-3 w-3 flex-shrink-0' />
				<div>
					<p>Supported formats:</p>
					<ul className='mt-1 list-inside list-disc space-y-1'>
						<li>IPv4: 192.168.1.1</li>
						<li>IPv6: 2001:db8::1</li>
						<li>CIDR: 192.168.1.0/24</li>
						<li>IPv6 CIDR: 2001:db8::/32</li>
					</ul>
				</div>
			</div>

			{/* Action Buttons */}
			<div className='flex justify-end gap-2'>
				<Button variant='outline' size='sm' onClick={handleCancel}>
					<X className='mr-1 h-3 w-3' />
					Cancel
				</Button>
				<Button size='sm' onClick={handleSave} disabled={!!validationError}>
					<Check className='mr-1 h-3 w-3' />
					Save
				</Button>
			</div>
			</div>
		</EditorFocusTrap>
	);
};
