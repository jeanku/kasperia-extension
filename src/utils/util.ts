import { Address } from "@/utils/wallet/address";
import {ethers} from "ethers";
import { NetworkType } from "@/utils/wallet/consensus";

export const isExtensionPopup = () => {
    return window.innerWidth <= 500;
};

export const formatHash = (hash: string, startLength: number = 6, endLength: number = 6): string => {
    if (hash.length < startLength + endLength) {
        return ""
    }
    const start = hash.substring(0, startLength);
    const end = hash.substring(hash.length - endLength);
    return `${start}…${end}`;
}

export const formatAddress = (address: string | undefined, skip: number = 6): string => {
    if (address == undefined) return ""
    if (!address || address.length < 30) {
        return address || ""
    }
    let resp = address.split(":")
    if (resp.length == 1) {
        return `${address.slice(0, skip)}...${address.slice(-skip)}`
    }
    if (resp.length !== 2 && resp[1].length <= 12) return address
    return `${resp[0]}:${resp[1].slice(0, skip)}...${resp[1].slice(-skip)}`
}

export const formatBalance = (amount: string, dec: number | string): string => {
    if (!amount || !dec) {
        return ""
    }
    let valueStr = ethers.formatUnits(amount, Number(dec))
    const value = parseFloat(valueStr)
    let fixed = formatFixed(Math.floor(value))
    let result = value.toFixed(fixed).replace(/(\.\d*?[1-9])0+$/g, "$1")
    return result.replace(/\.0+$/, "")
};

export const formatBalanceFixed = (valueStr: string, round?: number): string => {
    if (!valueStr) {
        return valueStr
    }
    const value = parseFloat(valueStr)
    if (!round) {
        round = formatFixed(Math.floor(value))
    }
    let result = value.toFixed(round).replace(/(\.\d*?[1-9])0+$/g, "$1")
    return result.replace(/\.0+$/, "")
};


export const formatFixed = (value: number): number => {
    if (value == 0) return 2
    if (value <= 1) return 8
    if (value <= 100) return 6
    if (value <= 10000) return 4
    if (value <= 1000000) return 2
    if (value <= 100000000) return 2
    return 8
}

export const formatDecimal = (amount: string, dec: number | string): number => {
    if (!amount || !dec) {
        return 8;
    }
    let resp = ethers.formatUnits(amount, Number(dec))
    let value = Number(resp)
    return formatFixed(value)
}


export const formatDecBalance = (amount: string, dec: string): BigInt => {
    if (amount === "" || dec === "") {
        return BigInt("")
    }
    return (BigInt(amount) / BigInt(10 ** Number(dec)))
}

export const toTokenUnits = (amount: number | string, decimals: number | string): BigInt => {
    const amountStr = String(amount);
    let decNumber = Number(decimals);
    decNumber = isNaN(decNumber) ? 0 : decNumber;
    const [intPart, fracPart = ""] = amountStr.split(".");
    const paddedFrac = (fracPart + "0".repeat(decNumber)).slice(0, decNumber);
    return BigInt(intPart + paddedFrac);
}

export const formatDate = (mts: string) => {
    if (mts === "") {
        return ""
    }
    let d = new Date(Number(mts))
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const getDecimals = (num: number) => {
    if (isNaN(num)) return 0;
    const str = num.toString();
    return str.includes('.') ? str.split('.')[1].length : 0;
};

export const stringToHex = (str: string): string => {
    return Array.from(str)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
}

export const hexToString = (hex: string): string => {
    if (hex == "") return ""
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
}

export const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str)
}

export const toAddressType = (addr: string): NetworkType => {
    let address = Address.fromString(addr)
    switch (address.prefix.toString().toLowerCase()) {
        case "kaspa":
            return NetworkType.Mainnet
        case "kaspatest":
            return NetworkType.Testnet
        default:
            throw Error("address invalid")
    }
}

export const formatNumber = (str: string): string => {
    const num = Number(str)
    if (typeof num !== 'number' || isNaN(num) || !str) {
        return '';
    }
    const absNum = Math.abs(num);
    const suffix = num < 0 ? '-' : '';
    const units = [
        { threshold: 1e12, suffix: 'T' },
        { threshold: 1e9, suffix: 'B' },
        { threshold: 1e6, suffix: 'M' },
        { threshold: 1e3, suffix: 'K' }
    ];
    const matchedUnit = units.find(unit => absNum >= unit.threshold);
    if (matchedUnit) {
        return `${suffix}${(num / matchedUnit.threshold).toFixed(1)}${matchedUnit.suffix}`;
    }
    return num.toString();
}

export const isValidTickString = (str: string): boolean => {
    const regex = /^[A-Za-z]{4,6}$/;
    return regex.test(str);
}


export const hashString = async (str: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const openUrl = (url: string) => {
    chrome.tabs.create({ url })
}

export const isEmptyObject = (obj: any) => {
    if (!obj) return true
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function debounce<F extends (...args: any[]) => any>(func: F, delay: number): (...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return ["https:", "http:"].includes(u.protocol);
    } catch {
        return false;
    }
}

export function getUrlIcon(url: string): string {
    const validateUrl = new URL(url)
    const domain = validateUrl.hostname;
    const protocol = validateUrl.protocol;
    return `${protocol}//${domain}/favicon.ico`
}

export function formatUTCToLocal(utcStr: string): string {
    const date = new Date(utcStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 月份从0开始
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatSignMessage(message: string): string {
    if (message.startsWith('0x')) {
        try {
            return ethers.toUtf8String(message);
        } catch {
            return message;
        }
    }
    return message;
}