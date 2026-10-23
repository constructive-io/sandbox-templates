// Naming helpers shared by the IR and the emitters. Every name the generator
// writes is derived from `_meta` (inflection, query.all, field names) through
// these functions; nothing is pluralized by hand.

export function lcFirst(value: string): string {
	return value ? value[0].toLowerCase() + value.slice(1) : value;
}

export function ucFirst(value: string): string {
	return value ? value[0].toUpperCase() + value.slice(1) : value;
}

const SEPARATORS = /[\s_\-.]+/;

const splitCamel = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

/** Splits camelCase, PascalCase, snake_case and kebab-case into lower-case words. */
export function words(value: string): string[] {
	return splitCamel(value)
		.split(SEPARATORS)
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

const CAPITALS = /^[A-Z0-9]*[A-Z][A-Z0-9]*$/;

// An option value's words as written. A run of capitals and digits is one word, so `4XL` and `P1` keep together.
const optionWords = (value: string) =>
	value
		.split(SEPARATORS)
		.filter(Boolean)
		.flatMap((part) => (CAPITALS.test(part) ? [part] : splitCamel(part).split(' ')));

// A code: capitals with at most three letters (`XS`, `USD`, `VIP`, `ID`, `A`) or no vowel (`XXXL`).
const isCode = (word: string) => CAPITALS.test(word) && (word.replace(/[^A-Z]/g, '').length <= 3 || !/[AEIOU]/.test(word));

/**
 * Labels for a column's allowed values, in sentence case like `humanize`, except that a code keeps
 * its capitals: `XS`, `XXL`, `USD`. A set written as constants (`OPEN`, `IN_PROGRESS`, `LOW`) uses
 * capitals as style, so it reads `Open`, `In progress`, `Low`: no lowercase anywhere and a word
 * that isn't a code mark it, as in a GraphQL enum (`LOW`, `MEDIUM`, `HIGH`).
 */
export function optionLabels(values: readonly string[]): string[] {
	const split = values.map(optionWords);
	const constants = values.every((value) => !/[a-z]/.test(value)) && split.flat().some((word) => CAPITALS.test(word) && !isCode(word));
	return split.map((parts) => ucFirst(parts.map((word) => (!constants && isCode(word) ? word : word.toLowerCase())).join(' ')));
}

export { normalizeKey } from './app-spec.types.ts';

/** A valid JS identifier for a generated binding (route segments can start with a digit). */
export function identifier(value: string): string {
	const name = camelCase(value) || 'resource';
	return /^[0-9]/.test(name) ? `_${name}` : name;
}
