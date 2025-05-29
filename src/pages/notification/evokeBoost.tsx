import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react"
import { Kiwi, Wallet, Wasm, initialize } from '@kasplex/kiwi-web'
import { Network } from '@/model/account'
import { Preference } from '@/chrome/preference';
import MessageProvider from '@/components/NoticeBar/NoticeBar'
import { SpinLoading } from 'antd-mobile'

const EvokeBoost = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initRpc = async () => {
            try {
                await initialize("./kaspa_bg.wasm");
                console.log("123123123")
                let network: Network = await Preference.getNetwork()
                Kiwi.setNetwork(network.networkId)
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing Kiwi:', error);
            }
        }
        initRpc()
    }, []);

    if (!isInitialized) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <SpinLoading color='primary' />
                <div>Initializing...</div>
            </div>
        );
    }

    return (
        <MessageProvider><Outlet /></MessageProvider>
    )
}
export { EvokeBoost }