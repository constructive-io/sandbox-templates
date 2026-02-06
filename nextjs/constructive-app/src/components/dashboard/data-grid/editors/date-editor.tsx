import React, { useCallback, useState } from 'react';
import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { parseDate as parseAriaDate } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateValue as DateValueType } from 'react-aria-components';

import { Button } from '@constructive-io/ui/button';
import { Calendar } from '@constructive-io/ui/calendar-rac';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';

import { EditorFocusTrap } from './editor-focus-trap';

// Determine date type from cell data or context
const getDateType = (value: any): 'date' | 'datetime' | 'timestamptz' | 'time' => {
	// Try to infer from the value format
	if (typeof value === 'string') {
		if (value.includes('T') || value.includes(' ')) {
			return value.includes('+') || value.includes('Z') ? 'timestamptz' : 'datetime';
		}
		if (value.includes(':') && !value.includes('-')) {
			return 'time';
		}
	}
	return 'date'; // Default fallback
};

// Format date for display based on type
const formatDate = (val: unknown, dateType: string): string => {
	if (!val) return '';

	try {
		let date: Date;
		if (val instanceof Date) {
			date = val;
		} else if (typeof val === 'string') {
			date = new Date(val);
		} else {
			return String(val);
		}

		if (isNaN(date.getTime())) return String(val);

		switch (dateType) {
			case 'date':
				return date.toISOString().split('T')[0];
			case 'time':
				return date.toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false,
				});
			case 'datetime':
			case 'timestamptz':
				return date.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				});
			default:
				return date.toISOString().split('T')[0];
		}
	} catch {
		return String(val);
	}
};

// Format date for input based on type
const formatForInput = (val: unknown, inputType: string): string => {
	if (!val) return '';

	try {
		let date: Date;
		if (val instanceof Date) {
			date = val;
		} else if (typeof val === 'string') {
			date = new Date(val);
		} else {
			return '';
		}

		if (isNaN(date.getTime())) return '';

		switch (inputType) {
			case 'date':
				return date.toISOString().split('T')[0];
			case 'time':
				return date.toTimeString().split(' ')[0].slice(0, 8); // HH:MM:SS format
			case 'datetime-local':
				return date.toISOString().slice(0, 16);
			default:
				return '';
		}
	} catch {
		return '';
	}
};

// Convert JavaScript Date to DateValue for calendar
const dateToDateValue = (date: Date | string | null): DateValueType | null => {
	if (!date) return null;

	try {
		const jsDate = date instanceof Date ? date : new Date(date);
		if (isNaN(jsDate.getTime())) return null;

		const isoString = jsDate.toISOString().split('T')[0];
		return parseAriaDate(isoString);
	} catch {
		return null;
	}
};

// Convert DateValue to JavaScript Date
const dateValueToDate = (dateValue: DateValueType | null): Date | null => {
	if (!dateValue) return null;

	try {
		return new Date(dateValue.year, dateValue.month - 1, dateValue.day);
	} catch {
		return null;
	}
};

interface DateEditorProps {
	value: GridCell;
	onFinishedEditing: (newValue?: GridCell) => void;
}

export const DateEditor: React.FC<DateEditorProps> = ({ value, onFinishedEditing }) => {
	// Extract current date data from the cell
	const currentDateValue = value.kind === GridCellKind.Text ? value.data : '';
	const dateType = getDateType(currentDateValue);

	const [dateValue, setDateValue] = useState<any>(currentDateValue);
	const [selectedDate, setSelectedDate] = useState<DateValueType | null>(
		dateToDateValue(currentDateValue || new Date()),
	);
	const [activeTab, setActiveTab] = useState<'calendar' | 'input'>('calendar');

	const isTimeOnly = dateType === 'time';
	const isDateTimeType = dateType === 'datetime' || dateType === 'timestamptz';
	const inputType = isTimeOnly ? 'time' : isDateTimeType ? 'datetime-local' : 'date';

	const handleDateSelect = useCallback(
		(dateValue: DateValueType | null) => {
			setSelectedDate(dateValue);
			const jsDate = dateValueToDate(dateValue);

			if (jsDate) {
				// For datetime types, preserve existing time if available
				if (isDateTimeType && currentDateValue) {
					const currentDate = new Date(currentDateValue);
					if (!isNaN(currentDate.getTime())) {
						jsDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
					}
				}
				setDateValue(jsDate);
			}
		},
		[isDateTimeType, currentDateValue],
	);

	const handleTimeChange = useCallback(
		(timeValue: string) => {
			if (!timeValue) return;

			const [hours, minutes, seconds = 0] = timeValue.split(':').map(Number);
			let targetDate: Date;

			if (isTimeOnly) {
				// For time-only, use today's date
				targetDate = new Date();
			} else {
				// For datetime, use selected date or current date
				targetDate = selectedDate
					? dateValueToDate(selectedDate) || new Date()
					: currentDateValue
						? new Date(currentDateValue)
						: new Date();
			}

			targetDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
			setDateValue(targetDate);
		},
		[isTimeOnly, selectedDate, currentDateValue],
	);

	const handleInputChange = useCallback(
		(inputValue: string) => {
			if (!inputValue) {
				setDateValue(null);
				return;
			}

			try {
				let newDate: Date;

				if (inputType === 'time') {
					const [hours, minutes, seconds = 0] = inputValue.split(':').map(Number);
					newDate = new Date();
					newDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
				} else {
					newDate = new Date(inputValue);
				}

				if (!isNaN(newDate.getTime())) {
					setDateValue(newDate);
					if (!isTimeOnly) {
						setSelectedDate(dateToDateValue(newDate));
					}
				}
			} catch {
				// Invalid input, ignore
			}
		},
		[inputType, isTimeOnly],
	);

	const handleSave = useCallback(() => {
		let finalValue: string;

		if (!dateValue) {
			finalValue = '';
		} else {
			const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

			if (isNaN(date.getTime())) {
				finalValue = '';
			} else {
				switch (dateType) {
					case 'date':
						finalValue = date.toISOString().split('T')[0];
						break;
					case 'time':
						finalValue = date.toTimeString().split(' ')[0];
						break;
					case 'datetime':
						finalValue = date.toISOString().slice(0, 19); // Remove Z
						break;
					case 'timestamptz':
						finalValue = date.toISOString();
						break;
					default:
						finalValue = date.toISOString().split('T')[0];
				}
			}
		}

		// Return updated Text cell with formatted date
		onFinishedEditing({
			kind: GridCellKind.Text,
			data: finalValue,
			displayData: finalValue,
			allowOverlay: true,
		});
	}, [dateValue, dateType, onFinishedEditing]);

	const handleCancel = useCallback(() => {
		// Signal cancel without committing
		onFinishedEditing();
	}, [onFinishedEditing]);

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

	const displayValue = formatDate(dateValue, dateType);
	const inputValue = formatForInput(dateValue, inputType);

	return (
		<EditorFocusTrap
			onEscape={handleCancel}
			className='bg-background border-border/60 flex w-96 max-w-lg flex-col gap-0 overflow-y-visible rounded-lg border p-0 shadow-lg'
		>
			<div onKeyDown={handleEditorKeyDown}>
			{/* Header */}
			<div className='border-b px-6 py-4'>
				<div className='flex items-center gap-2'>
					<CalendarIcon className='text-muted-foreground h-4 w-4' />
					<h3 className='text-base font-semibold'>Edit {dateType.charAt(0).toUpperCase() + dateType.slice(1)}</h3>
				</div>
			</div>

			<div className='overflow-y-auto'>
				{/* Preview */}
				<div className='bg-muted/30 px-6 py-4'>
					<Label className='mb-2 block text-sm font-medium'>Preview</Label>
					<div className='bg-background rounded border px-3 py-2 font-mono text-sm'>
						{displayValue || <span className='text-muted-foreground'>No date selected</span>}
					</div>
				</div>

				{/* Editor */}
				<div className='px-6 py-6'>
					{isTimeOnly ? (
						// Time-only input
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='time-input'>Time</Label>
								<Input
									id='time-input'
									type='time'
									step='1'
									value={inputValue}
									onChange={(e) => handleTimeChange(e.target.value)}
									className='text-sm'
									placeholder='HH:MM:SS'
									autoFocus
								/>
							</div>
						</div>
					) : (
						// Date or DateTime editor with tabs
						<Tabs
							value={activeTab}
							onValueChange={(value) => setActiveTab(value as 'calendar' | 'input')}
							className='w-full'
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='calendar'>Calendar</TabsTrigger>
								<TabsTrigger value='input'>Text Input</TabsTrigger>
							</TabsList>

							<TabsContent value='calendar' className='mt-4 space-y-4'>
								<div className='space-y-4'>
									<Calendar
										value={selectedDate}
										onChange={handleDateSelect}
										className='mx-auto rounded-md border'
										aria-label='Select date'
									/>

									{isDateTimeType && (
										<div className='space-y-2'>
											<Label htmlFor='time-input'>Time</Label>
											<Input
												id='time-input'
												type='time'
												step='1'
												value={dateValue ? new Date(dateValue).toTimeString().split(' ')[0].slice(0, 8) : ''}
												onChange={(e) => handleTimeChange(e.target.value)}
												className='text-sm'
												placeholder='HH:MM:SS'
											/>
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='input' className='mt-4 space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='date-input'>{isDateTimeType ? 'Date & Time' : 'Date'}</Label>
									<Input
										id='date-input'
										type={inputType}
										value={inputValue}
										onChange={(e) => handleInputChange(e.target.value)}
										className='text-sm'
										autoFocus={activeTab === 'input'}
									/>
								</div>
							</TabsContent>
						</Tabs>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className='flex justify-end gap-2 border-t px-6 py-4'>
				<Button type='button' variant='outline' onClick={handleCancel}>
					Cancel
				</Button>
				<Button type='button' onClick={handleSave}>
					Save
				</Button>
			</div>
			</div>
		</EditorFocusTrap>
	);
};
