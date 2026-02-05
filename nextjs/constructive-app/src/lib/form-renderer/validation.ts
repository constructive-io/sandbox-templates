import type { UINodeConstraints } from '@/lib/form-builder';

export function validateField(
	value: unknown,
	constraints?: UINodeConstraints,
	required?: boolean,
): string | null {
	const strValue = value == null ? '' : String(value);
	const isEmpty = strValue.trim() === '';

	if (required && isEmpty) {
		return 'This field is required';
	}

	if (isEmpty) return null;

	if (constraints?.minLength != null && strValue.length < constraints.minLength) {
		return `Minimum ${constraints.minLength} characters required`;
	}

	if (constraints?.maxLength != null && strValue.length > constraints.maxLength) {
		return `Maximum ${constraints.maxLength} characters allowed`;
	}

	if (constraints?.minValue != null && typeof value === 'number' && value < constraints.minValue) {
		return `Minimum value is ${constraints.minValue}`;
	}

	if (constraints?.maxValue != null && typeof value === 'number' && value > constraints.maxValue) {
		return `Maximum value is ${constraints.maxValue}`;
	}

	if (constraints?.pattern) {
		try {
			const regex = new RegExp(constraints.pattern);
			if (!regex.test(strValue)) {
				return 'Invalid format';
			}
		} catch {
			// Invalid regex pattern, skip validation
		}
	}

	return null;
}
