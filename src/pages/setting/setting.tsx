import React, {useState, useEffect} from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { Keyring } from "@/chrome/keyring"
import { SvgIcon } from '@/components/Icon/index'
import { openUrl } from '@/utils/util'
import {useSelector} from "react-redux";
import {RootState} from "@/store";
const Setting = () => {
    const navigate = useNavigate();
    const { preference} = useSelector((state: RootState) => state.preference);
    const [isPopUp, setIsPopUp] = useState(true);
    const lockFn = () => {
        Keyring.lock()
        navigate('/unlock', { replace: true });
    }

    useEffect(() => {
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
                <div className="otth-icon">
                    <div className="otth-icon-box">
                         {/*<SvgIcon className="cursor-pointer" size={20} iconName="IconDiscord" />*/}
                         <SvgIcon className="cursor-pointer" size={20} iconName="IconWeb" onClick={() => openUrl('https://kasperia-doc.github.io/index.html')} />
                        <SvgIcon className="cursor-pointer" onClick={() => openUrl('https://x.com/KasperiaWallet')}
                                 size={20} iconName="IconTwitter"/>
                         <SvgIcon className="cursor-pointer" size={20} iconName="IconGithub" onClick={() => openUrl('https://github.com/jeanku/kasperia-extension')} />
                    </div>
                    <p>version 1.10.48</p>
                </div>
            </div>
            <Footer></Footer>
        </article>
    )
}
export default Setting