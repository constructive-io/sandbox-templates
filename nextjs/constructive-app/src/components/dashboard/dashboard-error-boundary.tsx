'use client';

import React from 'react';
import { RiArrowLeftLine, RiErrorWarningLine, RiRefreshLine } from '@remixicon/react';

import { Button } from '@constructive-io/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@constructive-io/ui/card';

interface DashboardErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

interface DashboardErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class DashboardErrorBoundary extends React.Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
	constructor(props: DashboardErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({
			error,
			errorInfo,
		});

		// Log error to console for debugging
		console.error('Dashboard Error Boundary caught an error:', error, errorInfo);

		// TODO: Send error to monitoring service
		// Example: sendErrorToService(error, errorInfo);
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	handleReload = () => {
		window.location.reload();
	};

	handleGoBack = () => {
		window.history.back();
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return <FallbackComponent error={this.state.error!} reset={this.handleReset} />;
			}

			// Default error UI
			return (
				<div className='bg-background flex min-h-screen items-center justify-center p-4'>
					<Card className='w-full max-w-lg'>
						<CardHeader className='text-center'>
							<div className='bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
								<RiErrorWarningLine className='text-destructive h-6 w-6' />
							</div>
							<CardTitle className='text-xl'>Something went wrong</CardTitle>
							<CardDescription>
								An error occurred while loading the dashboard. This might be due to a network issue or server problem.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{this.state.error && (
								<div className='bg-muted rounded-lg p-3'>
									<p className='text-foreground mb-2 text-sm font-medium'>Error Details:</p>
									<p className='text-muted-foreground font-mono text-xs'>{this.state.error.message}</p>
									{process.env.NODE_ENV === 'development' && this.state.errorInfo && (
										<details className='mt-2'>
											<summary className='text-muted-foreground hover:text-foreground cursor-pointer text-xs'>
												Stack Trace (Development Only)
											</summary>
											<pre className='text-muted-foreground mt-2 text-xs whitespace-pre-wrap'>
												{this.state.errorInfo.componentStack}
											</pre>
										</details>
									)}
								</div>
							)}
						</CardContent>
						<CardFooter className='flex flex-col gap-2 sm:flex-row'>
							<Button onClick={this.handleReset} className='flex-1' variant='default'>
								<RiRefreshLine className='mr-2 h-4 w-4' />
								Try Again
							</Button>
							<Button onClick={this.handleReload} className='flex-1' variant='outline'>
								<RiRefreshLine className='mr-2 h-4 w-4' />
								Reload Page
							</Button>
							<Button onClick={this.handleGoBack} className='flex-1' variant='outline'>
								<RiArrowLeftLine className='mr-2 h-4 w-4' />
								Go Back
							</Button>
						</CardFooter>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook version for functional components
export function useDashboardErrorHandler() {
	const [error, setError] = React.useState<Error | null>(null);

	const resetError = React.useCallback(() => {
		setError(null);
	}, []);

	const captureError = React.useCallback((error: Error) => {
		setError(error);
	}, []);

	// Reset error when component unmounts
	React.useEffect(() => {
		return () => setError(null);
	}, []);

	return {
		error,
		resetError,
		captureError,
		hasError: error !== null,
	};
}
