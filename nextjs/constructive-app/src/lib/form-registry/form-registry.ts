import { ValidationError } from '@tanstack/react-form';

import { CellType, CellValue } from '@/lib/types/cell-types';

import { COMPLETE_FORM_FIELDS, getFormFieldCoverageStats } from './complete-form-fields';
import {
	EnhancedFormFieldRenderer,
	FormFieldMetadata,
	FormFieldPlugin,
	FormFieldRegistryEntry,
	FormFieldRenderer,
	FormFieldValidation,
} from './types';

/**
 * Form Field Registry
 * Manages form field components and their metadata, similar to CellRegistry
 */
export class FormFieldRegistry {
	private static instance: FormFieldRegistry;
	private entries: Map<CellType, FormFieldRegistryEntry> = new Map();
	private plugins: Map<string, FormFieldPlugin> = new Map();
	private initialized = false;

	private constructor() {}

	/**
	 * Get singleton instance
	 */
	static getInstance(): FormFieldRegistry {
		// SSR safety check
		if (typeof window === 'undefined') {
			return new FormFieldRegistry();
		}

		if (!FormFieldRegistry.instance) {
			FormFieldRegistry.instance = new FormFieldRegistry();
		}
		return FormFieldRegistry.instance;
	}

	/**
	 * Initialize the registry with default form fields
	 */
	private initializeDefaults(): void {
		if (this.initialized || typeof window === 'undefined') {
			return;
		}

		try {
			this.registerMany(COMPLETE_FORM_FIELDS);
			this.initialized = true;
			console.log(`Form Registry initialized with ${COMPLETE_FORM_FIELDS.length} form field types`);
		} catch (error) {
			console.error('Failed to initialize complete form fields:', error);
		}
	}

	/**
	 * Ensure the registry is initialized
	 */
	private ensureInitialized(): void {
		if (!this.initialized && typeof window !== 'undefined') {
			this.initializeDefaults();
		}
	}

	/**
	 * Register a form field component
	 */
	register(entry: FormFieldRegistryEntry): void {
		// SSR safety check
		if (typeof window === 'undefined') {
			return;
		}
		this.entries.set(entry.type, entry);
	}

	/**
	 * Register multiple form field components
	 */
	registerMany(entries: FormFieldRegistryEntry[]): void {
		// SSR safety check
		if (typeof window === 'undefined') {
			return;
		}
		entries.forEach((entry) => this.register(entry));
	}

	/**
	 * Get form field component by type
	 */
	getComponent(type: CellType): FormFieldRenderer | null {
		this.ensureInitialized();
		const entry = this.entries.get(type);
		return entry?.component || null;
	}

	/**
	 * Get enhanced form field component by type
	 */
	getEnhancedComponent(type: CellType): EnhancedFormFieldRenderer | null {
		this.ensureInitialized();
		const entry = this.entries.get(type);
		return entry?.enhancedComponent || null;
	}

	/**
	 * Get form field component (enhanced if available, otherwise basic)
	 */
	getBestComponent(type: CellType): FormFieldRenderer | EnhancedFormFieldRenderer | null {
		this.ensureInitialized();
		const entry = this.entries.get(type);
		return entry?.enhancedComponent || entry?.component || null;
	}

	/**
	 * Check if a form field type is registered
	 */
	hasComponent(type: CellType): boolean {
		return this.entries.has(type);
	}

	/**
	 * Get all registered form field types
	 */
	getRegisteredTypes(): CellType[] {
		return Array.from(this.entries.keys());
	}

	/**
	 * Get form field metadata
	 */
	getMetadata(type: CellType): FormFieldMetadata | null {
		const entry = this.entries.get(type);
		return entry?.metadata || null;
	}

	/**
	 * Get default value for a form field type
	 */
	getDefaultValue(type: CellType, metadata?: FormFieldMetadata): CellValue {
		const entry = this.entries.get(type);
		if (entry?.defaultValue) {
			return entry.defaultValue(metadata);
		}

		// Fallback default values based on type
		switch (type) {
			case 'text':
			case 'textarea':
			case 'email':
			case 'url':
			case 'phone':
			case 'citext':
				return '';
			case 'integer':
			case 'number':
			case 'decimal':
			case 'currency':
			case 'percentage':
				return 0;
			case 'boolean':
				return false;
			case 'date':
			case 'datetime':
			case 'timestamptz':
				return null;
			case 'json':
			case 'jsonb':
				return {};
			case 'array':
			case 'text-array':
			case 'uuid-array':
			case 'number-array':
			case 'integer-array':
			case 'date-array':
				return [];
			case 'uuid':
				return '';
			default:
				return null;
		}
	}

	/**
	 * Validate a value using the registered validator
	 */
	validateValue(type: CellType, value: CellValue, validation?: FormFieldValidation): ValidationError | undefined {
		const entry = this.entries.get(type);
		if (entry?.validator) {
			return entry.validator(value, validation);
		}

		// Built-in validation
		if (validation?.required && (value === null || value === undefined || value === '')) {
			return 'This field is required';
		}

		if (validation?.min !== undefined && typeof value === 'number' && value < validation.min) {
			return `Value must be at least ${validation.min}`;
		}

		if (validation?.max !== undefined && typeof value === 'number' && value > validation.max) {
			return `Value must be at most ${validation.max}`;
		}

		if (validation?.minLength !== undefined && typeof value === 'string' && value.length < validation.minLength) {
			return `Value must be at least ${validation.minLength} characters`;
		}

		if (validation?.maxLength !== undefined && typeof value === 'string' && value.length > validation.maxLength) {
			return `Value must be at most ${validation.maxLength} characters`;
		}

		if (validation?.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
			return 'Value does not match the required pattern';
		}

		if (validation?.custom) {
			return validation.custom(value);
		}

		return undefined;
	}

	/**
	 * Format a value for display
	 */
	formatValue(type: CellType, value: CellValue): string {
		const entry = this.entries.get(type);
		if (entry?.formatter) {
			return entry.formatter(value);
		}

		// Default formatting
		if (value === null || value === undefined) {
			return '';
		}

		if (typeof value === 'object') {
			return JSON.stringify(value);
		}

		return String(value);
	}

	/**
	 * Parse a string input to the appropriate value type
	 */
	parseValue(type: CellType, input: string): CellValue {
		const entry = this.entries.get(type);
		if (entry?.parser) {
			return entry.parser(input);
		}

		// Default parsing based on type
		switch (type) {
			case 'integer':
			case 'smallint':
				return parseInt(input, 10) || 0;
			case 'number':
			case 'decimal':
			case 'currency':
			case 'percentage':
				return parseFloat(input) || 0;
			case 'boolean':
				return input === 'true' || input === '1' || input === 'on';
			case 'json':
			case 'jsonb':
				try {
					return JSON.parse(input);
				} catch {
					return {};
				}
			case 'array':
			case 'text-array':
			case 'uuid-array':
			case 'number-array':
			case 'integer-array':
			case 'date-array':
				try {
					return JSON.parse(input);
				} catch {
					return [];
				}
			default:
				return input;
		}
	}

	/**
	 * Install a plugin
	 */
	installPlugin(plugin: FormFieldPlugin): void {
		if (this.plugins.has(plugin.name)) {
			throw new Error(`Plugin ${plugin.name} is already installed`);
		}

		// Register plugin fields
		this.registerMany(plugin.fields);

		// Store plugin reference
		this.plugins.set(plugin.name, plugin);

		// Run plugin installation hook
		plugin.install?.();
	}

	/**
	 * Uninstall a plugin
	 */
	uninstallPlugin(pluginName: string): void {
		const plugin = this.plugins.get(pluginName);
		if (!plugin) {
			throw new Error(`Plugin ${pluginName} is not installed`);
		}

		// Remove plugin fields
		plugin.fields.forEach((field) => {
			this.entries.delete(field.type);
		});

		// Remove plugin reference
		this.plugins.delete(pluginName);

		// Run plugin uninstallation hook
		plugin.uninstall?.();
	}

	/**
	 * Get installed plugins
	 */
	getInstalledPlugins(): FormFieldPlugin[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * Clear all registered form fields (useful for testing)
	 */
	clear(): void {
		this.entries.clear();
		this.plugins.clear();
	}

	/**
	 * Get all registered entries
	 */
	getEntries(): FormFieldRegistryEntry[] {
		return Array.from(this.entries.values());
	}

	/**
	 * Get registry statistics
	 */
	getStats(): {
		totalFields: number;
		totalPlugins: number;
		fieldsByCategory: Record<string, number>;
	} {
		const entries = this.getEntries();
		const fieldsByCategory: Record<string, number> = {};

		entries.forEach((entry) => {
			const category = entry.metadata?.category || 'unknown';
			fieldsByCategory[category] = (fieldsByCategory[category] || 0) + 1;
		});

		return {
			totalFields: entries.length,
			totalPlugins: this.plugins.size,
			fieldsByCategory,
		};
	}

	/**
	 * Get form field coverage compared to cell registry
	 */
	getCoverageStats(): {
		totalCellTypes: number;
		coveredTypes: number;
		coveragePercentage: number;
		missingTypes: CellType[];
	} {
		return getFormFieldCoverageStats();
	}
}

// Export singleton instance
export const FormRegistry = FormFieldRegistry.getInstance();
