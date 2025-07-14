import store from '@/store';
import { Dispatch } from 'redux';
import { setRpcClient } from "@/store/rpcSlice";
import { Network } from "@/model/account";

import { Rpc } from '@kasplex/kiwi-web'

let pingInterval: NodeJS.Timeout | null = null;

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