import {evmService, keyringService } from './index';
import {EvmTokenList} from '@/model/evm'
import {Provider} from "@/utils/provider";
import {BlockTag, TransactionRequest} from "ethers/src.ts/providers/provider";
import { ethers } from "ethers";

export const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

export class AccountEvm {

    private client: Map<number, Provider> = new Map();

    async getProvider(): Promise<Provider> {
        let network = await evmService.getSelectedNetwork();
        if (!network || network.rpcUrl.length == 0) {
            throw Error("network not found");
        }
        const chainId = Number(network.chainId);
        if (this.client.has(chainId)) {
            return this.client.get(chainId)!;
        }
        let provider = new Provider(network.rpcUrl, chainId)
        this.client.set(chainId, provider);
        return provider;
    }

    async getERC20Tokens(address: string): Promise<EvmTokenList[]> {
        let provider = await this.getProvider()
        let network = await evmService.getSelectedNetwork()
        if (!network) throw new Error("no network find")
        let ethBalance = await provider.getBalance(address)
        let listdata = [{
            native: true,
            symbol: network.symbol,
            balance: ethers.formatUnits(ethBalance, network.decimals),
            name: network.name,
            address: "",
            decimals: network.decimals
        }]
        if (network.contracts) {
            for (const token of network.contracts) {
                let tokenBal = await provider.getTokenBalance(address, {
                    address: token.address, symbol: token.symbol, decimals: token.decimals
                });
                listdata = listdata.concat({
                    native: false,
                    symbol: token.symbol,
                    balance: tokenBal || "0",
                    name: token.name,
                    address: token.address,
                    decimals: token.decimals
                });
            }
        }
        return listdata
    }

    async getTokenBalance(address: string, tokenAddress: string, decimals?: number): Promise<string> {
        let provider = await this.getProvider()
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider.provider);
        const balance = await token.balanceOf(address);
        const tokenDecimals = decimals ?? await token.decimals();
        return ethers.formatUnits(balance, tokenDecimals);
    }

    async getBalanceFormatEther(address: string):  Promise<string> {
        let provider = await this.getProvider()
        let balance =  await provider.getBalance(address)
        let network = await evmService.getSelectedNetwork()
        if (!network) {
            throw new Error("network not find")
        }
        return ethers.formatUnits(balance, network.decimals)
    }

    async getERC20Info(address: string) {
        let provider = await this.getProvider()
        return await provider.getTokenInfo(address)
    }

    async eth_blockNumber() {
        return this.getProvider().then(p => p.getBlockNumber())
    }

    async eth_getBlockByNumber(block_number: string, flag: boolean) {
        return this.getProvider().then(p => p.getBlockByNumber(block_number, flag))
    }

    async eth_getBalance(address: string, blockTag?: BlockTag) {
        return this.getProvider().then(p => p.getBalance(address, blockTag))
    }

    async eth_call(tx: TransactionRequest) {
        return this.getProvider().then(p => p.call(tx))
    }

    async eth_getTransactionReceipt(hash: string) {
        return this.getProvider().then(p => p.getTransactionReceipt(hash))
    }

    async eth_getTransactionByHash(hash: string) {
        return this.getProvider().then(p => p.getTransaction(hash))
    }

    async eth_estimateGas(data: any) {
        let provider = await this.getProvider()
        const gas = await provider.estimateGas(data)
        return ethers.toBeHex(gas)
    }

    async eth_getTransactionCount(address: ethers.AddressLike, blockTag?: BlockTag) {
        return this.getProvider().then(p => p.getTransactionCount(address, blockTag))
    }

    async eth_getCode(address: any, blockTag?: BlockTag) {
        return this.getProvider().then(p => p.getCode(address, blockTag))
    }

    async createTransaction(from: string, to: string, amount: string) {
        let provider = await this.getProvider()
        let tx = await provider.buildSendEthTx({from, to, amount})
        return tx
    }

    async createERC20TransferTx(from: string, token: string, to: string, amount: string) {
        let provider = await this.getProvider()
        let tx = await provider.buildERC20TransferTx({
            from, token, to, amount
        })
        return tx
    }

    async createContractTx(tx: TransactionRequest): Promise<TransactionRequest> {
        if (!tx.from) {
            let address = await keyringService.getActiveAddressForEvm()
            tx.from = address.address
        }
        return this.getProvider().then(p => {
            return p.buildTx(tx)
        })
    }

    async sendTransaction(tx: TransactionRequest): Promise<string> {
        let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
        let provider = await this.getProvider()
        const signer = new ethers.Wallet(privateKey.priKey, provider.provider);
        const resp = await provider.sendTx(signer, tx)
        return resp.hash
    }

    async parseERC20Meta(tx: any) {
        let provider = await this.getProvider()
        let resp = await provider.parseERC20Meta(tx)
        if (resp && resp.type == "ERC20" && resp.method == "approve") {
            let address = await keyringService.getActiveAddressForEvm()
            let tokenBalance = await provider.getTokenBalance(address.address, {
                address: resp.token.address,
                symbol: resp.token.symbol,
                decimals: resp.token.decimals
            })
            resp.token.balance = tokenBalance
        }
        return resp
    }
}

const accountEvm = new AccountEvm();

export default accountEvm;



