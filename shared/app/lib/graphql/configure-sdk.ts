// Points the generated React Query hooks at the same endpoints and session as
// the ORM client, so `use<Model>Query` hooks work in hand-written screens.

import { configure as configureApp } from '@sdk/app';
import { configure as configureAuth } from '@sdk/auth';

import { runtimeConfig } from '@/lib/runtime/config';

import { sessionAdapter } from './request';

let configured = false;

export function configureSdk() {
	if (configured) return;
	configured = true;
	configureApp({ adapter: sessionAdapter(() => runtimeConfig.appEndpoint) });
	configureAuth({ adapter: sessionAdapter(() => runtimeConfig.authEndpoint) });
}
