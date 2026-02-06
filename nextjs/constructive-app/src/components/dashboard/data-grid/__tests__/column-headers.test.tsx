/**
 * Column Headers Tests - Consolidated icon mapping and title formatting
 */
import { GridColumnIcon } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

function getCellTypeIcon(cellType: string | undefined): GridColumnIcon {
	switch (cellType) {
		case 'text': case 'textarea': case 'citext': case 'bpchar': case 'uuid': case 'tsvector': case 'origin': case 'unknown':
			return GridColumnIcon.HeaderString;
		case 'integer': case 'smallint': case 'number': case 'decimal': case 'currency':
			return GridColumnIcon.HeaderNumber;
		case 'boolean': case 'bit':
			return GridColumnIcon.HeaderBoolean;
		case 'image': case 'upload':
			return GridColumnIcon.HeaderImage;
		case 'url': case 'email':
			return GridColumnIcon.HeaderUri;
		case 'text-array': case 'uuid-array': case 'number-array': case 'integer-array': case 'date-array': case 'array':
			return GridColumnIcon.HeaderArray;
		case 'json': case 'jsonb':
			return GridColumnIcon.HeaderCode;
		case 'relation':
			return GridColumnIcon.HeaderRowID;
		default:
			return GridColumnIcon.HeaderString;
	}
}

describe('Column Headers', () => {
	describe('getCellTypeIcon', () => {
		const iconMappings = [
			['text', GridColumnIcon.HeaderString],
			['textarea', GridColumnIcon.HeaderString],
			['uuid', GridColumnIcon.HeaderString],
			['integer', GridColumnIcon.HeaderNumber],
			['number', GridColumnIcon.HeaderNumber],
			['currency', GridColumnIcon.HeaderNumber],
			['boolean', GridColumnIcon.HeaderBoolean],
			['image', GridColumnIcon.HeaderImage],
			['url', GridColumnIcon.HeaderUri],
			['email', GridColumnIcon.HeaderUri],
			['text-array', GridColumnIcon.HeaderArray],
			['json', GridColumnIcon.HeaderCode],
			['jsonb', GridColumnIcon.HeaderCode],
			['relation', GridColumnIcon.HeaderRowID],
			['unknown-type', GridColumnIcon.HeaderString], // Fallback
			[undefined, GridColumnIcon.HeaderString], // Fallback
		] as const;

		it.each(iconMappings)('%s → correct icon', (cellType, expected) => {
			expect(getCellTypeIcon(cellType)).toBe(expected);
		});
	});

	describe('Title formatting', () => {
		const typePriorityCases = [
			[{ pgAlias: 'text', pgType: 'varchar', gqlType: 'String' }, 'text'],
			[{ pgAlias: null, pgType: 'varchar', gqlType: 'String' }, 'varchar'],
			[{ pgAlias: null, pgType: null, gqlType: 'String' }, 'String'],
		] as const;

		it.each(typePriorityCases)('type priority: %j → %s', (type, expected) => {
			const info = type.pgAlias || type.pgType || type.gqlType;
			expect(info).toBe(expected);
		});
	});
});
