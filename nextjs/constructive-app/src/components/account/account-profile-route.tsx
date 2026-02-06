'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, Mail, Upload, User } from 'lucide-react';

import { useUpdateEmail, useVerifyEmail } from '@/lib/gql/hooks/schema-builder/account/use-account-email';
import {
	useAccountProfile,
	useUpdateUser,
	useUpdateUserProfile,
} from '@/lib/gql/hooks/schema-builder/account/use-account-profile';
import { useAppStore } from '@/store/app-store';
import { Avatar, AvatarFallback } from '@constructive-io/ui/avatar';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { Textarea } from '@constructive-io/ui/textarea';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { PageHeaderWithIcon } from '@/components/shared/page-header-with-icon';

interface ProfileFormState {
	displayName: string;
	username: string;
	bio: string;
}

interface EmailFormState {
	email: string;
	emailId: string;
	isVerified: boolean;
}

type EmailUpdateStatus = 'idle' | 'updated' | 'needs-verification';

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function getInitials(displayName: string | null, username: string | null): string {
	const name = displayName || username || '';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function AccountProfileRoute() {
	const userId = useAppStore((state) => state.auth.user?.id || '');

	const { profile, isLoading } = useAccountProfile({ userId, enabled: !!userId });
	const { updateUser, isUpdating: isUpdatingUser } = useUpdateUser();
	const { updateUserProfile, isUpdating: isUpdatingProfile } = useUpdateUserProfile();
	const { updateEmail, isUpdating: isUpdatingEmail } = useUpdateEmail();
	const { verifyEmail, isVerifying } = useVerifyEmail();

	const [profileState, setProfileState] = useState<ProfileFormState>({
		displayName: '',
		username: '',
		bio: '',
	});
	const [emailState, setEmailState] = useState<EmailFormState>({
		email: '',
		emailId: '',
		isVerified: false,
	});
	const [emailUpdateStatus, setEmailUpdateStatus] = useState<EmailUpdateStatus>('idle');

	useEffect(() => {
		if (profile) {
			setProfileState({
				displayName: profile.displayName || '',
				username: profile.username || '',
				bio: profile.bio || '',
			});
			setEmailState({
				email: profile.primaryEmail?.email || '',
				emailId: profile.primaryEmail?.id || '',
				isVerified: profile.primaryEmail?.isVerified || false,
			});
			setEmailUpdateStatus('idle');
		}
	}, [
		profile?.id,
		profile?.displayName,
		profile?.username,
		profile?.bio,
		profile?.primaryEmail?.email,
		profile?.primaryEmail?.id,
	]);

	const updateFormField = (field: keyof ProfileFormState, value: string) => {
		setProfileState((prev) => ({ ...prev, [field]: value }));
	};

	const hasProfileChanges =
		profileState.displayName !== (profile?.displayName || '') ||
		profileState.username !== (profile?.username || '') ||
		profileState.bio !== (profile?.bio || '');

	const hasEmailChanges = emailState.email !== (profile?.primaryEmail?.email || '');
	const isEmailValid = isValidEmail(emailState.email);

	const isSaving = isUpdatingUser || isUpdatingProfile;

	const handleSaveProfile = async () => {
		if (!profile || !hasProfileChanges) return;

		try {
			const userPatch: { displayName?: string; username?: string } = {};
			if (profileState.displayName !== (profile.displayName || '')) {
				userPatch.displayName = profileState.displayName;
			}
			if (profileState.username !== (profile.username || '')) {
				userPatch.username = profileState.username;
			}

			if (Object.keys(userPatch).length > 0) {
				await updateUser({ userId: profile.id, patch: userPatch });
			}

			if (profileState.bio !== (profile.bio || '')) {
				await updateUserProfile({
					userId: profile.id,
					userProfileId: profile.userProfileId,
					patch: { bio: profileState.bio },
				});
			}

			showSuccessToast({ message: 'Profile updated', description: 'Your profile has been saved successfully.' });
		} catch (err) {
			console.error('Failed to save profile:', err);
			showErrorToast({
				message: 'Failed to update profile',
				description: err instanceof Error ? err.message : 'An error occurred while saving your profile.',
			});
		}
	};

	const handleSaveEmail = async () => {
		if (!profile || !hasEmailChanges || !emailState.emailId || !isEmailValid) return;

		try {
			await updateEmail({
				userId: profile.id,
				currentEmailId: emailState.emailId,
				newEmail: emailState.email,
				currentEmail: profile.primaryEmail?.email || '',
				isPrimary: true,
				isVerified: false,
			});
			setEmailUpdateStatus('updated');
			setEmailState((prev) => ({ ...prev, isVerified: false }));
			showSuccessToast({ message: 'Email updated', description: 'Your email has been updated successfully.' });
		} catch (err) {
			console.error('Failed to update email:', err);
			showErrorToast({
				message: 'Failed to update email',
				description: err instanceof Error ? err.message : 'An error occurred while updating your email.',
			});
		}
	};

	const handleVerifyEmail = async () => {
		if (!emailState.emailId) return;

		try {
			await verifyEmail({
				emailId: emailState.emailId,
				token: '',
			});
			setEmailUpdateStatus('idle');
			setEmailState((prev) => ({ ...prev, isVerified: true }));
			showSuccessToast({ message: 'Email verified', description: 'Your email has been verified successfully.' });
		} catch (err) {
			console.error('Failed to verify email:', err);
			showErrorToast({
				message: 'Failed to verify email',
				description: err instanceof Error ? err.message : 'An error occurred while verifying your email.',
			});
		}
	};

	const handleDismissBanner = () => {
		setEmailUpdateStatus('idle');
	};

	useEffect(() => {
		if (emailUpdateStatus === 'updated' && !emailState.isVerified) {
			setEmailUpdateStatus('needs-verification');
		}
	}, [emailUpdateStatus, emailState.isVerified]);

	const initials = getInitials(profileState.displayName, profileState.username);

	if (isLoading || !profile) {
		return (
			<div className='flex h-full items-center justify-center'>
				<Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
			</div>
		);
	}

	return (
		<div className='h-full overflow-y-auto'>
			<div className='mx-auto max-w-4xl px-6 py-8 lg:px-8 lg:py-10'>
				<PageHeaderWithIcon
					title='Account Profile'
					description='Manage your personal information and account details'
					icon={User}
				/>

				<div className='mt-12 space-y-16'>
					{/* Profile Photo Section */}
					<section
						className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards duration-500'
						style={{ animationDelay: '50ms' }}
					>
						<div className='mb-8'>
							<h2 className='text-foreground text-lg font-semibold tracking-tight'>Profile Photo</h2>
							<p className='text-muted-foreground mt-1 text-sm'>Your profile image visible to others</p>
						</div>

						<div className='flex items-center gap-6'>
							<Avatar className='ring-offset-background ring-muted/50 size-20 ring-4 ring-offset-2'>
								<AvatarFallback className='bg-primary/10 text-primary text-xl font-medium'>{initials}</AvatarFallback>
							</Avatar>
							<div className='space-y-2'>
								<Button variant='outline' className='gap-2'>
									<Upload className='size-4' />
									Upload Photo
								</Button>
								<p className='text-muted-foreground text-xs'>JPG, PNG or GIF. Max 2MB.</p>
							</div>
						</div>
					</section>

					{/* Personal Information Section */}
					<section
						className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards duration-500'
						style={{ animationDelay: '100ms' }}
					>
						<div className='mb-8'>
							<h2 className='text-foreground text-lg font-semibold tracking-tight'>Personal Information</h2>
							<p className='text-muted-foreground mt-1 text-sm'>Your basic profile details</p>
						</div>

						<div className='space-y-8'>
							<div className='flex flex-col space-y-1'>
								<Label htmlFor='display-name' className='text-foreground text-sm font-medium'>
									Display Name
								</Label>
								<Input
									id='display-name'
									value={profileState.displayName}
									onChange={(e) => updateFormField('displayName', e.target.value)}
									placeholder='Enter your name'
								/>
								<p className='text-muted-foreground text-xs'>How your name appears across the platform</p>
							</div>

							<div className='flex flex-col space-y-1'>
								<Label htmlFor='username' className='text-foreground text-sm font-medium'>
									Username
								</Label>
								<Input
									id='username'
									value={profileState.username}
									onChange={(e) => updateFormField('username', e.target.value)}
									placeholder='Enter your username'
								/>
								<p className='text-muted-foreground text-xs'>Your unique identifier on the platform</p>
							</div>

							<div className='flex flex-col space-y-1'>
								<Label htmlFor='bio' className='text-foreground text-sm font-medium'>
									Bio
								</Label>
								<Textarea
									id='bio'
									value={profileState.bio}
									onChange={(e) => updateFormField('bio', e.target.value)}
									rows={3}
									placeholder='Tell us about yourself...'
								/>
								<p className='text-muted-foreground text-xs'>A brief description shown on your profile</p>
							</div>

							<div className='flex items-center justify-between pt-4'>
								<div className='flex items-center gap-2'>
									{hasProfileChanges ? (
										<>
											<span className='relative flex h-2 w-2'>
												<span
													className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400
														opacity-75'
												/>
												<span className='relative inline-flex h-2 w-2 rounded-full bg-amber-500' />
											</span>
											<span className='text-foreground/70 text-xs font-medium'>Unsaved changes</span>
										</>
									) : (
										<>
											<Check className='text-success h-4 w-4' />
											<span className='text-muted-foreground text-xs'>All changes saved</span>
										</>
									)}
								</div>
								<Button
									size='sm'
									onClick={handleSaveProfile}
									disabled={isSaving || !hasProfileChanges}
									className='group gap-2'
								>
									{isSaving ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											Save Changes
											<ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
										</>
									)}
								</Button>
							</div>
						</div>
					</section>

					{/* Contact Information Section */}
					<section
						className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards duration-500'
						style={{ animationDelay: '150ms' }}
					>
						<div className='mb-8'>
							<h2 className='text-foreground text-lg font-semibold tracking-tight'>Contact Information</h2>
							<p className='text-muted-foreground mt-1 text-sm'>How we can reach you</p>
						</div>

						<div className='space-y-8'>
							<div className='flex flex-col space-y-1'>
								<Label htmlFor='email' className='text-foreground text-sm font-medium'>
									Email Address
								</Label>
								<Input
									id='email'
									type='email'
									value={emailState.email}
									onChange={(e) => {
										setEmailState((prev) => ({ ...prev, email: e.target.value }));
										if (emailUpdateStatus !== 'idle') setEmailUpdateStatus('idle');
									}}
									placeholder='Enter your email'
									className={!isEmailValid && emailState.email ? 'border-destructive' : ''}
								/>
								{!isEmailValid && emailState.email && (
									<p className='text-destructive text-xs'>Please enter a valid email address</p>
								)}
								<p className='text-muted-foreground text-xs'>Used for notifications and account recovery</p>

								<div className='flex items-center justify-between pt-4'>
									<div className='flex items-center gap-2'>
										{emailUpdateStatus === 'updated' ? (
											<>
												<Check className='h-4 w-4 text-blue-600 dark:text-blue-400' />
												<span className='text-xs font-medium text-blue-600 dark:text-blue-400'>
													Email updated successfully
												</span>
											</>
										) : emailUpdateStatus === 'needs-verification' && !emailState.isVerified ? (
											<>
												<Mail className='h-4 w-4 text-amber-600 dark:text-amber-400' />
												<span className='text-xs font-medium text-amber-600 dark:text-amber-400'>
													Please verify your email
												</span>
											</>
										) : hasEmailChanges ? (
											<>
												<span className='relative flex h-2 w-2'>
													<span
														className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400
															opacity-75'
													/>
													<span className='relative inline-flex h-2 w-2 rounded-full bg-amber-500' />
												</span>
												<span className='text-foreground/70 text-xs font-medium'>Unsaved changes</span>
											</>
										) : (
											<>
												<Check className='text-success h-4 w-4' />
												<span className='text-muted-foreground text-xs'>All changes saved</span>
											</>
										)}
									</div>
									<Button
										size='sm'
										onClick={
											emailUpdateStatus === 'needs-verification' && !emailState.isVerified
												? handleVerifyEmail
												: handleSaveEmail
										}
										disabled={
											emailUpdateStatus === 'needs-verification' && !emailState.isVerified
												? isVerifying
												: isUpdatingEmail || !hasEmailChanges || !isEmailValid
										}
										className='group gap-2'
									>
										{emailUpdateStatus === 'needs-verification' && !emailState.isVerified ? (
											isVerifying ? (
												<>
													<Loader2 className='h-4 w-4 animate-spin' />
													Verifying...
												</>
											) : (
												<>
													Verify Email
													<ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
												</>
											)
										) : isUpdatingEmail ? (
											<>
												<Loader2 className='h-4 w-4 animate-spin' />
												Saving...
											</>
										) : (
											<>
												Save Changes
												<ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</section>
				</div>

				<div className='h-12' />
			</div>
		</div>
	);
}
