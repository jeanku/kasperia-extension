import { EventEmitter } from 'events';
import BroadcastChannelMessage from './message/boardcastMessage';
import ReadyPromise from './provider/readyPromise';

interface StateProvider {
    accounts: string[] | null;
    isConnected: boolean;
    isUnlocked: boolean;
    initialized: boolean;
    isPermanentlyDisconnected: boolean;
}

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'kasperiaChannel';

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

    // private _pushEventHandlers: PushEventHandlers;
    private _requestPromise = new ReadyPromise(0);

    private _bcm = new BroadcastChannelMessage(channelName);

    constructor({ maxListeners = 100 } = {}) {
        super();
        this.setMaxListeners(maxListeners);
        this.initialize();
        // this._pushEventHandlers = new PushEventHandlers(this);
    }

    initialize = async () => {
        document.addEventListener('visibilitychange', this._requestPromiseCheckVisibility);

        console.log("bcm connect to content script ...")
        this._bcm.connect()
            // .on('message', this._handleBackgroundMessage);
        // domReadyCall(() => {
        //     const origin = window.top?.location.origin;
        //     const icon =
        //         ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        //         ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;
        //
        //     const name = document.title || ($('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;
        //
        //     this._bcm.request({
        //         method: 'tabCheckin',
        //         params: { icon, name, origin }
        //     });
        //
        //     // Do not force to tabCheckin
        //     // this._requestPromise.check(2);
        // });

        try {
            // const { network, accounts, isUnlocked }: any = await this._request({
            //     method: 'getProviderState'
            // });
            // if (isUnlocked) {
            //     this._isUnlocked = true;
            //     this._state.isUnlocked = true;
            // }
            // this.emit('connect', {});
            // this._pushEventHandlers.networkChanged({
            //     network
            // });

            // this._pushEventHandlers.accountsChanged(accounts);
        } catch {
            //
        } finally {
            this._initialized = true;
            this._state.initialized = true;
            this.emit('_initialized');
        }

        // this.keepAlive();
    };

    // /**
    //  * Sending a message to the extension to receive will keep the service worker alive.
    //  */
    // private keepAlive = () => {
    //     this._request({
    //         method: 'keepAlive',
    //         params: {}
    //     }).then((v) => {
    //         setTimeout(() => {
    //             this.keepAlive();
    //         }, 15000);
    //     });
    // };


    private _requestPromiseCheckVisibility = () => {
        if (document.visibilityState === 'visible') {
            this._requestPromise.check(1);
        } else {
            this._requestPromise.uncheck(1);
        }
    };

    private _handleBackgroundMessage = (data: any) => {
        console.log('[push event]', data);
        // if (this._pushEventHandlers[event]) {
        //     return this._pushEventHandlers[event](data);
        // }

        // this.emit(event, data);
    };

    _request = async (data: any) => {
        if (!data) {
            throw Error("data not find");
        }
        this._requestPromiseCheckVisibility();
        return this._requestPromise.call(() => {
            return this._bcm.request(data).then((res) => res).catch((err) => {
                throw err;
            });
        });
    };

    getNetwork = async () => {
        return this._request({
            method: 'getNetwork'
        });
    };

    switchNetwork = async (networkId: number) => {
        console.log("networkId", networkId !== 0 && networkId !== 1)
        if (networkId !== 0 && networkId !== 1) {
            throw Error("networkId invalid, networkId must be 0 or 1");
        }
        return this._request({
            method: 'switchNetwork',
            params: {
                networkId
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

    sendKaspa = async (toAddress: string, amount: string, options: any) => {
        if (toAddress == undefined || toAddress.trim()  == '') {
            throw Error("toAddress must be a valid kaspa address")
        }
        const num = Number(amount);
        if (amount == undefined || !( Number.isInteger(num) && num > 0)) {
            throw Error("amount must be a valid kaspa address")
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
        return this._request({
            method: 'getVersion',
            params: {}
        });
    };
}



// 实例化
const kasperia = new KasperiaProvider();

declare global {
    interface Window {
        kasperia?: KasperiaProvider;
        mywallet?: any;
    }
}

// 防止被覆盖
if (!window.mywallet) {
    Object.defineProperty(window, 'kasperia', {
        value: new Proxy(kasperia, {
            deleteProperty: () => true,
        }),
        writable: false,
    });
}

// 通知外部页面插件已注入
window.dispatchEvent(new Event('kasperia#initialized'));

export { kasperia };
