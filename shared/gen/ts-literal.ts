// Deterministic TypeScript literals for generated source: single quotes, tab
// indentation, short values kept on one line.

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const INLINE_WIDTH = 100;

/** Marks a value that is written verbatim, e.g. `db.contact`. */
export class Code {
	readonly source: string;
	constructor(source: string) {
		this.source = source;
	}
}

export const code = (source: string) => new Code(source);

const ESCAPES: Record<string, string> = {
	'\\': '\\\\',
	"'": "\\'",
	'\n': '\\n',
	'\r': '\\r',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029',
};

/** A single-quoted TS string literal; safe for any input, including line separators. */
export function quote(value: string): string {
	return `'${value.replace(/[\\'\n\r\u2028\u2029]/g, (char) => ESCAPES[char])}'`;
}

function key(name: string): string {
	return IDENTIFIER.test(name) ? name : quote(name);
}

function inline(value: unknown): string {
	if (value instanceof Code) return value.source;
	if (typeof value === 'string') return quote(value);
	if (value === null || typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return `[${value.map(inline).join(', ')}]`;
	const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
	if (entries.length === 0) return '{}';
	return `{ ${entries.map(([k, v]) => `${key(k)}: ${inline(v)}`).join(', ')} }`;
}

/** Renders `value` as a TS expression starting at indentation `depth`. */
export function tsLiteral(value: unknown, depth = 0): string {
	const flat = inline(value);
	const isContainer = Array.isArray(value) || (typeof value === 'object' && value !== null && !(value instanceof Code));
	if (!isContainer || flat.length + depth * 2 <= INLINE_WIDTH) return flat;
	const pad = '\t'.repeat(depth + 1);
	const close = '\t'.repeat(depth);
	if (Array.isArray(value)) {
		return `[\n${value.map((item) => `${pad}${tsLiteral(item, depth + 1)},`).join('\n')}\n${close}]`;
	}
	const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
	return `{\n${entries.map(([k, v]) => `${pad}${key(k)}: ${tsLiteral(v, depth + 1)},`).join('\n')}\n${close}}`;
}
