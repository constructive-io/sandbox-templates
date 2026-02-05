// Main registry exports
export { FormFieldRegistry, FormRegistry } from './form-registry';

// Form fields collections
export { DEFAULT_FORM_FIELDS } from './default-form-fields';
export { ADVANCED_FORM_FIELDS } from './advanced-form-fields';
export {
	COMPLETE_FORM_FIELDS,
	getAllFormFields,
	getFormFieldsByCategory,
	getFormFieldCoverageStats,
	validateFormFieldCoverage,
} from './complete-form-fields';

// Bridge system
export { CellToFormBridge } from './cell-to-form-bridge';
export { CellFormWrapper, EnhancedFormWrapper, GeometryFormWrapper, RelationFormWrapper } from './cell-form-wrapper';

// Coverage reporting
export { generateCoverageReport, printCoverageReport, getCoverageSummary } from './coverage-report';

// Types
export type {
	BaseFormFieldProps,
	EnhancedFormFieldProps,
	FormFieldRenderer,
	EnhancedFormFieldRenderer,
	FormFieldRegistryEntry,
	FormFieldPlugin,
	FormSchema,
	FormFieldSchema,
	FormLayout,
	FormGroup,
	FormValidationSchema,
	FormFieldValidation,
	FormFieldOptions,
	FormFieldMetadata,
	FormContext,
	FormSubmissionData,
	FormFieldState,
} from './types';

// Note: Form registry initialization is now handled automatically
// within the FormFieldRegistry class when components are first accessed
