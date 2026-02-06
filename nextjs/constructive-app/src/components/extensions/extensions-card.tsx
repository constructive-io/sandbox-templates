'use client';

import type { CardComponent } from '@constructive-io/ui/stack';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis';
import { ScrollArea } from '@constructive-io/ui/scroll-area';

import { ServicesPanel } from '@/components/schemas';

export type ExtensionsCardProps = {
	// Services data
	services: DatabaseService[];
	isLoadingServices: boolean;
	// Navigation
	orgId: string;
	databaseId: string;
};

export const ExtensionsCard: CardComponent<ExtensionsCardProps> = ({
	services,
	isLoadingServices,
	orgId,
	databaseId,
	card,
}) => {
	const handleNavigate = () => {
		card.close();
	};

	return (
		<ScrollArea className='h-full'>
			<ServicesPanel
				services={services}
				isLoading={isLoadingServices}
				orgId={orgId}
				databaseId={databaseId}
				onNavigate={handleNavigate}
			/>
		</ScrollArea>
	);
};
