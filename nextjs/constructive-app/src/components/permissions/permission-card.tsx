'use client';

import { useEffect, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Field } from '@constructive-io/ui/field';
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@constructive-io/ui/input-group';
import type { CardComponent } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Loader2Icon } from 'lucide-react';

import {
	useCreateAppPermissionMutation,
	useCreateOrgPermissionMutation,
	useUpdateAppPermissionMutation,
	useUpdateOrgPermissionMutation,
} from '@sdk/api';

import { PermissionItem, PermissionType } from './permissions.types';

export type PermissionCardProps = {
	type: PermissionType;
	editingPermission: PermissionItem | null;
	onSuccess: () => void;
};

export const PermissionCard: CardComponent<PermissionCardProps> = ({ type, editingPermission, onSuccess, card }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const createAppPermission = useCreateAppPermissionMutation();
	const updateAppPermission = useUpdateAppPermissionMutation();
	const createMembershipPermission = useCreateOrgPermissionMutation();
	const updateMembershipPermission = useUpdateOrgPermissionMutation();

	const isEditMode = !!editingPermission;
	const isApp = type === 'app';
	const typeLabel = isApp ? 'App' : 'Membership';

	const isLoading =
		createAppPermission.isPending ||
		updateAppPermission.isPending ||
		createMembershipPermission.isPending ||
		updateMembershipPermission.isPending;

	const isValid = name.trim() !== '';

	useEffect(() => {
		if (editingPermission) {
			setName(editingPermission.name);
			setDescription(editingPermission.description || '');
		}
	}, [editingPermission]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isValid) {
			showErrorToast({
				message: 'Invalid input',
				description: 'Name is required.',
			});
			return;
		}

		try {
			if (isEditMode && editingPermission) {
				if (isApp) {
					await updateAppPermission.mutateAsync({
						input: {
							id: editingPermission.id,
							patch: { name: name.trim(), description: description.trim() || null },
						},
					});
				} else {
					await updateMembershipPermission.mutateAsync({
						input: {
							id: editingPermission.id,
							patch: { name: name.trim(), description: description.trim() || null },
						},
					});
				}
				showSuccessToast({
					message: `${typeLabel} permission updated`,
					description: `"${name.trim()}" has been updated.`,
				});
			} else {
				if (isApp) {
					await createAppPermission.mutateAsync({
						input: { appPermission: { name: name.trim(), description: description.trim() || null } },
					});
				} else {
					await createMembershipPermission.mutateAsync({
						input: { orgPermission: { name: name.trim(), description: description.trim() || null } },
					});
				}
				showSuccessToast({
					message: `${typeLabel} permission created`,
					description: `"${name.trim()}" has been created.`,
				});
			}

			onSuccess();
			card.close();
		} catch (err) {
			showErrorToast({
				message: isEditMode
					? `Failed to update ${typeLabel.toLowerCase()} permission`
					: `Failed to create ${typeLabel.toLowerCase()} permission`,
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			<form onSubmit={handleSubmit} className='flex flex-1 flex-col'>
				<div className='flex-1 space-y-4 p-4'>
					<Field label='Name' required>
						<InputGroup>
							<InputGroupInput
								placeholder='e.g. read_users'
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								autoComplete='off'
								disabled={isLoading}
							/>
						</InputGroup>
					</Field>

					<Field label='Description'>
						<InputGroup>
							<InputGroupTextarea
								placeholder='Describe what this permission allows...'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isLoading}
								rows={3}
							/>
						</InputGroup>
					</Field>
				</div>

				<div className='flex justify-end gap-2 border-t px-4 py-3'>
					<Button type='button' variant='outline' onClick={() => card.close()} disabled={isLoading}>
						Cancel
					</Button>
					<Button type='submit' disabled={isLoading || !isValid}>
						{isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
						{isLoading ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</div>
	);
};
