'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { RiAlertLine, RiArrowUpLine } from '@remixicon/react';

import { detectSchemaContextFromPath } from '@/lib/runtime/config-core';
import { useDashboardContext } from '@/components/dashboard/dashboard-context-selector';
import { DashboardForgotPasswordForm } from '@/components/auth/dashboard-forgot-password-form';
import { DashboardLoginForm } from '@/components/auth/dashboard-login-form';
import { DashboardRegisterForm } from '@/components/auth/dashboard-register-form';
import { DashboardResetPasswordForm } from '@/components/auth/dashboard-reset-password-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

import { AuthScreenHeader, type AuthBrandingProps } from './auth-screen-header';
import { AuthScreenLayout } from './auth-screen-layout';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const AUTH_CONTENT: Record<AuthMode, { title: string; description: string }> = {
	login: {
		title: 'Welcome back',
		description: 'Sign in to your account',
	},
	register: {
		title: 'Create an account',
		description: 'Get started with your free account',
	},
	forgot: {
		title: 'Reset your password',
		description: "We'll send you a password reset link",
	},
	reset: {
		title: 'Set a new password',
		description: 'Enter your new password below',
	},
} as const;

export type AuthEmbeddedProps = AuthBrandingProps;

export function AuthEmbedded({ logo, appName, showLogo = false }: AuthEmbeddedProps = {}) {
	return (
		<Suspense
			fallback={
				<div data-testid='auth-embedded' className='h-full w-full flex-1'>
					<AuthScreenLayout fill='parent' showLogo={false}>
						<div className='text-muted-foreground text-center text-sm'>Loading...</div>
					</AuthScreenLayout>
				</div>
			}
		>
			<AuthEmbeddedContent logo={logo} appName={appName} showLogo={showLogo} />
		</Suspense>
	);
}

type AuthEmbeddedContentProps = AuthBrandingProps;

function AuthEmbeddedContent({ logo, appName, showLogo = false }: AuthEmbeddedContentProps) {
	const pathname = usePathname();
	const search = useSearchParams();
	const resetToken = search?.get('reset_token') || search?.get('token') || '';
	const roleId = search?.get('role_id') || '';
	const initialMode: AuthMode = resetToken ? 'reset' : 'login';
	const [mode, setMode] = useState<AuthMode>(initialMode);
	const schemaContext = detectSchemaContextFromPath(pathname);
	const isDashboardContext = schemaContext === 'dashboard';

	// Get dashboard context for error handling and database selection state
	const dashboardContext = useDashboardContext();
	const { servicesError, noDatabaseSelected, currentDatabase } = dashboardContext;

	useEffect(() => {
		if (resetToken) setMode('reset');
	}, [resetToken]);

	const { title, description } = AUTH_CONTENT[mode];
	const computedDescription =
		isDashboardContext && currentDatabase
			? `Sign in to ${currentDatabase.label || currentDatabase.name}`
			: description;

	// Show helpful message when no database is selected in dashboard context
	const showNoDatabaseMessage = isDashboardContext && noDatabaseSelected;

	return (
		<div data-testid='auth-embedded' className='h-full w-full flex-1'>
			<AuthScreenLayout fill='parent' logo={logo} appName={appName} showLogo={showLogo}>
				<AuthScreenHeader title={title} description={computedDescription} logo={logo} appName={appName} showLogo={showLogo} />

				{/* No database selected message - dashboard context only */}
				{showNoDatabaseMessage && (
					<div
						data-testid='auth-no-database-message'
						className='bg-muted/50 border-border/60 flex items-center gap-3 rounded-lg border px-4 py-3'
					>
						<div className='bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
							<RiArrowUpLine className='text-primary h-4 w-4' />
						</div>
						<p className='text-muted-foreground text-sm leading-snug'>Select a database from the topbar to continue</p>
					</div>
				)}

				{/* Services error message */}
				{servicesError && (
					<div
						data-testid='auth-embedded-services-error'
						className='bg-destructive/10 border-destructive/20 flex items-center gap-3 rounded-lg border px-4 py-3'
					>
						<div className='bg-destructive/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
							<RiAlertLine className='text-destructive h-4 w-4' />
						</div>
						<p className='text-destructive text-sm leading-snug'>{servicesError.message}</p>
					</div>
				)}

				{/* Auth form - forms include their own mode switching links */}
				<div>
					{mode === 'login' && (
						isDashboardContext ? (
							<DashboardLoginForm onShowForgot={() => setMode('forgot')} onShowRegister={() => setMode('register')} />
						) : (
							<LoginForm onShowForgot={() => setMode('forgot')} onShowRegister={() => setMode('register')} />
						)
					)}
					{mode === 'register' &&
						(isDashboardContext ? (
							<DashboardRegisterForm onShowLogin={() => setMode('login')} />
						) : (
							<RegisterForm onShowLogin={() => setMode('login')} />
						))}
					{mode === 'forgot' &&
						(isDashboardContext ? (
							<DashboardForgotPasswordForm onShowLogin={() => setMode('login')} />
						) : (
							<ForgotPasswordForm onShowLogin={() => setMode('login')} />
						))}
					{mode === 'reset' &&
						(isDashboardContext ? (
							<DashboardResetPasswordForm resetToken={resetToken} roleId={roleId} onShowLogin={() => setMode('login')} />
						) : (
							<ResetPasswordForm resetToken={resetToken} roleId={roleId} onShowLogin={() => setMode('login')} />
						))}
				</div>
			</AuthScreenLayout>
		</div>
	);
}
