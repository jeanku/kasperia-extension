import {evmService, keyringService, preferenceService} from './index';
import {
    KRC20_DEPLOY_FEES,
    KRC20_DEPLOY_TOTAL_FEES,
    KRC20_MINT_FEES,
    KRC20_MINT_RETURN_FEES,
    KRC20_TRANSFER_TOTAL_FEES
} from './types';
import {Resolver, RpcClient} from '@/utils/wallet/rpc'
import {
    Generator,
    GeneratorSettings,
    Hash,
    PaymentOutput,
    TransactionOutpoint,
    U64_MAX_VALUE,
    UtxoEntryReference
} from '@/utils/wallet/tx'
import {Keypair, Wallet} from '@/utils/wallet/wallet'
import {NetworkId, ScriptPublicKey} from '@/utils/wallet/consensus';
import {Krc20DeployOptions, Krc20DeployScript, Krc20MintScript, Krc20TransferScript} from '@/utils/wallet/krc20';
import {stringToUint8Array} from "@/utils/util";
import {Provider} from "@/utils/wallet/provider";
import {BlockTag, TransactionRequest} from "ethers/src.ts/providers/provider";

export class Account {
    private client: RpcClient | undefined = undefined

    private clients: Map<number, Provider> = new Map();

    async get_provider(): Promise<Provider> {
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


    async getBalance(addr: string | undefined = undefined) {
        if (!this.client) {
            await this.connect()
        }
        const address = addr || await keyringService._getActiveAddress()
        return await this.client!.getBalanceByAddress(address)
    }

    async getAddressesBalance(addresses: string[]) {
        if (!this.client) {
            await this.connect()
        }
        return await this.client!.getBalancesByAddresses(addresses)
    }

    async connect() {
        let networkId = await preferenceService.getNetworkId()
        this.client = new RpcClient({resolver: new Resolver(), networkId});
        await this.client.connect()
    }

    async reconnect(networkId: NetworkId | undefined) {
        this.client = undefined
        // this.client.connect()
    }

    async signMessage(message: string) {
        let account = await keyringService.getActiveWalletPrivateKeyForEvm()
        let wallet = Wallet.fromPrivateKey(account.priKey)
        return wallet.wallet.signMessage(message)
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

    async estimateFee(to: string, amount: string, payload: string) {
        if (BigInt(amount) < 100000000n) return
        let account = keyringService.currentAccount()
        let networkId = await preferenceService.getNetworkId()
        const senderAddress = Keypair.fromPrivateKeyHex(account.priKey).toAddress(networkId.networkType);
        let utxos = await this.client?.getUtxosByAddresses([senderAddress.toString()])
        if (!utxos) {
            throw Error("fetch utxo fail")
        }
        const fee = 0n;
        const output = new PaymentOutput(to || senderAddress, BigInt(amount) - 100000000n);
        let setting = new GeneratorSettings([output],
            senderAddress, utxos.entries, NetworkId.Testnet10, fee, undefined, undefined,
            undefined, stringToUint8Array(payload)
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
        const output = new PaymentOutput(to, amount);
        let payloadArray = payload ? stringToUint8Array(payload) : undefined
        let setting = new GeneratorSettings([output], sender, utxos?.entries!, networkId, 0n, undefined, undefined, undefined, payloadArray);
        const generator = new Generator(setting);
        let transaction = generator.generateTransaction()
        const signedTx = await transaction!.sign([privateKey]);
        await this.client?.submitTransaction({
            transaction: signedTx.toSubmittableJsonTx(),
            allowOrphan: false
        });
        return signedTx.transaction.id.toString()
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
        // return (await this.get_provider()).getBalanceFormatEther(address)
    }

    async eth_call(tx: TransactionRequest) {
        return (await this.get_provider()).ethCall(tx)
    }

    async eth_getTransactionReceipt(hash: string) {
        return await (await this.get_provider()).getTransactionReceipt(hash)
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

    async sendTransaction(tx: TransactionRequest): Promise<string> {
        let privateKey = await keyringService.getActiveWalletPrivateKeyForEvm()
        return this.get_provider().then(provider => {
            return provider.sendTransaction(privateKey.priKey, tx)
        })
    }
}

const account = new Account();

export default account;


