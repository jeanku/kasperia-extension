import { Address } from '@/model/contact';
import { Storage } from '@/utils/storage';
import { ObservableStore } from '@metamask/obs-store';

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
    static async get() {
        await Contact.load()
        const state = Contact.store?.getState()
        return Object.values(state)
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


