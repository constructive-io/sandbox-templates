import { AuthGate } from '@/components/auth/auth-gate';
import { DashboardRoute } from '@/components/dashboard/dashboard-route';

/**
 * Database Data page - displays data grid for CRUD operations
 *
 * Route: /orgs/[orgId]/databases/[databaseId]/data
 * Uses dashboard context for per-database authentication (Tier 2)
 *
 * AuthGate handles the Tier 2 auth:
 * - If not authenticated to the database API, shows auth form
 * - If authenticated, shows the data grid
 */
export default function DatabaseDataPage() {
	return (
		<AuthGate>
			<DashboardRoute />
		</AuthGate>
	);
}
