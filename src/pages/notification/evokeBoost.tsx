import { Outlet } from "react-router-dom";
import React, { useEffect } from "react"
import { Kiwi, Wallet, Wasm, initialize } from '@kasplex/kiwi-web'
import { Network } from '@/model/account'
import { Preference } from '@/chrome/preference';
import MessageProvider from '@/components/NoticeBar/NoticeBar'

const EvokeBoost = () => {
    useEffect(() => {
        const initRpc = async () => {
            try {
                await initialize("./kaspa_bg.wasm");
                let network: Network = await Preference.getNetwork()
                Kiwi.setNetwork(network.networkId)
                // dispatchRpcConnect(network)
            } catch (error) {
                console.error('Error initializing Kiwi:', error);
            }
        }
        initRpc()
    }, []);

    return (
        <MessageProvider><Outlet /></MessageProvider>
    )
}
export { EvokeBoost }