import { max } from 'lodash';
// @ts-ignore
import LRU from 'lru-cache';

import {Storage} from '@/utils/storage';

export enum CHAINS_ENUM {
  KAS = 'KAS'
}

export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  chain: CHAINS_ENUM;
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  order?: number;
  isConnected: boolean;
}

export type PermissionStore = {
  dumpCache: ReadonlyArray<LRU.Entry<string, ConnectedSite>>;
}

class PermissionService {
  store?: PermissionStore;

  lruCache: LRU<string, ConnectedSite> = new LRU();

  async load() {
    if (!this.store) {
      let state = await Storage.getData<PermissionStore>('permission')
      if (!state) {
        this.store = {
          dumpCache: []
        }
      } else {
        this.store = state
        const cache: ReadonlyArray<LRU.Entry<string, ConnectedSite>> = (this.store!.dumpCache || []).map((item) => ({
          k: item.k,
          v: item.v,
          e: 0
        }));
        await this.lruCache.load(cache);
      }
    }
  }

  async sync() {
    if (!this.lruCache || !this.store) return;
    this.store!.dumpCache = this.lruCache.dump();
    Storage.setData<PermissionStore>('permission',this.store!)
  }

  async getWithoutUpdate(key: string) {
    this.load()
    if (!this.lruCache) return;
    return this.lruCache.peek(key);
  }

  async getSite(origin: string) {
    this.load()
    return this.lruCache?.get(origin);
  }

  async setSite(site: ConnectedSite) {
    this.load()
    if (!this.lruCache) return;
    this.lruCache.set(site.origin, site);
    this.sync();
  }

  async addConnectedSite(origin: string, name: string, icon: string, defaultChain: CHAINS_ENUM = CHAINS_ENUM.KAS, isSigned = false) {
    await this.load()
    if (!this.lruCache) return;
    this.lruCache.set(origin, {
      origin,
      name,
      icon,
      chain: defaultChain,
      isSigned,
      isTop: false,
      isConnected: true
    });
    this.sync();
  }

  async touchConnectedSite(origin: string) {
    this.load()
    if (!this.lruCache) return;
    this.lruCache.get(origin);
    this.sync();
  }

  async updateConnectSite (origin: string, value: Partial<ConnectedSite>, partialUpdate?: boolean) {
    this.load()
    if (!this.lruCache || !this.lruCache.has(origin)) return;
    if (partialUpdate) {
      const _value = this.lruCache.get(origin);
      this.lruCache.set(origin, { ..._value, ...value } as ConnectedSite);
    } else {
      this.lruCache.set(origin, value as ConnectedSite);
    }
    this.sync();
  }

  async hasPermission(origin: string) {
    await this.load()
    if (!this.lruCache) return;
    const site = this.lruCache.get(origin);

    return site && site.isConnected;
  }

  async setRecentConnectedSites (sites: ConnectedSite[]) {
    await this.load()
    this.lruCache.load(
      sites
        .map((item) => ({
          e: 0,
          k: item.origin,
          v: item
        }))
        .concat(
          (this.lruCache.values() || [])
            .filter((item: ConnectedSite) => !item.isConnected)
            .map((item: ConnectedSite) => ({
              e: 0,
              k: item.origin,
              v: item
            }))
        )
    );
    this.sync();
  }

  async getRecentConnectedSites () {
    await this.load()
    const sites = (this.lruCache?.values() || []).filter((item: ConnectedSite) => item.isConnected);
    const pinnedSites = sites.filter((item: ConnectedSite) => item?.isTop).sort((a: ConnectedSite, b:ConnectedSite) => (a.order || 0) - (b.order || 0));
    const recentSites = sites.filter((item: ConnectedSite) => !item.isTop);
    return [...pinnedSites, ...recentSites];
  }

  async getConnectedSites() {
    await this.load()
    return (this.lruCache?.values() || []).filter((item: ConnectedSite) => item.isConnected);
  }

  async getConnectedSite(key: string) {
    await this.load()
    const site = this.lruCache?.get(key);
    if (site && site.isConnected) {
      return site;
    }
  }

  async topConnectedSite(origin: string, order?: number) {
    await this.load()
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    order = order ?? (max((await this.getRecentConnectedSites()).map((item: ConnectedSite) => item.order)) || 0) + 1;
    this.updateConnectSite(origin, {
      ...site,
      order,
      isTop: true
    });
  }

  async unpinConnectedSite(origin: string) {
    await this.load()
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    this.updateConnectSite(origin, {
      ...site,
      isTop: false
    });
  }

  async removeConnectedSite(origin: string) {
    await this.load()
    if (!this.lruCache) return;
    const site = await this.getConnectedSite(origin);
    if (!site) {
      return;
    }
    await this.setSite({
      ...site!,
      isConnected: false
    })
    this.sync();
  }

  async getSitesByDefaultChain(chain: CHAINS_ENUM) {
    if (!this.lruCache) return [];
    return this.lruCache.values().filter((item: ConnectedSite) => item.chain === chain);
  }
}

export default new PermissionService();
