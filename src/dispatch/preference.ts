import { AccountDisplay } from '@/model/wallet';
import { Preference } from '@/chrome/preference';
import { Keyring } from '@/chrome/keyring';
import store from '@/store';
import { Dispatch } from 'redux';
import { setPreference, setCurrentAccount, setNetwork } from "@/store/preferenceSlice";
import { Kiwi, Wasm } from '@kasplex/kiwi-web'
import { Network } from '@/model/account';

export async function dispatchPreference(refresh: boolean=false) {
    try {
        let preference = await Preference.getAll()
        if (!preference.currentAccount || refresh) {
            let account: AccountDisplay = await Keyring.getActiveAccount()
            preference.currentAccount = account
        }
        const dispatch: Dispatch = store.dispatch;
        dispatch(setPreference(preference))
    } catch (error) {
        console.error("Error dispatching account:", error);
    }
}

export async function dispatchRefreshPreference(wallet: AccountDisplay) {
    try {
        await Preference.setCurrentAccount(wallet)
        const dispatch: Dispatch = store.dispatch;
        return dispatch(setCurrentAccount(wallet));
    } catch (error) {
        console.error("Error dispatching account:", error);
    }
}

export async function dispatchPreferenceAddNewAccount() {
    try {
        let account: AccountDisplay = await Keyring.getActiveAccount()
        const dispatch: Dispatch = store.dispatch;
        return dispatch(setCurrentAccount(account));
    } catch (error) {
        console.error("Error dispatching account:", error);
    }
}

export async function dispatchRefreshNetwork(network: Network, currentAccount: AccountDisplay) {
    try {
        const dispatch: Dispatch = store.dispatch;
        await Preference.setNetwork(network)
        dispatch(setNetwork(network))
        Kiwi.setNetwork(network.networkId)
        let address = new Wasm.PublicKey(currentAccount.pubKey).toAddress(network.networkId).toString()
        let account = {...currentAccount, address: address, balance: "0" }
        await Preference.setCurrentAccount(account)
        return dispatch(setCurrentAccount(account));
    } catch (error) {
        console.error("Error dispatching network:", error);
    }
}