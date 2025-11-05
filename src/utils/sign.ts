import crypto from 'crypto-js';
import md5 from 'js-md5';
import type { AppKey } from '@/types/type';

export interface SignableObject {
    [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | unknown[];
    sign?: string;
    appid?: string | number;
    randomstr?: string;
    timestamp?: number | string;
}

/**
 * get Sign
 */
export function getSign(obj: SignableObject, apiKey: AppKey): string {
    const temp = sort_ASCII(obj);
    const queryStr = objTransUrlParams(temp);
    const hash = crypto.HmacSHA256(queryStr, apiKey.appsecret).toString();
    return (md5 as unknown as ((input: string) => string))(hash).toLowerCase()
}

/**
 * checkSign
 */
export function checkSign(obj: SignableObject, apiKey: AppKey): Record<string, unknown> | { error: string } {
    if (!obj.sign || !obj.appid || !obj.randomstr || !obj.timestamp) {
        return { error: 'sign_error' };
    }

    if (Number(obj.timestamp) > 0) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDiff = Math.abs(currentTimestamp - Number(obj.timestamp));
        if (timeDiff >= 30) {
            return { error: 'timestamp_expired' };
        }
    }
    const paramSign = obj.sign;
    const cloned = { ...obj };
    delete cloned.sign;

    const _sign = getSign(cloned, apiKey);
    if (!_sign || _sign !== paramSign) {
        return { error: 'sign_error' };
    }
    delete cloned.appid;
    delete cloned.timestamp;
    delete cloned.randomstr;
    return cloned;
}


function sort_ASCII(obj: SignableObject): SignableObject {
    const keys = Object.keys(obj).sort();
    const sorted: SignableObject = {};
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

function objTransUrlParams(obj: SignableObject): string {
    const params: string[] = [];
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        if (typeof value === 'undefined') value = '';
        params.push(`${key}=${String(value)}`);
    });
    return params.join('&');
}


export function generateRandomStr(length = 8): string {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 获取签名基础数据
 */
export function getSignData(apiKey: AppKey): { appid: string; timestamp: number; randomstr: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomstr = generateRandomStr();
    const { appid } = apiKey;
    return {
        appid: appid.toString(),
        timestamp,
        randomstr,
    };
}