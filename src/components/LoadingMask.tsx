import React from 'react';
import { Mask, DotLoading } from 'antd-mobile';

interface LoadingMaskProps {
    visible: boolean;
    message?: string;
    onMaskClick?: () => void;
    color?: string;
    opacity?: number | "thin" | "default" | "thick" | undefined;
}

const LoadingMask: React.FC<LoadingMaskProps> = ({
    visible,
    message = 'Loading',
    onMaskClick,
    color = 'white',
    opacity = 'thin',
}) => {
    return (
        <Mask visible={visible} onMaskClick={() => onMaskClick && onMaskClick()} color={color} opacity={opacity}>
            <div className="kasplex-loading">
                <p>
                    {message}
                    <DotLoading color="primary" />
                </p>
            </div>
        </Mask>
    );
};

export default LoadingMask;