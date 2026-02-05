'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { RiLoader4Line, RiSettings4Line } from '@remixicon/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useMounted } from '@/hooks/use-mounted';
import { TokenManager } from '@/lib/auth/token-manager';
import { getDefaultEndpoint } from '@/lib/runtime/config-core';
import { cn } from '@/lib/utils';
import { useEnv, useEnvActions } from '@/store/app-store';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@constructive-io/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { getAuthHeaders } from '@/graphql/execute';

type ConnectionStatus = {
	type: 'success' | 'warning' | 'error';
	message: string;
} | null;

function isValidUrl(value: string): boolean {
	try {
		const u = new URL(value);
		return Boolean(u.protocol && u.host);
	} catch {
		return false;
	}
}

/**
 * Dialog for configuring the Schema Builder GraphQL endpoint.
 *
 * Note: Dashboard endpoint is managed dynamically via database API selection
 * or Direct Connect, not through this dialog.
 */
export interface RuntimeEndpointsDialogProps {
	/** Optional custom trigger element (e.g. a DropdownMenuItem) */
	trigger?: ReactNode | null;
	/** Control the open state externally */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
}

export function RuntimeEndpointsDialog({ trigger, open: controlledOpen, onOpenChange }: RuntimeEndpointsDialogProps) {
	const mounted = useMounted();
	const qc = useQueryClient();
	const env = useEnv();
	const envActions = useEnvActions();
	// Internal open state (used when not controlled)
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = (value: boolean) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.(value);
	};
	const [schemaBuilder, setSchemaBuilder] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [testing, setTesting] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(null);
	const effectiveSchema = env.getEffectiveEndpoint('schema-builder');

	useEffect(() => {
		if (!open) return;
		// On open, populate with current override from store (or effective value)
		setSchemaBuilder(env.endpointOverrides['schema-builder'] ?? effectiveSchema ?? '');
		setError(null);
		setConnectionStatus(null);
	}, [open, effectiveSchema, env]);

	const onReset = () => {
		setSchemaBuilder(getDefaultEndpoint('schema-builder') ?? '');
		setConnectionStatus(null);
	};

	const onSave = async () => {
		if (!isValidUrl(schemaBuilder)) {
			setError('Invalid URL');
			return;
		}

		// Persist override (store exact value if different from default)
		envActions.setEndpointOverride(
			'schema-builder',
			schemaBuilder === getDefaultEndpoint('schema-builder') ? null : schemaBuilder,
		);

		// Clear tokens and query caches so new endpoint is used cleanly
		TokenManager.clearToken('schema-builder');
		await qc.clear();

		toast.success('Schema Builder endpoint updated');
		setOpen(false);
	};

	const testConnection = async (url: string) => {
		setTesting(true);
		setConnectionStatus(null);

		try {
			const headers = {
				'Content-Type': 'application/json',
				Accept: 'application/graphql-response+json',
				...getAuthHeaders('schema-builder'),
			} as Record<string, string>;
			const res = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify({ query: 'query __Test { __typename }' }),
			});
			if (!res.ok) {
				if (res.status === 401) {
					setConnectionStatus({ type: 'warning', message: 'Online (auth required)' });
					return;
				}
				setConnectionStatus({ type: 'error', message: 'Offline' });
				return;
			}
			const json: any = await res.json().catch(() => undefined);
			if (json?.data) {
				setConnectionStatus({ type: 'success', message: 'Online' });
			} else if (json?.errors) {
				const msg = String(json.errors[0]?.message || '').toLowerCase();
				if (msg.includes('auth')) {
					setConnectionStatus({ type: 'warning', message: 'Online (auth required)' });
				} else {
					setConnectionStatus({ type: 'warning', message: 'Online (with errors)' });
				}
			} else {
				setConnectionStatus({ type: 'success', message: 'Online' });
			}
		} catch (e: any) {
			setConnectionStatus({ type: 'error', message: 'Offline' });
		} finally {
			setTesting(false);
		}
	};

	const defaultTrigger = (
		<button
			type="button"
			className={cn(
				'group/item flex h-10 w-full items-center gap-3 rounded-lg px-3',
				'text-sidebar-foreground/70 transition-colors duration-150',
				'hover:text-sidebar-foreground hover:bg-sidebar-accent',
			)}
		>
			<RiSettings4Line className='h-5 w-5 shrink-0 text-sidebar-foreground/60' aria-hidden={true} />
			<span className='truncate text-sm font-medium whitespace-nowrap'>
				Settings
			</span>
		</button>
	);

	const triggerNode = trigger === undefined ? defaultTrigger : trigger;

	// Render a placeholder during SSR to avoid hydration mismatch with Radix IDs
	if (!mounted) {
		return triggerNode ? <>{triggerNode}</> : null;
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{triggerNode ? <SheetTrigger asChild>{triggerNode}</SheetTrigger> : null}
			<SheetContent side='right' className='w-[340px] sm:w-[420px] flex flex-col gap-0 p-0'>
				<SheetHeader className='px-4 py-3 border-b border-border/50 space-y-1'>
					<SheetTitle className='flex items-center gap-2 text-base'>
						<RiSettings4Line className='h-4 w-4 text-muted-foreground' aria-hidden={true} />
						Schema Builder Endpoint
					</SheetTitle>
					<SheetDescription className='text-xs'>
						Override the Schema Builder GraphQL endpoint (stored locally in this browser)
					</SheetDescription>
				</SheetHeader>

				<div className='flex-1 overflow-y-auto'>
					<div className='p-4 space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='schema-endpoint'>Schema Builder endpoint</Label>
							<div className='relative'>
								<Input
									id='schema-endpoint'
									value={schemaBuilder}
									onChange={(e) => {
										setSchemaBuilder(e.target.value);
										setConnectionStatus(null);
										setError(null);
									}}
									placeholder={getDefaultEndpoint('schema-builder') ?? undefined}
									spellCheck={false}
									autoComplete='off'
									className='pr-8'
								/>
								{connectionStatus && (
									<Tooltip delayDuration={400}>
										<TooltipTrigger asChild>
											<span
												aria-label={connectionStatus.message}
												className={cn(
													'pointer-events-auto absolute top-1/2 right-2.5 h-2.5 w-2.5 -translate-y-1/2 cursor-help rounded-full',
													connectionStatus.type === 'success' &&
														'bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500/.7)]',
													connectionStatus.type === 'warning' &&
														'bg-amber-500 shadow-[0_0_8px_theme(colors.amber.500/.7)]',
													connectionStatus.type === 'error' &&
														'bg-red-500 shadow-[0_0_8px_theme(colors.red.500/.7)]',
												)}
											/>
										</TooltipTrigger>
										<TooltipContent side='top' align='center'>
											<p className='text-xs'>{connectionStatus.message}</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
							{error ? <p className='text-destructive text-sm'>{error}</p> : null}
							<div className='flex gap-2'>
								<Button variant='outline' size='sm' type='button' onClick={onReset}>
									Reset to default
								</Button>
								<span className='text-muted-foreground self-center text-xs'>Current: {effectiveSchema}</span>
							</div>
						</div>

						<p className='text-muted-foreground text-xs'>
							<strong>Note:</strong> Dashboard endpoint is managed via database API selection or Direct Connect.
						</p>
					</div>
				</div>

				<div className='border-t border-border/50 p-3 flex gap-2'>
					<Button variant='outline' className='flex-1' onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						variant='secondary'
						type='button'
						className='flex-1'
						disabled={!schemaBuilder.trim() || testing}
						onClick={() => testConnection(schemaBuilder || effectiveSchema || '')}
					>
						{testing ? (
							<>
								<RiLoader4Line className='mr-2 h-4 w-4 animate-spin' />
								Testing...
							</>
						) : (
							'Test Connection'
						)}
					</Button>
					<Button className='flex-1' onClick={onSave}>
						Save
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
