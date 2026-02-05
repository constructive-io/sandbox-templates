/**
 * Form Field Registry Tests
 * Consolidated: form-registry + integration + advanced-form-fields
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADVANCED_FORM_FIELDS } from '../advanced-form-fields';
import { DEFAULT_FORM_FIELDS } from '../default-form-fields';
import { FormFieldRegistry, FormRegistry } from '../form-registry';
import type { FormFieldPlugin, FormFieldRegistryEntry } from '../types';

describe('FormFieldRegistry', () => {
	let registry: FormFieldRegistry;

	beforeEach(() => {
		registry = new (FormFieldRegistry as any)();
		registry.clear();
	});

	// ============================================================================
	// Core Registration
	// ============================================================================

	describe('Field Registration', () => {
		it('registers single and multiple fields', () => {
			const mockField: FormFieldRegistryEntry = {
				type: 'test',
				component: vi.fn(),
				metadata: { name: 'Test Field', description: 'A test field', category: 'text' },
			};

			registry.register(mockField);
			expect(registry.hasComponent('test')).toBe(true);
			expect(registry.getComponent('test')).toBe(mockField.component);

			const mockFields: FormFieldRegistryEntry[] = [
				{ type: 'test1', component: vi.fn(), metadata: { name: 'Test 1', description: '', category: 'text' } },
				{ type: 'test2', component: vi.fn(), metadata: { name: 'Test 2', description: '', category: 'numeric' } },
			];
			registry.registerMany(mockFields);
			expect(registry.hasComponent('test1')).toBe(true);
			expect(registry.hasComponent('test2')).toBe(true);
		});

		it('gets all registered types', () => {
			registry.registerMany([
				{ type: 'field1', component: vi.fn(), metadata: { name: 'Field 1', description: '', category: 'text' } },
				{ type: 'field2', component: vi.fn(), metadata: { name: 'Field 2', description: '', category: 'numeric' } },
			]);
			const types = registry.getRegisteredTypes();
			expect(types).toContain('field1');
			expect(types).toContain('field2');
		});
	});

	// ============================================================================
	// Component Retrieval
	// ============================================================================

	describe('Component Retrieval', () => {
		beforeEach(() => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 5));
		});

		it('gets basic and enhanced components', () => {
			const basicComponent = vi.fn();
			const enhancedComponent = vi.fn();
			const mockField: FormFieldRegistryEntry = {
				type: 'hybrid',
				component: basicComponent,
				enhancedComponent: enhancedComponent,
				metadata: { name: 'Hybrid Field', description: '', category: 'text' },
			};

			registry.register(mockField);
			expect(registry.getComponent('hybrid')).toBe(basicComponent);
			expect(registry.getEnhancedComponent('hybrid')).toBe(enhancedComponent);
			expect(registry.getBestComponent('hybrid')).toBe(enhancedComponent); // Enhanced preferred
		});

		it('returns null for non-existent field types', () => {
			expect(registry.getComponent('nonexistent')).toBeNull();
			expect(registry.getEnhancedComponent('nonexistent')).toBeNull();
		});
	});

	// ============================================================================
	// Metadata
	// ============================================================================

	describe('Field Metadata', () => {
		it('gets field metadata', () => {
			const mockField: FormFieldRegistryEntry = {
				type: 'metadata-test',
				component: vi.fn(),
				metadata: {
					name: 'Metadata Test',
					description: 'A field for testing metadata',
					category: 'special',
					supportsValidation: true,
					width: 'full',
				},
			};

			registry.register(mockField);
			expect(registry.getMetadata('metadata-test')).toEqual(mockField.metadata);
			expect(registry.getMetadata('nonexistent' as any)).toBeNull();
		});
	});

	// ============================================================================
	// Default Values
	// ============================================================================

	describe('Default Values', () => {
		beforeEach(() => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 10));
		});

		const defaultValueCases = [
			['text', ''],
			['boolean', false],
			['integer', 0],
		] as const;

		it.each(defaultValueCases)('gets default value for %s', (type, expected) => {
			expect(registry.getDefaultValue(type)).toBe(expected);
		});

		it('returns null for unknown types', () => {
			expect(registry.getDefaultValue('unknown-type' as any)).toBeNull();
		});
	});

	// ============================================================================
	// Validation
	// ============================================================================

	describe('Validation', () => {
		beforeEach(() => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 10));
		});

		const validationCases = [
			['text', '', { required: true }, 'This field is required'],
			['email', 'invalid-email', {}, 'Please enter a valid email address'],
			['integer', 5, { min: 10 }, 'Value must be at least 10'],
			['text', 'abc', { minLength: 5 }, 'Must be at least 5 characters'],
			['text', 'valid text', {}, undefined],
		] as const;

		it.each(validationCases)('validates %s: %s', (type, value, opts, expected) => {
			expect(registry.validateValue(type as any, value, opts)).toBe(expected);
		});

		it('uses custom validation', () => {
			const mockField: FormFieldRegistryEntry = {
				type: 'custom-test' as any,
				component: vi.fn(),
				validator: (value, validation) => validation?.custom?.(value),
				metadata: { name: 'Custom Test', description: 'Test custom validation', category: 'text' },
			};
			registry.register(mockField);
			const customValidator = vi.fn().mockReturnValue('Custom error');
			expect(registry.validateValue('custom-test' as any, 'test', { custom: customValidator })).toBe('Custom error');
			expect(customValidator).toHaveBeenCalledWith('test');
		});
	});

	// ============================================================================
	// Formatting and Parsing
	// ============================================================================

	describe('Value Formatting and Parsing', () => {
		beforeEach(() => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 15));
		});

		it('formats and parses values', () => {
			expect(registry.formatValue('currency', 123.45)).toBe('$123.45');
			expect(registry.formatValue('percentage', 0.25)).toBe('25.00%');
			expect(registry.parseValue('integer', '123')).toBe(123);
			expect(registry.parseValue('boolean', 'true')).toBe(true);
			expect(registry.parseValue('json', '{"key": "value"}')).toEqual({ key: 'value' });
			expect(registry.parseValue('json', 'invalid json')).toEqual({});
		});
	});

	// ============================================================================
	// Plugin System
	// ============================================================================

	describe('Plugin System', () => {
		it('installs and uninstalls plugins', () => {
			const mockPlugin: FormFieldPlugin = {
				name: 'test-plugin',
				version: '1.0.0',
				fields: [
					{ type: 'plugin-field', component: vi.fn(), metadata: { name: 'Plugin Field', description: '', category: 'special' } },
				],
				install: vi.fn(),
				uninstall: vi.fn(),
			};

			registry.installPlugin(mockPlugin);
			expect(registry.hasComponent('plugin-field' as any)).toBe(true);
			expect(mockPlugin.install).toHaveBeenCalled();
			expect(registry.getInstalledPlugins()).toContain(mockPlugin);

			registry.uninstallPlugin('test-plugin');
			expect(registry.hasComponent('plugin-field' as any)).toBe(false);
			expect(mockPlugin.uninstall).toHaveBeenCalled();
		});

		it('prevents duplicate plugin installation', () => {
			const mockPlugin: FormFieldPlugin = { name: 'test-plugin', version: '1.0.0', fields: [] };
			registry.installPlugin(mockPlugin);
			expect(() => registry.installPlugin(mockPlugin)).toThrow('Plugin test-plugin is already installed');
		});

		it('throws on uninstalling non-existent plugin', () => {
			expect(() => registry.uninstallPlugin('nonexistent')).toThrow('Plugin nonexistent is not installed');
		});
	});

	// ============================================================================
	// Statistics and Clearing
	// ============================================================================

	describe('Registry Operations', () => {
		it('gets statistics', () => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 10));
			const stats = registry.getStats();
			expect(stats.totalFields).toBe(10);
			expect(stats.totalPlugins).toBe(0);
			expect(stats.fieldsByCategory).toBeDefined();
		});

		it('clears all entries and plugins', () => {
			registry.registerMany(DEFAULT_FORM_FIELDS.slice(0, 5));
			registry.installPlugin({ name: 'test-plugin', version: '1.0.0', fields: [] });
			registry.clear();
			expect(registry.getRegisteredTypes()).toHaveLength(0);
			expect(registry.getInstalledPlugins()).toHaveLength(0);
		});

		it('handles SSR gracefully', () => {
			const originalWindow = global.window;
			(global as any).window = undefined;
			expect(FormFieldRegistry.getInstance()).toBeDefined();
			global.window = originalWindow;
		});
	});
});

// ============================================================================
// FormRegistry Integration (Singleton)
// ============================================================================

describe('FormRegistry Integration', () => {
	beforeEach(() => {
		(FormRegistry as any).initialized = false;
	});

	const basicTypes = ['text', 'email', 'integer', 'boolean', 'date', 'textarea'];
	const advancedTypes = ['json', 'array', 'color', 'rating', 'tags'];

	it('has components for basic and advanced types', () => {
		for (const type of [...basicTypes, ...advancedTypes]) {
			expect(FormRegistry.getComponent(type)).toBeDefined();
			expect(FormRegistry.getBestComponent(type)).toBeDefined();
		}
	});

	it('returns null for unknown types', () => {
		expect(FormRegistry.getComponent('nonexistent' as any)).toBeNull();
	});

	it('validates and has metadata for types', () => {
		expect(FormRegistry.validateValue('text', 'hello', { required: true })).toBeUndefined();
		expect(FormRegistry.validateValue('email', 'invalid-email', { required: true })).toBeDefined();

		const textMetadata = FormRegistry.getMetadata('text');
		expect(textMetadata?.name).toBe('Text');
		expect(textMetadata?.inputType).toBe('text');
	});

	it('lists all registered types', () => {
		const types = FormRegistry.getRegisteredTypes();
		for (const type of [...basicTypes, ...advancedTypes]) {
			expect(types).toContain(type);
		}
	});
});

// ============================================================================
// Advanced Form Fields
// ============================================================================

describe('ADVANCED_FORM_FIELDS', () => {
	it('exports array with required properties', () => {
		expect(Array.isArray(ADVANCED_FORM_FIELDS)).toBe(true);
		expect(ADVANCED_FORM_FIELDS.length).toBeGreaterThan(0);

		ADVANCED_FORM_FIELDS.forEach((field) => {
			expect(field).toHaveProperty('type');
			expect(field).toHaveProperty('component');
			expect(field).toHaveProperty('validator');
			expect(field).toHaveProperty('formatter');
			expect(field).toHaveProperty('parser');
			expect(field).toHaveProperty('defaultValue');
			expect(field).toHaveProperty('metadata');
		});

		// Unique types
		const types = ADVANCED_FORM_FIELDS.map((f) => f.type);
		expect(types.length).toBe(new Set(types).size);
	});

	describe('JSON Fields', () => {
		const jsonField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'json');
		const jsonbField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'jsonb');

		it('has proper configuration', () => {
			expect(jsonField?.metadata?.name).toBe('JSON Editor');
			expect(jsonField?.metadata?.category).toBe('structured');
			expect(jsonbField?.metadata?.name).toBe('JSONB Editor');
		});

		it('validates, formats, and parses JSON', () => {
			expect(jsonField?.validator?.('{"valid": true}', {})).toBeUndefined();
			expect(jsonField?.validator?.('invalid json', {})).toBeDefined();
			expect(jsonField?.validator?.('', { required: true })).toBeDefined();

			const testObj = { test: 'value', nested: { key: 123 } };
			expect(jsonField?.formatter?.(testObj)).toBe(JSON.stringify(testObj, null, 2));
			expect(jsonField?.formatter?.('')).toBe('');

			expect(jsonField?.parser?.('{"test": "value"}')).toEqual({ test: 'value' });
			expect(jsonField?.parser?.('invalid json')).toBe('invalid json');

			expect(jsonField?.defaultValue?.()).toEqual({});
			expect(jsonbField?.defaultValue?.()).toEqual({});
		});
	});

	describe('Array Fields', () => {
		const arrayTypes = ['array', 'text-array', 'uuid-array', 'number-array', 'integer-array', 'date-array'];
		const arrayFields = arrayTypes.map((t) => ADVANCED_FORM_FIELDS.find((f) => f.type === t));

		it('has all array field types', () => {
			arrayFields.forEach((f) => expect(f).toBeDefined());
		});

		it('validates array fields', () => {
			const arrayField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'array');
			expect(arrayField?.validator?.([], {})).toBeUndefined();
			expect(arrayField?.validator?.([], { required: true })).toBeDefined();
			expect(arrayField?.validator?.(['item'], { min: 2 })).toBeDefined();
			expect(arrayField?.validator?.(['a', 'b', 'c'], { max: 2 })).toBeDefined();

			const uuidField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'uuid-array');
			const validUuid = '123e4567-e89b-12d3-a456-426614174000';
			expect(uuidField?.validator?.([validUuid], {})).toBeUndefined();
			expect(uuidField?.validator?.(['not-a-uuid'], {})).toBeDefined();
		});

		it('formats and parses arrays', () => {
			const textArrayField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'text-array');
			expect(textArrayField?.formatter?.(['item1', 'item2'])).toBe('item1\nitem2');
			expect(textArrayField?.parser?.('item1\nitem2\nitem3')).toEqual(['item1', 'item2', 'item3']);

			const numberArrayField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'number-array');
			expect(numberArrayField?.parser?.('1\n2.5\n3')).toEqual([1, 2.5, 3]);
		});

		it('has correct default values', () => {
			arrayFields.forEach((f) => expect(f?.defaultValue?.()).toEqual([]));
		});
	});

	describe('Special Fields', () => {
		const tagsField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'tags');
		const colorField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'color');
		const ratingField = ADVANCED_FORM_FIELDS.find((f) => f.type === 'rating');

		it('has tags field with proper configuration', () => {
			expect(tagsField?.metadata?.supportsMultiple).toBe(true);
			expect(tagsField?.metadata?.supportsSearch).toBe(true);
			expect(tagsField?.validator?.(['tag1'], {})).toBeUndefined();
			expect(tagsField?.validator?.([], { required: true })).toBeDefined();
			expect(tagsField?.formatter?.(['tag1', 'tag2'])).toBe('tag1, tag2');
			expect(tagsField?.parser?.('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('validates and handles color field', () => {
			expect(colorField?.validator?.('#FF0000', {})).toBeUndefined();
			expect(colorField?.validator?.('invalid-color', {})).toBeDefined();
			expect(colorField?.defaultValue?.()).toBe('#000000');
		});

		it('validates and formats rating field', () => {
			expect(ratingField?.validator?.(3, {})).toBeUndefined();
			expect(ratingField?.validator?.(6, {})).toBeDefined();
			expect(ratingField?.validator?.(-1, {})).toBeDefined();
			expect(ratingField?.formatter?.(3)).toBe('3/5');
			expect(ratingField?.parser?.('3.5')).toBe(3.5);
		});
	});

	describe('Metadata and Functions', () => {
		const validCategories = ['text', 'numeric', 'boolean', 'date', 'structured', 'geometric', 'network', 'media', 'special', 'other'];
		const validWidths = ['full', 'half', 'third', 'quarter'];

		it('has consistent metadata', () => {
			ADVANCED_FORM_FIELDS.forEach((field) => {
				expect(typeof field.metadata?.name).toBe('string');
				expect(typeof field.metadata?.description).toBe('string');
				expect(validCategories).toContain(field.metadata?.category);
				if (field.metadata?.width) {
					expect(validWidths).toContain(field.metadata.width);
				}
			});
		});

		it('handles null/undefined gracefully', () => {
			ADVANCED_FORM_FIELDS.forEach((field) => {
				expect(() => field.formatter(null)).not.toThrow();
				expect(() => field.formatter(undefined)).not.toThrow();
				expect(() => field.validator(null, {})).not.toThrow();
				expect(() => field.validator(undefined, {})).not.toThrow();
			});
		});
	});
});
