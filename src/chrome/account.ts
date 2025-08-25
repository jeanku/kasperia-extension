import { Address } from '@/model/contact'
import { Chrome } from '@/chrome/chrome'
import { AccountDisplay } from "@/model/wallet"

export class Account extends Chrome {
    static getBalance(): Promise<any> {
        return Chrome.request({ action: "Account.getBalance" })
    }

    static addListener(): Promise<any> {
        return Chrome.request({ action: "Account.addListener" })
    }

    static getConnectState(): Promise<boolean> {
        return Chrome.request({ action: "Account.getConnectState" })
    }

    static accounts(): Promise<AccountDisplay[]> {
        return Chrome.request({ action: "Account.accounts" })
    }

    static accountsBalance(addresses: string[]): Promise<Record<string, string>> {
        return Chrome.request({ action: "Account.accountsBalance", addresses })
    }

    static addAccountFromPrivateKey(privateKey: string): Promise<AccountDisplay> {
        return Chrome.request({ action: `Account.addAccountFromPrivateKey`, privateKey })
    }

    static addAccountFromMnemonic(mnemonic: string, passphrase: string): Promise<AccountDisplay> {
        return Chrome.request({ action: `Account.addAccountFromMnemonic`, mnemonic, passphrase })
    }

    static setActiveAccount(id: string): Promise<AccountDisplay> {
        return Chrome.request({ action: `Account.setActiveAccount`, id })
    }
}
