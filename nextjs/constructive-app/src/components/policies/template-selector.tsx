import { Card } from '@constructive-io/ui/card';

import { POLICY_TYPE_LIST } from './template-schema';

const nonAstPolicyTypes = POLICY_TYPE_LIST.filter((policyType) => policyType.astNode !== null || policyType.id !== 'ast');

type PolicyTypeSelectorProps = {
	activePolicyType: string;
	onPolicyTypeChange: (policyType: string) => void;
};

export function PolicyTypeSelector({ activePolicyType, onPolicyTypeChange }: PolicyTypeSelectorProps) {
	return (
		<div className='grid gap-2 sm:grid-cols-3'>
			{nonAstPolicyTypes.map((policyType) => {
					const isActive = activePolicyType === policyType.id;
					return (
						<Card
							key={policyType.id}
							onClick={() => onPolicyTypeChange(policyType.id)}
							className={
								`hover:border-primary/60 hover:bg-primary/5 flex cursor-pointer flex-col items-start gap-1.5 border px-4
								py-3.5 text-left text-xs transition-all hover:shadow-md sm:text-sm ` +
								(isActive
									? 'border-primary bg-primary/10 shadow-primary/10 ring-primary/20 shadow-md ring-1'
									: 'border-border/50 shadow-sm')
							}
						>
							<span className='text-foreground text-xs leading-snug font-semibold sm:text-sm'>{policyType.label}</span>
							<span className='text-muted-foreground text-[11px] leading-relaxed sm:text-xs'>{policyType.description}</span>
						</Card>
					);
				})}
		</div>
	);
}
