// Naming helpers shared by the IR and the emitters. Every name the generator
// writes is derived from `_meta` (inflection, query.all, field names) through
// these functions; nothing is pluralized by hand.

export function lcFirst(value: string): string {
	return value ? value[0].toLowerCase() + value.slice(1) : value;
}

export function ucFirst(value: string): string {
	return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** Splits camelCase, PascalCase, snake_case and kebab-case into lower-case words. */
export function words(value: string): string[] {
	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.split(/[\s_\-.]+/)
		.filter(Boolean)
		.map((word) => word.toLowerCase());
}

/** `volunteerShifts` → `volunteer-shifts` */
export function kebabCase(value: string): string {
	return words(value).join('-');
}

/** `volunteer_shifts` → `volunteerShifts` */
export function camelCase(value: string): string {
	const parts = words(value);
	return parts.map((word, index) => (index === 0 ? word : ucFirst(word))).join('');
}

/** `building-2` → `Building2` */
export function pascalCase(value: string): string {
	return words(value).map(ucFirst).join('');
}

/** `entryDate` → `ENTRY_DATE`, the shape of a PostGraphile orderBy enum value. */
export function constantCase(value: string): string {
	return words(value)
		.map((word) => word.toUpperCase())
		.join('_');
}

/** `closeDate` → `Close date`. Sentence case, like the blocks UI. */
export function humanize(value: string): string {
	const text = words(value).join(' ');
	return ucFirst(text);
}

/** Key used to match names across spellings: `volunteer_shifts` ≡ `volunteerShifts` ≡ `volunteer-shifts`. */
export function normalizeKey(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** A valid JS identifier for a generated binding (route segments can start with a digit). */
export function identifier(value: string): string {
	const name = camelCase(value) || 'resource';
	return /^[0-9]/.test(name) ? `_${name}` : name;
}
