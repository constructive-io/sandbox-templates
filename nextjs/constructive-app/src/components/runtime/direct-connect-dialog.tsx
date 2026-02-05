'use client';

import { useEffect, useState } from 'react';
import { RiCheckLine, RiCloseLine, RiLink, RiLinkUnlink, RiLoader4Line } from '@remixicon/react';
import { toast } from 'sonner';

import { useMounted } from '@/hooks/use-mounted';
import { validateEndpointUrl } from '@/lib/runtime/direct-connect';
import { useDirectConnect, useDirectConnectActions } from '@/store/app-store';
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
import { Switch } from '@constructive-io/ui/switch';

interface DirectConnectDialogProps {
	/** Custom trigger element. If not provided, uses a default button. */
	trigger?: React.ReactNode | null;
	/** Control the open state externally */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
}

/**
 * Sheet for configuring Direct Connect mode.
 *
 * This is a DASHBOARD-SPECIFIC feature. Direct Connect only affects the dashboard/CRM
 * context and does NOT impact the schema-builder or any other part of the application.
 *
 * Allows users to:
 * - Configure a custom GraphQL endpoint for the dashboard
 * - Toggle whether to skip authentication (for public/admin endpoints)
 * - Test connection to the endpoint
 *
 * Connection is active when a valid endpoint is saved and tested.
 * When skipAuth is enabled, no Authorization headers are sent.
 */
export function DirectConnectDialog({ trigger, open: controlledOpen, onOpenChange }: DirectConnectDialogProps) {
	const mounted = useMounted();
	const { isEnabled, endpoint, skipAuth } = useDirectConnect('dashboard');
	const { setDirectConnect, clearDirectConnect } = useDirectConnectActions();

	// Internal open state (used when not controlled)
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = (value: boolean) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.(value);
	};

	// Local form state
	const [endpointInput, setEndpointInput] = useState('');
	const [skipAuthInput, setSkipAuthInput] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [testing, setTesting] = useState(false);
	const [testSuccess, setTestSuccess] = useState(false);

	// Sync form state when sheet opens
	useEffect(() => {
		if (open) {
			setEndpointInput(endpoint ?? '');
			setSkipAuthInput(skipAuth);
			setError(null);
			setTestSuccess(isEnabled); // Show as tested if already connected
		}
	}, [open, isEnabled, endpoint, skipAuth]);

	const handleTest = async () => {
		if (!endpointInput.trim()) {
			setError('Enter an endpoint URL');
			return;
		}

		const validationError = validateEndpointUrl(endpointInput);
		if (validationError) {
			setError(validationError);
			return;
		}

		setTesting(true);
		setError(null);
		setTestSuccess(false);

		try {
			const res = await fetch(endpointInput.trim(), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/graphql-response+json',
				},
				body: JSON.stringify({ query: '{ __typename }' }),
			});

			if (res.status === 401) {
				if (skipAuthInput) {
					setError('Requires auth (401). Disable "Skip Auth" to send credentials.');
				} else {
					setError('Auth failed (401). Check your credentials.');
				}
			} else if (!res.ok) {
				setError(`HTTP ${res.status}: ${res.statusText}`);
			} else {
				const json = await res.json().catch(() => null);
				if (json?.errors?.length) {
					const errMsg = json.errors[0]?.message || 'GraphQL error';
					if (errMsg.toLowerCase().includes('auth')) {
						setError(`Auth required: ${errMsg}`);
					} else {
						toast.warning('Connected with warnings', { description: errMsg });
						setTestSuccess(true);
					}
				} else {
					setTestSuccess(true);
					toast.success('Connection verified');
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Connection failed');
		} finally {
			setTesting(false);
		}
	};

	const handleConnect = () => {
		if (!endpointInput.trim()) {
			setError('Endpoint URL required');
			return;
		}
		const validationError = validateEndpointUrl(endpointInput);
		if (validationError) {
			setError(validationError);
			return;
		}
		if (!testSuccess) {
			setError('Test connection before connecting');
			return;
		}
		setDirectConnect('dashboard', {
			enabled: true,
			endpoint: endpointInput.trim(),
			skipAuth: skipAuthInput,
		});
		toast.success('Direct Connect enabled', {
			description: skipAuthInput ? 'Using endpoint without auth' : 'Using endpoint with auth',
		});
		setOpen(false);
	};

	const handleDisconnect = () => {
		clearDirectConnect('dashboard');
		setEndpointInput('');
		setTestSuccess(false);
		toast.success('Direct Connect disabled');
		setOpen(false);
	};

	// Render a placeholder during SSR
	if (!mounted) {
		return trigger ?? (
			<Button variant='ghost' size='sm'>
				<RiLink className='mr-2 h-4 w-4' />
				Direct Connect
			</Button>
		);
	}

	const triggerNode =
		trigger === undefined ? (
			<Button variant='ghost' size='sm'>
				<RiLink className='mr-2 h-4 w-4' />
				Direct Connect
			</Button>
		) : (
			trigger
		);

	const hasEndpoint = endpointInput.trim().length > 0;
	const canConnect = hasEndpoint && testSuccess;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{triggerNode ? <SheetTrigger asChild>{triggerNode}</SheetTrigger> : null}
			<SheetContent side='right' className='w-[340px] sm:w-[380px] flex flex-col gap-0 p-0'>
				{/* Header */}
				<SheetHeader className='px-4 py-3 border-b border-border/50 space-y-1'>
					<SheetTitle className='flex items-center gap-2 text-base'>
						{isEnabled ? (
							<RiLink className='h-4 w-4 text-blue-500' />
						) : (
							<RiLinkUnlink className='h-4 w-4 text-muted-foreground' />
						)}
						Direct Connect
						{isEnabled && (
							<span className='ml-auto text-[10px] font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded'>
								Active
							</span>
						)}
					</SheetTitle>
					<SheetDescription className='text-xs'>
						Override dashboard endpoint for testing or external APIs
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className='flex-1 overflow-y-auto'>
					<div className='p-4 space-y-4'>
						{/* Scope notice */}
						<p className='text-[11px] text-muted-foreground leading-relaxed'>
							Affects <span className='font-medium text-foreground/80'>Dashboard only</span>. Schema Builder unaffected. Resets on refresh.
						</p>

						{/* Endpoint URL */}
						<div className='flex flex-col space-y-1'>
							<Label htmlFor='endpoint-url' className='text-xs font-medium'>
								GraphQL Endpoint
							</Label>
							<div className='relative'>
								<Input
									id='endpoint-url'
									value={endpointInput}
									onChange={(e) => {
										setEndpointInput(e.target.value);
										setError(null);
										setTestSuccess(false);
									}}
									placeholder='https://api.example.com/graphql'
									spellCheck={false}
									autoComplete='off'
									className={`h-9 text-sm font-mono pr-8 ${
										error ? 'border-destructive focus-visible:ring-destructive/30' :
										testSuccess ? 'border-emerald-500/60 focus-visible:ring-emerald-500/30' : ''
									}`}
								/>
								{testSuccess && (
									<RiCheckLine className='absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500' />
								)}
							</div>
							{error && (
								<p className='text-[11px] text-destructive flex items-start gap-1.5'>
									<RiCloseLine className='h-3.5 w-3.5 mt-0.5 shrink-0' />
									<span>{error}</span>
								</p>
							)}
						</div>

						{/* Auth toggle */}
						<div className='flex items-center justify-between py-2.5 px-3 rounded-md border border-border/50 bg-muted/30'>
							<div className='space-y-0.5'>
								<Label htmlFor='skip-auth' className='text-xs font-medium cursor-pointer'>
									Skip Authentication
								</Label>
								<p className='text-[10px] text-muted-foreground'>
									{skipAuthInput ? 'No auth headers sent' : 'Send auth if available'}
								</p>
							</div>
							<Switch
								id='skip-auth'
								checked={skipAuthInput}
								onCheckedChange={(checked) => {
									setSkipAuthInput(checked);
									setTestSuccess(false); // Re-test needed when auth changes
								}}
							/>
						</div>

						{/* Test button */}
						<Button
							variant='outline'
							size='sm'
							onClick={handleTest}
							disabled={testing || !hasEndpoint}
							className='w-full h-8 text-xs'
						>
							{testing ? (
								<>
									<RiLoader4Line className='mr-1.5 h-3.5 w-3.5 animate-spin' />
									Testing...
								</>
							) : testSuccess ? (
								<>
									<RiCheckLine className='mr-1.5 h-3.5 w-3.5 text-emerald-500' />
									Connection Verified
								</>
							) : (
								'Test Connection'
							)}
						</Button>
					</div>
				</div>

				{/* Footer */}
				<div className='border-t border-border/50 p-3 flex gap-2'>
					{isEnabled ? (
						<>
							<Button
								variant='outline'
								size='sm'
								onClick={handleDisconnect}
								className='flex-1 h-8 text-xs text-destructive hover:text-destructive'
							>
								Disconnect
							</Button>
							<Button
								size='sm'
								onClick={handleConnect}
								disabled={!canConnect}
								className='flex-1 h-8 text-xs'
							>
								Update
							</Button>
						</>
					) : (
						<>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setOpen(false)}
								className='flex-1 h-8 text-xs'
							>
								Cancel
							</Button>
							<Button
								size='sm'
								onClick={handleConnect}
								disabled={!canConnect}
								className='flex-1 h-8 text-xs'
							>
								Connect
							</Button>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
