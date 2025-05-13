import { Decimal } from 'decimal.js';

class MathUtil {
    /**
     * Precise addition
     */
    static add(...numbers: (number | string)[]): number {
        return numbers.map(n => new Decimal(n)).reduce((acc, cur) => acc.add(cur)).toNumber();
    }

    /**
     * Precise subtraction
     */
    static subtract(a: number | string, b: number | string): number {
        return new Decimal(a).sub(new Decimal(b)).toNumber();
    }

    /**
     * Precise multiplication
     */
    static multiply(...numbers: (number | string)[]): number {
        return numbers.map(n => new Decimal(n)).reduce((acc, cur) => acc.mul(cur)).toNumber();
    }

    /**
     * Precise division
     */
    static divide(a: number | string, b: number | string): number {
        if (new Decimal(b).equals(0)) throw new Error('Division by zero');
        return new Decimal(a).div(new Decimal(b)).toNumber();
    }

    /**
     * Safe rounding
     * @param num Number to process
     * @param decimalPlaces Number of decimal places to retain (default: 2)
     */
    static round(num: number | string, decimalPlaces: number = 2): number {
        return new Decimal(num).toNearest(1 / Math.pow(10, decimalPlaces)).toNumber();
    }
}

export default MathUtil;