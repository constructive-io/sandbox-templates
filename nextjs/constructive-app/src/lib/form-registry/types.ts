import { ComponentType } from 'react';
import { ValidationError } from '@tanstack/react-form';

import { CellCategory, CellType, CellValue } from '@/lib/types/cell-types';

// Type alias for TanStack Form field API - using a more flexible approach
export interface FormFieldApi {
	name: string;
	state: {
		value: CellValue;
		meta: {
			errors?: unknown[];
			isTouched?: boolean;
			isDirty?: boolean;
			[key: string]: unknown;
		};
	};
	handleChange: (value: CellValue) => void;
	handleBlur: () => void;
	getValue?: () => CellValue;
	setValue?: (value: CellValue) => void;
	[key: string]: unknown;
}

// Base form field component props
export interface BaseFormFieldProps {
	name: string;
	label: string;
	value: CellValue;
	onChange: (value: CellValue) => void;
	onBlur?: () => void;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	description?: string;
	className?: string;
	field?: FormFieldApi;
	// Internal props that may be passed but not used by all fields
	fieldType?: string;
	metadata?: Record<string, any>;
	validation?: Record<string, any>;
}

// Enhanced form field props with additional metadata
export interface EnhancedFormFieldProps extends BaseFormFieldProps {
	fieldType: CellType;
	metadata?: FormFieldMetadata;
	validation?: FormFieldValidation;
	options?: FormFieldOptions;
}

// Form field validation configuration
export interface FormFieldValidation {
	required?: boolean;
	min?: number;
	max?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: CellValue) => ValidationError | undefined;
}

// Form field options for selects, radios, etc.
export interface FormFieldOptions {
	options?: Array<{ value: CellValue; label: string; disabled?: boolean }>;
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;
	loadOptions?: (inputValue: string) => Promise<Array<{ value: CellValue; label: string }>>;
}

// Form field metadata
export interface FormFieldMetadata {
	name: string;
	description: string;
	category: CellCategory;
	// Form-specific metadata
	inputType?: string; // HTML input type
	multiline?: boolean;
	rows?: number;
	cols?: number;
	step?: number;
	min?: number;
	max?: number;
	// Styling metadata
	width?: 'full' | 'half' | 'third' | 'quarter';
	order?: number;
	groupWith?: string[];
	// Feature flags
	supportsValidation?: boolean;
	supportsOptions?: boolean;
	supportsMultiple?: boolean;
	supportsSearch?: boolean;
	supportsAsync?: boolean;
}

// Form field renderer component type
export type FormFieldRenderer = ComponentType<BaseFormFieldProps>;

// Enhanced form field renderer with metadata
export type EnhancedFormFieldRenderer = ComponentType<EnhancedFormFieldProps>;

// Form field registry entry
export interface FormFieldRegistryEntry {
	type: CellType;
	component: FormFieldRenderer;
	enhancedComponent?: EnhancedFormFieldRenderer;
	validator?: (value: CellValue, validation?: FormFieldValidation) => ValidationError | undefined;
	formatter?: (value: CellValue) => string;
	parser?: (input: string) => CellValue;
	defaultValue?: (metadata?: FormFieldMetadata) => CellValue;
	metadata?: FormFieldMetadata;
}

// Form field plugin interface
export interface FormFieldPlugin {
	name: string;
	version: string;
	fields: FormFieldRegistryEntry[];
	install?: () => void;
	uninstall?: () => void;
}

// Form schema for generating complete forms
export interface FormSchema {
	fields: FormFieldSchema[];
	layout?: FormLayout;
	validation?: FormValidationSchema;
}

// Individual field schema
export interface FormFieldSchema {
	name: string;
	label: string;
	type: CellType;
	required?: boolean;
	defaultValue?: CellValue;
	validation?: FormFieldValidation;
	options?: FormFieldOptions;
	metadata?: Partial<FormFieldMetadata>;
	// Layout hints
	group?: string;
	order?: number;
	width?: 'full' | 'half' | 'third' | 'quarter';
	conditional?: {
		dependsOn: string;
		condition: (value: CellValue) => boolean;
	};
}

// Form layout configuration
export interface FormLayout {
	columns?: number;
	groups?: FormGroup[];
	spacing?: 'compact' | 'normal' | 'loose';
}

// Form group configuration
export interface FormGroup {
	name: string;
	label: string;
	description?: string;
	fields: string[];
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	columns?: number;
}

// Form validation schema
export interface FormValidationSchema {
	mode?: 'onChange' | 'onBlur' | 'onSubmit';
	reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
	delayMs?: number;
	// Cross-field validation
	crossFieldValidation?: Array<{
		fields: string[];
		validator: (values: Record<string, CellValue>) => ValidationError | undefined;
	}>;
}

// Form context for advanced features
export interface FormContext {
	tenantId?: string;
	tableId?: string;
	mode: 'create' | 'edit';
	permissions?: {
		read: boolean;
		write: boolean;
	};
	// Additional context data
	relatedData?: Record<string, CellValue>;
	apiEndpoints?: {
		options?: string;
		upload?: string;
		validate?: string;
	};
}

// Form submission data
export interface FormSubmissionData {
	values: Record<string, CellValue>;
	context?: FormContext;
	metadata?: {
		submittedAt: Date;
		submittedBy?: string;
		formVersion?: string;
	};
}

// Form field state for complex components
export interface FormFieldState {
	isDirty: boolean;
	isTouched: boolean;
	isValidating: boolean;
	isLoading: boolean;
	error?: string;
	warnings?: string[];
}
