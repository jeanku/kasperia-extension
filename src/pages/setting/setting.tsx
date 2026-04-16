import React, {useState, useEffect, useCallback} from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { Keyring } from "@/chrome/keyring"
import { SvgIcon } from '@/components/Icon/index'
import { Preference } from '@/chrome/preference'
import { openUrl } from '@/utils/util'
import {useSelector} from "react-redux";
import {RootState} from "@/store";
const Setting = () => {
    const navigate = useNavigate();
    const { preference} = useSelector((state: RootState) => state.preference);
    const [isPopUp, setIsPopUp] = useState(true);
    const [mode, setMode] = useState('main');
    const lockFn = () => {
        Keyring.lock()
        navigate('/unlock', { replace: true });
    }

    const switchWindow = async () => {
        const nextMode = mode === 'main' ? 'sidepanel' : 'main';
        const current = await chrome.windows.getCurrent();
        await Preference.setUiModel(nextMode);
        setMode(nextMode);
        if (nextMode === 'sidepanel') {
            await chrome.sidePanel.open({ windowId: current.id! });
            window.close();
            return;
        }
        const sidePanelApi = chrome.sidePanel as typeof chrome.sidePanel & {
            close?: (options: { windowId?: number; tabId?: number }) => Promise<void>;
        };
        if (sidePanelApi.close) {
            await sidePanelApi.close({ windowId: current.id! });
        } else {
            await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
            await chrome.action.setPopup({ popup: 'index.html' });
        }
    };

    useEffect(() => {
        const init = async () => {
            const res = await Preference.getUiModel();
            setMode(res);
        };
        init();
        setIsPopUp(window.innerWidth <= 400)
    }, []);
    
    return(
        <article className="page-box">
            <HeadNav title='Settings'></HeadNav>
            <div className="page-setting list-box pb50">
                {
                    isPopUp ? (
                        <div className="list-item-box" onClick={() => {
                            chrome.tabs.create({
                                url: chrome.runtime.getURL("/index.html#/home")
                            });
                        }}>
                            <div className="list-item-left">
                                <strong>Expand view</strong>
                            </div>
                            <SvgIcon iconName="IconExpand"/>
                        </div>
                    ) : null
                }
                <div className="list-item-box" onClick={() => switchWindow()} >
                    <div className="list-item-left">
                        <strong>Switch To {mode === 'main' ? 'side panel' : 'popup' }</strong>
                    </div>
                    <SvgIcon iconName="IconConvert"/>
                </div>
                <div className="list-item-box" onClick={() => navigate('/contact/index')}>
                    <div className="list-item-left">
                        <strong>Address Book</strong>
                        <span>Add frequently used addresses</span>
                    </div>
                    <SvgIcon iconName="arrowRight"/>
                </div>

                <div className="list-item-box" onClick={() => navigate('/setting/connectSite')}>
                    <div className="list-item-left">
                        <strong>Connected Site</strong>
                    </div>
                    <SvgIcon iconName="arrowRight"/>
                </div>

                <div className="list-item-box" onClick={() => navigate('/network/index')}>
                    <div className="list-item-left">
                        <strong>Kaspa Network</strong>
                        <span>{preference.network.networkType}</span>
                    </div>
                    <SvgIcon iconName="arrowRight"/>
                </div>

                <div className="list-item-box" onClick={() => navigate('/evm/list')}>
                    <div className="list-item-left">
                        <strong>EVM Network</strong>
                    </div>
                    <SvgIcon iconName="arrowRight"/>
                </div>

                <div className="list-item-box" onClick={() => navigate('/setting/more')}>
                    <div className="list-item-left">
                        <strong>More options</strong>
                    </div>
                    <SvgIcon iconName="arrowRight"/>
                </div>

                <div className="list-item-box">
                    <p className="list-box-btn" onClick={() => lockFn()}>Lock now</p>
                </div>
                <div className="otth-icon mt5vh">
                    <div className="otth-icon-box">
                         {/*<SvgIcon className="cursor-pointer" size={20} iconName="IconDiscord" />*/}
                         <SvgIcon className="cursor-pointer" size={20} iconName="IconWeb" onClick={() => openUrl('https://kasperia-doc.github.io/index.html')} />
                        <SvgIcon className="cursor-pointer" onClick={() => openUrl('https://x.com/KasperiaWallet')}
                                 size={20} iconName="IconTwitter"/>
                         <SvgIcon className="cursor-pointer" size={20} iconName="IconGithub" onClick={() => openUrl('https://github.com/jeanku/kasperia-extension')} />
                    </div>
                    <p>version 1.10.80</p>
                </div>
            </div>
            <Footer></Footer>
        </article>
    )
}
export default Setting