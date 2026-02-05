'use client';

import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { Tabs, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';
import { RiGlobalLine } from '@remixicon/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useDatabaseServices } from '@/lib/gql/hooks/schema-builder/apis';
import { useEntityParams } from '@/lib/navigation';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { ExtensionsCard } from '@/components/extensions';

interface SchemaBuilderHeaderProps {
	leftPanelVisible: boolean;
	setLeftPanelVisible: (visible: boolean) => void;
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

export function SchemaBuilderHeader({
	leftPanelVisible,
	setLeftPanelVisible,
	activeTab,
	setActiveTab,
}: SchemaBuilderHeaderProps) {
	const stack = useCardStack();
	const { selectedSchemaKey, getSchemaByKey, currentDatabase } = useSchemaBuilderSelectors();
	const { orgId } = useEntityParams();

	// Fetch services for the current database
	const selectedSchemaInfo = getSchemaByKey(selectedSchemaKey);
	const currentDatabaseId = selectedSchemaInfo?.dbSchema?.id || '';
	const { services, isLoading: isLoadingServices } = useDatabaseServices({
		databaseId: currentDatabaseId,
		enabled: !!currentDatabaseId,
	});

	const databaseId = currentDatabase?.databaseId ?? null;

	return (
		<>
			<div
				data-testid='schema-builder-header'
				className='bg-card border-border/60 flex h-14 items-center justify-between border-b px-4'
			>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setLeftPanelVisible(!leftPanelVisible)}
						className='h-8 w-8 p-0'
					>
						{leftPanelVisible ? <PanelLeftClose className='h-4 w-4' /> : <PanelLeftOpen className='h-4 w-4' />}
					</Button>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger value='editor'>Structure</TabsTrigger>
							<TabsTrigger value='relationships'>Relationships</TabsTrigger>
							<TabsTrigger value='indexes'>Indexes</TabsTrigger>
							{/* <TabsTrigger value='form-builder'>Form Builder</TabsTrigger>
							<TabsTrigger value='diagram'>Diagram</TabsTrigger> */}
						</TabsList>
					</Tabs>
				</div>

				<div className='flex items-center gap-2'>
					{/* Services Button - modules hidden, backend handles installation */}
					{databaseId && orgId && (
						<Button
							variant='outline'
							size='sm'
							className='gap-2'
							onClick={() =>
								stack.push({
									id: 'extensions',
									title: 'Services',
									Component: ExtensionsCard,
									props: {
										services,
										isLoadingServices,
										orgId,
										databaseId,
									},
									width: CARD_WIDTHS.wide,
								})
							}
						>
							<RiGlobalLine className='h-4 w-4' />
							<span className='text-sm font-medium'>Services</span>
							<span className='text-muted-foreground text-[10px] tabular-nums'>
								{isLoadingServices ? '...' : services.length}
							</span>
						</Button>
					)}
				</div>
			</div>
		</>
	);
}
