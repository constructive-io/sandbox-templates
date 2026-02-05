/**
 * Hook for updating a site
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 * Note: File uploads require special FormData handling not supported by SDK
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getEndpoint } from '@/app-config';
import { executeSb, getAuthHeaders } from '@/graphql/execute';
import {
	updateSiteMutationDocument,
	type UpdateSiteMutationResult,
	type UpdateSiteMutationVariables,
} from '@sdk/app-public';

import { siteQueryKeys } from './use-sites';

export interface ImageConfig {
	url: string;
	mime: string;
}

export interface UpdateSiteData {
	id: string;
	databaseId: string;
	title?: string;
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

export interface UpdatedSite {
	id: string;
	databaseId: string;
}

export function useUpdateSite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateSiteData): Promise<UpdatedSite> => {
			const hasUploads =
				!!data.logoUpload || !!data.faviconUpload || !!data.appleTouchIconUpload || !!data.ogImageUpload;

			const basePatch: Record<string, unknown> = {
				...(data.title && { title: data.title }),
				...(data.description !== undefined && { description: data.description }),
				...(data.logo !== undefined && { logo: data.logo }),
				...(data.favicon !== undefined && { favicon: data.favicon }),
				...(data.appleTouchIcon !== undefined && { appleTouchIcon: data.appleTouchIcon }),
				...(data.ogImage !== undefined && { ogImage: data.ogImage }),
			};

			let result: UpdateSiteMutationResult;

			if (!hasUploads) {
				result = (await executeSb(updateSiteMutationDocument, {
					input: {
						id: data.id,
						patch: basePatch,
					},
				})) as UpdateSiteMutationResult;
			} else {
				// File uploads require FormData multipart request
				const baseInput = {
					input: {
						id: data.id,
						patch: {
							...basePatch,
							logoUpload: null,
							faviconUpload: null,
							appleTouchIconUpload: null,
							ogImageUpload: null,
						},
					},
				};

				const operations: Record<string, unknown> = {
					query: updateSiteMutationDocument,
					variables: baseInput,
				};

				const formData = new FormData();
				const map: Record<string, string[]> = {};
				let fileIndex = 0;

				formData.append('operations', JSON.stringify(operations));
				formData.append('map', JSON.stringify(map));

				const appendFile = (file: File | undefined, fieldName: string) => {
					if (!file) return;
					const key = String(fileIndex++);
					map[key] = [`variables.input.patch.${fieldName}`];
					formData.append(key, file, file.name);
				};

				appendFile(data.logoUpload, 'logoUpload');
				appendFile(data.faviconUpload, 'faviconUpload');
				appendFile(data.appleTouchIconUpload, 'appleTouchIconUpload');
				appendFile(data.ogImageUpload, 'ogImageUpload');

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
					throw new Error(`Update site failed: ${response.statusText}`);
				}

				const json = await response.json();

				if (json.errors?.length) {
					throw new Error(json.errors[0]?.message ?? 'Update site failed');
				}

				result = json.data;
			}

			const site = result.updateSite?.site;
			if (!site?.id || !site?.databaseId) {
				throw new Error('Failed to update site');
			}

			return {
				id: site.id,
				databaseId: site.databaseId,
			};
		},
		onSuccess: async (site) => {
			await queryClient.invalidateQueries({
				queryKey: siteQueryKeys.byDatabase(site.databaseId),
			});
		},
		onError: (error) => {
			console.error('Failed to update site:', error);
		},
	});
}
