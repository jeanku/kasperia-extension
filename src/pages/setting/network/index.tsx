import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import Footer from '@/components/Footer'
import { useNavigate } from "react-router-dom";
import { Radio } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useSelector } from "react-redux";
import { RootState } from '@/store';

import { dispatchRefreshNetwork } from '@/dispatch/preference'
import { Network } from '@/model/account';

const NetworkIndex: React.FC = () => {
    const navigate = useNavigate()
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const { preference} = useSelector((state: RootState) => state.preference);
    const currentNetworkType = preference.network.networkType

    useEffect(() => {
        if (preference?.networkConfig) {
            setNetworkConfig(Object.values(preference?.networkConfig))
        }
    }, [preference.networkConfig]);

    const changeNetwork = async (index: number) => {
        const selectedNetwork = networkConfig[index];
        if (selectedNetwork.networkType === currentNetworkType) return;
        try {
            await dispatchRefreshNetwork(selectedNetwork);
            navigate('/home');
        } catch (error) {
            console.error('Failed to change network:', error);
        }
    };

    return (
        <article className="page-box">
            <HeadNav url="/contact/add" title='Switch Network'></HeadNav>
            <div className="content-main list-box pb50">
                <Radio.Group value={currentNetworkType} >
                    {
                        networkConfig.map((item: Network, index) => {
                            return (
                                <div className="list-item-box" key={item.networkType}>
                                    <Radio value={item.networkType} onChange={val => changeNetwork(index)}>
                                        <div className="list-item-left">
                                            <strong>{item.networkType}</strong>
                                            <span>{item.url || '-'}</span>
                                        </div>
                                    </Radio>
                                    <div onClick={() => navigate("/network/update", { state: { network: item, isChecked: currentNetworkType === item.networkType } })}>
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