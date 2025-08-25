import { Wasm, Kiwi, Wallet } from '@kasplex/kiwi-web'

export class Common {

    async addressFromPrivateKey(pk: string) {
        try {
            return new Wasm.PrivateKey(pk).toPublicKey().toAddress(Kiwi.network).toString()
        } catch (error) {
            throw Error("PrivateKey invalid")
        }
    }

    async addressFromMnemonic(mnemonic: string, passphrase: string) {
        try {
            return Wallet.fromMnemonic(mnemonic, passphrase).toAddress(Kiwi.network).toString()
        } catch (error) {
            return ""
        }
    }

    async checkMnemonic(mnemonic: string) {
        return Wasm.Mnemonic.validate(mnemonic)
    }
}

const common = new Common();

export default common;


