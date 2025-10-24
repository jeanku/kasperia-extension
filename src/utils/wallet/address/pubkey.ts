import { schnorr, secp256k1 } from "@noble/curves/secp256k1";
import {Address, AddressPrefix, AddressVersion} from "./index";


export class PublicKey {
    publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    /** Get public key (Ethereum format, uncompressed) */
    public getXOnlyPublicKey(): Uint8Array {
        let pubKey =  this.publicKey.slice(2)
        const x = schnorr.utils.bytesToNumberBE(Uint8Array.from(Buffer.from(pubKey, 'hex')).slice(1, 33));
        const p = schnorr.utils.lift_x(x);
        return p.toRawBytes(true).slice(1);
    }

    /** Get Kaspa compressed public key (33 bytes, starts with 0x02 or 0x03) */
    public getKaspaPublicKey(): string {
        let pubKey = this.publicKey.startsWith("0x")
            ? this.publicKey.slice(2)
            : this.publicKey;
        const pubBytes = Uint8Array.from(Buffer.from(pubKey, "hex"));
        const point = secp256k1.ProjectivePoint.fromHex(pubBytes);
        const compressed = point.toRawBytes(true);
        return Buffer.from(compressed).toString("hex");
    }

    public toAddress(network: AddressPrefix): Address {
        return new Address(
            network,
            AddressVersion.PubKey,
            this.getXOnlyPublicKey()
        )
    }
}

// let pubkey = "0x02f5c16567f9eaa48a31b4bf5959ebd2fdbac6671998996a5b8165213e6f38e79e"
// let addr = new PublicKey(pubkey).toAddress(AddressPrefix.Testnet).toString()
// console.log("addr", addr)