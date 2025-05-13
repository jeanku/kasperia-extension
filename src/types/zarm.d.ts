declare module 'zarm/lib/list' {
    interface ListItemProps {
        children?: React.ReactNode;
    }

    interface ListProps {
        children?: React.ReactNode;
    }

    const List: React.FC<ListProps> & {
        Item: React.FC<ListItemProps>;
    };
    
    export default List;
}

declare module 'zarm/lib/input' {
    interface InputProps {
        type?: 'text' | 'password';
        placeholder?: string;
        value?: string;
        onChange?: (value: string) => void;
    }

    const Input: React.FC<InputProps>;
    export default Input;
}

declare module 'zarm/lib/button' {
    interface ButtonProps {
        block?: boolean;
        size?: 'lg' | 'md' | 'sm';
        theme?: 'primary' | 'default' | 'danger';
        onClick?: () => void;
        children?: React.ReactNode;
    }

    const Button: React.FC<ButtonProps>;
    export default Button;
}

declare module 'zarm/lib/list/style/css';
declare module 'zarm/lib/input/style/css';
declare module 'zarm/lib/button/style/css'; 