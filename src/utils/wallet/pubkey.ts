import {schnorr} from "@noble/curves/secp256k1";
import {Address, AddressPrefix, AddressVersion} from "./lib";

export class PublicKey {
    publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    private getXOnlyPublicKey(): Uint8Array {
        let pubKey =  this.publicKey
        const x = schnorr.utils.bytesToNumberBE(Uint8Array.from(Buffer.from(pubKey, 'hex')).slice(1, 33));
        const p = schnorr.utils.lift_x(x);
        return p.toRawBytes(true).slice(1);
    }

    public toAddress(network: number): Address {
        const addresPrefix = network == 0 ? AddressPrefix.Mainnet : AddressPrefix.Testnet
        var addr = new Address(
            addresPrefix,
            AddressVersion.PubKey,
            this.getXOnlyPublicKey()
        )
        return addr
    }
}