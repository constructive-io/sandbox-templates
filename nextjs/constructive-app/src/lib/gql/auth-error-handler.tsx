'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RiLockLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { TokenManager } from '@/lib/auth/token-manager';

import { DataError, DataErrorType, parseError } from './error-handler';

// ============================================================================
// Types
// ============================================================================

export interface AuthErrorConfig {
	/** Countdown duration in seconds before redirect */
	countdownSeconds?: number;
	/** Redirect path after countdown */
	redirectPath?: Route;
	/** Custom message to display */
	message?: string;
}

// ============================================================================
// Auth Error Detection
// ============================================================================

/**
 * Check if an error is an authentication error that requires redirect
 */
export function isAuthError(error: unknown): boolean {
	const dataError = error instanceof DataError ? error : parseError(error);
	return dataError.type === DataErrorType.UNAUTHORIZED;
}

/**
 * Check if an error message indicates authentication is required
 */
export function isAuthRequiredMessage(message: string): boolean {
	const lowerMessage = message.toLowerCase();
	return (
		lowerMessage.includes('authentication required') ||
		lowerMessage.includes('please log in') ||
		lowerMessage.includes('unauthorized') ||
		lowerMessage.includes('session expired') ||
		lowerMessage.includes('token expired')
	);
}

// ============================================================================
// Auth Error Banner Component
// ============================================================================

interface AuthErrorBannerProps {
	error: Error | DataError;
	config?: AuthErrorConfig;
	className?: string;
	/** Schema context for targeted auth clearing (defaults to 'schema-builder') */
	context?: 'schema-builder' | 'dashboard';
	/** Dashboard scope (databaseId) for scoped dashboard auth clearing */
	dashboardScope?: string | null;
}

/**
 * Auth error banner with countdown and auto-redirect
 *
 * Displays a countdown timer and automatically:
 * 1. Clears auth state for the specified context only
 * 2. Clears token from TokenManager for that context
 * 3. Invalidates React Query caches for that context
 * 4. Redirects to root route
 *
 * Context-aware: Only clears auth for the context that had the error.
 * - schema-builder errors: Clear schema-builder auth only
 * - dashboard errors: Clear dashboard auth for the specific scope only
 */
export function AuthErrorBanner({
	error,
	config = {},
	className,
	context = 'schema-builder',
	dashboardScope,
}: AuthErrorBannerProps) {
	const {
		countdownSeconds = 5,
		redirectPath = '/',
		message,
	} = config;

	const router = useRouter();
	const queryClient = useQueryClient();
	const setUnauthenticated = useAppStore((state) => state.setUnauthenticated);

	const [countdown, setCountdown] = useState(countdownSeconds);
	const [isRedirecting, setIsRedirecting] = useState(false);

	const clearAuthAndRedirect = useCallback(() => {
		setIsRedirecting(true);

		// Clear auth state for the specific context only (context-aware)
		if (context === 'dashboard') {
			// Dashboard: clear auth for the specific scope
			setUnauthenticated('dashboard', dashboardScope ?? undefined);
			TokenManager.clearToken('dashboard', dashboardScope ?? undefined);
		} else {
			// Schema-builder: clear schema-builder auth only
			setUnauthenticated('schema-builder');
			TokenManager.clearToken('schema-builder');
		}

		// Invalidate React Query caches (keep it broad for simplicity)
		queryClient.clear();

		// Redirect to root
		router.push(redirectPath);
	}, [setUnauthenticated, queryClient, router, redirectPath, context, dashboardScope]);

	useEffect(() => {
		if (countdown <= 0) {
			clearAuthAndRedirect();
			return;
		}

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown, clearAuthAndRedirect]);

	const dataError = error instanceof DataError ? error : parseError(error);
	const displayMessage = message || dataError.getUserMessage();

	return (
		<div
			className={cn(
				'rounded-lg border overflow-hidden',
				'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/50',
				className
			)}
		>
			<div className='flex items-center gap-4 px-4 py-3'>
				{/* Icon */}
			<div className='flex h-9 w-9 items-center justify-center rounded-md shrink-0 bg-amber-100 dark:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/50'>
					<RiLockLine className='h-4.5 w-4.5 text-amber-600 dark:text-amber-400' />
				</div>

				{/* Content */}
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-medium text-foreground'>Session Expired</p>
					<p className='text-xs text-muted-foreground'>{displayMessage}</p>
				</div>

				{/* Countdown */}
				<div className='flex items-center gap-2 shrink-0'>
					{isRedirecting ? (
						<span className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
							Redirecting...
						</span>
					) : (
						<>
							<span className='text-xs text-muted-foreground'>
								Redirecting in
							</span>
						<span className='flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/50 text-sm font-semibold text-amber-700 dark:text-amber-300'>
								{countdown}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Progress bar */}
			<div className='h-1 bg-amber-100 dark:bg-amber-900/30'>
				<div
					className='h-full bg-amber-500 dark:bg-amber-400 transition-all duration-1000 ease-linear'
					style={{
						width: `${((countdownSeconds - countdown) / countdownSeconds) * 100}%`,
					}}
				/>
			</div>
		</div>
	);
}

// ============================================================================
// Hook for Auth Error Handling
// ============================================================================

interface UseAuthErrorHandlerOptions {
	error: Error | null;
	countdownSeconds?: number;
	redirectPath?: string;
}

interface UseAuthErrorHandlerResult {
	isAuthError: boolean;
	shouldShowAuthBanner: boolean;
}

/**
 * Hook to detect auth errors and determine if auth banner should be shown
 */
export function useAuthErrorHandler(options: UseAuthErrorHandlerOptions): UseAuthErrorHandlerResult {
	const { error, countdownSeconds = 5 } = options;

	const [hasShownBanner, setHasShownBanner] = useState(false);

	const errorIsAuth = error ? isAuthError(error) : false;
	const shouldShowAuthBanner = errorIsAuth && !hasShownBanner;

	useEffect(() => {
		if (errorIsAuth && !hasShownBanner) {
			setHasShownBanner(true);
		}
	}, [errorIsAuth, hasShownBanner]);

	return {
		isAuthError: errorIsAuth,
		shouldShowAuthBanner,
	};
}
