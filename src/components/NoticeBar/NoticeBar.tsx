import React, {
    useEffect,
    createContext,
    useMemo,
    useState,
    useContext,
    useCallback
} from 'react';
import {
    SoundOutline,
    ExclamationCircleOutline,
    CloseOutline,
} from 'antd-mobile-icons';
import { SvgIcon } from '@/components/Icon/index'
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { MessageType, MessageConfig, MessageContextType } from '@/types/type'
import { createPortal } from 'react-dom';
import './index.scss';

const MessageContext = createContext<MessageContextType>({
    add: () => '',
    remove: () => { }
});

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<Array<MessageConfig & { key: string }>>([]);
    const addMessage = useCallback((config: MessageConfig) => {
        const key = Math.random().toString(36).substr(2, 9);
        setMessages(prev => [...prev, { ...config, key }]);
        return key;
    }, []);

    const removeMessage = useCallback((key?: string) => {
        setMessages(prev => key ? prev.filter(msg => msg.key !== key) : []);
    }, []);

    useEffect(() => {
        const autoclose = messages.filter(msg => msg.duration && msg.duration > 0);
        const timers = autoclose.map(msg => {
            return setTimeout(() => {
                removeMessage();
            }, msg.duration);
        });
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [messages, removeMessage]);
    const iconType = (msgType: MessageType | undefined) => {
        switch (msgType) {
            case 'success':
                return <SvgIcon iconName="IconTipSuccess" color="#76D44D" />
            case 'error':
                return <SvgIcon iconName="IconTipError" color="#E64E4E" />
            case 'warning':
                return <ExclamationCircleOutline fontSize={20} />
            default:
                return <SoundOutline />
        }
    }

    const contextValue = useMemo(
        () => ({ add: addMessage, remove: removeMessage }),
        [addMessage, removeMessage]
    );
    const messageContainer = (
        <div className="global-notice-bar">
            <TransitionGroup component={null}>
                {
                    messages.map((msg) => (
                        <CSSTransition
                            key={msg.key}
                            timeout={300}
                            classNames="message-item"
                        >
                            <div className="global-notice-bar">
                                <div className={`global-toast ${msg.type || 'info'}`}>
                                    {msg.leftIcon && iconType(msg.type)}
                                    <span>{msg.content}</span>
                                    {
                                        msg.closable && (
                                            <CloseOutline fontSize={18} onClick={() => removeMessage(msg.key!)} />
                                        )
                                    }
                                </div>
                            </div>
                        </CSSTransition>
                    ))
                }
            </TransitionGroup>
        </div>
    );
    return (
        <MessageContext.Provider value={contextValue}>
            {children}
            {createPortal(messageContainer, document.body)}
        </MessageContext.Provider>
    );
}

export default MessageProvider

export const useMessage = () => {
    return useContext(MessageContext);
};

export const useNotice = () => {
    const { add } = useMessage();
    const noticeSuccess = (content: string) => {
        add({
            content,
            type: 'success',
            leftIcon: 'success',
            duration: 2100,
            closable: false,
        });
    };

    const noticeError = (error: any) => {
        let content = ""
        if (typeof error === 'string') {
            content = error;
        } else if (error instanceof Error) {
            content = error.message;
        } else {
            content = 'error.';
        }
        add({
            content,
            type: 'error',
            leftIcon: 'error',
            duration: 2300,
            closable: false,
        });
    };
    return { noticeSuccess, noticeError };
}