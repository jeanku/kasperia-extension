import { Provider } from '@/utils/wallet/provider';
import {evmService, keyringService} from './index';
import {TransactionRequest} from "ethers/src.ts/providers/provider";

/**
 * EVM Service
 * Manages EVM networks and contracts using ObservableStore and persists data via Storage utility
 */
export class Token {

    private client: Provider | undefined = undefined;

    /** Get all network configs */
    async getClient() {
        if (!this.client) {
            let network = await evmService.getSelectedNetwork()
            if (!network) {
                throw Error("network not find")
            }
            this.client = new Provider(network.rpcUrl[0], Number(network.chainId))
        }
        return this.client
    }

    // async sendEth(to: string, amount: string): Promise<string> {
    //     let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
    //     return this.getClient().then(client => {
    //         // return client.sendEth(privateKey.priKey, to, amount)
    //         return ""
    //     })
    // }
    //
    // async sendToken(to: string, tokenAddress: string,  amount: string): Promise<string> {
    //     let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
    //     return this.getClient().then(client => {
    //         return client.sendToken(privateKey.priKey, tokenAddress, to, amount)
    //     })
    // }

    async createTransaction(from: string, to: string,  amount: string): Promise<string> {
        return this.getClient().then(client => {
            return client.createTransaction(from, to, amount)
        })
    }

    async createERC20TransferTx(from: string, tokenAddress: string, toAddress: string, amount: string, tokenDecimals: number): Promise<string> {
        return this.getClient().then(client => {
            return client.createERC20TransferTx(from, tokenAddress, toAddress, amount, tokenDecimals)
        })
    }

    async sendTransaction(tx: TransactionRequest): Promise<string> {
        let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
        return this.getClient().then(client => {
            return client.sendTransaction(privateKey.priKey, tx)
        })
    }



}

const token = new Token();

export default token;
