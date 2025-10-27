import { Provider } from '@/utils/wallet/provider';
import {evmService, keyringService} from './index';
import {TransactionRequest} from "ethers/src.ts/providers/provider";

/**
 * EVM Service
 * Manages EVM networks and contracts using ObservableStore and persists data via Storage utility
 */
export class Token {

    private clients: Map<number, Provider> = new Map();

    async getClient(): Promise<Provider> {
        const network = await evmService.getSelectedNetwork();
        if (!network || network.rpcUrl.length == 0) {
            throw Error("network not found");
        }
        const chainId = Number(network.chainId);
        if (this.clients.has(chainId) && this.clients.get(chainId)!.rpcUrl == network.rpcUrl[0]) {
            return this.clients.get(chainId)!;
        }
        const client = new Provider(network.rpcUrl[0], chainId);
        this.clients.set(chainId, client);
        return client;
    }

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
