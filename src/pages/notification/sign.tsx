import React, { useState, useEffect } from "react"
import { Radio, Button } from 'antd-mobile'
import { Network } from '@/model/account';


const SignInfo: React.FC = () => {
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])
    const [currentNetworkId, setCurrentNetworkId] = useState<number>(1)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    const disabled = (networkId: number) => {
        return networkId === currentNetworkId
    }
    const session = {
        icon:  'https://kaspa.org/img/kaspa-logo.svg',
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
                <h6 className="title-tip mb20">Signature request</h6>
                <p className="title-desc mb20">Only sign this message if you fully understand the content andtrust the requesting site.</p>
                <h6 className="title-tip-2">You are signing:</h6>
                <div className="sign-info">
                    haha
                </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" >
                    Reject
                </Button>
                <Button block size="large" color="primary" 
                    loading={btnLoading}
                    loadingText={'Submitting'}
                    >
                    Sign
                </Button>
            </div>
        </article>
    )
}
export { SignInfo }