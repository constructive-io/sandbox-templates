'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ExternalLink } from 'lucide-react';
import { RiGlobalLine } from '@remixicon/react';

import { useHealthCheck } from '@/hooks/use-health-check';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis';
import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { buildDomainHref, buildDomainLabel } from '@/components/services/services.utils';

interface ServicesListProps {
	services: DatabaseService[];
	orgId: string;
	databaseId: string;
	onNavigate?: () => void;
}

export function ServicesList({ services, orgId, databaseId, onNavigate }: ServicesListProps) {
	const servicesPath = `/orgs/${orgId}/databases/${databaseId}/services` as Route;

	return (
		<div className='space-y-2'>
			{services.map((service) => (
				<ServiceItem
					key={service.id}
					service={service}
					servicesPath={servicesPath}
					onNavigate={onNavigate}
				/>
			))}
		</div>
	);
}

interface ServiceItemProps {
	service: DatabaseService;
	servicesPath: Route;
	onNavigate?: () => void;
}

function ServiceItem({ service, servicesPath, onNavigate }: ServiceItemProps) {
	const firstDomain = service.domains?.nodes?.[0] ?? null;
	const baseHref = firstDomain ? buildDomainHref(firstDomain.domain, firstDomain.subdomain) : null;
	const endpoint = baseHref ? `${baseHref.replace(/\/$/, '')}/graphql` : null;
	const domainLabel = firstDomain ? buildDomainLabel(firstDomain) : null;

	const { status } = useHealthCheck({ endpoint, enabled: !!endpoint });
	const statusLabel =
		status === 'online'
			? 'Online'
			: status === 'offline'
				? 'Offline'
				: status === 'checking'
					? 'Checking status'
					: 'Status unknown';
	const indicatorClass = cn(
		'h-2 w-2 shrink-0 rounded-full',
		status === 'online' && 'bg-emerald-500',
		status === 'offline' && 'bg-destructive',
		status === 'checking' && 'bg-amber-400 animate-pulse',
		status === 'idle' && 'bg-muted-foreground/40',
	);

	// Services are now org-scoped at /orgs/[orgId]/databases/[databaseId]/services
	// This component shows service info without linking to a global services page
	return (
		<div
			className='group border-border/60 bg-accent/50 flex items-center gap-2.5 rounded-lg border px-2.5 py-2'
			role='listitem'
		>
			<div
				className='from-primary/10 to-primary/5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md
					bg-gradient-to-br'
			>
				<RiGlobalLine className='text-primary h-3.5 w-3.5' />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='flex items-center gap-1.5'>
					{domainLabel ? (
						<span className='truncate text-sm leading-tight font-medium'>{domainLabel}</span>
					) : (
						<span className='text-muted-foreground truncate text-sm leading-tight font-medium'>No domain</span>
					)}
					{service.isPublic && (
						<span
							className='bg-primary/15 text-primary inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5
								text-[9px] leading-none font-semibold uppercase'
						>
							Public
						</span>
					)}
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<div className={indicatorClass} title={statusLabel} aria-hidden='true' />
				<span className='sr-only'>{statusLabel}</span>
				<Button
					variant='ghost'
					size='icon'
					className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
					asChild
				>
					<Link href={servicesPath} onClick={onNavigate}>
						<ExternalLink className='h-3.5 w-3.5' />
						<span className='sr-only'>View service details</span>
					</Link>
				</Button>
			</div>
		</div>
	);
}
