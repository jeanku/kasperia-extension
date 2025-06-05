import { Big } from 'big.js';
import { Wasm } from '@kasplex/kiwi-web'

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

export const formatAddress = (address: string, skip: number = 6): string => {
    if (address.length < 30) {
        return ""
    }
    let resp = address.split(":")
    if (resp.length !== 2 && resp[1].length <= 12) return address
    return `${resp[0]}:${resp[1].slice(0, skip)}...${resp[1].slice(-skip)}`
}

export const formatBalance = (amount: string, dec: any): string => {
    if (!amount || !dec) {
        return "";
    }
    
    const bigBalance = new Big(amount);
    if (bigBalance.eq(0)) {
        return "0";
    }

    const result = bigBalance.div(10 ** Number(dec));

    const thresholds = [
        { limit: new Big("10000000"), decimals: 0 },
        { limit: new Big("10000"), decimals: 2 },
        { limit: new Big("10"), decimals: 4 }
    ];

    for (const { limit, decimals } of thresholds) {
        if (result.gte(limit)) {
            return result.round(decimals, Big.roundDown).toFixed(decimals).replace(/\.?0+$/, "");
        }
    }

    return result.round(8, Big.roundDown).toFixed(8).replace(/\.?0+$/, "");
};


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

export const checkAddressPrefix = (addr: string, network: number): boolean => {
    let address = new Wasm.Address(addr)
    return address.prefix.toString().toLowerCase() == (network == 0 ? "kaspa" : "kaspatest")
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
        { threshold: 1e9,  suffix: 'B' },
        { threshold: 1e6,  suffix: 'M' },
        { threshold: 1e3,  suffix: 'K' }
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

export const getBrowser = () => {
    if (typeof (globalThis as any).browser === 'undefined') {
        return chrome;
    } else {
        return (globalThis as any).browser;
    }
}

export const openUrl = (url: string) => {
    if(!url.trim()) return
    window.open(url, '_blank')
}

export const isEmptyObject = (obj: any) =>{
    if(!obj) return true
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}