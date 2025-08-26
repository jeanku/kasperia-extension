import { ethers, SigningKey } from "ethers";
import { Address } from "../lib/address";
import { AddressPrefix, NetworkType, NetworkTypeHelper } from "../lib/address/prefix";
import { PublicKey } from "./pubkey";

class WalletManager {
    wallet: ethers.HDNodeWallet | ethers.Wallet;

    private constructor(wallet: ethers.HDNodeWallet | ethers.Wallet) {
        this.wallet = wallet;
    }

    static fromMnemonic(
        mnemonic: string,
        path: string,
        passphrase: string = "",
    ): WalletManager {
        const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, passphrase, path);
        return new WalletManager(wallet);
    }

    static fromPrivateKey(privateKey: string): WalletManager {
        const ethWallet = new ethers.Wallet(privateKey);
        return new WalletManager(ethWallet);
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

    /** Get mnemonic phrase */
    getMnemonic(): string {
        if (this.wallet instanceof ethers.HDNodeWallet) {
            return this.wallet.mnemonic?.phrase || "";
        }
        return "";
    }

    /** Get private key (Ethereum format, hex string) */
    getPrivateKey(): string {
        return this.wallet.privateKey;
    }

    /** Get public key (Ethereum format, uncompressed) */
    getPublicKey(): string {
        if (this.wallet instanceof ethers.HDNodeWallet) {
            return this.wallet.publicKey;
        } else if (this.wallet instanceof ethers.Wallet) {
            return new SigningKey(this.wallet.privateKey).publicKey
        }
    }

    toEthAddress(): string {
        return this.wallet.address;
    }

    toKaspaAddress(network: NetworkType): Address {
        let addressPrefix = NetworkTypeHelper.toAddressPrefix(network)
        return new PublicKey(this.getPublicKey()).toAddress(addressPrefix)
    }
}

export {
    PublicKey,
    AddressPrefix,
    WalletManager,
}