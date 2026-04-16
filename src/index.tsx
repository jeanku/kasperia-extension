import { createRoot } from 'react-dom/client'
import App from './App'
import { useEffect } from 'react';
import 'antd-mobile/es/global'
import 'lib-flexible'
import './styles/main.scss'
import { Provider } from "react-redux";
import { store } from "./store";
import { isExtensionPopup } from './utils/util'

const rootElement = document.getElementById('root')!;
const RootComponent = () => {
    const isExtension = isExtensionPopup();
    if (!isExtension) {
        rootElement.classList.remove('extension-container');
    }
    useEffect(() => {
    }, []);

    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};
createRoot(rootElement).render(<RootComponent />);