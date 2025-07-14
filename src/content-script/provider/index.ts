/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// this script is injected into webpage's context
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { EventEmitter } from 'events';

import BroadcastChannelMessage from '../message/boardcastMessage';

import PushEventHandlers from './pushEventHandlers';
import ReadyPromise from './readyPromise';
import { $, domReadyCall } from './utils';

const log = (event: string, ...args: any[]) => {
  console.log(
    `%c [kasperia] (${new Date().toTimeString().slice(0, 8)}) ${event}`,
    'font-weight: 600; background-color: #7d6ef9; color: white;',
    ...args
  );
};
const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'KASPERIA';

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

export enum TxType {
  SIGN_TX,
  SEND_KASPA,
}

const EXTENSION_CONTEXT_INVALIDATED_CHROMIUM_ERROR = 'Extension context invalidated.';
export class KasperiaProvider extends EventEmitter {
  _selectedAddress: string | null = null;
  _network: string | null = null;
  _isConnected = false;
  _initialized = false;
  _isUnlocked = false;

  _state: StateProvider = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false
  };

  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(0);

  private _bcm = new BroadcastChannelMessage(channelName);

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async () => {
    document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);

    this._bcm.connect().on('message', this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = window.top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name = document.title || ($('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;

      this._bcm.request({
        method: 'tabCheckin',
        params: { icon, name, origin }
      });

      // Do not force to tabCheckin
      // this._requestPromise.check(2);
    });

    try {
      const { network, accounts, isUnlocked }: any = await this._request({
        method: 'getProviderState'
      });
      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.emit('connect', {});
      this._pushEventHandlers.networkChanged({
        network
      });

      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit('_initialized');
    }

    this.keepAlive();
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
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data } : {
    event: string;
    data: unknown;
  }) => {
    // if (this._pushEventHandlers.) {
    //   return this._pushEventHandlers[event](data);
    // }

    this.emit(event, data);
  };

  _request = async (data: any) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      return this._bcm
        .request(data)
        .then((res) => {
          log('[request: success]', data.method, res);
          return res;
        })
        .catch((err) => {
          log('[request: error]', data.method, serializeError(err));
          throw serializeError(err);
        });
    });
  };

  // public methods
  requestAccounts = async () => {
    return this._request({
      method: 'requestAccounts'
    });
  };

  getNetwork = async () => {
    return this._request({
      method: 'getNetwork'
    });
  };

  switchNetwork = async (network: string) => {
    return this._request({
      method: 'switchNetwork',
      params: {
        network
      }
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

  signMessage = async (text: string, type: string) => {
    return this._request({
      method: 'signMessage',
      params: {
        text,
        type
      }
    });
  };

  sendKaspa = async (toAddress: string, sompi: number, options?: { feeRate: number }) => {
    return this._request({
      method: 'sendKaspa',
      params: {
        toAddress,
        sompi,
        feeRate: options?.feeRate,
        type: TxType.SEND_KASPA
      }
    });
  };

  getVersion = async () => {
    return this._request({
      method: 'getVersion'
    });
  };
}

const provider = new KasperiaProvider();

if (!window.mywallet) {
  Object.defineProperty(window, 'kasperia', {
    value: new Proxy(provider, {
      deleteProperty: () => true,
    }),
    writable: false,
  });
}

window.dispatchEvent(new Event('kasperia#initialized'));

export {};
