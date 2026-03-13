import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RegisterFormData } from '@/lib/auth/schemas';
import { TokenManager } from '@/lib/auth/token-manager';
import { toApiToken } from '@/lib/auth/token-utils';
import { useAuthActions } from '@/store/app-store';
import type { UserProfile } from '@/store/auth-slice';
import { ROUTE_PATHS } from '@/app-routes';
import {
	useSendVerificationEmailMutation,
	useSignUpMutation,
} from '@sdk/auth';

import { authKeys } from '../../query-keys';

/**
 * Schema-builder register hook using SDK-generated mutation
 * Handles registration and verification email flow
 */
export function useRegisterSb() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();
	const router = useRouter();
	const signUpMutation = useSignUpMutation({
		selection: {
			fields: {
				result: {
					select: {
						id: true,
						userId: true,
						accessToken: true,
						accessTokenExpiresAt: true,
						isVerified: true,
						totpEnabled: true,
					},
				},
			},
		},
	});
	const sendVerificationMutation = useSendVerificationEmailMutation({ selection: { fields: { result: true } } });

	return useMutation({
		mutationKey: authKeys.signUp.queryKey,
		mutationFn: async (formData: RegisterFormData) => {
			const result = await signUpMutation.mutateAsync({
				input: {
					email: formData.email,
					password: formData.password,
					rememberMe: formData.rememberMe ?? true,
				},
			});

			const signUpResult = result.signUp?.result;

			if (!signUpResult) {
				throw new Error('Sign up failed. Please try again.');
			}

			return {
				rememberMe: formData.rememberMe ?? true,
				email: formData.email,
				signUpResult,
			};
		},
		onSuccess: async ({ email, rememberMe, signUpResult }) => {
			const token = toApiToken(signUpResult);

			if (!token) {
				throw new Error('Sign up failed. Please try again.');
			}

			const userId = token.userId || token.id;

			// signUpResult.isVerified reflects the user's actual email verification status
			// const isVerified = signUpResult.isVerified ?? false;
			const isVerified = true;

			if (isVerified) {
				TokenManager.setToken(token, rememberMe, 'schema-builder');
				const user: UserProfile = {
					id: userId,
					email: email || '',
				};
				authActions.setAuthenticated(user, token, rememberMe);
				queryClient.invalidateQueries({ queryKey: authKeys._def });
				return;
			}

			// Clear token before sending verification email (public mutation, no auth needed)
			TokenManager.clearToken();
			authActions.setUnauthenticated();

			// Not verified: send email and redirect
			try {
				await sendVerificationMutation.mutateAsync({
					input: { email },
				});
			} catch {
				// Best-effort: still navigate to check-email even if sending fails
			}
			queryClient.invalidateQueries({ queryKey: authKeys._def });

			const url = `${ROUTE_PATHS.CHECK_EMAIL}?type=verification&email=${encodeURIComponent(email)}`;
			router.push(url as Route);
		},
		onError: () => {
			authActions.setUnauthenticated();
		},
	});
}
