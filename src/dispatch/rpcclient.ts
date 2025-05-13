import store from '@/store';
import { Dispatch } from 'redux';
import { setRpcClient } from "@/store/rpcSlice";
import { Network } from "@/model/account";
import { Keyring } from "@/chrome/keyring";

import { Rpc } from '@kasplex/kiwi-web'

let pingInterval: NodeJS.Timeout | null = null;

async function waitUntil<T>(promise: Promise<T>): Promise<T> {
    const keepAlive = setInterval(() => {
        chrome.runtime.getPlatformInfo(() => {});
    }, 25 * 1000);

    try {
        return await promise;
    } finally {
        clearInterval(keepAlive);
    }
}

export async function dispatchRpcConnect(network: Network) {
    try {
        Rpc.setInstance(network.networkId, network.url).connect().then(_ => {
            const client = Rpc.getInstance().client
            const dispatch: Dispatch = store.dispatch;
            dispatch(setRpcClient(client));

            if (pingInterval) {
                clearInterval(pingInterval);
            }
            pingInterval = setInterval(async () => {
                try {
                    await client.ping();
                } catch (pingError) {
                    console.warn('ping failed:', pingError);
                }
            }, 30000);
        })
    } catch (error) {
        console.error("Error dispatching account:", error);
    }
}