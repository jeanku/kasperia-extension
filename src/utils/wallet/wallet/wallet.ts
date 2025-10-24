import { ethers, SigningKey } from "ethers";
import { PublicKey, NetworkType, NetworkTypeHelper, Address } from "../address";


export class Wallet {
    wallet: ethers.HDNodeWallet | ethers.Wallet;

    private constructor(wallet: ethers.HDNodeWallet | ethers.Wallet) {
        this.wallet = wallet;
    }

    static fromMnemonic(
        mnemonic: string,
        path: string,
        passphrase: string = "",
    ): Wallet {
        const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, passphrase, path);
        return new Wallet(wallet);
    }

    static fromPrivateKey(privateKey: string): Wallet {
        const ethWallet = new ethers.Wallet(privateKey);
        return new Wallet(ethWallet);
    }

    /**
     * Generate a random wallet with mnemonic
     * @param words number of words (12 or 24)
     */
    static generateMnemonic(words: 12 | 24 = 12): string {
        const strength = words === 12 ? 128 : 256; // 128 bits = 12 words, 256 bits = 24 words
        return ethers.Mnemonic.entropyToPhrase(
            ethers.randomBytes(strength / 8)
        );
    }

    static validateMnemonic(mnemonic: string): boolean {
        return ethers.Mnemonic.isValidMnemonic(mnemonic)
    }

    /** Get mnemonic phrase */
    getMnemonic(): string {
        if (this.wallet instanceof ethers.HDNodeWallet) {
            return this.wallet.mnemonic?.phrase || "";
        }
        return "";
    }

    getPrivateKey(): string {
        let privateKey = this.wallet.privateKey;
        if (privateKey.startsWith("0x")) {
            privateKey = privateKey.slice(2)
        }
        return privateKey
    }

    /** Get public key (Ethereum format, uncompressed) */
    getEthPublicKey(): string {
        if (this.wallet instanceof ethers.HDNodeWallet) {
            return this.wallet.publicKey;
        } else if (this.wallet instanceof ethers.Wallet) {
            return new SigningKey(this.wallet.privateKey).publicKey
        }
        return ""
    }

    /** Get public key (Ethereum format, uncompressed) */
    getKaspaPublicKey() {
        return new PublicKey(this.getEthPublicKey()).getKaspaPublicKey()
    }

    toEthAddress(): string {
        return this.wallet.address;
    }

    toKaspaAddress(network: NetworkType): Address {
        let addressPrefix = NetworkTypeHelper.toAddressPrefix(network)
        return new PublicKey(this.getEthPublicKey()).toAddress(addressPrefix)
    }
}