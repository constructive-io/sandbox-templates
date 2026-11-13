'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// The database's emails link to `/login` (a sign-up attempt for an address
// that already has an account). This app signs in at `/sign-in`, so the link
// lands there, keeping `?next=`. A static export has no server redirect.
export default function LoginPage() {
	const router = useRouter();

	React.useEffect(() => {
		router.replace(`/sign-in/${window.location.search}`);
	}, [router]);

	return null;
}
