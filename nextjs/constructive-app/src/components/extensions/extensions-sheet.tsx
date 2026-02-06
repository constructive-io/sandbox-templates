'use client';

import type { Transition } from 'motion/react';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@constructive-io/ui/sheet';

import { ServicesPanel } from '@/components/schemas';

interface ExtensionsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// Modules data - kept for backward compatibility, not used
	installedModuleCount: number;
	totalModuleCount: number;
	isLoadingModules: boolean;
	// Services data
	services: DatabaseService[];
	isLoadingServices: boolean;
	// Navigation
	orgId: string;
	databaseId: string;
}

// Fast tween animation - feels snappier than spring for sheets
const fastSheetTransition: Transition = {
	type: 'tween',
	duration: 0.2,
	ease: [0.32, 0.72, 0, 1], // Custom ease-out curve for snappy feel
};

export function ExtensionsSheet({
	open,
	onOpenChange,
	services,
	isLoadingServices,
	orgId,
	databaseId,
}: ExtensionsSheetProps) {
	const handleNavigate = () => {
		onOpenChange(false);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side='right'
				className='flex w-full flex-col gap-0 p-0 sm:max-w-lg'
				transition={fastSheetTransition}
			>
				<SheetHeader className='border-b px-6 py-4'>
					<SheetTitle>Services</SheetTitle>
					<SheetDescription>Manage services for your database.</SheetDescription>
				</SheetHeader>

				<div className='min-h-0 flex-1 overflow-auto'>
					<ServicesPanel
						services={services}
						isLoading={isLoadingServices}
						orgId={orgId}
						databaseId={databaseId}
						onNavigate={handleNavigate}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
