// The app's data client: the ORM generated from the app schema, sending the
// session token. Before codegen, `@sdk/app` is a stub with no models.

import { createClient } from '@sdk/app';

import { runtimeConfig } from '@/lib/runtime/config';

import { sessionAdapter } from './request';

export const db = createClient({ adapter: sessionAdapter(() => runtimeConfig.appEndpoint) });
