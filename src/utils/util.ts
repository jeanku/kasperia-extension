import { Address } from "@/utils/wallet/address";
import { ethers } from "ethers";
import { NetworkType } from "@/utils/wallet/consensus";
import type { AppKey, PlainObject } from '@/types/type'
import { getSign, getSignData } from '@/utils/sign'
import qs from 'qs';

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
    let fixed = formatFixed(value)
    let result = truncateDecimals(valueStr, fixed).replace(/(\.\d*?[1-9])0+$/g, "$1")
    return result.replace(/\.0+$/, "")
};


export const formatBalanceFixed = (valueStr: string, round?: number): string => {
    if (!valueStr) {
        return valueStr
    }
    const value = parseFloat(valueStr)
    if (!round) {
        round = formatFixed(value)
    }
    let result = truncateDecimals(valueStr, round).replace(/(\.\d*?[1-9])0+$/g, "$1")
    return result.replace(/\.0+$/, "")
};

function truncateDecimals(value: string, n: number): string {
    const [intPart, fracPart = ""] = value.split(".");
    if (n <= 0) return intPart;
    return fracPart.length > 0
        ? `${intPart}.${fracPart.slice(0, n)}`
        : intPart;
}


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

export const hexToString = (hex: string): string => {
    if (!hex) return "";

    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }

    if (hex.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }

    const bytes = new Uint8Array(
        hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16))
    );

    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    for (let i = 0; i < decoded.length; i++) {
        const c = decoded.charCodeAt(i);
        if (
            c === 0 ||          // null byte
            c < 0x20 ||         // control chars
            c > 0x7e            // non-ascii
        ) {
            return hex;
        }
    }
    return decoded;
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

export function formatUTCToLocal(utcStr: string | Date): string {
    const date = utcStr instanceof Date ? utcStr : new Date(utcStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function convertUTCToLocalTime(utcTimeString: string): string {
    const utcDate = new Date(utcTimeString + 'Z');
    return formatUTCToLocal(utcDate);
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatSignMessage(message: string): Uint8Array {
    if (ethers.isHexString(message)) {
        if (message.length % 2 === 0) {
            return ethers.getBytes(message)
        }
        return ethers.getBytes('0x0' + message.slice(2))
    }
    const hexRegex = /^[0-9a-fA-F]+$/;
    if (hexRegex.test(message)) {
        if (message.length % 2 === 0) {
            return ethers.getBytes('0x' + message)
        }
        return ethers.getBytes('0x0' + message)
    } else {
        return ethers.getBytes(message)
    }
}

export function withSignedParams<T extends PlainObject>(params: T, apiKey: AppKey): T & { sign: string } {
    const signBase = {
        ...getSignData(apiKey),
        ...params,
    };
    const sign = getSign(signBase, apiKey);
    return {
        ...signBase,
        sign,
    };
}

export const mergeUrlParams = (url: string, params = {}) => {
    const [cleanUrl, queryString] = url.split('?');
    const queryParams = qs.parse(queryString);
    const mergedParams = { ...queryParams, ...params };
    return {
        cleanUrl,
        mergedParams
    };
}
