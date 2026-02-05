// Legacy imports - components moved/removed
import { TextareaField } from '@/components/form-fields/textarea-field';

import { FormFieldRegistryEntry } from './types';

// Placeholder components for ArrayField and JsonEditor until proper implementations are ready
const ArrayField = TextareaField;
const JsonEditor = TextareaField;

// Advanced form field entries that extend the default set
export const ADVANCED_FORM_FIELDS: FormFieldRegistryEntry[] = [
	// Enhanced JSON fields with advanced editor
	{
		type: 'json',
		component: JsonEditor,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					JSON.parse(value);
				} catch {
					return 'Please enter valid JSON';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'string') return value;
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({}),
		metadata: {
			name: 'JSON Editor',
			description: 'Advanced JSON data editor with validation',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 8,
			supportsValidation: true,
			supportsAsync: false,
			width: 'full',
		},
	},

	{
		type: 'jsonb',
		component: JsonEditor,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					JSON.parse(value);
				} catch {
					return 'Please enter valid JSON';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'string') return value;
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({}),
		metadata: {
			name: 'JSONB Editor',
			description: 'Advanced binary JSON data editor with validation',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 8,
			supportsValidation: true,
			supportsAsync: false,
			width: 'full',
		},
	},

	// Enhanced Array fields
	{
		type: 'array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (validation?.min !== undefined && Array.isArray(value) && value.length < validation.min) {
				return `Must have at least ${validation.min} items`;
			}
			if (validation?.max !== undefined && Array.isArray(value) && value.length > validation.max) {
				return `Must have at most ${validation.max} items`;
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return JSON.stringify(value, null, 2);
			return String(value);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return [];
			}
		},
		defaultValue: () => [],
		metadata: {
			name: 'Array Editor',
			description: 'Advanced array editor with drag & drop',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	{
		type: 'text-array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (validation?.min !== undefined && Array.isArray(value) && value.length < validation.min) {
				return `Must have at least ${validation.min} items`;
			}
			if (validation?.max !== undefined && Array.isArray(value) && value.length > validation.max) {
				return `Must have at most ${validation.max} items`;
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join('\n');
			return String(value);
		},
		parser: (input) => {
			return input.split('\n').filter((line) => line.trim() !== '');
		},
		defaultValue: () => [],
		metadata: {
			name: 'Text Array',
			description: 'Array of text values with individual editing',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	{
		type: 'uuid-array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (Array.isArray(value)) {
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				for (const item of value) {
					if (typeof item === 'string' && item.trim() && !uuidRegex.test(item)) {
						return 'All items must be valid UUIDs';
					}
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join('\n');
			return String(value);
		},
		parser: (input) => {
			return input.split('\n').filter((line) => line.trim() !== '');
		},
		defaultValue: () => [],
		metadata: {
			name: 'UUID Array',
			description: 'Array of UUID values with validation',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	{
		type: 'number-array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (Array.isArray(value)) {
				for (const item of value) {
					if (typeof item === 'string' && item.trim() && isNaN(parseFloat(item))) {
						return 'All items must be valid numbers';
					}
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join('\n');
			return String(value);
		},
		parser: (input) => {
			return input
				.split('\n')
				.filter((line) => line.trim() !== '')
				.map((line) => parseFloat(line.trim()))
				.filter((num) => !isNaN(num));
		},
		defaultValue: () => [],
		metadata: {
			name: 'Number Array',
			description: 'Array of numbers with validation',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	{
		type: 'integer-array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (Array.isArray(value)) {
				for (const item of value) {
					if (typeof item === 'string' && item.trim()) {
						const num = parseInt(item.trim(), 10);
						if (isNaN(num) || !Number.isInteger(num)) {
							return 'All items must be valid integers';
						}
					}
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join('\n');
			return String(value);
		},
		parser: (input) => {
			return input
				.split('\n')
				.filter((line) => line.trim() !== '')
				.map((line) => parseInt(line.trim(), 10))
				.filter((num) => !isNaN(num));
		},
		defaultValue: () => [],
		metadata: {
			name: 'Integer Array',
			description: 'Array of integers with validation',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	{
		type: 'date-array',
		component: ArrayField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			if (Array.isArray(value)) {
				for (const item of value) {
					if (typeof item === 'string' && item.trim()) {
						const date = new Date(item.trim());
						if (isNaN(date.getTime())) {
							return 'All items must be valid dates';
						}
					}
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join('\n');
			return String(value);
		},
		parser: (input) => {
			return input
				.split('\n')
				.filter((line) => line.trim() !== '')
				.map((line) => line.trim());
		},
		defaultValue: () => [],
		metadata: {
			name: 'Date Array',
			description: 'Array of dates with validation',
			category: 'structured',
			supportsValidation: true,
			supportsMultiple: true,
			width: 'full',
		},
	},

	// Enhanced select field for enum-like types
	{
		type: 'tags',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return value.join(', ');
			return String(value);
		},
		parser: (input) => {
			return input
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag !== '');
		},
		defaultValue: () => [],
		metadata: {
			name: 'Tags',
			description: 'Multi-select tags field',
			category: 'special',
			supportsValidation: true,
			supportsOptions: true,
			supportsMultiple: true,
			supportsSearch: true,
			width: 'full',
		},
	},

	// Color picker field
	{
		type: 'color',
		component: TextareaField, // Will be enhanced with custom color picker
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
				if (!colorRegex.test(value)) {
					return 'Please enter a valid hex color (e.g., #FF0000)';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '#000000',
		metadata: {
			name: 'Color',
			description: 'Color picker field',
			category: 'special',
			inputType: 'color',
			supportsValidation: true,
			width: 'half',
		},
	},

	// Rating field
	{
		type: 'rating',
		component: TextareaField, // Will be enhanced with star rating
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = Number(value);
				if (isNaN(numValue) || numValue < 0 || numValue > 5) {
					return 'Rating must be between 0 and 5';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			return `${value}/5`;
		},
		parser: (input) => parseFloat(input) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Rating',
			description: 'Star rating field (0-5)',
			category: 'special',
			supportsValidation: true,
			width: 'half',
		},
	},
];
