import React, { CSSProperties, ReactNode } from 'react';
import { DotLoading,SpinLoading } from 'antd-mobile';

import './index.scss';

interface LoadingWrapperProps {
    loading?: boolean;
    placement?: 'start' | 'end';
    children: ReactNode;
    color?:string;
    className?: string;
    style?: CSSProperties;
    offset?: number;
    type?:'dot' | 'spin'
}

const LoadingWrapper = ({
    loading = false,
    placement = 'start',
    children,
    color = 'primary',
    className = '',
    style,
    offset = 0,
    type = 'dot'
}: LoadingWrapperProps) => {
    return (
        <div
            className={`loading-wrapper ${className}`}
            style={{ position: 'relative', display: 'inline-block', ...style }}
        >
            {children}
            <div
                className="loading-placeholder"
                style={{
                    visibility: loading ? 'visible' : 'hidden',
                    position: 'absolute',
                    [placement === 'start' ? 'right' : 'left']: `calc(100% + ${offset}px)`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}
            >
                { type === 'dot'? <DotLoading color={color} /> : <SpinLoading style={{ '--size': '16px', marginTop: '-20px'}} color={color} />}
            </div>
        </div>
    );
};
export default LoadingWrapper