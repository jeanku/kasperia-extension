import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { Radio } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { setRpcClient } from "@/store/rpcSlice";

import { dispatchRefreshNetwork } from '@/dispatch/preference'
import { dispatchRpcConnect } from '@/dispatch/rpcclient'
import { Preference } from '@/chrome/preference'
import { Network } from '@/model/account';
import { Kiwi } from "@kasplex/kiwi-web";
import store from '@/store';
import { Dispatch } from 'redux';

const NetworkIndex: React.FC = () => {
    const navigate = useNavigate()
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const { preference} = useSelector((state: RootState) => state.preference);
    const currentNetworkId = Kiwi.network

    useEffect(() => {
        console.log("NetworkIndex preference1", preference.networkConfig)
        console.log("NetworkIndex preference2", preference.network)
        if (preference?.networkConfig) {
            setNetworkConfig(Object.values(preference?.networkConfig))
        }
    }, [preference.networkConfig]);

    const changeNetwork = async (index: number) => {
        const selectedNetwork = networkConfig[index];
        if (selectedNetwork.networkId === currentNetworkId) return;
        try {
            const dispatch: Dispatch = store.dispatch;
            dispatch(setRpcClient(null));

            await dispatchRefreshNetwork(selectedNetwork, preference?.currentAccount!);
            dispatchRpcConnect(selectedNetwork);
            navigate('/home');
        } catch (error) {
            console.error('Failed to change network:', error);
        }
    };

    return (
        <article className="page-box">
            <HeadNav url="/contact/add" title='Switch Network'></HeadNav>
            <div className="content-main list-box pb50">
                <Radio.Group value={currentNetworkId} >
                    {
                        networkConfig.map((item: Network) => {
                            return (
                                <div className="list-item-box" key={item.name}>
                                    <Radio value={item.networkId} onChange={val => changeNetwork(item.networkId)}>
                                        <div className="list-item-left">
                                            <strong>{item.name}</strong>
                                            <span>{item.url || '-'}</span>
                                        </div>
                                    </Radio>
                                    <div onClick={() => navigate("/network/update", { state: { network: item, isChecked: currentNetworkId === item.networkId } })}>
                                        <SvgIcon iconName="arrowRight" />
                                    </div>
                                </div>
                            )
                        })
                    }
                </Radio.Group>
            </div>
            <Footer></Footer>
        </article>
    )
}
export default NetworkIndex