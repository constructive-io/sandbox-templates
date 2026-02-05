'use client';

import { useMemo } from 'react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { Badge } from '@constructive-io/ui/badge';
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
} from '@constructive-io/ui/combobox';

export interface SchemaPickerProps {
	selectedSchema: string;
	onSchemaChange: (schema: string) => void;
}

export function SchemaPicker({ selectedSchema, onSchemaChange }: SchemaPickerProps) {
	// Get schema state from selectors
	const { availableSchemas, isCustomSchema } = useSchemaBuilderSelectors();

	// Transform schemas data for combobox
	const comboboxData = useMemo(
		() =>
			availableSchemas.map((schema) => ({
				label: schema.name,
				value: schema.key,
			})),
		[availableSchemas],
	);

	const selectedSchemaOption = comboboxData.find((o) => o.value === selectedSchema) ?? null;

	const currentSchemaInfo = availableSchemas.find((s) => s.key === selectedSchema);

	return (
		<div className='bg-card flex flex-col gap-4 sm:flex-row'>
			<div className='flex-1'>
				<Combobox
					items={comboboxData}
					value={selectedSchemaOption}
					onValueChange={(next) => {
						if (next) onSchemaChange(next.value);
					}}
				>
					<ComboboxInput placeholder='Select a schema template...' />
					{currentSchemaInfo && (
						<div className='text-muted-foreground mt-1 text-xs'>
							{currentSchemaInfo.nodeCount} tables • {currentSchemaInfo.edgeCount} relationships
						</div>
					)}
					<ComboboxPopup>
						<ComboboxEmpty>No schemas found.</ComboboxEmpty>
						<ComboboxList>
							{(option: (typeof comboboxData)[number]) => {
								const schema = availableSchemas.find((s) => s.key === option.value);
								if (!schema) return null;

								return (
									<ComboboxItem key={option.value} value={option}>
										<div className='flex w-full items-center gap-2'>
											<div className='min-w-0 flex-1'>
												<div className='truncate font-medium'>{schema.name}</div>
												<div className='text-muted-foreground text-xs'>
													{schema.nodeCount} tables • {schema.edgeCount} relationships
												</div>
											</div>
											<div className='flex shrink-0 items-center gap-1'>
												{isCustomSchema(schema.key) && (
													<Badge variant='secondary' className='text-xs'>
														Custom
													</Badge>
												)}
												<Badge variant='outline' className='shrink-0'>
													{schema.category}
												</Badge>
											</div>
									</div>
								</ComboboxItem>
								);
							}}
						</ComboboxList>
					</ComboboxPopup>
				</Combobox>
			</div>
		</div>
	);
}
