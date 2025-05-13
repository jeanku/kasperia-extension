import React from "react"
import AppRouter from "./router/index";
import { ConfigProvider } from "antd-mobile";
import enUS from 'antd-mobile/es/locales/en-US'

const App: React.FC = () => {
    return (
        <ConfigProvider locale={enUS}>
            <AppRouter />
        </ConfigProvider>
    )
};

export default App;
