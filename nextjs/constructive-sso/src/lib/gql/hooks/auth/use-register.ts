import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RegisterFormData } from '@/lib/auth/schemas';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAuthActions } from '@/store/app-store';
import { ROUTE_PATHS } from '@/app-routes';
import { useSignUpMutation } from '@sdk/auth';

import { authKeys } from '../query-keys';

/**
 * Register hook using SDK-generated mutation.
 * sign_up never signs anyone in: the tenant mails the address a link that does,
 * so every answer goes to the same "check your email" page.
 */
export function useRegister() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();
	const router = useRouter();
	const signUpMutation = useSignUpMutation({ selection: { fields: { clientMutationId: true } } });

	return useMutation({
		mutationKey: authKeys.signUp.queryKey,
		mutationFn: async (formData: RegisterFormData) => {
			await signUpMutation.mutateAsync({
				input: {
					email: formData.email,
					password: formData.password,
				},
			});
			return { email: formData.email };
		},
		onSuccess: ({ email }) => {
			TokenManager.clearToken();
			authActions.setUnauthenticated();
			queryClient.invalidateQueries({ queryKey: authKeys._def });

			const url = `${ROUTE_PATHS.CHECK_EMAIL}?type=verification&email=${encodeURIComponent(email)}`;
			router.push(url as Route);
		},
		onError: () => {
			authActions.setUnauthenticated();
		},
	});
}
