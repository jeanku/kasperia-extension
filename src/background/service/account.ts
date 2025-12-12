import {evmService, keyringService, preferenceService} from './index';
import {
    KRC20_DEPLOY_FEES,
    KRC20_DEPLOY_TOTAL_FEES,
    KRC20_MINT_FEES,
    KRC20_MINT_RETURN_FEES,
    KRC20_TRANSFER_TOTAL_FEES
} from './types';
import {Resolver, RpcClient, } from '@/utils/wallet/rpc'
import { RpcUtxosByAddressesEntry } from '@/utils/wallet/rpc/types'
import {
    Generator,
    GeneratorSettings,
    Hash,
    PaymentOutput,
    TransactionOutpoint,
    U64_MAX_VALUE,
    UtxoEntryReference,
    FeeSource, Fees,
} from '@/utils/wallet/tx'
import {Keypair, Wallet} from '@/utils/wallet/wallet'
import {EvmTokenList} from '@/model/evm'
import {NetworkId, ScriptPublicKey} from '@/utils/wallet/consensus';
import {Krc20DeployOptions, Krc20DeployScript, Krc20MintScript, Krc20TransferScript} from '@/utils/wallet/krc20';
import {stringToUint8Array} from "@/utils/util";
import {Provider} from "@/utils/wallet/provider";
import {BlockTag, TransactionRequest} from "ethers/src.ts/providers/provider";
import { ethers } from "ethers";

export class Account {
    private client: RpcClient | undefined = undefined

    private clients: Map<number, Provider> = new Map();

    private entry: { total: bigint, from: string, data: RpcUtxosByAddressesEntry[]} = {
        from: "",
        total: 0n,
        data: []
    };

    async get_provider(chainIdStr: string | undefined = undefined): Promise<Provider> {
        let network = undefined
        if (chainIdStr) {
            network = await evmService.getNetwork(chainIdStr)
        } else {
            network = await evmService.getSelectedNetwork();
        }
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

    async getBalance(addr: string | undefined = undefined) {
        if (!this.client) {
            await this.connect()
        }
        const address = addr || await keyringService._getActiveAddress()
        return await this.client!.getBalanceByAddress(address)
    }

    resetEntry = () => {
        this.entry = {
            from: "",
            total: 0n,
            data: []
        }
    }

    async getAddressesBalance(addresses: string[]) {
        if (!this.client) {
            await this.connect()
        }
        return await this.client!.getBalancesByAddresses(addresses)
    }

    async connect() {
        let networkId = await preferenceService.getNetworkId()
        this.client = new RpcClient({resolver: new Resolver(), networkId });
        await this.client.connect()
    }

    async reconnect(networkId: NetworkId | undefined) {
        this.client = undefined
        // this.client.connect()
    }

    async signMessage(message: number[]) {
        let account = await keyringService.getActiveWalletPrivateKeyForEvm()
        let wallet = Wallet.fromPrivateKey(account.priKey)
        const bytes = new Uint8Array(message);
        return wallet.wallet.signMessage(bytes)
    }

    async transferKrc20(tick: string | undefined, ca: string | undefined, amount: string, to: string) {
        const options = {
            tick, ca, to, amount: BigInt(amount),
        };
        let account = keyringService.currentAccount()
        let networkId = await preferenceService.getNetworkId()

        const senderAddress = Keypair.fromPrivateKeyHex(account.priKey).toAddress(networkId.networkType);
        const script = new Krc20TransferScript(senderAddress, networkId, options);
        let p2shAddress = script.p2shAddress
        let scriptPublicKey = script.payToScriptPublicKey()

        let utxos = await this.client?.getUtxosByAddresses([senderAddress.toString()])
        if (!utxos) {
            throw Error("fetch utxo fail")
        }
        const output = new PaymentOutput(p2shAddress.toString(), KRC20_TRANSFER_TOTAL_FEES);

        let setting = new GeneratorSettings([output], senderAddress, utxos.entries, networkId, 0n);
        const generator = new Generator(setting);

        let transaction = generator.generateTransaction()

        const signedTx = await transaction!.sign([account.priKey]);

        await this.client?.submitTransaction({
            transaction: signedTx.toSubmittableJsonTx(),
            allowOrphan: false
        });
        const priorityEntries = [
            new UtxoEntryReference(
                p2shAddress,
                new TransactionOutpoint(signedTx.transaction.id, 0),
                KRC20_TRANSFER_TOTAL_FEES,
                scriptPublicKey,
                U64_MAX_VALUE,
                false
            )
        ];

        let revealSetting = new GeneratorSettings([
            new PaymentOutput(senderAddress, KRC20_MINT_RETURN_FEES)
        ], senderAddress, priorityEntries, NetworkId.Testnet10, KRC20_MINT_FEES);

        const revealGenerator = new Generator(revealSetting);
        let revealTransaction = revealGenerator.generateTransaction()

        const revealInputIndex = revealTransaction!.tx.inputs.findIndex((input) => input.signatureScript.length === 0);
        if (revealInputIndex !== -1) {
            const signature = revealTransaction!.createInputSignature(revealInputIndex, account.priKey);
            revealTransaction!.fillInputSignature(revealInputIndex, script.script.encodePayToScriptHashSignatureScript(signature));
        }

        await this.client?.submitTransaction({
            transaction: revealTransaction!.toSubmittableJsonTx(),
            allowOrphan: false
        });
        return revealTransaction!.tx.id.toHex()
    }

    async deployKrc20(options: Krc20DeployOptions) {
        let account = keyringService.currentAccount()
        let networkId = await preferenceService.getNetworkId()

        const senderAddress = Keypair.fromPrivateKeyHex(account.priKey).toAddress(networkId.networkType);
        const script = new Krc20DeployScript(senderAddress, networkId, options);

        let p2shAddress = script.p2shAddress
        let scriptPublicKey = script.payToScriptPublicKey()
        let utxos = await this.client?.getUtxosByAddresses([senderAddress.toString()])
        if (!utxos) {
            throw Error("fetch utxo fail")
        }

        const output = new PaymentOutput(p2shAddress.toString(), KRC20_DEPLOY_TOTAL_FEES);
        let setting = new GeneratorSettings([output], senderAddress, utxos.entries, networkId, 0n);
        const generator = new Generator(setting);
        let transaction = generator.generateTransaction()
        const signedTx = await transaction!.sign([account.priKey]);
        await this.client?.submitTransaction({
            transaction: signedTx.toSubmittableJsonTx(),
            allowOrphan: false
        });

        const priorityEntries = [
            new UtxoEntryReference(
                p2shAddress,
                new TransactionOutpoint(signedTx.transaction.id, 0),
                KRC20_DEPLOY_TOTAL_FEES,
                scriptPublicKey,
                U64_MAX_VALUE,
                false
            )
        ];

        let revealSetting = new GeneratorSettings([
            new PaymentOutput(senderAddress, KRC20_MINT_RETURN_FEES)
        ], senderAddress, priorityEntries, NetworkId.Testnet10, KRC20_DEPLOY_FEES);

        const revealGenerator = new Generator(revealSetting);
        let revealTransaction = revealGenerator.generateTransaction()

        const revealInputIndex = revealTransaction!.tx.inputs.findIndex((input) => input.signatureScript.length === 0);
        if (revealInputIndex !== -1) {
            const signature = revealTransaction!.createInputSignature(revealInputIndex, account.priKey);
            revealTransaction!.fillInputSignature(revealInputIndex, script.script.encodePayToScriptHashSignatureScript(signature));
        }

        await this.client?.submitTransaction({
            transaction: revealTransaction!.toSubmittableJsonTx(),
            allowOrphan: false
        });
        return revealTransaction!.tx.id.toHex()
    }

    async mintKrc20(txid: string, leftAmount: string, tick: string, times: number, useUtxo: boolean) {
        const options = {
            tick,
        };
        let account = keyringService.currentAccount()
        let networkId = await preferenceService.getNetworkId()
        const senderAddress = Keypair.fromPrivateKeyHex(account.priKey).toAddress(networkId.networkType);
        const script = new Krc20MintScript(senderAddress, networkId, options);

        let p2shAddress = script.p2shAddress
        let scriptPublicKey = script.payToScriptPublicKey()
        let total_fee = KRC20_MINT_FEES * BigInt(times) + KRC20_MINT_RETURN_FEES
        var charge_fee = 0n

        var inputEntries: UtxoEntryReference[] = []
        if (txid == "") {
            if (useUtxo) {
                let {entries, balance} = await this.getEntriesFromUtxos(p2shAddress.toString())
                if (balance < total_fee) {
                    charge_fee = total_fee - balance
                    charge_fee = charge_fee >= KRC20_MINT_FEES ? charge_fee : KRC20_MINT_FEES
                }
                inputEntries = entries
            } else {
                charge_fee = total_fee
            }
            if (charge_fee > 0n) {
                let txid = await this.transfer(account.priKey, senderAddress.toString(), p2shAddress.toString(), charge_fee, networkId)
                inputEntries.push(new UtxoEntryReference(p2shAddress,
                    new TransactionOutpoint(Hash.fromHex(txid), 0),
                    charge_fee, scriptPublicKey, U64_MAX_VALUE, false
                ) as UtxoEntryReference)
            }
        } else {
            inputEntries = [
                new UtxoEntryReference(p2shAddress,
                    new TransactionOutpoint(Hash.fromHex(txid), 0),
                    BigInt(leftAmount), scriptPublicKey, U64_MAX_VALUE, false
                ) as UtxoEntryReference
            ]
        }

        let balance = inputEntries.reduce((sum, utxo) => sum + utxo.amount, 0n);

        let output = balance - KRC20_MINT_FEES
        let outputAddress = output < KRC20_MINT_FEES ? senderAddress : p2shAddress
        let revealSetting = new GeneratorSettings([
            new PaymentOutput(outputAddress, output)
        ], senderAddress, inputEntries, NetworkId.Testnet10, KRC20_MINT_FEES);

        const revealGenerator = new Generator(revealSetting);
        let revealTransaction = revealGenerator.generateTransaction()

        let length = revealTransaction!.tx.inputs.length
        for (let i = 0; i < length; i++) {
            const signature = revealTransaction!.createInputSignature(i, account.priKey);
            revealTransaction!.fillInputSignature(i, script.script.encodePayToScriptHashSignatureScript(signature));
        }

        await this.client?.submitTransaction({
            transaction: revealTransaction!.toSubmittableJsonTx(),
            allowOrphan: false
        });

        return {txid: revealTransaction!.tx.id.toHex(), balance: output.toString()}
    }

    async getEntriesFromUtxos(address: string) {
        let utxos = await this.client?.getUtxosByAddresses([address])
        var entries: UtxoEntryReference[] = []
        let balance = 0
        for (let utxo of utxos!.entries) {
            balance = balance + utxo.utxoEntry!.amount
            let entry = new UtxoEntryReference(
                utxo.address,
                new TransactionOutpoint(utxo.outpoint?.transactionId!, utxo.outpoint?.index!),
                utxo.utxoEntry?.amount ? BigInt(utxo.utxoEntry?.amount) : 0n,
                ScriptPublicKey.fromHex(utxo.utxoEntry?.scriptPublicKey!),
                U64_MAX_VALUE,
                false
            )
            entries.push(entry)
        }
        return {entries, balance: BigInt(balance)}
    }

    async estimateFee(from: string, to: string, sompi: string, payload: string | undefined) {
        let amount = BigInt(sompi)
        let networkId = await preferenceService.getNetworkId()
        if (this.entry.total < amount || this.entry.from != from) {
            let utxos = await this.client?.getUtxosByAddresses([from])
            if (!utxos) {
                throw new Error("fetch utxo fail")
            }
            let entry = utxos.entries.sort((a, b) => (a.utxoEntry?.amount || 0) - (b.utxoEntry?.amount || 0))
            let total = entry.reduce((sum, utxo) => sum + (utxo.utxoEntry?.amount || 0), 0)
            this.entry = {
                from,
                total: BigInt(total),
                data: entry
            }
        }
        const output = new PaymentOutput(to, amount);
        let fee = new Fees(0n, this.entry.total == amount ? FeeSource.ReceiverPays : FeeSource.SenderPays)
        let setting = new GeneratorSettings([output],
            from, this.entry.data, networkId, fee, undefined, undefined,
            undefined, payload ? stringToUint8Array(payload) : undefined
        );
        const generator = new Generator(setting);
        let transaction = generator.generateTransaction()
        return transaction?.feeAmount.toString()
    }

    async transferKas(to: string, amount: string, payload: string | undefined) {
        let account = keyringService.currentAccount()
        let networkId = await preferenceService.getNetworkId()
        const senderAddress = Keypair.fromPrivateKeyHex(account.priKey).toAddress(networkId.networkType);
        return this.transfer(account.priKey, senderAddress.toString(), to, BigInt(amount), networkId, payload)
    }

    async transfer(privateKey: string, sender: string, to: string, amount: bigint, networkId: NetworkId, payload: string | undefined = undefined) {
        let utxos = await this.client?.getUtxosByAddresses([sender])
        if (!utxos) {
            throw new Error("fetch utxo fail")
        }
        let total = utxos.entries.reduce((sum, utxo) => sum + (utxo.utxoEntry?.amount || 0), 0)
        const output = new PaymentOutput(to, amount);
        let payloadArray = payload ? stringToUint8Array(payload) : undefined
        let fee = new Fees(0n, BigInt(total) == amount ? FeeSource.ReceiverPays : FeeSource.SenderPays)
        let setting = new GeneratorSettings([output], sender, utxos?.entries!, networkId, fee, undefined, undefined, undefined, payloadArray);
        const generator = new Generator(setting);
        let transaction = generator.generateTransaction()
        const signedTx = await transaction!.sign([privateKey]);
        await this.client?.submitTransaction({
            transaction: signedTx.toSubmittableJsonTx(),
            allowOrphan: false
        });
        this.resetEntry()
        return signedTx.transaction.id.toString()
    }

    async getERC20Tokens(address: string): Promise<EvmTokenList[]> {
        let provider = await this.get_provider()
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
            let tokensBalance = await provider.getMultipleTokenBalances(address, network.contracts)
            const tokenList = network.contracts.map((token) => ({
                native: false,
                symbol: token.symbol,
                balance: tokensBalance[token.address] || "0",
                name: token.name,
                address: token.address,
                decimals: token.decimals
            }));
            listdata = listdata.concat(tokenList);
        }
        return listdata
    }

    async eth_blockNumber() {
        return (await this.get_provider()).blockNumber()
    }

    async eth_getBlockByNumber(block_number: string, flag: boolean) {
        return (await this.get_provider()).getBlockByNumber(block_number, flag)
    }

    async eth_getBalance(address: string, blockTag?: BlockTag) {
        return (await this.get_provider()).getBalance(address, blockTag)
    }

    async getBalanceFormatEther(address: string) {
        return (await this.get_provider()).getBalanceFormatEther(address)
    }

    async eth_call(tx: TransactionRequest) {
        return (await this.get_provider()).ethCall(tx)
    }

    async eth_getTransactionReceipt(hash: string) {
        return await (await this.get_provider()).getTransactionReceipt(hash)
    }

    async eth_getTransactionByHash(hash: string) {
        return await (await this.get_provider()).getTransactionByHash(hash)
    }

    async eth_estimateGas(data: any) {
        let gas = await (await this.get_provider()).estimateGas(data)
        return "0x" + gas.toString(16)
    } 
    
    async eth_getCode(address: any, blockTag?: BlockTag) {
        return await (await this.get_provider()).getCode(address, blockTag)
    }

    async createTransaction(from: string, to: string, amount: string): Promise<string> {
        return this.get_provider().then(provider => {
            return provider.createTransaction(from, to, amount)
        })
    }

    async createERC20TransferTx(from: string, tokenAddress: string, toAddress: string, amount: string, tokenDecimals: number): Promise<string> {
        return this.get_provider().then(provider => {
            return provider.createERC20TransferTx(from, tokenAddress, toAddress, amount, tokenDecimals)
        })
    }

    async createContractTx(tx: TransactionRequest): Promise<TransactionRequest> {
        return this.get_provider().then(provider => {
            // @ts-ignore
            return provider.createContractTx(tx)
        })
    }

    async sendTransaction(tx: TransactionRequest): Promise<string> {
        let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
        return this.get_provider().then(provider => {
            return provider.sendTransaction(privateKey.priKey, tx)
        })
    }
}

const account = new Account();

export default account;


