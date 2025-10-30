import { Address } from '@/model/contact';
import { preferenceService } from './index';
import { Storage } from '@/utils/storage';
import { ObservableStore } from '@metamask/obs-store';
import {AddressType, NetworkType} from "@/types/enum";

/**
 * Contact manager that handles address book entries using ObservableStore
 * and persists the data to chrome.storage (via Storage utility).
 */
export class Contact {

    // Observable store to manage address book state
    public static store: ObservableStore<Record<string, Address>>;

    /**
     * Initialize the ObservableStore from persistent storage.
     */
    static async load() {
        if (!Contact.store) {
            let encryptedData = await Storage.getData<Record<string, Address>>('contactBook')
            Contact.store = new ObservableStore(encryptedData  || {})
        }
    }

    /**
     * Add a new address to the contact book.
     * @param address - Address object containing address and name
     */
    static async add(address: Address) {
        await Contact.load()
        Contact.store?.updateState({[address.address]: address})
        return Contact.persistToStorage()
    }

    /**
     * Retrieve all saved addresses as a list.
     */
    static async getAll() {
        await Contact.load()
        const state = Contact.store?.getState()
        return Object.values(state)
    }

    /**
     * Retrieve all saved addresses as a list.
     */
    static async get(type: AddressType = AddressType.KaspaAddress) {
        await Contact.load()
        let resp: Address[] = []
        const state = Contact.store?.getState()
        let network = await preferenceService.getNetwork()
        for (const key in state) {
            if (type == AddressType.KaspaAddress) {
                // console.log("state[key].network:", state[key].network, network.networkId, state[key].network == network.networkId)
                if (state[key].type == type && state[key].network == network.networkType) {
                    resp.push(state[key])
                }
            } else {
                if (state[key].type == type) {
                    resp.push(state[key])
                }
            }
        }
        return resp
    }

    /**
     * Change the name of an existing contact.
     * @param address - Address string (key)
     * @param name - New name to assign
     */
    static async changeName(address: string, name: string) {
        await Contact.load()
        const state = Contact.store?.getState()
        if (state[address]) {
            state[address].name = name
            Contact.store.updateState({ ...state })
            return Contact.persistToStorage()
        }
    }

    /**
     * Remove a contact by address.
     * @param address - Address string (key)
     */
    static async remove(address: string) {
        await Contact.load()
        const state = Contact.store.getState()
        if (state[address]) {
            delete state[address]
            Contact.store.updateState({ ...state })
            return Contact.persistToStorage()
        }
    }

    /**
     * Save current store state to persistent storage.
     */
    static async persistToStorage(): Promise<void> {
        await Storage.setData('contactBook', Contact.store.getState());
    }
}

export default Contact;


