// AppSpec v1 as TypeScript, plus the two values every reader of a spec shares.
// `app-spec.schema.json` is the source of truth for the shape. This file
// imports nothing, so the desktop vendors it as is (`pnpm sync:app-spec`) and
// types its own AppSpec code from it.

export type SpecFieldType =
	| 'text'
	| 'long_text'
	| 'integer'
	| 'decimal'
	| 'money'
	| 'boolean'
	| 'date'
	| 'timestamp'
	| 'email'
	| 'url'
	| 'uuid'
	| 'json';

export type SpecField = {
	name: string;
	type: SpecFieldType;
	required?: boolean;
	default?: unknown;
	enum?: string[];
	label?: string;
};

export type SpecBelongsTo = { field: string; to: string; onDelete?: 'cascade' | 'set_null' | 'restrict'; label?: string };

export type SpecEntity = {
	name: string;
	label?: string;
	access?: 'shared' | 'private';
	fields: SpecField[];
	belongsTo?: SpecBelongsTo[];
};

export type SpecLink = { name?: string; between: [string, string] };

/** Additions to a curated blueprint: new tables, new columns and keys on its tables, new links. */
export type BackendExtend = {
	entities?: SpecEntity[];
	fields?: Record<string, SpecField[]>;
	belongsTo?: Record<string, SpecBelongsTo[]>;
	links?: SpecLink[];
};

export type FilterValue = string | number | boolean | null;

export type DashboardTileSpec =
	| { kind: 'count'; resource: string; label?: string; filters?: Record<string, FilterValue> }
	| { kind: 'recent'; resource: string; limit?: number; label?: string };

/** The signed-in user's id, filled in by the app on create. */
export const CURRENT_USER_ID = '$currentUserId';

/** How a form edits a field. */
export type FieldInput =
	| 'text'
	| 'textarea'
	| 'email'
	| 'url'
	| 'number'
	| 'integer'
	| 'currency'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'time'
	| 'select'
	| 'relation'
	| 'json'
	| 'uuid';

export type FieldUiSpec = {
	label?: string;
	/** Help text under the input. */
	description?: string;
	/** Allowed values; the field becomes a select. */
	options?: string[];
	hidden?: boolean;
	input?: FieldInput;
	/** Overrides `_meta`, e.g. false for a column a trigger fills. */
	required?: boolean;
	/** `$currentUserId` or a literal sent on create when the form has none. */
	default?: FilterValue;
};

export type ResourceUiSpec = {
	label?: string;
	singular?: string;
	icon?: string;
	titleField?: string;
	columns?: string[];
	formFields?: string[];
	hidden?: boolean;
	fields?: Record<string, FieldUiSpec>;
};

export type AppSpec = {
	version: 1;
	name: string;
	tagline?: string;
	backend:
		| { kind: 'blueprint'; slug: string; extend?: BackendExtend }
		| { kind: 'custom'; entities: SpecEntity[]; links?: SpecLink[] };
	seed?: Record<string, Array<Record<string, unknown>>>;
	ui?: {
		nav?: string[];
		resources?: Record<string, ResourceUiSpec>;
		dashboard?: { tiles: DashboardTileSpec[] };
	};
};

/** Key used to match names across spellings: `volunteer_shifts` ≡ `volunteerShifts` ≡ `volunteer-shifts`. */
export function normalizeKey(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
