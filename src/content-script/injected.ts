import { EventEmitter } from 'events';
import BroadcastChannelMessage from './message/boardcastMessage';
import { ReadyPromise } from './message/readyPromise';
import {NetworkType} from "@/utils/wallet/consensus";
import {AddEthereumChainParameter} from "@/model/evm";

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

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'kasperiaChannel';


export class KasperiaProvider extends EventEmitter {
    _selectedAddress: string | null = null;
    _network: string | null = null;
    _chainId: string | null = null;
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
    };

    _request = async (data: any) => {
        if (!data) {
            throw Error("data not find");
        }
        // this._requestPromiseCheckVisibility();
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
        return "1.10.32";
    };

    async request({ method, params }: RequestArguments): Promise<any> {
        console.log("【injected call:】method: is calling ....", method, JSON.stringify(params))
        switch (method) {
            case 'eth_requestAccounts':
                return await this._request({ method: 'eth_requestAccounts' });
            case 'eth_accounts':
                return await this._request({ method: 'eth_accounts' });
            case 'eth_chainId': {
                let chainHex = await this._request({ method: 'eth_chainId' });
                return '0x' + Number(chainHex).toString(16)
            }
            case 'net_version': {
                return await this._request({ method: 'eth_chainId' });
            }
            case 'personal_sign': {
                const [message, address] = params || [];
                if (!message) throw new Error('message parameter missing');
                return this._request({
                    method: 'signMessage',
                    params: {
                        message,
                        address
                    }
                });
            }

            case 'eth_getBalance': {
                const [address, tag] = params || [];
                let balance: any = await this._request({
                    method: 'eth_getBalance',
                    params: {
                        address,
                        tag
                    }
                })
                if (balance) {
                    const value = BigInt(balance);
                    return '0x' + value.toString(16);
                }
                return '0x0'
            }
            case 'eth_blockNumber': {
                let block = await this._request({method: 'eth_blockNumber', params: {}})
                return '0x' + Number(block).toString(16)
            }
            case 'eth_getBlockByNumber': {
                const [block_number, flag] = params || [];
                return await this._request({
                    method: 'eth_getBlockByNumber',
                    params: {
                        block_number,
                        flag: flag || false
                    }
                })
            }
            case 'wallet_switchEthereumChain': {
                const chainHex = params?.[0].chainId;
                if (!chainHex) throw new Error('chainId missing');
                const chainId = parseInt(chainHex, 16);
                const result = await this._request({
                    method: 'walletSwitchEthereumChain',
                    params: {
                        chainId: chainId.toString(),
                    },
                })
                this.emit('chainChanged', chainHex);
                return result
            }
            case 'eth_sendTransaction': {
                const tx = params?.[0];
                if (!tx) throw new Error('tx parameter missing');
                let resp = await this._request({
                    method: 'sendTransaction',
                    params: {
                        tx
                    },
                });
                return resp
            }
            case 'eth_getTransactionReceipt': {
                const hash = params?.[0];
                if (!hash) throw new Error('hash missing');
                return await this._request({
                    method: 'eth_getTransactionReceipt',
                    params: {
                        hash
                    },
                });
            }
            case 'eth_call': {
                const tx = params?.[0];
                if (!tx) throw new Error('tx parameter missing');
                return await this._request({
                    method: 'eth_call',
                    params: {
                        tx
                    },
                });
            }
            case 'wallet_watchAsset': {
                if (params.type != "ERC20") throw new Error("invalid ERC20 config")
                let resp = await this._request({
                    method: 'walletWatchAsset',
                    params: {
                        options: params.options
                    },
                });
                return resp
            }

            case 'wallet_addEthereumChain': {
                const chainParams = params?.[0] as AddEthereumChainParameter;
                if (!chainParams) throw new Error('chainParams missing');
                return this._request({
                    method: 'addEthereumChain',
                    params: {
                        chainParams: {
                            chainId: parseInt(chainParams.chainId).toString(),
                            symbol: chainParams.nativeCurrency.symbol,
                            name: chainParams.chainName,
                            rpcUrl: chainParams.rpcUrls,
                            explorer: chainParams.blockExplorerUrls?.[0] || "",
                            decimals: chainParams.nativeCurrency.decimals
                        }
                    },
                });
            }
            case 'wallet_revokePermissions': {
                const eth_accounts = params?.[0];
                return this._request({
                    method: 'wallet_revokePermissions',
                    params: {
                        eth_accounts
                    },
                });
            }
            case "wallet_requestPermissions": {
                await this._request({
                    method: 'walletRequestPermissions',
                    params: {},
                });
                return [{ parentCapability: "eth_accounts" }];
            }
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }
}

declare global {
    interface Window {
        kasperia?: KasperiaProvider;
        ethereum?: KasperiaProvider;
    }
}

const existing = window.kasperia as KasperiaProvider | undefined;
const baseProvider: KasperiaProvider = existing ?? new KasperiaProvider();
(baseProvider as any).isKasperia = true;
const proxied = new Proxy(baseProvider, handler);

const kasperiaProviderInfo = {
    walletId: 'kasperia',
    name: 'Kasperia Wallet',
    icon: 'chrome-extension://ffalcabgggegkejjlknofllbaledgcob/media/icon16.png',
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
