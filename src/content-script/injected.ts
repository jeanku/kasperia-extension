// type SignMessageResponseEvent = MessageEvent<{
//     type: 'KASPERIA_SIGN_MESSAGE_RESP';
//     data: any;
// }>;
//
// // type MessageEvent = MessageEvent<{
// //     type: 'KASPERIA_SIGN_MESSAGE_RESP';
// //     data: any;
// // }>;
//
//
// // 扩展 window 接口，添加自定义字段
//
//
// class Kasperia {
//     private bindEvent: boolean;
//
//     constructor() {
//         this.bindEvent = false;
//     }
//
//     signMessage(data?: any): Promise<any> {
//         return new Promise((resolve) => {
//             const listener = (event: SignMessageResponseEvent) => {
//                 if (event.data.type === 'KASPERIA_SIGN_MESSAGE_RESP') {
//                     window.removeEventListener('message', listener);
//                     this.bindEvent = false;
//                     resolve(event.data.data);
//                 }
//             };
//
//             if (!this.bindEvent) {
//                 window.addEventListener('message', listener);
//                 this.bindEvent = true;
//             }
//
//             window.postMessage({ type: 'KASPERIA_SIGN_MESSAGE', data }, '*');
//         });
//     }
//
//     getAccounts(): Promise<{ address: string }> {
//         return Promise.resolve({
//             address: 'kaspa:qrk9decfnl4rayeegp6gd3tc6605zavclkpud5jp78axat5namppwt050d57j',
//         });
//     }
//
//     getBalance(): Promise<{ balance: string }> {
//         return Promise.resolve({
//             balance: '12600000000000',
//         });
//     }
//
//     send(data?: any): Promise<any> {
//         return new Promise((resolve) => {
//             const listener = (event: SignMessageResponseEvent) => {
//                 if (event.data.type === 'KASPERIA_SIGN_MESSAGE_RESP') {
//                     window.removeEventListener('message', listener);
//                     this.bindEvent = false;
//                     resolve(event.data.data);
//                 }
//             };
//
//             if (!this.bindEvent) {
//                 window.addEventListener('message', listener);
//                 this.bindEvent = true;
//             }
//
//             console.log("send", data)
//             window.postMessage({ type: 'KASPERIA_SEND_KAS', data }, '*');
//         });
//     }
// }

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

        this._bcm.connect().on('message', this._handleBackgroundMessage);
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
            }, 15000);
        });
    };

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

    // TODO: support multi request!
    // request = async (data) => {
    //   return this._request(data);
    // };

    _request = async (data: any) => {
        if (!data) {
            throw Error("data not find");
        }
        this._requestPromiseCheckVisibility();

        return this._requestPromise.call(() => {
            console.log('[request]', JSON.stringify(data, null, 2));
            return this._bcm
                .request(data)
                .then((res) => {
                    console.log('[request: success]', data, res);
                    return res;
                })
                .catch((err) => {
                    console.log('[request: error]', data.method, err);
                    throw err;
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

    sendKaspa = async (toAddress: string, amount: string, payload: string) => {
        return this._request({
            method: 'sendKaspa',
            params: {
                toAddress,
                amount,
                payload
            }
        });
    };

    // signTx = async (rawtx: string) => {
    //   return this._request({
    //     method: 'signTx',
    //     params: {
    //       rawtx
    //     }
    //   });
    // };

    /**
     * push transaction
     */
    pushTx = async (rawtx: string) => {
        return this._request({
            method: 'pushTx',
            params: {
                rawtx
            }
        });
    };

    signPsbt = async (psbtHex: string, options?: any) => {
        return this._request({
            method: 'signPsbt',
            params: {
                psbtHex,
                options
            }
        });
    };

    signPsbts = async (psbtHexs: string[], options?: any[]) => {
        return this._request({
            method: 'multiSignPsbt',
            params: {
                psbtHexs,
                options
            }
        });
    };

    pushPsbt = async (psbtHex: string) => {
        return this._request({
            method: 'pushPsbt',
            params: {
                psbtHex
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

export {};
