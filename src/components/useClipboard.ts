// hooks/useClipboard.ts
import { useCallback } from 'react';
import { useNotice } from '@/components/NoticeBar/NoticeBar';

export function useClipboard() {
    const { noticeSuccess, noticeError } = useNotice();

    const handleCopy = useCallback(
        async (content: string) => {
            try {
                if (!content) return 
                await navigator.clipboard.writeText(content);
                noticeSuccess('Copied to clipboard');
            } catch (err) {
                noticeError('Failed to copy');
            }
        },
        [noticeSuccess, noticeError]
    );

    return { handleCopy };
}
