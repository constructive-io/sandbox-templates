import {
	getAllFormFields,
	getFormFieldCoverageStats,
	getFormFieldsByCategory,
	validateFormFieldCoverage,
} from './complete-form-fields';
import { ADVANCED_FORM_FIELDS } from './advanced-form-fields';
import { DEFAULT_FORM_FIELDS } from './default-form-fields';

const MANUAL_FIELD_TYPES = new Set<string>(DEFAULT_FORM_FIELDS.map((field) => field.type));
const ADVANCED_FIELD_TYPES = new Set<string>(ADVANCED_FORM_FIELDS.map((field) => field.type));

/**
 * Generate a comprehensive coverage report comparing form fields to cell registry
 */
export function generateCoverageReport(): string {
	const coverage = validateFormFieldCoverage();
	const stats = getFormFieldCoverageStats();
	const categories = getFormFieldsByCategory();
	const allFormFields = getAllFormFields();

	let report = '';
	report += '='.repeat(80) + '\n';
	report += 'FORM FIELD COVERAGE REPORT\n';
	report += '='.repeat(80) + '\n\n';

	// Overall Statistics
	report += '📊 OVERALL STATISTICS\n';
	report += '-'.repeat(40) + '\n';
	report += `Total Cell Types: ${stats.totalCellTypes}\n`;
	report += `Covered Types: ${stats.coveredTypes}\n`;
	report += `Coverage: ${stats.coveragePercentage}%\n`;
	report += `Status: ${coverage.isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n\n`;

	// Coverage by Source
	report += '📈 COVERAGE BY SOURCE\n';
	report += '-'.repeat(40) + '\n';
	report += `Manual Form Fields: ${stats.fieldsBySource.manual}\n`;
	report += `Advanced Form Fields: ${stats.fieldsBySource.advanced}\n`;
	report += `Specialized Form Fields: ${stats.fieldsBySource.specialized}\n`;
	report += `Bridged from Cell Registry: ${stats.fieldsBySource.bridged}\n`;
	report += `Total Form Fields: ${allFormFields.length}\n\n`;

	// Missing Types (if any)
	if (stats.missingTypes.length > 0) {
		report += '❌ MISSING TYPES\n';
		report += '-'.repeat(40) + '\n';
		stats.missingTypes.forEach((type) => {
			report += `- ${type}\n`;
		});
		report += '\n';
	}

	// Coverage by Category
	report += '📂 COVERAGE BY CATEGORY\n';
	report += '-'.repeat(40) + '\n';
	Object.entries(categories).forEach(([category, fields]) => {
		report += `${category.toUpperCase()}: ${fields.length} types\n`;
		fields.forEach((field) => {
			const source = getFieldSource(field.type);
			report += `  - ${field.type} (${field.metadata?.name || 'Unknown'}) [${source}]\n`;
		});
		report += '\n';
	});

	// Validation Errors (if any)
	if (coverage.errors.length > 0) {
		report += '🚫 VALIDATION ERRORS\n';
		report += '-'.repeat(40) + '\n';
		coverage.errors.forEach((error) => {
			report += `- ${error}\n`;
		});
		report += '\n';
	}

	// Summary
	report += '📋 SUMMARY\n';
	report += '-'.repeat(40) + '\n';
	if (coverage.isComplete) {
		report += '✅ Form field coverage is COMPLETE!\n';
		report += '✅ All cell types have corresponding form field implementations.\n';
		report += '✅ The form builder can handle any data type from your database.\n';
	} else {
		report += '❌ Form field coverage is INCOMPLETE!\n';
		report += `❌ ${stats.missingTypes.length} cell types are missing form implementations.\n`;
		report += '⚠️  Some database fields may not be editable in forms.\n';
	}

	report += '\n' + '='.repeat(80) + '\n';
	report += 'END OF REPORT\n';
	report += '='.repeat(80) + '\n';

	return report;
}

/**
 * Determine the source of a form field type
 */
function getFieldSource(type: string): string {
	if (ADVANCED_FIELD_TYPES.has(type)) {
		return 'Advanced';
	}
	if (MANUAL_FIELD_TYPES.has(type)) {
		return 'Manual';
	}
	if (['geometry', 'geometry-point', 'geometry-collection', 'relation'].includes(type)) {
		return 'Specialized';
	}
	return 'Bridged';
}

/**
 * Print coverage report to console
 */
export function printCoverageReport(): void {
	console.log(generateCoverageReport());
}

/**
 * Get coverage summary for quick checks
 */
export function getCoverageSummary(): {
	isComplete: boolean;
	percentage: number;
	totalTypes: number;
	missingCount: number;
	message: string;
} {
	const coverage = validateFormFieldCoverage();
	const stats = getFormFieldCoverageStats();

	return {
		isComplete: coverage.isComplete,
		percentage: stats.coveragePercentage,
		totalTypes: stats.totalCellTypes,
		missingCount: stats.missingTypes.length,
		message: coverage.isComplete
			? `✅ Complete: ${stats.coveredTypes}/${stats.totalCellTypes} types covered (${stats.coveragePercentage}%)`
			: `❌ Incomplete: ${stats.coveredTypes}/${stats.totalCellTypes} types covered (${stats.coveragePercentage}%), ${stats.missingTypes.length} missing`,
	};
}
