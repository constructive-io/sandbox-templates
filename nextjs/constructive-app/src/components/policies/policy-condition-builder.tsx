import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { Label } from '@constructive-io/ui/label';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';

import { ConditionBuilder } from './condition-builder/condition-builder';
import type { ConditionGroupNode, ConditionLeafNode } from './condition-builder/types';
import type { PolicyConditionData, PolicyTypeKey } from './policies.types';
import { updateConditionData } from './policies.utils';
import { PolicyDiagram } from './policy-diagram';
import { TemplateFieldsRenderer, type FieldOption, type FieldCreationContext } from './template-fields';
import type { PolicyFieldType } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import { CONDITION_BUILDER_POLICY_TYPES, getDefaultData, type PolicyTypeId } from './template-schema';

function PolicyTypeDisplay({ policyTypeId }: { policyTypeId: string }) {
	const policyType = CONDITION_BUILDER_POLICY_TYPES.find((p) => p.id === policyTypeId);
	if (!policyType) return null;
	const Icon = policyType.icon;
	return (
		<span className='flex items-center gap-2'>
			<Icon className='text-muted-foreground h-4 w-4 shrink-0' />
			{policyType.label}
		</span>
	);
}

type PolicyConditionBuilderProps = {
	conditionRoot: ConditionGroupNode<PolicyConditionData>;
	onConditionRootChange: (root: ConditionGroupNode<PolicyConditionData>) => void;
	createNewCondition: () => ConditionLeafNode<PolicyConditionData>;
	fields: FieldOption[];
	tables: PolicyTableData[];
	onCreateTable?: () => void;
	onCreateField?: (fieldType: PolicyFieldType, context?: FieldCreationContext) => void;
	fieldCreationContext?: FieldCreationContext;
	fieldDrawerOpen?: boolean;
};

export function PolicyConditionBuilder({
	conditionRoot,
	onConditionRootChange,
	createNewCondition,
	fields,
	tables,
	onCreateTable,
	onCreateField,
	fieldCreationContext,
	fieldDrawerOpen,
}: PolicyConditionBuilderProps) {
	return (
		<div className='overflow-x-auto rounded-lg border'>
			<div className='min-w-[700px]'>
				<ConditionBuilder<PolicyConditionData>
					value={conditionRoot}
					onChange={onConditionRootChange}
					getNewCondition={createNewCondition}
					renderCondition={(leaf: ConditionLeafNode<PolicyConditionData>) => {
							const policyTypeId = leaf.data.policyType as PolicyTypeId;

							return (
								<div className='flex flex-1 items-center gap-2'>
									<Label className='text-muted-foreground shrink-0 text-xs'>Policy Type:</Label>
									<Select
										value={leaf.data.policyType}
										onValueChange={(value) => {
											const newPolicyTypeId = value as PolicyTypeId;
											const updatedRoot = updateConditionData(conditionRoot, leaf.id, {
												policyType: value,
												data: getDefaultData(newPolicyTypeId),
											});
											onConditionRootChange(updatedRoot);
										}}
									>
									<SelectTrigger className='bg-background h-8 w-fit rounded-lg text-xs'>
										<SelectValue>
											<PolicyTypeDisplay policyTypeId={leaf.data.policyType} />
										</SelectValue>
									</SelectTrigger>
								<SelectContent>
									{CONDITION_BUILDER_POLICY_TYPES.map((policyTypeItem) => {
										const Icon = policyTypeItem.icon;
										return (
											<Tooltip key={policyTypeItem.id} delayDuration={300}>
												<TooltipTrigger asChild>
													<SelectItem value={policyTypeItem.id}>
														<span className='flex items-center gap-2'>
															<Icon className='text-muted-foreground h-4 w-4 shrink-0' />
															{policyTypeItem.label}
														</span>
													</SelectItem>
												</TooltipTrigger>
												<TooltipContent side='right' sideOffset={12} className='hidden w-fit max-w-none p-0 md:block'>
													<div className='max-w-[320px] space-y-3 p-3 shadow-xl'>
														<div className='space-y-1'>
															<p className='text-sm font-semibold'>{policyTypeItem.label}</p>
															<p className='text-muted-foreground text-xs'>{policyTypeItem.description}</p>
															<p className='text-muted-foreground text-xs italic'>{policyTypeItem.explanation}</p>
														</div>
														<ResponsiveDiagram className='rounded-md border-0 p-2'>
															<PolicyDiagram policyType={policyTypeItem.id as PolicyTypeKey} tableName='Table' />
														</ResponsiveDiagram>
													</div>
												</TooltipContent>
											</Tooltip>
										);
									})}
								</SelectContent>
								</Select>

								<TemplateFieldsRenderer
									key={`condition-${leaf.id}-${fieldDrawerOpen ? 'drawer-open' : 'drawer-closed'}`}
									policyTypeId={policyTypeId}
									data={leaf.data.data}
									onChange={(newData) => {
										const updatedRoot = updateConditionData(conditionRoot, leaf.id, {
											...leaf.data,
											data: newData,
										});
										onConditionRootChange(updatedRoot);
									}}
									variant='compact'
									fields={fields}
									tables={tables}
									onCreateTable={onCreateTable}
									onCreateField={onCreateField}
									fieldCreationContext={fieldCreationContext}
								/>
							</div>
						);
					}}
				/>
			</div>
		</div>
	);
}
