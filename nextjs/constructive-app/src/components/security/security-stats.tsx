'use client';

import { CheckCircle, Shield, Users, XCircle } from 'lucide-react';

import { Card } from '@constructive-io/ui/card';

interface SecurityStatsProps {
  activePolicies: number;
  disabledPolicies: number;
  appPermissions: number;
  membershipPermissions: number;
}

export function SecurityStats({
  activePolicies,
  disabledPolicies,
  appPermissions,
  membershipPermissions,
}: SecurityStatsProps) {
  const stats = [
    {
      label: 'Policies Active',
      value: activePolicies,
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Policies Disabled',
      value: disabledPolicies,
      icon: XCircle,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'App Permissions',
      value: appPermissions,
      icon: Shield,
      iconColor: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
    },
    {
      label: 'Membership Permissions',
      value: membershipPermissions,
      icon: Users,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
