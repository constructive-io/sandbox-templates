import type { FileFieldStorage, FileProjection } from '@/components/ui/resource-kit';

import { describeError } from '../graphql/errors.ts';
import { graphqlRequest } from '../graphql/request.ts';
import { runtimeConfig } from '../runtime/config';

type FileBinding = {
	filesType?: string;
	bucketKey?: string;
	isPublic?: boolean;
	readOnly?: boolean;
	ownerId?: (context: Parameters<NonNullable<FileFieldStorage['upload']>>[1]) => unknown;
};

type StorageTable = {
	query: { all: string | null } | null;
	storage: {
		isFilesTable: boolean;
		filesType: string;
		downloadUrlField: string | null;
		upload: { mutation: string; inputType: string; requiresOwnerId: boolean } | null;
	} | null;
};

type Ticket = {
	file: FileProjection;
	deduplicated: boolean;
	uploadUrl: string | null;
	uploadHeaders: Record<string, string> | null;
};

const STORAGE_META = `{
	_meta {
		tables {
			query { all }
			storage { isFilesTable filesType downloadUrlField upload { mutation inputType requiresOwnerId } }
		}
	}
}`;

async function request<T>(endpoint: string, query: string, variables: Record<string, unknown>, signal: AbortSignal): Promise<T> {
	signal.throwIfAborted();
	const result = await graphqlRequest<T>(endpoint, query, variables, { signal });
	signal.throwIfAborted();
	if (!result.ok) throw new Error(describeError(result));
	return result.data;
}

async function findPlane(binding: FileBinding, signal: AbortSignal) {
	const { appEndpoint, storageEndpoint } = runtimeConfig;
	const endpoints = binding.filesType ? [appEndpoint, storageEndpoint] : [storageEndpoint || appEndpoint];
	for (const endpoint of new Set(endpoints.filter(Boolean))) {
		const data = await request<{ _meta: { tables: StorageTable[] } }>(endpoint, STORAGE_META, {}, signal);
		const tables = data._meta.tables.filter(({ storage }) => storage?.isFilesTable && (!binding.filesType || storage.filesType === binding.filesType));
		if (tables.length !== 1) continue;
		const { query, storage } = tables[0]!;
		if (!query?.all || !storage?.downloadUrlField) continue;
		return { endpoint, all: query.all, downloadUrlField: storage.downloadUrlField, upload: storage.upload };
	}
	throw new Error('No unambiguous tenant storage is available for this field.');
}

type Plane = Awaited<ReturnType<typeof findPlane>>;

async function downloadUrl(plane: Plane, file: FileProjection, signal: AbortSignal): Promise<string | null> {
	const { endpoint, all, downloadUrlField } = plane;
	const data = await request<{ files: { nodes: { url: string | null }[] } }>(
		endpoint,
		`query FileDownload($id: UUID!) {
			files: ${all}(where: { id: { equalTo: $id } }) { nodes { url: ${downloadUrlField} } }
		}`,
		{ id: file.id },
		signal,
	);
	return data.files.nodes[0]?.url ?? null;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
	signal.throwIfAborted();
	return new Promise((resolve, reject) => {
		const abort = () => {
			clearTimeout(timer);
			reject(signal.reason);
		};
		const timer = setTimeout(() => {
			signal.removeEventListener('abort', abort);
			resolve();
		}, ms);
		signal.addEventListener('abort', abort, { once: true });
	});
}

export function fileField(binding: FileBinding): FileFieldStorage {
	return {
		resolveUrl: async (file, { signal }) => downloadUrl(await findPlane(binding, signal), file, signal),
		upload: binding.readOnly ? undefined : async (file, context) => {
			const { signal } = context;
			const plane = await findPlane(binding, signal);
			const operation = plane.upload;
			if (!operation) throw new Error('Uploads are not enabled for this field’s storage.');
			const ownerId = operation.requiresOwnerId ? binding.ownerId?.(context) : undefined;
			if (operation.requiresOwnerId && (typeof ownerId !== 'string' || !ownerId)) {
				throw new Error('This file needs a storage owner before it can be uploaded.');
			}
			const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
			const contentHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
			const { mutation, inputType } = operation;
			const { ticket } = await request<{ ticket: Ticket }>(
				plane.endpoint,
				`mutation ResourceUpload($input: ${inputType}!) {
					ticket: ${mutation}(input: $input) { uploadUrl uploadHeaders deduplicated file }
				}`,
				{ input: {
					...(binding.bucketKey ? { bucketKey: binding.bucketKey } : { isPublic: binding.isPublic }),
					ownerId,
					contentHash,
					contentType: file.type || 'application/octet-stream',
					size: file.size,
					filename: file.name,
				} },
				signal,
			);
			if (!ticket.file?.id || !ticket.file.key) throw new Error('Storage did not return a file reference.');
			if (!ticket.deduplicated) {
				if (!ticket.uploadUrl || !ticket.uploadHeaders) throw new Error('Storage did not return an upload ticket.');
				const put = await fetch(ticket.uploadUrl, { method: 'PUT', body: file, headers: ticket.uploadHeaders, signal });
				if (!put.ok) throw new Error(`The file could not be uploaded (HTTP ${put.status}).`);
			}
			// The storage worker confirms the PUT asynchronously. Don't save a record whose file isn't ready to read.
			for (let attempt = 0; attempt < 30; attempt++) {
				if (await downloadUrl(plane, ticket.file, signal)) return ticket.file;
				await wait(1000, signal);
			}
			throw new Error('Storage did not confirm the upload. Try again.');
		},
	};
}
