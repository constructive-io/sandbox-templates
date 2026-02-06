/**
 * Field-Specific Upload Hook
 * Provides upload functionality that integrates with the existing dynamic mutation system
 * Works with backend's field-specific upload pattern: <fieldName>Upload fields
 */

import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as inflection from 'inflection';

import { getEndpoint } from '@/app-config';
import { getAuthHeaders } from '@/graphql/execute';

import { queryKeys } from './use-table';
import { type DashboardCacheScopeKey, useDashboardCacheScopeKey } from './use-dashboard-cache-scope';

/**
 * Upload progress callback type
 */
export interface UploadProgress {
	loaded: number;
	total: number;
	percentage: number;
}

/**
 * Upload response from backend
 */
export interface UploadResponse {
	url: string;
	filename: string;
	mimetype: string;
	size: number;
	width?: number;
	height?: number;
}

/**
 * Field upload options
 */
export interface UseFieldUploadOptions {
	onProgress?: (progress: UploadProgress) => void;
	onSuccess?: (data: UploadResponse) => void;
	onError?: (error: Error) => void;
	showToast?: boolean; // default true
	successMessage?: string; // custom success message
	successToastDelayMs?: number; // optional delay for success toast
}

/**
 * Execute field upload using manual fetch with FormData
 * Following the "known-good" multipart format from coworker's tips
 * 
 * Exported for direct use when record ID is known at call time (e.g., after draft submission)
 */
export async function executeFieldUpload(
	tableName: string,
	fieldName: string,
	recordId: string | number,
	file: File,
	scopeKey: DashboardCacheScopeKey,
): Promise<UploadResponse> {
	// Generate the mutation
	const uploadFieldName = `${fieldName}Upload`;
	const mutationName = `update${tableName}`;
	const singularName = inflection.camelize(tableName, true);

	const mutationString = `
    mutation ${mutationName}Mutation($input: Update${tableName}Input!) {
      ${mutationName}(input: $input) {
        ${singularName} {
          id
          ${fieldName}
        }
      }
    }
  `.trim();

	const formData = new FormData();

	// 1) operations: JSON string (exactly as specified)
	const operations = JSON.stringify({
		query: mutationString,
		variables: {
			input: {
				id: recordId,
				patch: {
					[uploadFieldName]: null, // Must be null in operations
				},
			},
		},
	});

	// 2) map: tell server which form field replaces which variable path
	const map = JSON.stringify({
		'0': [`variables.input.patch.${uploadFieldName}`],
	});

	// 3) Append the three named parts exactly as specified
	formData.append('operations', operations);
	formData.append('map', map);
	formData.append('0', file, file.name); // IMPORTANT: Include file.name as third parameter

	// Make the request with proper authentication
	const headers: Record<string, string> = getAuthHeaders('dashboard', scopeKey.databaseId ?? undefined);

	// Get endpoint with validation
	const endpoint = scopeKey.endpoint ?? getEndpoint('dashboard');
	if (!endpoint) {
		throw new Error('No endpoint configured. Select a database API or use Direct Connect.');
	}

	const response = await fetch(endpoint, {
		method: 'POST',
		body: formData,
		headers, // Browser will automatically set Content-Type: multipart/form-data; boundary=...
	});

	if (!response.ok) {
		throw new Error(`Upload failed: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors) {
		throw new Error(result.errors[0].message || 'Upload failed');
	}

	// Extract the updated record from PostGraphile response
	const updatedRecord = result.data?.[mutationName]?.[singularName];

	if (!updatedRecord) {
		throw new Error('Upload succeeded but no data returned');
	}

	// Extract the uploaded file data from the updated record
	const uploadedFileData = updatedRecord[fieldName];
	if (!uploadedFileData) {
		throw new Error(`Upload succeeded but ${fieldName} field not found in response`);
	}

	// Return standardized upload response
	return {
		url: uploadedFileData.url || uploadedFileData,
		filename: uploadedFileData.filename || file.name,
		mimetype: uploadedFileData.mimetype || file.type,
		size: uploadedFileData.size || file.size,
		width: uploadedFileData.width,
		height: uploadedFileData.height,
	};
}

/**
 * Hook for uploading files to specific table fields
 * Integrates with the existing dynamic mutation system
 */
export function useFieldUpload(
	tableName: string,
	fieldName: string,
	recordId: string | number,
	options: UseFieldUploadOptions = {},
) {
	const queryClient = useQueryClient();
	const scopeKey = useDashboardCacheScopeKey();

	// Keep latest params in refs to avoid stale closures
	const tableRef = useRef(tableName);
	const fieldRef = useRef(fieldName);
	const idRef = useRef(recordId);

	useEffect(() => {
		tableRef.current = tableName;
		fieldRef.current = fieldName;
		idRef.current = recordId;
	}, [tableName, fieldName, recordId]);

	return useMutation<UploadResponse, Error, File>({
		mutationKey: ['dashboard', scopeKey, 'field-upload', tableName, fieldName, recordId],
		mutationFn: async (file: File) => {
			return executeFieldUpload(tableRef.current, fieldRef.current, idRef.current, file, scopeKey);
		},
		onSuccess: (data) => {
			// First allow callers to react (e.g., close overlay)
			options.onSuccess?.(data);
			// Invalidate related queries to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableRef.current) });
			queryClient.invalidateQueries({ queryKey: queryKeys.tableRow(scopeKey, tableRef.current, idRef.current) });
		},
		onError: (error) => {
			options.onError?.(error);
		},
	});
}

/**
 * Hook for uploading images with validation
 * Convenience wrapper around useFieldUpload with image-specific validation
 */
export function useImageUpload(
	tableName: string,
	fieldName: string,
	recordId: string | number,
	options: UseFieldUploadOptions = {},
) {
	const queryClient = useQueryClient();
	const scopeKey = useDashboardCacheScopeKey();

	// Keep latest params in refs to avoid stale closures
	const tableRef = useRef(tableName);
	const fieldRef = useRef(fieldName);
	const idRef = useRef(recordId);

	useEffect(() => {
		tableRef.current = tableName;
		fieldRef.current = fieldName;
		idRef.current = recordId;
	}, [tableName, fieldName, recordId]);

	return useMutation<UploadResponse, Error, File>({
		mutationKey: ['dashboard', scopeKey, 'image-upload', tableName, fieldName, recordId],
		mutationFn: async (file: File) => {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				throw new Error('Please select an image file');
			}

			// Validate file size (10MB limit)
			const maxSize = 10 * 1024 * 1024; // 10MB
			if (file.size > maxSize) {
				throw new Error('File size must be less than 10MB');
			}

			return executeFieldUpload(tableRef.current, fieldRef.current, idRef.current, file, scopeKey);
		},
		onSuccess: (data) => {
			// First allow callers to react (e.g., close overlay)
			options.onSuccess?.(data);

			// Invalidate related queries to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableRef.current) });
			queryClient.invalidateQueries({ queryKey: queryKeys.tableRow(scopeKey, tableRef.current, idRef.current) });
		},
		onError: (error) => {
			options.onError?.(error);
		},
	});
}
