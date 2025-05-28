import { createRoot } from 'react-dom/client'
import App from './App'
import { useEffect } from 'react';
import 'antd-mobile/es/global'
import 'lib-flexible'
import './styles/index.scss'
import { Provider } from "react-redux";
import { store } from "./store";
import { isExtensionPopup } from './utils/util'
import { Network } from './model/account'
import { dispatchRpcConnect } from './dispatch/rpcclient'
import {  Kiwi, initialize } from '@kasplex/kiwi-web'
import { getBrowser } from '@/utils/util'
import { Preference } from '@/chrome/preference'

const RootComponent = () => {
    const rootElement = document.getElementById('root')!;
    const isExtension = isExtensionPopup();
    useEffect(() => {
        const initRpc = async () => {
            try {
                const browser = getBrowser()
                const extensionIsInTab = await browser.tabs.getCurrent()
                if(extensionIsInTab || !isExtension) {
                    rootElement.classList.remove('extension-container');
                }
                await initialize("./kaspa_bg.wasm");
                let network: Network = await Preference.getNetwork()

                Kiwi.setNetwork(network.networkId)
                dispatchRpcConnect(network)
            } catch (error) {
                console.error('Error initializing Kiwi:', error);
            }
        }
        initRpc()
    }, []);

    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

const rootElement = document.getElementById('root')!;
createRoot(rootElement).render(<RootComponent />);