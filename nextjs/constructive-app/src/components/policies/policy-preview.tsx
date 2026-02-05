import { Fragment, useMemo } from 'react';

import { cn } from '@/lib/utils';

import {
	getMembershipTypeLabel,
	POLICY_TYPE_SCHEMAS,
	type PreviewVar,
	type PreviewVarKind,
	type PolicyTypeId,
} from './template-schema';

interface PolicyPreviewProps {
	policyTypeId: PolicyTypeId;
	data: Record<string, unknown>;
	className?: string;
}

type PreviewSegment =
	| { type: 'text'; value: string }
	| { type: 'placeholder'; value: string; kind: PreviewVarKind; filled: boolean };

const KIND_LABELS: Record<PreviewVarKind, string> = {
	field: 'field',
	fields: 'fields',
	table: 'table',
	membership: 'scope',
	permission: 'permission',
	access: 'access type',
};

function formatValue(name: string, kind: PreviewVarKind, value: unknown, data: Record<string, unknown>): string {
	if (value === null || value === undefined || value === '') return '';

	if (kind === 'membership' && typeof value === 'number') {
		return getMembershipTypeLabel(value);
	}

	if (kind === 'access') {
		if (value === true) return 'admin';
		return '';
	}

	if (Array.isArray(value)) {
		const filtered = value.filter((v) => v !== null && v !== undefined && v !== '');
		if (filtered.length === 0) return '';
		return filtered.join(', ');
	}

	return String(value);
}

function parsePreviewTemplate(template: string, vars: PreviewVar[], data: Record<string, unknown>): PreviewSegment[] {
	const segments: PreviewSegment[] = [];
	const varMap = new Map(vars.map((v) => [v.name, v]));
	let remaining = template;

	while (remaining.length > 0) {
		const match = remaining.match(/\{(\w+)\}/);

		if (!match) {
			if (remaining) segments.push({ type: 'text', value: remaining });
			break;
		}

		if (match.index! > 0) {
			segments.push({ type: 'text', value: remaining.slice(0, match.index) });
		}

		const [fullMatch, varName] = match;
		const varDef = varMap.get(varName);
		const value = data[varName];
		const formattedValue = varDef ? formatValue(varName, varDef.kind, value, data) : '';
		const filled = formattedValue !== '';

		segments.push({
			type: 'placeholder',
			value: filled ? formattedValue : KIND_LABELS[varDef?.kind ?? 'field'],
			kind: varDef?.kind ?? 'field',
			filled,
		});

		remaining = remaining.slice(match.index! + fullMatch.length);
	}

	for (const varDef of vars) {
		if (varDef.optional && varDef.suffix) {
			const value = data[varDef.name];
			const formattedValue = formatValue(varDef.name, varDef.kind, value, data);
			const filled = formattedValue !== '';

			if (filled) {
				const parts = varDef.suffix.split('{value}');
				if (parts[0]) segments.push({ type: 'text', value: parts[0] });
				segments.push({
					type: 'placeholder',
					value: formattedValue,
					kind: varDef.kind,
					filled: true,
				});
				if (parts[1]) segments.push({ type: 'text', value: parts[1] });
			}
		}
	}

	return segments;
}

export function PolicyPreview({ policyTypeId, data, className }: PolicyPreviewProps) {
	const policyTypeSchema = POLICY_TYPE_SCHEMAS[policyTypeId];

	const segments = useMemo(() => {
		if (!policyTypeSchema?.preview) return [];
		return parsePreviewTemplate(policyTypeSchema.preview.policyType, policyTypeSchema.preview.vars, data);
	}, [policyTypeSchema, data]);

	if (!policyTypeSchema?.preview) return null;

	return (
		<div className={cn('bg-muted/30 rounded-lg border px-4 py-3', className)}>
			<p className='text-muted-foreground mb-1.5 text-xs font-medium'>Live Preview</p>
			<p className='text-sm leading-relaxed'>
				{segments.map((segment, index) => (
					<Fragment key={index}>
						{segment.type === 'text' ? (
							segment.value
						) : (
							<span
								className={cn(
									'mx-0.5 rounded px-1.5 py-0.5 font-medium',
									segment.filled
										? 'bg-primary/10 text-primary'
										: 'bg-muted text-muted-foreground/80 border border-dashed font-normal',
								)}
							>
								{segment.value}
							</span>
						)}
					</Fragment>
				))}
				.
			</p>
		</div>
	);
}
