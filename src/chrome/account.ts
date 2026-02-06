import { Chrome } from '@/chrome/chrome'
import { GetBalancesByAddressesResponseMessage } from "@/utils/wallet/rpc/types";
import { Krc20DeployOptions } from "@/utils/wallet/krc20";
import { SubmitSetting, SubmitBuilderOptions } from '@/model/account'

export class Account extends Chrome {

    static signMessage(message: number[]): Promise<string> {
        return Chrome.request({ action: "Account.signMessage", message })
    }

    static getBalance(address: string | undefined = undefined): Promise<any> {
        return Chrome.request({ action: "Account.getBalance", address })
    }

    static getAddressesBalance(addresses: string[]): Promise<GetBalancesByAddressesResponseMessage> {
        return Chrome.request({ action: "Account.getAddressesBalance", addresses })
    }

    static transferKrc20(tick: string | undefined, ca: string | undefined, amount: string, to: string): Promise<string> {
        return Chrome.request({ action: "Account.transferKrc20", tick, amount, to, ca })
    }

    static deployKrc20(data: Krc20DeployOptions): Promise<string> {
        return Chrome.request({ action: "Account.deployKrc20", data })
    }

    static mintKrc20(txid: string, balance: string, tick: string, times: number, useUtxo: boolean): Promise<{
        txid: string
        balance: string
    }> {
        return Chrome.request({ action: "Account.mintKrc20", txid, balance, tick, times, useUtxo })
    }

    static transferKas(to: string, amount: string, payload: string | undefined): Promise<string | undefined> {
        return Chrome.request({ action: "Account.transferKas", to, amount, payload})
    }

    static estimateFee(from: string, to: string, sompi: string, payload: string | undefined): Promise<string | undefined> {
        return Chrome.request({ action: "Account.estimateFee", from, to, sompi, payload})
    }

    static async bridgeForIgra(receiver: string, address: string, amount: string): Promise<string> {
        return Chrome.request({ action: "Account.bridgeForIgra", receiver, address, amount })
    }
    
    static transferKns(assetId: string, to: string, isDomain: boolean): Promise<string> {
        return Chrome.request({ action: "Account.transferKns", assetId, to, isDomain })
    }

    static submitCommitReveal(reveal: SubmitSetting, options: SubmitBuilderOptions): Promise<{ commitTxid: string, revealTxid: string }> {
        return Chrome.request({ action: "Account.submitCommitReveal", reveal, options})
    }
}
