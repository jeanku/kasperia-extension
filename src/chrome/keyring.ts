import { Chrome } from '@/chrome/chrome'
import { Wallet, Account } from '@/model/wallet'

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

    static async addWallet(wallet: Wallet): Promise<any> {
        return Chrome.request({ action: "Keyring.addWallet", wallet })
    }

    static async removeWallet(id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.removeWallet", id })
    }

    static async setActiveWallet(id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setActiveWallet", id })
    }

    static async getActiveWalletKeys(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveWalletKeys" })
    }

    static async getActiveAccount(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveAccount" })
    }

    static async getWalletList(): Promise<any> {
        return Chrome.request({ action: "Keyring.getWalletList" })
    }

    static async getWalletById(password: string, id: string): Promise<any> {
        return Chrome.request({ action: "Keyring.getWalletById", password, id})
    }

    static async checkPassword(password: string): Promise<any> {
        return Chrome.request({ action: "Keyring.checkPassword", password: password })
    }

    static async setWalletName(id: string, name: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setWalletName", id, name })
    }

    static async setNewPassword(password: string): Promise<any> {
        return Chrome.request({ action: "Keyring.setNewPassword", password })
    }

    static async clear(): Promise<any> {
        return Chrome.request({ action: "Keyring.clear" })
    }

    static async getActiveWalletWithAccounts(): Promise<any> {
        return Chrome.request({ action: "Keyring.getActiveWalletWithAccounts" })
    }
    static async addDriveAccount(id: string, account: Account): Promise<any> {
        return Chrome.request({ action: "Keyring.addDriveAccount", id, account })
    }
    static async switchDriveAccount(id: string, index: number): Promise<any> {
        return Chrome.request({ action: "Keyring.switchDriveAccount", id, index })
    }
    static async setAccountName(id: string, index: number, name:string): Promise<any> {
        return Chrome.request({ action: "Keyring.setAccountName", id, index, name })
    }
    static async getPrivateKey(password: string, id: string, index:number): Promise<any> {
        return Chrome.request({ action: "Keyring.getPrivateKey", password, id, index })
    }
    static async removeAccount(id: string, index:number): Promise<any> {
        return Chrome.request({ action: "Keyring.removeAccount", id, index })
    }
    static async getAccountBook(): Promise<any> {
        return Chrome.request({ action: "Keyring.getAccountBook" })
    }
}
