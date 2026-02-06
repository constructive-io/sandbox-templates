import React from 'react';
import { GridCellKind, type TextCell } from '@glideapps/glide-data-grid';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InetEditor } from '../editors/inet-editor';
import { TsvectorEditor } from '../editors/tsvector-editor';
import { UploadEditor } from '../editors/upload-editor';

// Mock the UI components
vi.mock('@constructive-io/ui/button', () => ({
	Button: ({ children, onClick, ...props }: any) => (
		<button onClick={onClick} {...props}>
			{children}
		</button>
	),
}));

vi.mock('@constructive-io/ui/input', () => ({
	Input: ({ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
}));

vi.mock('@constructive-io/ui/textarea', () => ({
	Textarea: ({ onChange, ...props }: any) => <textarea onChange={onChange} {...props} />,
}));

vi.mock('@constructive-io/ui/label', () => ({
	Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@constructive-io/ui/tabs', () => ({
	Tabs: ({ children }: any) => <div>{children}</div>,
	TabsContent: ({ children }: any) => <div>{children}</div>,
	TabsList: ({ children }: any) => <div>{children}</div>,
	TabsTrigger: ({ children }: any) => <button>{children}</button>,
}));

describe('New DataGridV2 Editors', () => {
	describe('TsvectorEditor', () => {
		it('renders with initial tsvector data', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: "'word1':1,2 'word2':3 'word3':4,5",
				displayData: "'word1':1,2 'word2':3 'word3':4,5",
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<TsvectorEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			// Updated to match current implementation (view mode, not edit mode)
			expect(screen.getByText('View Text Search Vector')).toBeInTheDocument();
			expect(screen.getByText('word1')).toBeInTheDocument();
			expect(screen.getByText('word2')).toBeInTheDocument();
			expect(screen.getByText('word3')).toBeInTheDocument();
		});

		it('parses tsvector format and shows parsed words', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: "'hello':1 'world':2",
				displayData: "'hello':1 'world':2",
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<TsvectorEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			expect(screen.getByText('hello')).toBeInTheDocument();
			expect(screen.getByText('world')).toBeInTheDocument();
			// Updated label text
			expect(screen.getByText('Parsed Tokens (2)')).toBeInTheDocument();
		});

		it('calls onFinishedEditing when close is clicked', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: 'test data',
				displayData: 'test data',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<TsvectorEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			// Editor is now read-only with Close button instead of Save
			fireEvent.click(screen.getByText('Close'));

			// Close calls onFinishedEditing without parameters (no changes)
			expect(onFinishedEditing).toHaveBeenCalledWith();
		});
	});

	describe('InetEditor', () => {
		it('renders with initial IP address data', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '192.168.1.1',
				displayData: '192.168.1.1',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<InetEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			expect(screen.getByText('Edit IP Address')).toBeInTheDocument();
			expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();
		});

		it('validates IPv4 addresses correctly', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '192.168.1.1',
				displayData: '192.168.1.1',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<InetEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			expect(screen.getByText('IPv4 Address')).toBeInTheDocument();
		});

		it('validates CIDR notation correctly', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '192.168.1.0/24',
				displayData: '192.168.1.0/24',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<InetEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			expect(screen.getByText('IPv4 Network')).toBeInTheDocument();
		});

		it('calls onFinishedEditing when save is clicked', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '192.168.1.1',
				displayData: '192.168.1.1',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<InetEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			fireEvent.click(screen.getByText('Save'));

			expect(onFinishedEditing).toHaveBeenCalledWith({
				...mockCell,
				data: '192.168.1.1',
			});
		});
	});

	describe('UploadEditor', () => {
		it('renders with file upload interface', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<UploadEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			expect(screen.getByText('File Upload')).toBeInTheDocument();
			expect(screen.getByText('Upload File')).toBeInTheDocument();
			expect(screen.getAllByText('File URL')).toHaveLength(2); // Button and label
		});

		it('handles URL input for file uploads', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<UploadEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			const urlInput = screen.getByPlaceholderText('https://example.com/file.pdf');
			fireEvent.change(urlInput, { target: { value: 'https://example.com/test.pdf' } });

			expect(screen.getByText('test.pdf')).toBeInTheDocument();
		});

		it('calls onFinishedEditing when save is clicked', () => {
			const mockCell: TextCell = {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
			};

			const onFinishedEditing = vi.fn();

			render(<UploadEditor value={mockCell} onFinishedEditing={onFinishedEditing} />);

			fireEvent.click(screen.getByText('Save'));

			expect(onFinishedEditing).toHaveBeenCalledWith({
				...mockCell,
				data: '',
			});
		});
	});
});
