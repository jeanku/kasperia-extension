import React, { useState, useEffect, useRef } from 'react';

interface NumberInputProps {
    value?: number | null | '';
    onChange: (value: number | '') => void;
    decimalPlaces?: number;
    allowNegative?: boolean;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    max?: number;
    disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    decimalPlaces = 0,
    allowNegative = false,
    placeholder = '',
    className = '',
    style = {},
    max,
    disabled = false,
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused) return;

        if (value === '' || value === null || value === undefined) {
            setDisplayValue('');
        } else {
            setDisplayValue(String(value));
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (displayValue === '' || displayValue === '-') {
            setDisplayValue('');
            onChange('');
            setIsFocused(false);
            return;
        }

        let normalizedValue = displayValue;

        if (normalizedValue.startsWith('.')) {
            normalizedValue = '0' + normalizedValue;
        }
        if (normalizedValue.endsWith('.')) {
            normalizedValue = normalizedValue.slice(0, -1);
        }

        const numValue = parseFloat(normalizedValue);

        if (isNaN(numValue)) {
            setDisplayValue('');
            onChange('');
            setIsFocused(false);
            return;
        }

        const finalValue = max !== undefined && numValue > max ? max : numValue;

        setDisplayValue(String(finalValue));
        onChange(finalValue);

        setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        if (inputValue === '') {
            setDisplayValue('');
            onChange('');
            return;
        }

        if ((e.nativeEvent as InputEvent).inputType === 'insertFromPaste') {
            const regex = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
            inputValue = inputValue.replace(regex, '');
            const parts = inputValue.split('.');
            if (parts.length > 2) {
                inputValue = parts[0] + '.' + parts.slice(1).join('');
            }
            if (allowNegative) {
                const hasNegative = inputValue.includes('-');
                if (hasNegative && !inputValue.startsWith('-')) {
                    inputValue = inputValue.replace(/-/g, '');
                }
            }
        }

        const isValid = validateInput(inputValue);
        if (isValid || inputValue === '' || inputValue === '-') {
            setDisplayValue(inputValue);

            if (isValid && inputValue !== '-' && inputValue !== '') {
                let numValue = parseFloat(inputValue);
                onChange(isNaN(numValue) ? '' : numValue);
            } else if (inputValue === '' || inputValue === '-') {
                onChange('');
            }
        }
    };

    const validateInput = (val: string) => {
        if (val === '' || (allowNegative && val === '-')) {
            return true;
        }
        const regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
        if (!regex.test(val)) {
            return false;
        }

        const parts = val.split('.');
        if (parts.length === 2 && parts[1].length > decimalPlaces) {
            return false;
        }
        return true;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Delete', 'Backspace'].includes(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') return;

        const allowedEditKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', 'Tab'
        ];
        if (allowedEditKeys.includes(e.key)) return;
        if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) return;

        const allowedKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
        ];
        if (allowNegative) {
            allowedKeys.push('-');
        }

        if (
            !allowedKeys.includes(e.key) &&
            !(e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
        ) {
            e.preventDefault();
        }

        if (e.key === '.' && displayValue.includes('.')) {
            e.preventDefault();
        }

        if (e.key === '-' && (e.target as HTMLInputElement).selectionStart !== 0) {
            e.preventDefault();
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            style={style}
            {...props}
        />
    );
};

export default NumberInput;
