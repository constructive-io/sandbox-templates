import React from 'react';
import { GridCellKind, type TextCell } from '@glideapps/glide-data-grid';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IntervalEditor } from '../editors/interval-editor';

describe('IntervalEditor', () => {
	const mockOnFinishedEditing = vi.fn();

	beforeEach(() => {
		mockOnFinishedEditing.mockClear();
	});

	describe('Interval parsing and formatting', () => {
		it('should parse interval JSON data correctly', () => {
			const intervalData = '{"days":1,"hours":2,"minutes":30,"seconds":45}';
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: intervalData,
				displayData: intervalData,
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			// Check that input fields are populated correctly
			expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // days
			expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // hours
			expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // minutes
			expect(screen.getByDisplayValue('45')).toBeInTheDocument(); // seconds
		});

		it('should parse text format interval data correctly', () => {
			const intervalData = '2d 3h 15m 30s';
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: intervalData,
				displayData: intervalData,
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			// Check that input fields are populated correctly
			expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // days
			expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // hours
			expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // minutes
			expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // seconds
		});

		it('should handle empty/invalid data gracefully', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			// All fields should be empty or show placeholder
			const inputs = screen.getAllByRole('spinbutton');
			inputs.forEach((input) => {
				expect(input).toHaveValue(null);
			});
		});
	});

	describe('User interactions', () => {
		it('should update input values when user types', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			const daysInput = screen.getByLabelText('Days');
			const hoursInput = screen.getByLabelText('Hours');

			fireEvent.change(daysInput, { target: { value: '5' } });
			fireEvent.change(hoursInput, { target: { value: '12' } });

			expect(daysInput).toHaveValue(5);
			expect(hoursInput).toHaveValue(12);
		});

		it('should update preview when values change', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			const daysInput = screen.getByLabelText('Days');
			const minutesInput = screen.getByLabelText('Minutes');

			fireEvent.change(daysInput, { target: { value: '1' } });
			fireEvent.change(minutesInput, { target: { value: '30' } });

			// Check preview shows formatted interval
			expect(screen.getByText('1d 30m')).toBeInTheDocument();
		});

		it('should show "0s" for empty interval', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			// Preview should show "0s" for empty interval
			expect(screen.getByText('0s')).toBeInTheDocument();
		});
	});

	describe('Save and cancel actions', () => {
		it('should call onFinishedEditing with updated data when save is clicked', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			const daysInput = screen.getByLabelText('Days');
			const saveButton = screen.getByText('Save');

			fireEvent.change(daysInput, { target: { value: '3' } });
			fireEvent.click(saveButton);

			expect(mockOnFinishedEditing).toHaveBeenCalledWith({
				...mockCell,
				data: '{"days":3,"hours":0,"minutes":0,"seconds":0}',
			});
		});

		it('should call onFinishedEditing without data when cancel is clicked', () => {
			const mockCell = {
				kind: GridCellKind.Text,
				data: '{"days":1,"hours":2,"minutes":30,"seconds":45}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			const cancelButton = screen.getByText('Cancel');
			fireEvent.click(cancelButton);

			expect(mockOnFinishedEditing).toHaveBeenCalledWith();
		});
	});

	describe('Keyboard shortcuts', () => {
		it('should save when Ctrl+Enter is pressed', () => {
			const mockCell = {
				kind: GridCellKind.Text,
				data: '{"days":1,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);
			const daysInput = screen.getByLabelText('Days');

			fireEvent.keyDown(daysInput, { key: 'Enter', ctrlKey: true });

			expect(mockOnFinishedEditing).toHaveBeenCalledWith({
				...mockCell,
				data: '{"days":1,"hours":0,"minutes":0,"seconds":0}',
			});
		});

		it('should cancel when Escape is pressed', () => {
			const mockCell = {
				kind: GridCellKind.Text,
				data: '{"days":1,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			const { container } = render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);
			const editorWrapper = container.querySelector('[role="dialog"]');

			fireEvent.keyDown(editorWrapper!, { key: 'Escape' });

			expect(mockOnFinishedEditing).toHaveBeenCalledWith();
		});
	});

	describe('Input validation', () => {
		it('should enforce non-negative values', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
				displayData: '',
				allowOverlay: true,
			};

			render(<IntervalEditor value={mockCell} onFinishedEditing={mockOnFinishedEditing} />);

			const daysInput = screen.getByLabelText('Days');
			fireEvent.change(daysInput, { target: { value: '-5' } });

			const saveButton = screen.getByText('Save');
			fireEvent.click(saveButton);

			// Should save with 0 instead of negative value
			expect(mockOnFinishedEditing).toHaveBeenCalledWith({
				...mockCell,
				data: '{"days":0,"hours":0,"minutes":0,"seconds":0}',
			});
		});
	});
});
