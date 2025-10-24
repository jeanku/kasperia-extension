import { Chrome } from '@/chrome/chrome'
import { AccountDisplay } from '@/model/wallet'
import { AccountSubListDisplay, AccountsSubListDisplay } from '@/model/account'
import {AddressType} from "@/types/enum";

export class Keyring {

    static state(): Promise<any> {
        return Chrome.request({ action: "Keyring.state" })
    }

    static async isBoot(): Promise<boolean> {
        return Chrome.request({ action: "Keyring.isBoot" })
    }

    static async boot(password: string): Promise<void> {
        return Chrome.request({ action: "Keyring.boot", password: password })
    }

    static isLocked(): Promise<boolean> {
        return Chrome.request({ action: "Keyring.isLocked" })
    }

    static lock(): Promise<any> {
        return Chrome.request({ action: "Keyring.lock" })
    }

    static unLock(password: string): Promise<any> {
        return Chrome.request({ action: "Keyring.unlock", password: password })
    }

    static addAccountFromPrivateKey(privateKey: string): Promise<AccountDisplay> {
        return Chrome.request({ action: `Keyring.addAccountFromPrivateKey`, privateKey })
    }

    static addAccountFromMnemonic(mnemonic: string, passphrase: string): Promise<AccountDisplay> {
        return Chrome.request({ action: `Keyring.addAccountFromMnemonic`, mnemonic, passphrase })
    }
    
    static async removeAccount(id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.removeAccount", id })
    }

    static async setActiveWallet(id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setActiveWallet", id })
    }

    static async getActiveWalletPrivateKeyForKaspa(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveWalletPrivateKeyForKaspa" })
    }

    static async getActiveAccountDisplay(): Promise<AccountDisplay> {
        return Chrome.request({ action: "Keyring.getActiveAccountDisplay" })
    }

    static async getActiveAccountAndSyncPreference(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveAccountAndSyncPreference" })
    }

    static async getAccountList(): Promise<AccountDisplay[]> {
        return Chrome.request({ action: "Keyring.getAccountList" })
    }

    static async getActivePublicKey(): Promise<string> {
        return Chrome.request({ action: "Keyring.getActivePublicKey" })
    }

    static async checkPassword(password: string): Promise<any> {
        return Chrome.request({ action: "Keyring.checkPassword", password: password })
    }

    static async setAccountName(id: string, name: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setAccountName", id, name })
    }

    static async setNewPassword(password: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setNewPassword", password })
    }

    static async clear(): Promise<any> {
        return Chrome.request({ action: "Keyring.clear" })
    }


    static async addSubAccount(id: string, name: string): Promise<AccountDisplay> {
        return Chrome.request({ action: "Keyring.addSubAccount", id, name })
    }
    static async switchSubAccount(id: string, path: number): Promise<any> {
        return Chrome.request({ action: "Keyring.switchSubAccount", id, path })
    }

    static async setSubAccountName(id: string, path: number, name:string): Promise<any> {
        return Chrome.request({ action: "Keyring.setSubAccountName", id, path, name })
    }

    static async removeSubAccount(id: string, path:number): Promise<AccountSubListDisplay> {
        return Chrome.request({ action: "Keyring.removeSubAccount", id, path })
    }

    static async getAccountSubAccountsDisplay(): Promise<AccountSubListDisplay> {
        return Chrome.request({ action: "Keyring.getAccountSubAccountsDisplay" })
    }

    static async getAccountsSubListDisplay(type: AddressType|undefined = undefined): Promise<AccountsSubListDisplay[]> {
        return Chrome.request({ action: "Keyring.getAccountsSubListDisplay", type })
    }

    
    static async getMnemonic(password: string, id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.getMnemonic", password, id })
    }

    static async getPrivateKey(password: string, id: string, index:number): Promise<string[]> {
        return Chrome.request({ action: "Keyring.getPrivateKey", password, id, index })
    }

    static async getActiveAddressForEvm(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveAddressForEvm" })
    }
}
