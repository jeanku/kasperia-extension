import {Buffer} from "buffer";

function hexToBuf(hex: string) {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    return Buffer.from(hex, 'hex');
}

function addr20FromHex(hexAddr: string) {
    const b = hexToBuf(hexAddr);
    if (b.length !== 20) throw new Error('address must be 20 bytes');
    return b;
}
function u64BE(big: bigint) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(big);
    return buf;
}

function u32BE(n: number) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(n >>> 0);
    return buf;
}

function u64LE(big: bigint) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(big);
    return buf;
}

function u32LE(n: number) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(n >>> 0);
    return buf;
}

export function buildEntryPayload(l2AddressHex: string, amount: bigint, nonce: number) {
    const version = 0x92;
    const head = Buffer.from([version]);
    const addr = addr20FromHex(l2AddressHex);
    const amt = u64LE(amount);
    const non = u32LE(nonce);
    return Buffer.concat([head, addr, amt, non]); // 33 bytes
}

export const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str)
}
