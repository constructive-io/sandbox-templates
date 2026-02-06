'use client';

import { Check, GitBranch, GitMerge, Network } from 'lucide-react';

import type { RelationshipType } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface RelationshipTypeSelectorProps {
	value: RelationshipType;
	onChange: (type: RelationshipType) => void;
	disabled?: boolean;
}

interface TypeOption {
	type: RelationshipType;
	icon: typeof GitMerge;
	title: string;
	subtitle: string;
	description: string;
	example: string;
	colors: {
		iconBg: string;
		iconText: string;
		selectedBorder: string;
		selectedBg: string;
		checkBg: string;
	};
}

const TYPE_OPTIONS: TypeOption[] = [
	{
		type: 'one-to-one',
		icon: GitMerge,
		title: 'One-to-One',
		subtitle: 'Exactly one each',
		description: 'Each record in the table with foreign key references exactly one record in the referenced table.',
		example: 'A user profile references exactly one user. The profile table has the foreign key.',
		colors: {
			iconBg: 'bg-purple-500/10',
			iconText: 'text-purple-400',
			selectedBorder: 'border-purple-500',
			selectedBg: 'bg-purple-500/5',
			checkBg: 'bg-purple-500',
		},
	},
	{
		type: 'one-to-many',
		icon: GitBranch,
		title: 'One-to-Many',
		subtitle: 'One has many',
		description: 'Each record in this table can be referenced by multiple records in the other table.',
		example: 'One customer can have many orders. The orders table has the foreign key.',
		colors: {
			iconBg: 'bg-blue-500/10',
			iconText: 'text-blue-400',
			selectedBorder: 'border-blue-500',
			selectedBg: 'bg-blue-500/5',
			checkBg: 'bg-blue-500',
		},
	},
	{
		type: 'many-to-many',
		icon: Network,
		title: 'Many-to-Many',
		subtitle: 'Junction table',
		description: 'Records in both tables can reference each other through a junction table with foreign keys to both.',
		example: 'Students enroll in courses via an enrollments junction table with foreign keys to both.',
		colors: {
			iconBg: 'bg-amber-500/10',
			iconText: 'text-amber-400',
			selectedBorder: 'border-amber-500',
			selectedBg: 'bg-amber-500/5',
			checkBg: 'bg-amber-500',
		},
	},
];

export function RelationshipTypeSelector({ value, onChange, disabled }: RelationshipTypeSelectorProps) {
	const selectedOption = TYPE_OPTIONS.find((opt) => opt.type === value) || TYPE_OPTIONS[1];

	return (
		<div className='space-y-3'>
			<label className='text-sm font-medium'>Relationship Type</label>

			<div className='mt-2 flex gap-3'>
				{TYPE_OPTIONS.map((option) => {
					const Icon = option.icon;
					const isSelected = value === option.type;

					return (
						<button
							key={option.type}
							type='button'
							onClick={() => onChange(option.type)}
							disabled={disabled}
							className={cn(
								'border-border relative flex-1 rounded-lg border p-4 text-left transition-all',
								'disabled:pointer-events-none disabled:opacity-50',
								isSelected
									? [option.colors.selectedBorder, option.colors.selectedBg]
									: 'hover:border-border/80 hover:bg-muted/30',
							)}
						>
							{isSelected && (
								<div className='absolute top-3 right-3'>
									<div className={cn('flex h-5 w-5 items-center justify-center rounded-full', option.colors.checkBg)}>
										<Check className='h-3 w-3 text-white' strokeWidth={3} />
									</div>
								</div>
							)}

							<div className='space-y-2.5'>
								<div className='flex items-start gap-2 pr-6'>
									<div
										className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', option.colors.iconBg)}
									>
										<Icon className={cn('h-5 w-5', option.colors.iconText)} />
									</div>
									<div className='min-w-0 flex-1'>
										<h3 className='text-sm leading-tight font-semibold'>{option.title}</h3>
										<p className={cn('text-muted-foreground mt-0.5 text-xs', isSelected && option.colors.iconText)}>
											{option.subtitle}
										</p>
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{/* Description text below cards */}
			<div className='text-muted-foreground space-y-1 text-center text-xs'>
				<p>{selectedOption.description}</p>
				<p className='text-muted-foreground/60 italic'>Example: {selectedOption.example}</p>
			</div>
		</div>
	);
}
