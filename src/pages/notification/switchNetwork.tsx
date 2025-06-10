import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Radio } from 'antd-mobile'
import { Network } from '@/model/account';

const SwitchNetwork: React.FC = () => {
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const [currentNetworkId, setCurrentNetworkId] = useState<number>(1)
    const networkList: Network[] = [
        {
            name: 'Mainnet',
            networkId: 0,
            url: 'https://kaspa.org',
        },
        {
            name: 'Testnet',
            networkId: 1,
            url: 'https://testnet.kaspa.org',
        }
    ]
    useEffect(() => {
        setNetworkConfig(networkList)
        setCurrentNetworkId(networkList[0].networkId)
    }, [])

    const changeNetwork = async (index: number) => {
        const selectedNetwork = networkConfig[index];
        console.log('selectedNetwork', selectedNetwork)
        console.log('currentNetworkId', currentNetworkId);
        if (selectedNetwork.networkId === currentNetworkId) return;
        setCurrentNetworkId(selectedNetwork.networkId)
    };

    return (
        <article className="page-box">
            <HeadNav leftDom={ null} title='Switch Network'></HeadNav>
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
                                </div>
                            )
                        })
                    }
                </Radio.Group>
            </div>
        </article>
    )
}
export { SwitchNetwork }