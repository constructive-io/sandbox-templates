'use client';

import { Card } from '@constructive-io/ui/card';
import { CheckCircle, Shield, Table2 } from 'lucide-react';

interface SecurityStatsProps {
	tablesProtected: number;
	totalTables: number;
	activePolicies: number;
	totalPermissions: number;
}

export function SecurityStats({ tablesProtected, totalTables, activePolicies, totalPermissions }: SecurityStatsProps) {
	const stats = [
		{
			label: 'Tables Protected',
			value: tablesProtected,
			subLabel: `of ${totalTables} tables`,
			icon: Table2,
			iconColor: 'text-emerald-500',
			bgColor: 'bg-emerald-500/10',
		},
		{
			label: 'Policies Active',
			value: activePolicies,
			subLabel: 'across all tables',
			icon: CheckCircle,
			iconColor: 'text-sky-500',
			bgColor: 'bg-sky-500/10',
		},
		{
			label: 'Permissions Defined',
			value: totalPermissions,
			subLabel: 'app & membership',
			icon: Shield,
			iconColor: 'text-violet-500',
			bgColor: 'bg-violet-500/10',
		},
	];

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
			{stats.map((stat) => (
				<Card key={stat.label} className='flex flex-row items-center gap-3 p-6 shadow-none'>
					<div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
						<stat.icon className={`size-5 ${stat.iconColor}`} />
					</div>
					<div className='text-left'>
						<p className='text-foreground text-2xl font-bold'>{stat.value}</p>
						<p className='text-muted-foreground text-xs'>{stat.label}</p>
					</div>
				</Card>
			))}
		</div>
	);
}
