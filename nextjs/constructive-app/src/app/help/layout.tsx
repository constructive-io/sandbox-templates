import { ReactNode } from 'react';

interface HelpLayoutProps {
	children: ReactNode;
}

/**
 * Help layout - protected route, auth enforced by RouteGuard.
 * Only renders when user is authenticated (schema-builder context).
 * Shell (sidebar/topbar) is provided by AuthenticatedShell in root layout.
 */
export default function HelpLayout({ children }: HelpLayoutProps) {
	return (
		<div id='help-route-layout' className='bg-background flex h-full flex-col'>
			{children}
		</div>
	);
}
