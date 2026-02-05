import type { DatabaseApp } from '@/lib/gql/hooks/schema-builder/sites';

export interface DomainItem {
	id?: string;
	domain?: string | null;
	subdomain?: string | null;
	apiId?: string | null;
}

export function buildDomainLabel(item: DomainItem) {
	const { domain, subdomain } = item;
	if (!domain && !subdomain) return 'Unknown domain';
	if (subdomain && domain) return `${subdomain}.${domain}`;
	return domain ?? subdomain ?? 'Unknown domain';
}

export function buildDomainHref(domain?: string | null, subdomain?: string | null) {
	if (!domain) return null;
	const host = subdomain ? `${subdomain}.${domain}` : domain;
	const isLocalhost = host.includes('localhost');
	const protocol = isLocalhost ? 'http' : 'https';
	const needsPort = isLocalhost && !host.includes(':');
	const hostWithPort = needsPort ? `${host}:3000` : host;
	return `${protocol}://${hostWithPort}`;
}

export function formatAppPlatform(app: DatabaseApp) {
	if (app.appStoreId || app.appStoreLink) return 'iOS';
	if (app.playStoreLink) return 'Android';
	return 'Native';
}

export const getMimeFromUrl = (url: string): string => {
	const clean = url.split('?')[0].toLowerCase();
	if (clean.endsWith('.svg')) return 'image/svg+xml';
	if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
	if (clean.endsWith('.webp')) return 'image/webp';
	if (clean.endsWith('.ico')) return 'image/x-icon';
	return 'image/png';
};
