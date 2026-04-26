import { useCallback, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Status surfaced by the app-update indicator.
 *
 * - `idle` - default; no UI shown unless a pull gesture is in progress.
 * - `checking` - SW `update()` in flight.
 * - `updating` - new SW found; activating it and reloading.
 * - `up-to-date` - check finished, no new SW; shown briefly then auto-cleared.
 * - `offline` - check failed (e.g. no network); shown briefly.
 */
export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'updating'
  | 'up-to-date'
  | 'offline';

/**
 * Wraps `vite-plugin-pwa`'s `useRegisterSW` and exposes a single
 * `checkAndApply` action. The plugin is configured with
 * `registerType: 'prompt'`, so a waiting SW never auto-activates - the
 * app must explicitly call `updateServiceWorker(true)` to skip waiting
 * and reload. This is what makes pull-to-refresh predictable on iOS PWA.
 */
export function useAppUpdate() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const statusTimeoutRef = useRef<number | undefined>(undefined);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration ?? undefined;
    },
  });

  const flashStatus = useCallback((next: UpdateStatus, ms = 1500) => {
    setStatus(next);
    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = window.setTimeout(() => {
      setStatus('idle');
      statusTimeoutRef.current = undefined;
    }, ms);
  }, []);

  const checkAndApply = useCallback(async () => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = undefined;
    }

    if (needRefresh) {
      setStatus('updating');
      void updateServiceWorker(true);
      return;
    }

    setStatus('checking');
    const registration = registrationRef.current;
    let foundUpdate = false;
    try {
      if (registration) {
        await registration.update();
        foundUpdate =
          !!registration.waiting ||
          (registration.installing?.state === 'installed');
      }
    } catch {
      flashStatus('offline');
      return;
    }

    if (foundUpdate) {
      setStatus('updating');
      void updateServiceWorker(true);
      return;
    }

    flashStatus('up-to-date');
  }, [flashStatus, needRefresh, updateServiceWorker]);

  return { status, checkAndApply };
}
