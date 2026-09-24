'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { formatPhoneNumber, normalizePhoneNumber } from '@/components/ui/phone-input';

import {
  AccountPhoneNumbersUnavailableError,
  type AccountPhoneNumber,
  type AccountPhoneNumbersAction,
  type AccountPhoneNumbersAdapter,
  type AccountPhoneNumbersBusy,
  type AccountPhoneNumbersCodeEntry,
  type AccountPhoneNumbersFeedback,
  type AccountPhoneNumbersScope
} from './account-phone-numbers-contracts';
import {
  interpolateAccountPhoneNumbersMessage as interpolate,
  mergeAccountPhoneNumbersMessages,
  type AccountPhoneNumbersMessageOverrides,
  type AccountPhoneNumbersMessages
} from './messages';
import type { AccountPhoneNumbersViewProps } from './account-phone-numbers-view';

export type UseAccountPhoneNumbersOptions = {
  /** Loaded from once per mount. Remount (for example with a `key`) when the signed-in identity changes. */
  adapter: AccountPhoneNumbersAdapter;
  messages?: AccountPhoneNumbersMessageOverrides;
  /** Digits in the texted code. */
  codeLength?: number;
  /** Returns the message to show for an error, or undefined to fall back to `messages.errors`. */
  formatError?: (error: unknown, action: AccountPhoneNumbersAction) => string | undefined;
  onError?: (error: unknown, action: AccountPhoneNumbersAction) => void;
};

/** Everything `AccountPhoneNumbersView` needs, including the message overrides, so `{...state}` is enough. */
export type UseAccountPhoneNumbersResult = Omit<AccountPhoneNumbersViewProps, 'className' | 'defaultCountry'>;

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const { code, extensions } = error as { code?: unknown; extensions?: { code?: unknown } };
  if (typeof code === 'string') return code;
  return typeof extensions?.code === 'string' ? extensions.code : undefined;
}

function errorMessage(error: unknown, messages: AccountPhoneNumbersMessages) {
  const code = errorCode(error);
  if (code && messages.errors[code]) return messages.errors[code];
  return error instanceof Error && error.message ? error.message : messages.errors.UNKNOWN_ERROR;
}

function scopeOf(busy: AccountPhoneNumbersBusy): AccountPhoneNumbersScope {
  return busy.scope === 'add' ? busy : { scope: 'phone', phoneId: busy.phoneId };
}

/**
 * The add → text a code → verify → remove flow as state for `AccountPhoneNumbersView`. Adding a number texts it a
 * code straight away, a code that no longer applies reloads the list, and every outcome is scoped to the row (or
 * the add form) that caused it.
 */
export function useAccountPhoneNumbers({
  adapter,
  messages: messageOverrides,
  codeLength = 6,
  formatError,
  onError
}: UseAccountPhoneNumbersOptions): UseAccountPhoneNumbersResult {
  const messages = mergeAccountPhoneNumbersMessages(messageOverrides);
  const [phones, setPhones] = useState<readonly AccountPhoneNumber[] | null>(null);
  /** Sequence of in-flight runs; the newest owns the shared busy/feedback slots. */
  const runSeq = useRef(0);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [feedback, setFeedback] = useState<AccountPhoneNumbersFeedback>();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<AccountPhoneNumbersBusy>();
  const [codeEntry, setCodeEntry] = useState<AccountPhoneNumbersCodeEntry>();

  function fail(cause: unknown, action: AccountPhoneNumbersAction, scope: AccountPhoneNumbersScope) {
    onError?.(cause, action);
    setFeedback({ ...scope, error: formatError?.(cause, action) || errorMessage(cause, messages) });
  }

  async function refresh() {
    setLoading(true);
    setFeedback(undefined);
    try {
      setPhones(await adapter.list());
      setUnavailable(false);
    } catch (cause) {
      if (cause instanceof AccountPhoneNumbersUnavailableError) setUnavailable(true);
      else fail(cause, 'load', { scope: 'card' });
    } finally {
      setLoading(false);
    }
  }

  // Once per mount, matching the adapter contract; a new identity remounts the block.
  useEffect(() => {
    void refresh();
  }, []);

  /** Marks `next` busy, clears old feedback, and shows any failure in the place `next` names. */
  async function run<T>(
    next: AccountPhoneNumbersBusy,
    action: AccountPhoneNumbersAction,
    work: () => Promise<T>
  ): Promise<{ ok: true; value: T; own: boolean } | { ok: false; own: boolean }> {
    // Actions can overlap (the add form and a row's verify are disabled
    // separately), so each run owns the slots it takes: a later run's state
    // survives an earlier run's finally, and a failure only clears feedback
    // it still owns.
    const token = ++runSeq.current;
    setBusy(next);
    setFeedback(undefined);
    try {
      const value = await work();
      const own = token === runSeq.current;
      if (own) setBusy(undefined);
      return { ok: true, value, own };
    } catch (cause) {
      const own = token === runSeq.current;
      if (own) setBusy(undefined);
      // A newer action owns the feedback slot now — its outcome is what the
      // user is waiting on, so this older failure steps aside entirely.
      if (own) fail(cause, action, scopeOf(next));
      return { ok: false, own };
    }
  }

  async function sendCode(phone: AccountPhoneNumber) {
    const ref = { id: phone.id, number: phone.number };
    const sent = await run({ scope: 'phone', phoneId: phone.id, action: 'send' }, 'send', () => adapter.sendCode(ref));
    if (!sent.ok) return;
    // Nothing was sent because the number is already verified; reload so the row shows that.
    if (!sent.value) return refresh();
    if (!sent.own) return;
    setCodeEntry({ phoneId: phone.id, code: '' });
    setFeedback({
      scope: 'phone',
      phoneId: phone.id,
      notice: interpolate(messages.codeSentNotice, { number: formatPhoneNumber(phone.number) })
    });
  }

  async function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = normalizePhoneNumber(draft);
    if (!number) {
      setFeedback({ scope: 'add', error: messages.invalidNumber });
      return;
    }
    const added = await run({ scope: 'add' }, 'add', () => adapter.add({ number }));
    if (!added.ok) return;
    const phone = added.value;
    setPhones((current) => [...(current ?? []), phone]);
    setDraft('');
    if (!phone.isVerified) await sendCode(phone);
  }

  async function onVerify(phone: AccountPhoneNumber, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = codeEntry?.code ?? '';
    if (code.length !== codeLength || !/^\d+$/.test(code)) return;
    const busyRow = { scope: 'phone', phoneId: phone.id, action: 'verify' } as const;
    const verified = await run(busyRow, 'verify', () => adapter.verify({ id: phone.id, number: phone.number, code }));
    if (!verified.ok) return;
    if (!verified.value) {
      if (verified.own) setFeedback({ scope: 'phone', phoneId: phone.id, error: messages.wrongCode });
      return;
    }
    // The row's own state updates regardless (a late verify still flipped
    // the row); only the shared notice defers to a newer action.
    setPhones((current) => current?.map((row) => (row.id === phone.id ? { ...row, isVerified: true } : row)) ?? null);
    setCodeEntry((entry) => (entry?.phoneId === phone.id ? undefined : entry));
    if (verified.own)
      setFeedback({
        scope: 'phone',
        phoneId: phone.id,
        notice: interpolate(messages.verifiedNotice, { number: formatPhoneNumber(phone.number) })
      });
  }

  async function onSetPrimary(phone: AccountPhoneNumber) {
    if (!adapter.setPrimary) return;
    const busyRow = { scope: 'phone', phoneId: phone.id, action: 'setPrimary' } as const;
    const done = await run(busyRow, 'setPrimary', () => adapter.setPrimary!({ id: phone.id, number: phone.number }));
    if (!done.ok) return;
    setPhones((current) => current?.map((row) => ({ ...row, isPrimary: row.id === phone.id })) ?? null);
    if (done.own)
      setFeedback({
        scope: 'phone',
        phoneId: phone.id,
        notice: interpolate(messages.setPrimaryNotice, { number: formatPhoneNumber(phone.number) })
      });
  }

  async function onRemove(phone: AccountPhoneNumber) {
    const busyRow = { scope: 'phone', phoneId: phone.id, action: 'remove' } as const;
    const removed = await run(busyRow, 'remove', () => adapter.remove({ id: phone.id, number: phone.number }));
    if (!removed.ok) return;
    setPhones((current) => current?.filter((row) => row.id !== phone.id) ?? null);
    setCodeEntry((entry) => (entry?.phoneId === phone.id ? undefined : entry));
  }

  return {
    phones,
    loading,
    unavailable,
    feedback,
    draft,
    busy,
    codeEntry,
    codeLength,
    messages: messageOverrides,
    onDraftChange: setDraft,
    onCodeChange: (code) => setCodeEntry((entry) => entry && { ...entry, code }),
    onAdd: (event) => void onAdd(event),
    onSendCode: (phone) => void sendCode(phone),
    onVerify: (phone, event) => void onVerify(phone, event),
    onCancelCode: () => {
      setCodeEntry(undefined);
      setFeedback(undefined);
    },
    onRemove: (phone) => void onRemove(phone),
    onSetPrimary: adapter.setPrimary ? (phone) => void onSetPrimary(phone) : undefined,
    onRetry: () => void refresh()
  };
}
