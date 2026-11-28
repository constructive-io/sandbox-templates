// Next.js inlines NEXT_PUBLIC_* variables only where they are read literally.

export type PublicEnv = {
	dbName?: string;
	authEndpoint?: string;
	appEndpoint?: string;
	adminEndpoint?: string;
	storageEndpoint?: string;
	apiPort?: string;
};

export const publicEnv: PublicEnv = {
	dbName: process.env.NEXT_PUBLIC_DB_NAME,
	authEndpoint: process.env.NEXT_PUBLIC_AUTH_ENDPOINT,
	appEndpoint: process.env.NEXT_PUBLIC_APP_ENDPOINT,
	adminEndpoint: process.env.NEXT_PUBLIC_ADMIN_ENDPOINT,
	storageEndpoint: process.env.NEXT_PUBLIC_STORAGE_ENDPOINT,
	apiPort: process.env.NEXT_PUBLIC_API_PORT,
};
