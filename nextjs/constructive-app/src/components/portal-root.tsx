'use client';

import { PortalRoot } from '@constructive-io/ui/portal';

export function AppPortalRoot() {
	return (
		<>
			<PortalRoot />
			{/* Glide Data Grid v6 hardcodes getElementById("portal") for overlay editors */}
			<div id='portal' />
		</>
	);
}
