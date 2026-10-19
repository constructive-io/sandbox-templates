import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import type { RegisterFormData } from '@/lib/auth/schemas';
import { ROUTE_PATHS } from '@/app-routes';
import { useSignUpMutation } from '@sdk/auth';

import { authKeys } from '../query-keys';

/**
 * Register hook using SDK-generated mutation.
 *
 * Password sign-up signs nobody in and answers every address the same way
 * (planning#2283): it mails the address a verification link, and the password
 * stays pending until that link is opened (planning#2291). So there is no
 * session to keep here — the form goes to the check-email page.
 */
export function useRegister() {
	const router = useRouter();
	const signUpMutation = useSignUpMutation({ selection: { fields: { clientMutationId: true } } });

	return useMutation({
		mutationKey: authKeys.signUp.queryKey,
		mutationFn: async (formData: RegisterFormData) => {
			await signUpMutation.mutateAsync({ input: { email: formData.email, password: formData.password } });
			return formData.email;
		},
		onSuccess: (email) => {
			const url = `${ROUTE_PATHS.CHECK_EMAIL}?type=verification&email=${encodeURIComponent(email)}`;
			router.push(url as Route);
		},
	});
}
