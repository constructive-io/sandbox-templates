import React from 'react';

import { CellValue } from '@/lib/types/cell-types';

import { FormFieldSchema } from './types';

// Persistence configuration
export interface FormPersistenceConfig {
	key: string;
	storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
	autoSave: boolean;
	autoSaveDelay: number;
	maxSnapshots: number;
	ttl: number; // Time to live in milliseconds
	version: string;
	enableCompression?: boolean;
	enableEncryption?: boolean;
}

// Persisted form state
export interface PersistedFormState {
	values: Record<string, CellValue>;
	metadata: {
		savedAt: number;
		version: string;
		formSchema: string; // Hash of form schema
		userId?: string;
		sessionId: string;
		isDirty: boolean;
		lastModifiedField?: string;
	};
	validation?: {
		errors: Record<string, string>;
		isValid: boolean;
		validatedAt: number;
	};
	progress?: {
		completedFields: string[];
		totalFields: number;
		percentage: number;
	};
}

// Form snapshot for versioning
export interface FormSnapshot {
	id: string;
	timestamp: number;
	state: PersistedFormState;
	label?: string;
	isAutoSave: boolean;
}

// Recovery information
export interface FormRecoveryInfo {
	hasRecoverableData: boolean;
	lastSaved: number;
	formVersion: string;
	isCompatible: boolean;
	fieldCount: number;
	completionPercentage: number;
}

/**
 * Form State Persistence Manager
 * Handles saving and restoring form state across sessions
 */
export class FormPersistenceManager {
	private config: FormPersistenceConfig;
	private autoSaveTimer?: NodeJS.Timeout;
	private sessionId: string;

	constructor(config: Partial<FormPersistenceConfig> = {}) {
		this.config = {
			key: 'form-state',
			storage: 'localStorage',
			autoSave: true,
			autoSaveDelay: 2000,
			maxSnapshots: 5,
			ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
			version: '1.0.0',
			enableCompression: false,
			enableEncryption: false,
			...config,
		};

		this.sessionId = this.generateSessionId();
	}

	/**
	 * Generate unique session ID
	 */
	private generateSessionId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Generate form schema hash for compatibility checking
	 */
	private generateSchemaHash(fields: FormFieldSchema[]): string {
		const schemaString = JSON.stringify(
			fields.map((f) => ({ name: f.name, type: f.type, required: f.required })).sort(),
		);
		return btoa(schemaString);
	}

	/**
	 * Get storage interface based on configuration
	 */
	private getStorage(): Storage {
		switch (this.config.storage) {
			case 'sessionStorage':
				return sessionStorage;
			case 'localStorage':
			default:
				return localStorage;
		}
	}

	/**
	 * Compress data if enabled
	 */
	private compressData(data: string): string {
		if (!this.config.enableCompression) return data;

		// Simple compression using JSON minification
		// In production, you might want to use a proper compression library
		return JSON.stringify(JSON.parse(data));
	}

	/**
	 * Decompress data if needed
	 */
	private decompressData(data: string): string {
		// For now, just return as-is since we're not using real compression
		return data;
	}

	/**
	 * Encrypt data if enabled
	 */
	private encryptData(data: string): string {
		if (!this.config.enableEncryption) return data;

		// Placeholder for encryption - in production, use proper encryption
		return btoa(data);
	}

	/**
	 * Decrypt data if needed
	 */
	private decryptData(data: string): string {
		if (!this.config.enableEncryption) return data;

		try {
			return atob(data);
		} catch {
			return data; // Return as-is if not encrypted
		}
	}

	/**
	 * Save form state
	 */
	async saveFormState(
		values: Record<string, CellValue>,
		fields: FormFieldSchema[],
		options: {
			isAutoSave?: boolean;
			label?: string;
			validation?: { errors: Record<string, string>; isValid: boolean };
		} = {},
	): Promise<void> {
		try {
			const storage = this.getStorage();
			const now = Date.now();
			const schemaHash = this.generateSchemaHash(fields);

			// Calculate progress
			const completedFields = Object.keys(values).filter((key) => {
				const value = values[key];
				return value !== null && value !== undefined && value !== '';
			});

			const state: PersistedFormState = {
				values,
				metadata: {
					savedAt: now,
					version: this.config.version,
					formSchema: schemaHash,
					sessionId: this.sessionId,
					isDirty: true,
					lastModifiedField: undefined, // Could be enhanced to track this
				},
				validation: options.validation
					? {
							...options.validation,
							validatedAt: now,
						}
					: undefined,
				progress: {
					completedFields: completedFields,
					totalFields: fields.length,
					percentage: Math.round((completedFields.length / fields.length) * 100),
				},
			};

			// Create snapshot
			const snapshot: FormSnapshot = {
				id: `${now}-${this.sessionId}`,
				timestamp: now,
				state,
				label: options.label,
				isAutoSave: options.isAutoSave || false,
			};

			// Get existing snapshots
			const snapshots = await this.getSnapshots();
			snapshots.push(snapshot);

			// Keep only the most recent snapshots
			const recentSnapshots = snapshots.sort((a, b) => b.timestamp - a.timestamp).slice(0, this.config.maxSnapshots);

			// Save to storage
			const dataToSave = this.compressData(
				this.encryptData(
					JSON.stringify({
						current: state,
						snapshots: recentSnapshots,
					}),
				),
			);

			storage.setItem(this.config.key, dataToSave);
		} catch (error) {
			console.error('Failed to save form state:', error);
		}
	}

	/**
	 * Load form state
	 */
	async loadFormState(): Promise<PersistedFormState | null> {
		try {
			const storage = this.getStorage();
			const savedData = storage.getItem(this.config.key);

			if (!savedData) return null;

			const decryptedData = this.decryptData(savedData);
			const decompressedData = this.decompressData(decryptedData);
			const parsedData = JSON.parse(decompressedData);

			const state: PersistedFormState = parsedData.current;

			// Check if data is expired
			if (Date.now() - state.metadata.savedAt > this.config.ttl) {
				await this.clearFormState();
				return null;
			}

			return state;
		} catch (error) {
			console.error('Failed to load form state:', error);
			return null;
		}
	}

	/**
	 * Get all snapshots
	 */
	async getSnapshots(): Promise<FormSnapshot[]> {
		try {
			const storage = this.getStorage();
			const savedData = storage.getItem(this.config.key);

			if (!savedData) return [];

			const decryptedData = this.decryptData(savedData);
			const decompressedData = this.decompressData(decryptedData);
			const parsedData = JSON.parse(decompressedData);

			return parsedData.snapshots || [];
		} catch (error) {
			console.error('Failed to load snapshots:', error);
			return [];
		}
	}

	/**
	 * Get recovery information
	 */
	async getRecoveryInfo(fields: FormFieldSchema[]): Promise<FormRecoveryInfo> {
		const state = await this.loadFormState();

		if (!state) {
			return {
				hasRecoverableData: false,
				lastSaved: 0,
				formVersion: this.config.version,
				isCompatible: true,
				fieldCount: 0,
				completionPercentage: 0,
			};
		}

		const currentSchemaHash = this.generateSchemaHash(fields);
		const isCompatible = state.metadata.formSchema === currentSchemaHash;

		return {
			hasRecoverableData: true,
			lastSaved: state.metadata.savedAt,
			formVersion: state.metadata.version,
			isCompatible,
			fieldCount: state.progress?.totalFields || 0,
			completionPercentage: state.progress?.percentage || 0,
		};
	}

	/**
	 * Check if form is compatible with saved state
	 */
	async isFormCompatible(fields: FormFieldSchema[]): Promise<boolean> {
		const state = await this.loadFormState();
		if (!state) return true;

		const currentSchemaHash = this.generateSchemaHash(fields);
		return state.metadata.formSchema === currentSchemaHash;
	}

	/**
	 * Restore form state to a specific snapshot
	 */
	async restoreSnapshot(snapshotId: string): Promise<PersistedFormState | null> {
		const snapshots = await this.getSnapshots();
		const snapshot = snapshots.find((s) => s.id === snapshotId);

		if (!snapshot) return null;

		// Save the restored state as current
		const storage = this.getStorage();
		const dataToSave = this.compressData(
			this.encryptData(
				JSON.stringify({
					current: snapshot.state,
					snapshots,
				}),
			),
		);

		storage.setItem(this.config.key, dataToSave);
		return snapshot.state;
	}

	/**
	 * Clear form state
	 */
	async clearFormState(): Promise<void> {
		try {
			const storage = this.getStorage();
			storage.removeItem(this.config.key);
		} catch (error) {
			console.error('Failed to clear form state:', error);
		}
	}

	/**
	 * Start auto-save
	 */
	startAutoSave(
		getValues: () => Record<string, CellValue>,
		getFields: () => FormFieldSchema[],
		getValidation?: () => { errors: Record<string, string>; isValid: boolean },
	): void {
		if (!this.config.autoSave) return;

		this.stopAutoSave();

		this.autoSaveTimer = setInterval(async () => {
			const values = getValues();
			const fields = getFields();
			const validation = getValidation?.();

			await this.saveFormState(values, fields, {
				isAutoSave: true,
				validation,
			});
		}, this.config.autoSaveDelay);
	}

	/**
	 * Stop auto-save
	 */
	stopAutoSave(): void {
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
			this.autoSaveTimer = undefined;
		}
	}

	/**
	 * Create manual snapshot
	 */
	async createSnapshot(values: Record<string, CellValue>, fields: FormFieldSchema[], label: string): Promise<void> {
		await this.saveFormState(values, fields, {
			isAutoSave: false,
			label,
		});
	}

	/**
	 * Cleanup expired states across all forms
	 */
	static async cleanupExpiredStates(ttl: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
		try {
			const now = Date.now();
			const storage = localStorage;

			for (let i = 0; i < storage.length; i++) {
				const key = storage.key(i);
				if (!key || !key.startsWith('form-state')) continue;

				try {
					const data = storage.getItem(key);
					if (!data) continue;

					const parsedData = JSON.parse(data);
					const savedAt = parsedData.current?.metadata?.savedAt;

					if (savedAt && now - savedAt > ttl) {
						storage.removeItem(key);
					}
				} catch {
					// Remove invalid data
					if (key) storage.removeItem(key);
				}
			}
		} catch (error) {
			console.error('Failed to cleanup expired states:', error);
		}
	}

	/**
	 * Get storage usage statistics
	 */
	static getStorageStats(): {
		used: number;
		available: number;
		formStates: number;
		percentage: number;
	} {
		try {
			let used = 0;
			let formStates = 0;

			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (!key) continue;

				const value = localStorage.getItem(key);
				if (value) {
					used += key.length + value.length;
					if (key.startsWith('form-state')) {
						formStates++;
					}
				}
			}

			// Estimate available storage (5MB is typical localStorage limit)
			const available = 5 * 1024 * 1024;
			const percentage = (used / available) * 100;

			return {
				used,
				available,
				formStates,
				percentage,
			};
		} catch (error) {
			console.error('Failed to get storage stats:', error);
			return { used: 0, available: 0, formStates: 0, percentage: 0 };
		}
	}
}

// React hook for form persistence
export const useFormPersistence = (config: Partial<FormPersistenceConfig> = {}) => {
	const [manager] = React.useState(() => new FormPersistenceManager(config));
	const [isLoading, setIsLoading] = React.useState(false);
	const [hasRecoverableData, setHasRecoverableData] = React.useState(false);

	const saveState = React.useCallback(
		async (
			values: Record<string, CellValue>,
			fields: FormFieldSchema[],
			options?: Parameters<FormPersistenceManager['saveFormState']>[2],
		) => {
			setIsLoading(true);
			try {
				await manager.saveFormState(values, fields, options);
			} finally {
				setIsLoading(false);
			}
		},
		[manager],
	);

	const loadState = React.useCallback(async () => {
		setIsLoading(true);
		try {
			return await manager.loadFormState();
		} finally {
			setIsLoading(false);
		}
	}, [manager]);

	const checkRecovery = React.useCallback(
		async (fields: FormFieldSchema[]) => {
			const info = await manager.getRecoveryInfo(fields);
			setHasRecoverableData(info.hasRecoverableData && info.isCompatible);
			return info;
		},
		[manager],
	);

	const clearState = React.useCallback(async () => {
		await manager.clearFormState();
		setHasRecoverableData(false);
	}, [manager]);

	React.useEffect(() => {
		return () => {
			manager.stopAutoSave();
		};
	}, [manager]);

	return {
		manager,
		saveState,
		loadState,
		checkRecovery,
		clearState,
		isLoading,
		hasRecoverableData,
	};
};
