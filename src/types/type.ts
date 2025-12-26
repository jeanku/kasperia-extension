export interface HeadNavProps {
    title?: string;
    rightTit?: string;
    url?: string;
    leftDom?: React.ReactNode;
    rightType?: string;
    loading?: boolean;
    showLeft?: boolean;
    state?: Object;
    onBack?: () => void;
    onClickRight?: () => void;
}
export type MessageType = 'info' | 'success' | 'warning' | 'error';
export interface MessageConfig {
    content: React.ReactNode;
    duration?: number;
    type?: MessageType;
    closable?: boolean;
    leftIcon?: React.ReactNode | null;
    key?: string;
}
export interface MessageContextType {
    add: (config: MessageConfig) => string;
    remove: (key: string) => void;
}

export interface AccountData {
    key: string,
    text: string,
    icon: string,
    url: string
}

export interface Session {
    origin: string;
    icon: string;
    name: string;
}

export interface PlainObject {
    [key: string]: string | number | boolean | null | undefined | Record<string, unknown> | Array<unknown>;
}

export interface ApiResponse<T = unknown> {
    code?: number;
    message?: string;
    data: T;
}

export interface AppKey {
    appid: number  | string;
    appsecret: string;
}
export type NetworkNameType = 'Mainnet' | 'Testnet'