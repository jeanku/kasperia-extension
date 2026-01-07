import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';
import BroadcastChannelMessage from '@/content-script/message/boardcastMessage';
import KasperiaIcon from '@/assets/images/icon128.png'
import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import {NetworkType} from "@/utils/wallet/consensus";
import { $, domReadyCall } from './utils';


const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'Kasperia';

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

interface RequestArguments {
  method: string;
  params?: any;
}


const _kasperiaPrividerPrivate: {
  _selectedAddress: string | null;
  _network: string | null;
  _isConnected: boolean;
  _initialized: boolean;
  _isUnlocked: boolean;

  _state: StateProvider;

  _pushEventHandlers: PushEventHandlers | null;
  _requestPromise: ReadyPromise;
  _bcm: BroadcastChannelMessage;
} = {
  _selectedAddress: null,
  _network: null,
  _isConnected: false,
  _initialized: false,
  _isUnlocked: false,

  _state: {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false
  },

  _pushEventHandlers: null,
  _requestPromise: new ReadyPromise(0),
  _bcm: new BroadcastChannelMessage(channelName)
};

let cache_origin = '';

export class KasperiaProvider extends EventEmitter {
  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    _kasperiaPrividerPrivate._pushEventHandlers = new PushEventHandlers(this, _kasperiaPrividerPrivate);
  }

  tryDetectTab = async () => {
    const origin = window.top?.location.origin;
    if (origin && cache_origin !== origin) {
      cache_origin = origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name = document.title || ($('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;
      _kasperiaPrividerPrivate._bcm.request({
        method: 'tabCheckin',
        params: { icon, name, origin }
      });
    }
  };

  initialize = async () => {
    document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);
    _kasperiaPrividerPrivate._bcm.connect().on('message', this._handleBackgroundMessage);
  };

  /**
   * Sending a message to the extension to receive will keep the service worker alive.
   */
  private keepAlive = () => {
    this._request({
      method: 'keepAlive',
      params: {}
    }).then((v) => {
      setTimeout(() => {
        this.keepAlive();
      }, 1000);
    });
  };

    private _requestPromiseCheckVisibility = () => {
        if (document.visibilityState === 'visible') {
            _kasperiaPrividerPrivate._requestPromise.check(1);
        } else {
            _kasperiaPrividerPrivate._requestPromise.uncheck(1);
        }
    };

    private _handleBackgroundMessage = ({ event, data }: {event: string, data: any}) => {
        this.emit(event, data);
    };

    _request = async (data: any) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return _kasperiaPrividerPrivate._requestPromise.call(() => {
      console.log('[request]', JSON.stringify(data, null, 2));
      return _kasperiaPrividerPrivate._bcm
        .request(data)
        .then((res: any) => {
          return res;
        })
        .catch((err: any) => {
            let resp = err.message.toString().split("::")
            if (resp.length <= 1) {
                throw serializeError(err)
            }
            throw { code: Number(resp[0]), message: resp[1] }
        });
    });
  };

    getScriptBuilder = async () => {
        return
    };

    getNetwork = async () => {
        return this._request({
            method: 'getNetwork'
        });
    };

    switchNetwork = async (networkType: NetworkType) => {
        if (networkType !== NetworkType.Mainnet && networkType !== NetworkType.Testnet) {
            throw Error("networkId invalid, networkId must be mainnet or testnet");
        }
        return this._request({
            method: 'switchNetwork',
            params: {
                networkType
            }
        });
    };

    requestAccounts = async () => {
        return this._request({
            method: 'requestAccounts'
        });
    };

    getAccounts = async () => {
        return this._request({
            method: 'getAccounts'
        });
    };

    getPublicKey = async () => {
        return this._request({
            method: 'getPublicKey'
        });
    };

    getBalance = async () => {
        return this._request({
            method: 'getBalance'
        });
    };

    sendKaspa = async (toAddress: string, amount: string, options: any) => {
        if (toAddress == undefined || toAddress.trim()  == '') {
            throw Error("toAddress must be a valid kaspa address")
        }
        const num = Number(amount);
        if (amount == undefined || !( Number.isInteger(num) && num > 0)) {
            throw Error("amount invalid")
        }
        return this._request({
            method: 'sendKaspa',
            params: {
                toAddress,
                amount,
                options
            }
        });
    };

    disconnect = async (origin: string) => {
        return this._request({
            method: 'disconnect',
            params: {
                origin,
            }
        });
    };

    getVersion = async () => {
        return "1.10.52";
    };

  async request({ method, params }: RequestArguments): Promise<any> {
    console.log("【injected call:】method: is calling ....", method, JSON.stringify(params))
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
      case 'eth_chainId':
      case 'net_version':
      case 'personal_sign':
      case 'eth_getBalance':
      case 'eth_estimateGas':
      case 'eth_blockNumber':
      case 'eth_getBlockByNumber':
      case 'eth_sendTransaction':
      case 'eth_getTransactionReceipt':
      case 'eth_getTransactionByHash':
      case 'eth_getCode':
      case 'eth_call':
      case 'wallet_watchAsset':
      case 'wallet_requestPermissions':
      case 'wallet_getPermissions':
      case 'wallet_revokePermissions':
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain': {
        return this._request({ method, params });
      }
      default:
        throw serializeError(ethErrors.rpc.methodNotFound({
          message: `${method} is not supported`
        }))
    }
  }
}

declare global {
    interface Window {
        kasperia?: KasperiaProvider;
        ethereum?: KasperiaProvider;
    }
}

function extensionIdToUUID(extensionId: string) {
    return [
        extensionId.slice(0, 8),
        extensionId.slice(8, 12),
        extensionId.slice(12, 16),
        extensionId.slice(16, 20),
        extensionId.slice(20, 32),
    ].join("-");
}

const handler: ProxyHandler<KasperiaProvider> = {
    get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') return (value as Function).bind(target);
        return value;
    },
    set() { return false; },              // 禁止写入
    deleteProperty() { return false; },   // 禁止删除
    defineProperty() { return false; },   // 禁止 defineProperty
    ownKeys(target) { return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, prop) {
        const desc = Reflect.getOwnPropertyDescriptor(target, prop);
        if (!desc) return undefined;
        return { ...desc, configurable: false };
    }
};

const existing = window.kasperia as KasperiaProvider | undefined;
const baseProvider: KasperiaProvider = existing ?? new KasperiaProvider();
(baseProvider as any).isKasperia = true;
(baseProvider as any).isMetamask = true;
const proxied = new Proxy(baseProvider, handler);

const kasperiaProviderInfo = {
    uuid: extensionIdToUUID("ffalcabgggegkejjlknofllbaledgcob"),
    name: 'Kasperia Wallet',
    icon: KasperiaIcon,
    rdns: 'io.kasperia.wallet',
};

function safeDefineGlobal(name: string, value: any, enumerable = true) {
    try {
        Object.defineProperty(window, name, {
            value,
            writable: false,
            configurable: true,
            enumerable,
        });
        return true;
    } catch (e) {
        try {
            (window as any)[name] = value;
            return true;
        } catch (err) {
            return false;
        }
    }
}

function enhancedAnnounceProvider() {
    window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
            detail: Object.freeze({
                info: Object.freeze({...kasperiaProviderInfo}),
                provider: proxied,
            }),
        })
    );
}


if (!existing) {
    safeDefineGlobal('kasperia', proxied, true);
    enhancedAnnounceProvider();
    window.addEventListener('eip6963:requestProvider', enhancedAnnounceProvider);

    const currentEth = (window as any).ethereum;
    if (!currentEth) {
        safeDefineGlobal('ethereum', proxied, true);
    } else if (currentEth === window.kasperia) {
        safeDefineGlobal('ethereum', proxied, true);
    }

    const payload = { injectedAt: Date.now(), reused: false };
    try {
        window.dispatchEvent(new CustomEvent('kasperia#initialized', { detail: payload }));
        window.dispatchEvent(new Event('ethereum#initialized'));
    } catch {
        window.dispatchEvent(new Event('kasperia#initialized'));
        window.dispatchEvent(new Event('ethereum#initialized'));
    }
} else {
    try {
        window.dispatchEvent(
            new CustomEvent('kasperia#initialized', { detail: { injectedAt: Date.now(), reused: true } })
        );
    } catch {
        window.dispatchEvent(new Event('kasperia#initialized'));
    }
}