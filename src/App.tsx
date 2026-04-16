import React from "react"
import AppRouter from "./router/index";
import { ConfigProvider } from "antd-mobile";
import MessageProvider from '@/components/NoticeBar/NoticeBar'
import { SidePanelBootDelayGate } from '@/components/BootDelayGate';
import enUS from 'antd-mobile/es/locales/en-US'

const App: React.FC = () => {
    return (
        <ConfigProvider locale={enUS}>
            <MessageProvider>
                <SidePanelBootDelayGate>
                    <AppRouter />
                </SidePanelBootDelayGate>
            </MessageProvider>
        </ConfigProvider>
    )
};

export default App;
