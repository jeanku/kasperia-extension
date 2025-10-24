import { LinkItem } from '@/model/links';
import { Storage } from '@/utils/storage';
import { ObservableStore } from '@metamask/obs-store';

/**
 * Share
 * Manages LinkItem objects in a Record<string, LinkItem> store
 * persisted via Storage utility
 */
export class Share {
    private store: ObservableStore<Record<string, LinkItem>> | undefined;

    /** Initialize store from storage */
    private async load() {
        if (!this.store) {
            const data = await Storage.getData<Record<string, LinkItem>>('shares');
            this.store = new ObservableStore(data || {});
        }
    }

    /** Get all link items as an array */
    async getAll(): Promise<LinkItem[]> {
        await this.load();
        return Object.values(this.store!.getState());
    }

    /** Add or update a link item */
    async add(item: LinkItem) {
        await this.load();
        const state = this.store!.getState();
        if (!item.id) {
            item.id = crypto.randomUUID();
        }
        state[item.id] = item;
        this.store!.updateState({ ...state });
        return this.persistToStorage();
    }

    /** Remove a link item by id */
    async remove(id: string) {
        await this.load();
        const state = this.store!.getState();
        if (state[id]) {
            delete state[id];
        }
        this.store!.updateState({ ...state });
        return this.persistToStorage();
    }

    /** Persist store to storage */
    async persistToStorage(): Promise<void> {
        await Storage.setData('shares', this.store!.getState());
    }
}

const share = new Share();

export default share;
