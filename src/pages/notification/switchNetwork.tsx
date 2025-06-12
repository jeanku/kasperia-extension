import React, { useState, useEffect } from "react"
import { Button } from 'antd-mobile'
import { Network } from '@/model/account';
import { SvgIcon } from '@/components/Icon/index'
import PngCoinDef from '@/assets/images/icon-coin-def.png'

const SwitchNetwork: React.FC = () => {
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const [currentNetworkId, setCurrentNetworkId] = useState<number>(1)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    const disabled = (networkId: number) => {
        return networkId !== currentNetworkId
    }
    const session = {
        icon:  PngCoinDef,
        name: 'Kasware Wallet',
        origin: 'https://kaspa.org'
    }
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
            <section className="source-top">
                <div className='source-box'>
                    <img className="logo-img" src={session?.icon} alt="" />
                    <div className='source-txt'>
                        <strong>{session?.name}</strong>
                        <p>{session?.origin}</p>
                    </div>
                </div>
                <span className="tip-test-tn">TN10</span>
            </section>
            <div className="content-main pb50">
                <h6 className="title-tip">Allow this site to switch the network?</h6>
                <div className="switch-network">
                    <span>Testnet 10</span>
                    <SvgIcon iconName="arrowRight" />
                    <span>Mainnet</span>
                </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block className="fs16" size="large" >
                    Cancel
                </Button>
                <Button block size="large" className="fs16" color="primary" 
                    disabled={ disabled(currentNetworkId) }
                    loading={btnLoading}
                    onClick={() => {
                        changeNetwork(currentNetworkId)
                    }}
                    loadingText={'Submitting'}
                    >
                    Switch Network
                </Button>
            </div>
        </article>
    )
}
export { SwitchNetwork }