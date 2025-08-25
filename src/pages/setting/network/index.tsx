import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { Radio } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { Preference } from '@/chrome/preference';
import { setPreference } from "@/store/preferenceSlice";

import { Network } from '@/model/account';
import store from '@/store';
import { Dispatch } from 'redux';

const NetworkIndex: React.FC = () => {
    const navigate = useNavigate()
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const { preference} = useSelector((state: RootState) => state.preference);

    useEffect(() => {
        if (preference?.networkConfig) {
            setNetworkConfig(Object.values(preference?.networkConfig))
        }
    }, [preference.networkConfig]);

    const changeNetwork = async (index: number) => {
        const selectedNetwork = networkConfig[index];
        if (selectedNetwork.networkId === preference.network.networkId) return;
        try {
            let prefrence = await Preference.setNetwork(selectedNetwork)
            const dispatch: Dispatch = store.dispatch;
            dispatch(setPreference(prefrence))
            navigate('/home');
        } catch (error) {
            console.error('Failed to change network:', error);
        }
    };

    return (
        <article className="page-box">
            <HeadNav url="/contact/add" title='Switch Network'></HeadNav>
            <div className="content-main list-box pb50">
                <Radio.Group value={preference.network.networkId} >
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
                                    <div onClick={() => navigate("/network/update", { state: { network: item, isChecked: preference.network.networkId === item.networkId } })}>
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