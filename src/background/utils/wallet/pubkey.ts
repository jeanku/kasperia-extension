import {schnorr} from "@noble/curves/secp256k1";
import {Address, AddressPrefix, AddressVersion} from "../lib/address";

export class PublicKey {
    publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    /** Get public key (Ethereum format, uncompressed) */
    private getXOnlyPublicKey(): Uint8Array {
        let pubKey =  this.publicKey.slice(2)
        const x = schnorr.utils.bytesToNumberBE(Uint8Array.from(Buffer.from(pubKey, 'hex')).slice(1, 33));
        const p = schnorr.utils.lift_x(x);
        return p.toRawBytes(true).slice(1);
    }

    public toAddress(network: AddressPrefix): Address {
        return new Address(
            network,
            AddressVersion.PubKey,
            this.getXOnlyPublicKey()
        )
    }
}