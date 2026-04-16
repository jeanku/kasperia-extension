import { useEffect, useMemo, useState } from 'react';

export interface UseBootDelayOptions {
    enabled?: boolean;
    delay?: number;
    storageKey?: string;
}

export function useBootDelay(options: UseBootDelayOptions = {}): boolean {
    const { enabled = true, delay = 310, storageKey = 'extension_boot_delayed', } = options;

    const shouldUseDelay = useMemo(() => {
        if (typeof window === 'undefined') return false;
        if (!enabled) return false;
        return sessionStorage.getItem(storageKey) !== '1';
    }, [enabled, storageKey]);
    const [ready, setReady] = useState<boolean>(() => !shouldUseDelay);
    useEffect(() => {
        if (!shouldUseDelay) {
            setReady(true);
            return;
        }
        const timer = window.setTimeout(() => {
            sessionStorage.setItem(storageKey, '1');
            setReady(true);
        }, delay);
        return () => {
            window.clearTimeout(timer);
        };
    }, [delay, shouldUseDelay, storageKey]);
    return ready;
}