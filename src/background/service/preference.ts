import { Network, PreferenceState, KasPrice } from '@/model/account';
import { TokenList } from '@/model/krc20';
import { AccountDisplay } from '@/model/wallet';
import {Oplist} from '@/model/krc20';
import {Transaction} from '@/model/kaspa';
import {Storage} from '@/utils/storage';
import {KeyRing} from './keyring';
import {ObservableStore} from '@metamask/obs-store';
import { NetworkName, NetworkType } from '@/types/enum'


export class Preference {

    public static store?: ObservableStore<PreferenceState>;

    static async load() {
        if (!Preference.store) {
            let encryptedData = await Storage.getData<PreferenceState>('preference')
            if (!encryptedData) {
                encryptedData = Preference.newPreferenceState()
                Preference.store = new ObservableStore(encryptedData)
                Preference.persistToStorage()
            } else {
                Preference.store = new ObservableStore(encryptedData)
            }
        }
    }

    static async getNetwork() {
        await Preference.load()
        return Preference.store?.getState().network
    }

    static async setNetwork(network: Network) {
        await Preference.load()
        let data = {
            network: network, currentAccount: undefined, krc20TokenList: [], krc20OpList: [], kaspaTx: [], accountsBalance: {}
        }
        Preference.store?.updateState(data)
        return Preference.persistToStorage()
    }

    static async setCurrentAccount(account: AccountDisplay) {
        await Preference.load()
        let data = { currentAccount: account, krc20TokenList: [], krc20OpList: [], kaspaTxList: [], accountsBalance: {}}
        Preference.store?.updateState(data)
        return Preference.persistToStorage()
    }

    static async getCurrentAccount() {
        await Preference.load()
        return Preference.store?.getState().currentAccount
    }

    // static async setCurrentAccountBalance(balance: string) {
    //     await Preference.load()
    //     let account = Preference.store?.getState().currentAccount!
    //     account!.balance = balance
    //     Preference.store?.updateState({currentAccount: account})
    //     return Preference.persistToStorage()
    // }

    static async setKrc20TokenList(data: TokenList[]) {
        await Preference.load()
        return Preference.store?.updateState( { krc20TokenList: data })
    }

    static async getKrc20TokenList() {
        await Preference.load()
        return Preference.store?.getState().krc20TokenList
    }

    static async setKrc20OpList(data: Oplist[]) {
        await Preference.load()
        return Preference.store?.updateState({ krc20OpList: data })
    }

    static async getKrc20OpList() {
        await Preference.load()
        return Preference.store?.getState().krc20OpList
    }

    static async setKaspaTxList(data: Transaction[]) {
        await Preference.load()
        return Preference.store?.updateState({ kaspaTxList: data })
    }

    static async getKaspaTxList() {
        await Preference.load()
        return Preference.store?.getState().kaspaTxList
    }

    static async getAll() {
        await Preference.load()
        return Preference.store?.getState()
    }

    static async setNetworkConfig(network: Network) {
        await Preference.load()
        let networkConfig = Preference.store?.getState().networkConfig!
        networkConfig[network.networkId] = network
        await Preference.persistToStorage()
        return Object.values(networkConfig)
    }

    static async getNetworkConfig() {
        await Preference.load()
        return Object.values(Preference.store?.getState().networkConfig!)
    }

    static async setAccountsBalance(accountsBalance: Record<string, string>) {
        await Preference.load()
        Preference.store?.updateState({accountsBalance: accountsBalance})
        return Preference.persistToStorage()
    }

    static async updateAccountsBalance(address: string, balance:string) {
        await Preference.load()
        let state = Preference.store?.getState().accountsBalance! || {}
        let currentAccount = Preference.store?.getState().currentAccount
        if (currentAccount && currentAccount.address == address) {
            currentAccount.balance = balance
        }
        state[address] = balance
        return Preference.persistToStorage()
    }

    static async getAccountsBalance()  {
        await Preference.load()
        return Preference.store?.getState().accountsBalance
    }

    static async getLockTime() {
        await Preference.load()
        return Preference.store?.getState().lockTime || 3600000
    }

    static async setLockTime(lockTime: number) {
        await Preference.load()
        Preference.store?.updateState({lockTime: lockTime})
        return Preference.persistToStorage()
    }

    static async setKasprice(price: KasPrice) {
        await Preference.load()
        Preference.store?.updateState({kasPrice: price})
        return Preference.persistToStorage()
    }

    static async setContractAddress(data: Record<string, string>) {
        await Preference.load()
        let address = Preference.store?.getState().contractAddress || {}
        for (const [key, value] of Object.entries(data)) {
            address[key] = value
        }
        Preference.store?.updateState({contractAddress: address})
        return Preference.persistToStorage()
    }

    static newPreferenceState() {
        return {
            network: {
                networkId: 0,
                url: "",
                name: ""
            },
            networkConfig: {
                [NetworkType.Mainnet]: {
                    name: NetworkName.Mainnet,
                    networkId: NetworkType.Mainnet,
                    url: "",
                },
                [NetworkType.Testnet]: {
                    name: NetworkName.Testnet,
                    networkId: NetworkType.Testnet,
                    url: "",
                }
            },
            lockTime: 3600000,
        }
    }

    static async persistToStorage(): Promise<void> {
        console.log("preference persistToStorage",  Preference.store?.getState())
        await Storage.setData('preference', Preference.store?.getState());
    }
}

export default Preference;


