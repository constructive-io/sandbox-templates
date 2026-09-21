'use client';

/**
 * sign-out-button  (registry: auth-sign-out-button)
 *
 * Single-click sign-out button. SSO sessions revoke through the same-origin
 * BFF (`/api/auth/sign-out`); the password lane can supply `onSubmitOverride`.
 * hook. On click: runs the mutation (or `onSubmit` override), clears the
 * React Query cache via `queryClient.clear()`, then fires `onSuccess`.
 *
 * Data path = generated hook from `@/generated/auth`. No fetch, no GraphQL doc
 * string, no `@constructive-io/data`, no hardcoded URL. `QueryClient` is
 * supplied by `blocks-runtime` (the single wiring point).
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@constructive-io/ui/button';

import { cn } from '@/lib/utils';

import { defaultSignOutButtonMessages, type SignOutButtonMessages } from './messages';

export type SignOutButtonMessageOverrides = Partial<Omit<SignOutButtonMessages, 'errors'>> & {
  errors?: Partial<SignOutButtonMessages['errors']>;
};

export type SignOutButtonProps = {
  /** Content rendered inside the button. Default: messages.buttonText */
  children?: React.ReactNode;
  /** Pass-through to the underlying Button component. Default: 'ghost' */
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  /** Pass-through to the underlying Button component. */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  messages?: SignOutButtonMessageOverrides;
  /** Replace the default `useSignOutMutation` call. Cache clear still fires after resolution. */
  onSubmit?: () => Promise<void>;
  /** Fires after successful sign-out and cache clear. Navigate here. */
  onSuccess?: () => void;
  /** Fires after a mapped error. */
  onError?: (err: { message: string; code: string }) => void;
  /** Notification seam — fires for success and errors. */
  onMessage?: (event: { kind: 'success' | 'error' | 'info' | 'warning'; key: string; message?: string }) => void;
};

export function SignOutButton({
  children,
  variant = 'ghost',
  size,
  className,
  messages: messageOverrides,
  onSubmit: onSubmitOverride,
  onSuccess,
  onError,
  onMessage
}: SignOutButtonProps) {
  // Deep merge: top-level copy + errors map merged separately.
  const merged: SignOutButtonMessages = {
    ...defaultSignOutButtonMessages,
    ...messageOverrides,
    errors: { ...defaultSignOutButtonMessages.errors, ...messageOverrides?.errors }
  };

  // SSO sessions sign out through the same-origin BFF, which revokes the
  // session at the gateway and expires the HttpOnly cookie. The password lane
  // (GraphQL mutation) remains available via `onSubmitOverride`.
  const [pending, setPending] = useState(false);
  const isPending = pending;

  const queryClient = useQueryClient();

  async function handleSignOut() {
    setPending(true);
    try {
      if (onSubmitOverride) {
        await onSubmitOverride();
      } else {
        const res = await fetch('/api/auth/sign-out', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: '{}'
        });
        if (!res.ok) throw new Error('sign-out failed');
      }
      // Clear all cached query data to prevent stale auth state post-sign-out.
      queryClient.clear();
      onMessage?.({ kind: 'success', key: 'signOut.success', message: merged.successMessage });
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      onMessage?.({ kind: 'error', key: 'UNKNOWN_ERROR', message });
      onError?.({ message, code: 'UNKNOWN_ERROR' });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      aria-busy={isPending}
      disabled={isPending}
      data-testid="sign-out-button"
      onClick={handleSignOut}
    >
      {isPending ? merged.buttonPending : (children ?? merged.buttonText)}
    </Button>
  );
}
