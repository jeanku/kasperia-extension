import { type ReactNode } from 'react';
import { useBootDelay } from '@/hooks/useBootDelay';

export interface SidePanelBootDelayGateProps {
    children?: ReactNode;
    delay?: number;
    storageKey?: string;
    fallback?: ReactNode;
}

export function SidePanelBootDelayGate({ children, delay = 310, storageKey = 'extension_boot_delayed', fallback, }: SidePanelBootDelayGateProps) {
    const isSidePanelPage = typeof window !== 'undefined' && window.location.pathname.includes('side_panel');
    const ready = useBootDelay({
        enabled: isSidePanelPage,
        delay,
        storageKey,
    });
    if (!ready) {
        return <>{fallback ?? <div className="page-box" />}</>;
    }
    return <>{children} </>;
}
