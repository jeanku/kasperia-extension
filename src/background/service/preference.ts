import { debounce } from 'lodash';
import { Network, PreferenceState, KasPrice } from '@/model/account';
import { TokenList } from '@/model/krc20';
import { AccountDisplay } from '@/model/wallet';
import {Oplist} from '@/model/krc20';
import { KaspaTransaction } from '@/utils/wallet/kaspa';
import {Storage} from '@/utils/storage';
import {accountService, keyringService} from './index';
import {ObservableStore} from '@metamask/obs-store';
import {EvmTokenList} from "@/model/evm";
import { NetworkType, NetworkId } from "@/utils/wallet/consensus";

export class Preference {

    public static store?: ObservableStore<PreferenceState>;

    private static debouncedPersist = debounce(async () => {
        console.log("💾 preference debounced persist", Preference.store?.getState());
        await Storage.setData('preference', Preference.store?.getState());
    }, 5000);

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
        return Preference.store!.getState().network
    }

    static async getNetworkType() {
        await Preference.load()
        let network = Preference.store!.getState().network
        return network.networkType
    }

    static async getNetworkId(): Promise<NetworkId> {
        await Preference.load()
        let network = Preference.store!.getState().network
        return NetworkId.from(network.networkType)
    }

    static async setNetwork(network: Network) {
        await Preference.load()
        let curAccount = await keyringService.getActiveAccountDisplay(network.networkType)
        console.log("setNetwork 0")
        Preference.store?.updateState({
            network: network, currentAccount: curAccount, krc20TokenList: [], krc20OpList: [], kaspaTxList: [], accountsBalance: {}
        })
        console.log("setNetwork 1")
        accountService.reconnect(NetworkId.from(network.networkType))
        console.log("setNetwork 2")
        Preference.persistToStorage()
        console.log("setNetwork 3")
        return curAccount
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

    static async setKrc20TokenList(data: TokenList[]) {
        await Preference.load()
        Preference.store?.updateState( { krc20TokenList: data })
        return Preference.persistToStorage()
    }

    static async getKrc20TokenList() {
        await Preference.load()
        return Preference.store?.getState().krc20TokenList
    }

    static async setKrc20OpList(data: Oplist[]) {
        await Preference.load()
        Preference.store?.updateState({ krc20OpList: data })
        return Preference.persistToStorage()
    }

    static async getKrc20OpList() {
        await Preference.load()
        return Preference.store?.getState().krc20OpList
    }

    static async setKaspaTxList(data: KaspaTransaction[]) {
        await Preference.load()
        Preference.store?.updateState({ kaspaTxList: data })
        return Preference.persistToStorage()
    }

    static async getKaspaTxList() {
        await Preference.load()
        return Preference.store?.getState().kaspaTxList
    }

    static async setEvm20TokenList(chainId: string, data: EvmTokenList[]) {
        await Preference.load()
        let state = Preference.store?.getState()!
        Preference.store?.updateState({ evmTokenList: {...state.evmTokenList, [chainId]: data} })
        return Preference.persistToStorage()
    }

    static async getAll() {
        await Preference.load()
        return Preference.store?.getState()!
    }

    static async setNetworkConfig(network: Network) {
        await Preference.load()
        let networkConfig = Preference.store?.getState().networkConfig!
        networkConfig[network.networkType] = network
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

    static async resetCurrentAccount() {
        await Preference.load()
        let account = await keyringService.getActiveAccountDisplay()
        Preference.store?.updateState({currentAccount: account})
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
                url: "",
                networkType: NetworkType.Mainnet
            },
            networkConfig: {
                [NetworkType.Mainnet]: {
                    networkType: NetworkType.Mainnet,
                    url: "",
                },
                [NetworkType.Testnet]: {
                    networkType: NetworkType.Testnet,
                    url: "",
                }
            },
            lockTime: 3600000,
            evmTokenList: {}
        }
    }

    static async setIndex(index: string) {
        await Preference.load()
        Preference.store?.updateState({ index })
        return Preference.persistToStorage()
    }

    static async persistToStorage(): Promise<void> {
        Preference.debouncedPersist();
    }
}

export default Preference;


