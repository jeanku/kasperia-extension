export interface HeadNavProps {
    title?: string;
    rightTit?: string;
    url?: string;
    leftDom?: React.ReactNode;
    rightType?: string;
    loading?: boolean;
    onBack?: () => void;
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