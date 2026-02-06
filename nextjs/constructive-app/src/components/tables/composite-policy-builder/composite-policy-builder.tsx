'use client';

import { useCallback, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { useCardStack, type CardId } from '@constructive-io/ui/stack';
import { Settings } from 'lucide-react';

import { ConditionBuilder } from '@/components/policies/condition-builder/condition-builder';
import type { ConditionGroupNode, ConditionLeafNode } from '@/components/policies/condition-builder/types';

import { getDefaultFormValues } from '../policy-hooks';
import type { MergedPolicyType } from '../policy-types';
import { CompositeConditionEditCard, type CompositeConditionEditCardProps } from './composite-condition-edit-card';
import { createNewCompositeCondition, type CompositeConditionData, type CompositePolicyData } from './types';

interface CompositePolicyBuilderProps {
	value: CompositePolicyData;
	onChange: (value: CompositePolicyData) => void;
	policyTypes: MergedPolicyType[];
	disabled?: boolean;
}

/**
 * Recursively update a leaf node's data in the condition tree.
 */
function updateConditionData(
	root: CompositePolicyData,
	leafId: string,
	newData: CompositeConditionData,
): CompositePolicyData {
	const updateNode = (
		node: ConditionGroupNode<CompositeConditionData> | ConditionLeafNode<CompositeConditionData>,
	): ConditionGroupNode<CompositeConditionData> | ConditionLeafNode<CompositeConditionData> => {
		if (node.type === 'condition') {
			if (node.id === leafId) {
				return { ...node, data: newData };
			}
			return node;
		}
		return {
			...node,
			children: node.children.map(updateNode),
		};
	};

	return updateNode(root) as CompositePolicyData;
}

/**
 * Wrapper around the existing ConditionBuilder for composite policy configuration.
 * Uses the NEW policy types from policy-config.ts (not the old template-schema.ts).
 */
export function CompositePolicyBuilder({ value, onChange, policyTypes, disabled }: CompositePolicyBuilderProps) {
	const stack = useCardStack();
	const [editCardId, setEditCardId] = useState<CardId | null>(null);

	// Filter out composite policy type (no nesting allowed)
	const availablePolicyTypes = policyTypes.filter((pt) => pt.name !== 'AuthzComposite');

	// Default policy type for new conditions
	const defaultPolicyType = availablePolicyTypes[0]?.name ?? 'AuthzDirectOwner';

	// Get default data for the default policy type
	const defaultPolicyTypeObj = availablePolicyTypes.find((pt) => pt.name === defaultPolicyType);
	const defaultPolicyData = defaultPolicyTypeObj ? getDefaultFormValues(defaultPolicyTypeObj) : {};

	// Ensure value has valid structure - create default if not initialized
	const safeValue: CompositePolicyData =
		value?.type === 'group' && Array.isArray(value?.children)
			? value
			: {
					id: crypto.randomUUID(),
					type: 'group',
					operator: 'AND',
					children: [createNewCompositeCondition(defaultPolicyType, defaultPolicyData)],
				};

	// Factory function for creating new conditions
	const getNewCondition = useCallback((): ConditionLeafNode<CompositeConditionData> => {
		const policyType = availablePolicyTypes.find((pt) => pt.name === defaultPolicyType);
		const defaultData = policyType ? getDefaultFormValues(policyType) : {};
		return createNewCompositeCondition(defaultPolicyType, defaultData);
	}, [availablePolicyTypes, defaultPolicyType]);

	// Handle policy type change in a leaf
	const handlePolicyTypeChange = useCallback(
		(leafId: string, newPolicyType: string) => {
			const policyType = availablePolicyTypes.find((pt) => pt.name === newPolicyType);
			const defaultData = policyType ? getDefaultFormValues(policyType) : {};
			const updatedRoot = updateConditionData(safeValue, leafId, {
				policyType: newPolicyType,
				data: defaultData,
			});
			onChange(updatedRoot);
		},
		[safeValue, availablePolicyTypes, onChange],
	);

	// Handle opening edit card for a condition
	const handleEditCondition = useCallback(
		(leafId: string, leafData: CompositeConditionData) => {
			const policyType = availablePolicyTypes.find((pt) => pt.name === leafData.policyType);
			if (!policyType) return;

			// Close existing edit card if open
			if (editCardId && stack.has(editCardId)) {
				stack.dismiss(editCardId);
			}

			const pushedId = stack.push({
				id: `edit-composite-condition-${leafId}`,
				title: 'Edit Condition',
				Component: CompositeConditionEditCard,
				props: {
					policyType,
					policyData: leafData.data,
					onSave: (newPolicyData: Record<string, unknown>) => {
						const updatedRoot = updateConditionData(safeValue, leafId, {
							...leafData,
							data: newPolicyData,
						});
						onChange(updatedRoot);
					},
				} satisfies CompositeConditionEditCardProps,
				onClose: () => setEditCardId(null),
				width: 420,
			});

			setEditCardId(pushedId);
		},
		[safeValue, availablePolicyTypes, editCardId, stack, onChange],
	);

	// Render function for each leaf condition
	const renderCondition = useCallback(
		(leaf: ConditionLeafNode<CompositeConditionData>) => {
			const policyType = availablePolicyTypes.find((pt) => pt.name === leaf.data.policyType);
			const PolicyIcon = policyType?.icon;

			return (
				<div className='flex flex-1 items-center gap-1'>
					{/* Policy Type Selector */}
					<Select
						value={leaf.data.policyType}
						onValueChange={(newType) => handlePolicyTypeChange(leaf.id, newType)}
						disabled={disabled}
					>
						<SelectTrigger className='bg-background h-8 w-fit rounded-lg text-xs'>
							<SelectValue>
								{policyType && (
									<span className='flex items-center gap-2'>
										{PolicyIcon && <PolicyIcon className='text-muted-foreground size-4 shrink-0' />}
										{policyType.title}
									</span>
								)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className='max-h-60'>
							{availablePolicyTypes.map((pt) => {
								const Icon = pt.icon;
								return (
									<SelectItem key={pt.name} value={pt.name}>
										<span className='flex items-center gap-2'>
											<Icon className='text-muted-foreground size-4 shrink-0' />
											{pt.title}
										</span>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>

					{/* Config Button */}
					<button
						type='button'
						onClick={() => handleEditCondition(leaf.id, leaf.data)}
						disabled={disabled}
						className='text-muted-foreground/80 hover:text-foreground flex h-6 w-6 shrink-0 cursor-pointer items-center
							justify-center transition-colors disabled:pointer-events-none disabled:opacity-50'
					>
						<Settings className='size-4' />
					</button>
				</div>
			);
		},
		[availablePolicyTypes, handlePolicyTypeChange, handleEditCondition, disabled],
	);

	// Wrap onChange to cast ConditionGroupNode to CompositePolicyData
	const handleChange = useCallback(
		(newValue: ConditionGroupNode<CompositeConditionData>) => {
			onChange(newValue as CompositePolicyData);
		},
		[onChange],
	);

	return (
		<div className='overflow-x-auto rounded-lg border'>
			<ConditionBuilder<CompositeConditionData>
				value={safeValue}
				onChange={handleChange}
				getNewCondition={getNewCondition}
				renderCondition={renderCondition}
			/>
		</div>
	);
}
