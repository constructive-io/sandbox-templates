'use client';

// An entity's members and files on its record page: a data room's people and
// documents, an organization's members. Generated record pages render this
// when the AppSpec gives the table `panels`; RLS and the scope's capabilities
// decide what each person sees and may change.

import { ScopeAccessPanel } from '@/blocks/scope-access/scope-access-panel';
import { ScopeFilesPanel } from '@/blocks/scope-access/scope-files-panel';
import { Panel } from '@/components/ui/workspace-kit';

export type EntityPanelsProps = {
	/** The membership scope whose entity the record is, e.g. `data_room`. */
	scope: string;
	entityId: string;
	show: ReadonlyArray<'members' | 'files'>;
};

export function EntityPanels({ scope, entityId, show }: EntityPanelsProps) {
	return (
		<>
			{show.includes('files') ? (
				<Panel title='Files'>
					<ScopeFilesPanel entityId={entityId} scope={scope} />
				</Panel>
			) : null}
			{show.includes('members') ? (
				<Panel title='People'>
					<ScopeAccessPanel entityId={entityId} scope={scope} />
				</Panel>
			) : null}
		</>
	);
}
