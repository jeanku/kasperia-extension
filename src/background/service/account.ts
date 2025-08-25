import { keyringService, preferenceService } from '@/background/service';
import { Wasm, Rpc, Kiwi } from '@kasplex/kiwi-web'
import { AccountDisplay } from "@/model/wallet"
import { WatchBalance } from "@/background/utils/watch_balance"

export class Account {

    private isConnected: boolean = false;

    async init() {
        const network = await preferenceService.getNetwork()
        if (network == null) {
            return
        }
        Kiwi.setNetwork(network.networkId)
        Rpc.setInstance(Kiwi.network)
        await Rpc.setInstance(Kiwi.network).connect()
        this.isConnected = true
    }

    async reconnect() {
        this.isConnected = false
        if (this.isConnected) {
            return
        }
        await Rpc.setInstance(Kiwi.network).connect()
        this.isConnected = true
        chrome.runtime.sendMessage({
            type: 'connected',
            data: {}
        });
    }

    async addListener() {
        const address = await this.getAddress()
        const watchBalance = new WatchBalance(Kiwi.getNetworkID(), Rpc.getInstance().client)

        watchBalance.addAddress(address, balance => {
            console.log("balance change:", balance)
            chrome.runtime.sendMessage({
                type: 'balance-changed',
                data: {
                    address: address,
                    balance: balance
                }
            });
        })
    }

    async getBalance() {
        const address = await this.getAddress()
        const balance = await Rpc.getInstance().client.getBalanceByAddress({address: address!})
        preferenceService.getCurrentAccount().then(preference => {
            const balstr = balance.balance.toString()
            if (!preference || preference.balance != balstr) {
                preferenceService.updateAccountsBalance(address, balstr)
            }
        })
        return balance.balance
    }

    async getConnectState() {
        if (!this.isConnected) {
            this.reconnect()
            return false
        }
        return true
    }

    async getAddress() {
        const { address} = await keyringService.getActiveAccountAddressAndNetwork()
        return address
    }

    async accounts() {
        const accounts: AccountDisplay[] = await keyringService.getWalletList()
        for (const account of accounts) {
            account.address = new Wasm.PublicKey(account?.pubKey).toAddress(Kiwi.network).toString()
        }
        return accounts
    }

    async accountsBalance(addresses: string[]) {
        const balanceMap: Record<string, string> = {};
        const resp: Wasm.IGetBalancesByAddressesResponse = await Rpc.getInstance().client.getBalancesByAddresses({
            addresses: addresses
        })
        for (const entry of resp.entries) {
            balanceMap[entry.address.toString()] = entry.balance.toString();
        }
        return balanceMap
    }

    async setActiveAccount(id: string) {
        keyringService.setActiveWallet(id)
    }

    async addAccountFromPrivateKey(privateKey: string) {
        return keyringService.addAccountFromPrivateKey(privateKey)
    }

    async addAccountFromMnemonic(mnemonic: string, passphrase: string) {
        return keyringService.addAccountFromMnemonic(mnemonic, passphrase)
    }
}

const account = new Account();

export default account;


