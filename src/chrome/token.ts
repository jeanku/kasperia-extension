import { Chrome } from '@/chrome/chrome'
import {TransactionRequest} from "ethers/src.ts/providers/provider";

export class Token {

    static async createTransaction(from: string, to: string, amount: string): Promise<TransactionRequest> {
        return Chrome.request({ action: "Token.createTransaction", from, to, amount })
    }

    static async createErc20Transaction(from: string, tokenAddress: string, toAddress: string, amount: string, tokenDecimals: number): Promise<TransactionRequest> {
        return Chrome.request({ action: "Token.createERC20TransferTx", from, tokenAddress, toAddress, amount, tokenDecimals })
    }

    static async sendToken(to: string, tokenAddress: string, amount: string | number): Promise<string> {
        return Chrome.request({ action: "Token.sendToken", to, tokenAddress, amount })
    }

    static async sendTransaction(tx: TransactionRequest): Promise<string> {
        return Chrome.request({ action: "Token.sendTransaction", tx })
    }
}
