import React, { useMemo } from "react"
import {  TabBar, SafeArea } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";

import IconWallet from '../assets/images/footer-wallet.png'
import IconSearch from '../assets/images/footer-center.png'
import IconSetting from '../assets/images/footer-setting.png'
import IconWalletSel from '../assets/images/footer-wallet-sel.png'
import IconSearchSel from '../assets/images/footer-center-sel.png'
import IconSettingSel from '../assets/images/footer-setting-sel.png'

const Footer: React.FC  = React.memo(() => {
    
    const tabs = useMemo(() => [
        {
            key: '/home',
            title: '首页',
            icon: <img className="footer-nav-bar" src={IconWallet} alt="wallet" />,
            selectedIcon: <img className="footer-nav-bar" src={IconWalletSel} alt="wallet" />,
        },
        {
            key: '/explore',
            title: '搜索',
            icon: <img className="footer-nav-bar" src={IconSearch} alt="explore" />,
            selectedIcon: <img className="footer-nav-bar" src={IconSearchSel} alt="explore" />,
        },
        {
            key: '/setting',
            title: '设置',
            icon: <img className="footer-nav-bar" src={IconSetting} alt="setting" />,
            selectedIcon: <img className="footer-nav-bar" src={IconSettingSel} alt="setting" />,
        }
    ], [])
    const settingUrl = ['/network/index', '/network/update', '/contact/add']
    const navigate = useNavigate();
    const { pathname } = useLocation()
    const setRouteActive = (value: string) => {
        navigate(value)
    }
    return (
        <>
            <div className='page-tab-bar'>
                <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
                    {tabs.map(item => (
                        <TabBar.Item key={item.key} icon={item.key === pathname || (item.key === '/setting' && settingUrl.includes(pathname)) ? item.selectedIcon : item.icon} />
                    ))}
                </TabBar>
            </div>
            <SafeArea position='bottom' />
        </>
    )
})

export default Footer