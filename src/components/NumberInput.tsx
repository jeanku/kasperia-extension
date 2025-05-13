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
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isFocused) {
            if (value !== undefined && value !== null && value !== '') {
                const adjustedValue = max !== undefined ? Math.min(value, max) : value;
                setDisplayValue(String(adjustedValue));
            } else {
                setDisplayValue('');
            }
        }
    }, [value, max, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);

        if (displayValue === '-' || displayValue === '') {
            setDisplayValue('');
            onChange('');
        } else if (displayValue.endsWith('.') || displayValue.startsWith('.')) {
            let normalizedValue = displayValue.replace(/\.$/, '');
            if (displayValue.startsWith('.')) {
                normalizedValue = '0' + normalizedValue;
            }

            let numValue = parseFloat(normalizedValue);
            if (isNaN(numValue)) {
                setDisplayValue('');
                onChange('');
                return;
            }

            if (max !== undefined && numValue > max) {
                numValue = max;
            }

            setDisplayValue(String(numValue));
            onChange(numValue);
        } else {
            const numValue = parseFloat(displayValue);
            if (isNaN(numValue)) {
                setDisplayValue('');
                onChange('');
            } else if (max !== undefined && numValue > max) {
                setDisplayValue(String(max));
                onChange(max);
            } else {
                setDisplayValue(String(numValue));
                onChange(numValue);
            }
        }
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
                if (max !== undefined && numValue > max) {
                    numValue = max;
                    setDisplayValue(String(max));
                }
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
            style={style}
            {...props}
        />
    );
};

export default NumberInput;
