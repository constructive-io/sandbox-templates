/**
 * Hook for creating a site
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 * Note: File uploads require special FormData handling not supported by SDK
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getEndpoint } from '@/app-config';
import { executeSb, getAuthHeaders } from '@/graphql/execute';
import {
	createSiteMutationDocument,
	type CreateSiteMutationResult,
	type CreateSiteMutationVariables,
} from '@sdk/api';

import { siteQueryKeys } from './use-sites';

export interface ImageConfig {
	url: string;
	mime: string;
}

export interface CreateSiteData {
	databaseId: string;
	title: string;
	description?: string;
	logo?: ImageConfig;
	favicon?: string;
	appleTouchIcon?: ImageConfig;
	ogImage?: ImageConfig;
	logoUpload?: File;
	faviconUpload?: File;
	appleTouchIconUpload?: File;
	ogImageUpload?: File;
}

export interface CreatedSite {
	id: string;
	title: string | null;
	databaseId: string;
	description: string | null;
	logo: unknown | null;
	favicon: string | null;
	appleTouchIcon: unknown | null;
	ogImage: unknown | null;
}

export function useCreateSite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSiteData): Promise<CreatedSite> => {
			const hasUploads =
				!!data.logoUpload || !!data.faviconUpload || !!data.appleTouchIconUpload || !!data.ogImageUpload;

			const baseInput: CreateSiteMutationVariables = {
				input: {
					site: {
						databaseId: data.databaseId,
						title: data.title,
						description: data.description ?? null,
						logo: data.logo ?? null,
						favicon: data.favicon ?? null,
						appleTouchIcon: data.appleTouchIcon ?? null,
						ogImage: data.ogImage ?? null,
					},
				},
			};

			let result: CreateSiteMutationResult;

			if (!hasUploads) {
				result = (await executeSb(
					createSiteMutationDocument,
					baseInput as unknown as Record<string, unknown>
				)) as CreateSiteMutationResult;
			} else {
				// File uploads require FormData multipart request
				const operations: Record<string, unknown> = {
					query: createSiteMutationDocument,
					variables: {
						input: {
							site: {
								...baseInput.input.site,
								logoUpload: null,
								faviconUpload: null,
								appleTouchIconUpload: null,
								ogImageUpload: null,
							},
						},
					},
				};

				const formData = new FormData();
				const map: Record<string, string[]> = {};
				let fileIndex = 0;
				const fileEntries: { key: string; file: File }[] = [];

				const registerFile = (file: File | undefined, fieldName: string) => {
					if (!file) return;
					const key = String(fileIndex++);
					map[key] = [`variables.input.site.${fieldName}`];
					fileEntries.push({ key, file });
				};

				registerFile(data.logoUpload, 'logoUpload');
				registerFile(data.faviconUpload, 'faviconUpload');
				registerFile(data.appleTouchIconUpload, 'appleTouchIconUpload');
				registerFile(data.ogImageUpload, 'ogImageUpload');

				formData.append('operations', JSON.stringify(operations));
				formData.append('map', JSON.stringify(map));

				for (const { key, file } of fileEntries) {
					formData.append(key, file, file.name);
				}

				const headers: Record<string, string> = getAuthHeaders('schema-builder');
				const endpoint = getEndpoint('schema-builder');
				if (!endpoint) {
					throw new Error('Schema builder endpoint not configured');
				}

				const response = await fetch(endpoint, {
					method: 'POST',
					body: formData,
					headers,
				});

				if (!response.ok) {
					throw new Error(`Create site failed: ${response.statusText}`);
				}

				const json = await response.json();

				if (json.errors?.length) {
					throw new Error(json.errors[0]?.message ?? 'Create site failed');
				}

				result = json.data;
			}

			const site = result.createSite?.site;
			if (!site?.id || !site?.databaseId) {
				throw new Error('Failed to create site');
			}

			return {
				id: site.id,
				title: site.title ?? null,
				databaseId: site.databaseId,
				description: site.description ?? null,
				logo: site.logo ?? null,
				favicon: site.favicon ?? null,
				appleTouchIcon: site.appleTouchIcon ?? null,
				ogImage: site.ogImage ?? null,
			};
		},
		onSuccess: async (site) => {
			await queryClient.invalidateQueries({
				queryKey: siteQueryKeys.byDatabase(site.databaseId),
			});
		},
		onError: (error) => {
			console.error('Failed to create site:', error);
		},
	});
}
