import { Chrome } from '@/chrome/chrome'
import {GetBalancesByAddressesResponseMessage} from "@/utils/wallet/rpc/types";
import {Krc20DeployOptions} from "@/utils/wallet/krc20";
import {TransactionRequest} from "ethers/src.ts/providers/provider";
import {EvmTokenList, Erc20Options} from "@/model/evm";
import { SubmitSetting, SubmitBuilderOptions } from '@/model/account'

export class AccountEvm extends Chrome {

    static getEvmBalanceFormatEther(address: string): Promise<any> {
        return Chrome.request({ action: "AccountEvm.getBalanceFormatEther", address })
    }

    static getTokenBalance(address: string, token: string, decimals?: number): Promise<any> {
        return Chrome.request({ action: "AccountEvm.getTokenBalance", address, token, decimals})
    }

    static async createTransaction(from: string, to: string, amount: string): Promise<TransactionRequest> {
        return Chrome.request({ action: "AccountEvm.createTransaction", from, to, amount })
    }

    static async createErc20Transaction(from: string, tokenAddress: string, toAddress: string, amount: string): Promise<TransactionRequest> {
        return Chrome.request({ action: "AccountEvm.createERC20TransferTx", from, tokenAddress, toAddress, amount })
    }

    static async createContractTx(tx: TransactionRequest): Promise<TransactionRequest> {
        return Chrome.request({ action: "AccountEvm.createContractTx", tx })
    }

    static async sendTransaction(tx: TransactionRequest): Promise<string> {
        return Chrome.request({ action: "AccountEvm.sendTransaction", tx })
    }

    static async getERC20Tokens(address: string): Promise<EvmTokenList[]> {
        return Chrome.request({ action: "AccountEvm.getERC20Tokens", address })
    }

    static async getERC20Info(address: string): Promise<Erc20Options> {
        return Chrome.request({ action: "AccountEvm.getERC20Info", address })
    }
}
