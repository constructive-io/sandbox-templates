'use client';

import { useEntityParams } from '@/lib/navigation';
import { OrgFeaturePackAdapter } from '@/components/orgs/org-feature-pack-adapter';

export default function OrgSettingsPage() {
	const { orgId, organization } = useEntityParams();

	if (!orgId || !organization?._raw) {
		return null;
	}

	return <OrgFeaturePackAdapter orgId={orgId} section="settings" />;
}
