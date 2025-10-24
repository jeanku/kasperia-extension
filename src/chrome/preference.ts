import { Chrome } from '@/chrome/chrome'
import { Network, KasPrice } from '@/model/account'
import { TokenList, Oplist, } from '@/model/krc20'
import { KaspaTransaction } from '@/utils/wallet/kaspa'
import {EvmTokenList} from "@/model/evm";
import {AccountDisplay} from "@/model/wallet";

export class Preference extends Chrome {

    static getNetwork(): Promise<any> {
        return Chrome.request({ action: "Preference.getNetwork" })
    }

    static setNetwork(network: Network): Promise<any> {
        return Chrome.request({ action: "Preference.setNetwork", network })
    }

    static getCurrentAccount(): Promise<AccountDisplay> {
        return Chrome.request({ action: "Preference.getCurrentAccount" })
    }

    static setCurrentAccount(account: any): Promise<any> {
        return Chrome.request({ action: "Preference.setCurrentAccount", account: account })
    }

    static setKrc20TokenList(data: TokenList[]): Promise<any> {
        return Chrome.request({ action: "Preference.setKrc20TokenList", data })
    }

    static getKrc20TokenList(): Promise<any> {
        return Chrome.request({ action: "Preference.getKrc20TokenList" })
    }

    static setKrc20OpList(data: Oplist[]): Promise<any> {
        return Chrome.request({ action: "Preference.setKrc20OpList", data })
    }

    static getKrc20OpList(): Promise<any> {
        return Chrome.request({ action: "Preference.getKrc20OpList" })
    }

    static setKaspaTxList(data: KaspaTransaction[]): Promise<any> {
        return Chrome.request({ action: "Preference.setKaspaTxList", data: data })
    }

    static getKaspaTxList(): Promise<any> {
        return Chrome.request({ action: "Preference.getKaspaTxList" })
    }

    static setEvm20TokenList(chainId: string, data: EvmTokenList[]): Promise<void> {
        return Chrome.request({ action: "Preference.setEvm20TokenList", chainId, data })
    }

    static getAll(): Promise<any> {
        return Chrome.request({ action: "Preference.getAll" })
    }

    static getNetworkConfig(): Promise<any> {
        return Chrome.request({ action: "Preference.getNetworkConfig" })
    }

    static setNetworkConfig(network: Network): Promise<any> {
        return Chrome.request({ action: "Preference.setNetworkConfig", network })
    }

    static setAccountsBalance(accountsBalance: any): Promise<any> {
        return Chrome.request({ action: "Preference.setAccountsBalance", accountsBalance })
    }

    static getAccountsBalance(): Promise<any> {
        return Chrome.request({ action: "Preference.getAccountsBalance" })
    }

    static updateAccountsBalance(address: string, balance: string): Promise<any> {
        return Chrome.request({ action: "Preference.updateAccountsBalance", address, balance })
    }

    static setLockTime(lockTime: number): Promise<any> {
        return Chrome.request({ action: "Preference.setLockTime", lockTime })
    }

    static getLockTime(): Promise<any> {
        return Chrome.request({ action: "Preference.getLockTime" })
    }

    static setKasPrice(price: KasPrice): Promise<any> {
        return Chrome.request({ action: "Preference.setKasPrice", price })
    }

    static setContractAddress(data: Record<string, string>): Promise<any> {
        return Chrome.request({ action: "Preference.setContractAddress", data })
    }

    static setIndex(index: string) {
        return Chrome.request({ action: "Preference.setIndex", index })
    }
}
