import { BooleanField } from '@/components/form-fields/boolean-field';
import { DateField } from '@/components/form-fields/date-field';
import { NumberField } from '@/components/form-fields/number-field';
import { TextField } from '@/components/form-fields/text-field';
import { TextareaField } from '@/components/form-fields/textarea-field';

import { FormFieldRegistryEntry } from './types';

export const DEFAULT_FORM_FIELDS: FormFieldRegistryEntry[] = [
	// Text types
	{
		type: 'text',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (validation?.minLength && typeof value === 'string' && value.length < validation.minLength) {
				return `Must be at least ${validation.minLength} characters`;
			}
			if (validation?.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
				return `Must be no more than ${validation.maxLength} characters`;
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Text',
			description: 'Single-line text input',
			category: 'text',
			inputType: 'text',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'textarea',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (validation?.minLength && typeof value === 'string' && value.length < validation.minLength) {
				return `Must be at least ${validation.minLength} characters`;
			}
			if (validation?.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
				return `Must be no more than ${validation.maxLength} characters`;
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Textarea',
			description: 'Multi-line text input',
			category: 'text',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'email',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					return 'Please enter a valid email address';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Email',
			description: 'Email address input',
			category: 'text',
			inputType: 'email',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'url',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					new URL(value);
				} catch {
					return 'Please enter a valid URL';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'URL',
			description: 'URL input',
			category: 'text',
			inputType: 'url',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'phone',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
				if (!phoneRegex.test(value.replace(/[-\s\(\)]/g, ''))) {
					return 'Please enter a valid phone number';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Phone',
			description: 'Phone number input',
			category: 'text',
			inputType: 'tel',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'citext',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Case-insensitive Text',
			description: 'Case-insensitive text input',
			category: 'text',
			inputType: 'text',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'uuid',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				if (!uuidRegex.test(value)) {
					return 'Please enter a valid UUID';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'UUID',
			description: 'UUID input',
			category: 'special',
			inputType: 'text',
			supportsValidation: true,
			width: 'full',
		},
	},

	// Numeric types
	{
		type: 'integer',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
				if (isNaN(numValue) || !Number.isInteger(numValue)) {
					return 'Please enter a valid integer';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}`;
				}
			}
			return undefined;
		},
		formatter: (value) => value?.toString() || '',
		parser: (input) => parseInt(input, 10) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Integer',
			description: 'Integer number input',
			category: 'numeric',
			inputType: 'number',
			step: 1,
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'number',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
				if (isNaN(numValue)) {
					return 'Please enter a valid number';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}`;
				}
			}
			return undefined;
		},
		formatter: (value) => value?.toString() || '',
		parser: (input) => parseFloat(input) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Number',
			description: 'Decimal number input',
			category: 'numeric',
			inputType: 'number',
			step: 0.01,
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'decimal',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
				if (isNaN(numValue)) {
					return 'Please enter a valid decimal number';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}`;
				}
			}
			return undefined;
		},
		formatter: (value) => value?.toString() || '',
		parser: (input) => parseFloat(input) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Decimal',
			description: 'Decimal number input',
			category: 'numeric',
			inputType: 'number',
			step: 0.01,
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'currency',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
				if (isNaN(numValue)) {
					return 'Please enter a valid currency amount';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}`;
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(Number(value));
		},
		parser: (input) => parseFloat(input.replace(/[^0-9.-]/g, '')) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Currency',
			description: 'Currency amount input',
			category: 'numeric',
			inputType: 'number',
			step: 0.01,
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'percentage',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
				if (isNaN(numValue)) {
					return 'Please enter a valid percentage';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}%`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}%`;
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			return `${(Number(value) * 100).toFixed(2)}%`;
		},
		parser: (input) => parseFloat(input.replace('%', '')) / 100 || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Percentage',
			description: 'Percentage input',
			category: 'numeric',
			inputType: 'number',
			step: 0.01,
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'smallint',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
				if (isNaN(numValue) || !Number.isInteger(numValue)) {
					return 'Please enter a valid integer';
				}
				if (numValue < -32768 || numValue > 32767) {
					return 'Value must be between -32,768 and 32,767';
				}
				if (validation?.min !== undefined && numValue < validation.min) {
					return `Value must be at least ${validation.min}`;
				}
				if (validation?.max !== undefined && numValue > validation.max) {
					return `Value must be at most ${validation.max}`;
				}
			}
			return undefined;
		},
		formatter: (value) => value?.toString() || '',
		parser: (input) => parseInt(input, 10) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Small Integer',
			description: 'Small integer input (-32,768 to 32,767)',
			category: 'numeric',
			inputType: 'number',
			step: 1,
			supportsValidation: true,
			width: 'half',
		},
	},

	// Boolean type
	{
		type: 'boolean',
		component: BooleanField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined)) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(Boolean(value)),
		parser: (input) => input === 'true' || input === '1' || input === 'on',
		defaultValue: () => false,
		metadata: {
			name: 'Boolean',
			description: 'True/false toggle',
			category: 'boolean',
			supportsValidation: true,
			width: 'half',
		},
	},

	// Date/Time types
	{
		type: 'date',
		component: DateField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					return 'Please enter a valid date';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (value instanceof Date) return value.toISOString().slice(0, 10);
			if (typeof value === 'string') return value.slice(0, 10);
			return String(value);
		},
		parser: (input) => {
			if (!input) return null;
			return new Date(input + 'T00:00:00');
		},
		defaultValue: () => null,
		metadata: {
			name: 'Date',
			description: 'Date picker',
			category: 'date',
			inputType: 'date',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'datetime',
		component: DateField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					return 'Please enter a valid date and time';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (value instanceof Date) return value.toISOString().slice(0, 16);
			if (typeof value === 'string') return value.slice(0, 16);
			return String(value);
		},
		parser: (input) => {
			if (!input) return null;
			return new Date(input);
		},
		defaultValue: () => null,
		metadata: {
			name: 'Date Time',
			description: 'Date and time picker',
			category: 'date',
			inputType: 'datetime-local',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'timestamptz',
		component: DateField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					return 'Please enter a valid timestamp';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (value instanceof Date) return value.toISOString().slice(0, 16);
			if (typeof value === 'string') return value.slice(0, 16);
			return String(value);
		},
		parser: (input) => {
			if (!input) return null;
			return new Date(input);
		},
		defaultValue: () => null,
		metadata: {
			name: 'Timestamp with Timezone',
			description: 'Timestamp with timezone picker',
			category: 'date',
			inputType: 'datetime-local',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'time',
		component: DateField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (!timeRegex.test(value)) {
					return 'Please enter a valid time (HH:MM)';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (value instanceof Date) return value.toISOString().slice(11, 16);
			if (typeof value === 'string') return value.slice(11, 16);
			return String(value);
		},
		parser: (input) => {
			if (!input) return null;
			const today = new Date();
			const [hours, minutes] = input.split(':').map(Number);
			return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
		},
		defaultValue: () => null,
		metadata: {
			name: 'Time',
			description: 'Time picker',
			category: 'date',
			inputType: 'time',
			supportsValidation: true,
			width: 'half',
		},
	},

	// JSON types
	{
		type: 'json',
		component: TextareaField,
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
			name: 'JSON',
			description: 'JSON data input',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'jsonb',
		component: TextareaField,
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
			name: 'JSONB',
			description: 'Binary JSON data input',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Additional text types
	{
		type: 'bpchar',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Character',
			description: 'Fixed-length character field',
			category: 'text',
			inputType: 'text',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'inet',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
				const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
				if (!ipv4Regex.test(value) && !ipv6Regex.test(value)) {
					return 'Please enter a valid IP address';
				}
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'IP Address',
			description: 'IPv4 or IPv6 address',
			category: 'network',
			inputType: 'text',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'tsvector',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'TSVector',
			description: 'PostgreSQL full-text search vector',
			category: 'special',
			inputType: 'textarea',
			multiline: true,
			rows: 3,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Binary/Bit types
	{
		type: 'bit',
		component: BooleanField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined)) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (typeof value === 'boolean') return value ? '1' : '0';
			return String(value || '0');
		},
		parser: (input) => input === '1' || input === 'true',
		defaultValue: () => false,
		metadata: {
			name: 'Bit',
			description: 'Binary digit (0 or 1)',
			category: 'boolean',
			supportsValidation: true,
			width: 'quarter',
		},
	},

	// Geometric types
	{
		type: 'geometry',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					JSON.parse(value);
				} catch {
					return 'Please enter valid geometry JSON';
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
		defaultValue: () => ({
			geojson: { type: 'Point', coordinates: [0, 0] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry',
			description: 'Geographic shapes and coordinates',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'geometry-point',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value) {
				return `Point(${value.x}, ${value.y})`;
			}
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({
			geojson: { type: 'Point', coordinates: [0, 0] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry Point',
			description: 'Geographic point with X/Y coordinates',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'geometry-collection',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
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
		defaultValue: () => ({
			geojson: { type: 'GeometryCollection', geometries: [] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry Collection',
			description: 'Collection of geometric shapes',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Time interval type
	{
		type: 'interval',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				const interval = value as any;
				const parts = [];
				if (interval.days) parts.push(`${interval.days}d`);
				if (interval.hours) parts.push(`${interval.hours}h`);
				if (interval.minutes) parts.push(`${interval.minutes}m`);
				if (interval.seconds) parts.push(`${interval.seconds}s`);
				return parts.join(' ') || '0s';
			}
			return String(value);
		},
		parser: (input) => {
			const interval = { days: 0, hours: 0, minutes: 0, seconds: 0 };
			const patterns = [
				{ regex: /(\d+)\s*d(ays?)?/i, key: 'days' },
				{ regex: /(\d+)\s*h(ours?)?/i, key: 'hours' },
				{ regex: /(\d+)\s*m(in(utes?)?)?/i, key: 'minutes' },
				{ regex: /(\d+)\s*s(ec(onds?)?)?/i, key: 'seconds' },
			];

			patterns.forEach(({ regex, key }) => {
				const match = input.match(regex);
				if (match) {
					(interval as any)[key] = parseInt(match[1], 10);
				}
			});

			return interval;
		},
		defaultValue: () => ({ days: 0, hours: 0, minutes: 0, seconds: 0 }),
		metadata: {
			name: 'Time Interval',
			description: 'Duration (e.g., "1d 2h 30m")',
			category: 'date',
			inputType: 'text',
			supportsValidation: true,
			width: 'half',
		},
	},

	// Media types
	{
		type: 'image',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					new URL(value);
				} catch {
					return 'Please enter a valid image URL';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (typeof value === 'string') return value;
			if (typeof value === 'object' && value !== null) return JSON.stringify(value);
			return String(value || '');
		},
		parser: (input) => {
			try {
				return input.startsWith('{') ? JSON.parse(input) : input;
			} catch {
				return input;
			}
		},
		defaultValue: () => '',
		metadata: {
			name: 'Image',
			description: 'Image URL or upload data',
			category: 'media',
			inputType: 'url',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'file',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (typeof value === 'string') return value;
			if (typeof value === 'object' && value !== null) return JSON.stringify(value);
			return String(value || '');
		},
		parser: (input) => {
			try {
				return input.startsWith('{') ? JSON.parse(input) : input;
			} catch {
				return input;
			}
		},
		defaultValue: () => '',
		metadata: {
			name: 'File',
			description: 'File URL or upload data',
			category: 'media',
			inputType: 'url',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'video',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Video',
			description: 'Video URL or upload data',
			category: 'media',
			inputType: 'url',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'audio',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Audio',
			description: 'Audio URL or upload data',
			category: 'media',
			inputType: 'url',
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'upload',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (!value) return '';
			if (typeof value === 'object' && value !== null) {
				return JSON.stringify(value, null, 2);
			}
			return String(value);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => null,
		metadata: {
			name: 'File Upload',
			description: 'File upload metadata',
			category: 'media',
			inputType: 'textarea',
			multiline: true,
			rows: 3,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Special custom types
	{
		type: 'origin',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Origin',
			description: 'Origin reference',
			category: 'special',
			inputType: 'text',
			supportsValidation: true,
			width: 'half',
		},
	},
	{
		type: 'relation',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return `${value.length} related records`;
			if (typeof value === 'object') return 'Related record';
			return String(value);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => null,
		metadata: {
			name: 'Relation',
			description: 'Related table records',
			category: 'special',
			inputType: 'textarea',
			multiline: true,
			rows: 3,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Toggle type (alias for boolean with different UI)
	{
		type: 'toggle',
		component: BooleanField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined)) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(Boolean(value)),
		parser: (input) => input === 'true' || input === '1' || input === 'on',
		defaultValue: () => false,
		metadata: {
			name: 'Toggle',
			description: 'True/false toggle switch',
			category: 'boolean',
			supportsValidation: true,
			width: 'half',
		},
	},

	// Color type
	{
		type: 'color',
		component: TextField,
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
			description: 'Color picker input',
			category: 'special',
			inputType: 'color',
			supportsValidation: true,
			width: 'half',
		},
	},

	// Rating type
	{
		type: 'rating',
		component: NumberField,
		validator: (value, validation) => {
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}
			if (value !== null && value !== undefined && value !== '') {
				const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
				if (isNaN(numValue) || !Number.isInteger(numValue)) {
					return 'Please enter a valid rating';
				}
				if (numValue < 1 || numValue > 5) {
					return 'Rating must be between 1 and 5';
				}
			}
			return undefined;
		},
		formatter: (value) => value?.toString() || '',
		parser: (input) => parseInt(input, 10) || 0,
		defaultValue: () => 0,
		metadata: {
			name: 'Rating',
			description: 'Rating input (1-5 stars)',
			category: 'numeric',
			inputType: 'number',
			min: 1,
			max: 5,
			step: 1,
			supportsValidation: true,
			width: 'half',
		},
	},

	// Tags type
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
			if (Array.isArray(value)) {
				return value.join(', ');
			}
			return String(value || '');
		},
		parser: (input) => {
			if (typeof input === 'string') {
				return input
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0);
			}
			return Array.isArray(input) ? input : [];
		},
		defaultValue: () => [],
		metadata: {
			name: 'Tags',
			description: 'Comma-separated tags',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 2,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Fallback type
	{
		type: 'unknown',
		component: TextField,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => String(value || ''),
		parser: (input) => input,
		defaultValue: () => '',
		metadata: {
			name: 'Unknown',
			description: 'Fallback for unknown field types',
			category: 'other',
			inputType: 'text',
			supportsValidation: true,
			width: 'full',
		},
	},

	// Array types
	{
		type: 'array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			name: 'Array',
			description: 'Array data input',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'text-array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			description: 'Array of text values (one per line)',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'uuid-array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			description: 'Array of UUID values (one per line)',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'number-array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			description: 'Array of numbers (one per line)',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'integer-array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			description: 'Array of integers (one per line)',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
	{
		type: 'date-array',
		component: TextareaField,
		validator: (value, validation) => {
			if (validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
				return 'This field is required';
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
			description: 'Array of dates (one per line)',
			category: 'structured',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},
];
