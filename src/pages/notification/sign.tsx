import React, { useState, useEffect } from "react"

import { Notification } from '@/chrome/notification'
import { Keyring } from '@/chrome/keyring'
import { Kiwi, Wasm, initialize } from '@kasplex/kiwi-web'
import { Wallet } from '@/model/wallet'
import { Network } from '@/model/account'
import { Button } from 'antd-mobile'

interface Session {
    origin: string;
    icon: string;
    name: string;
}

interface SignData {
    text: string,
    type: string,
}

interface RequestParam {
    data: SignData
    session: Session
}

const Sign = () => {
    const [networkConfig, setNetworkConfig] = useState<Network[]>([])

    const [session, setSession] = useState<Session | undefined>(undefined)
    const [data, setData] = useState<SignData | undefined>(undefined)

    const [currentNetworkId, setCurrentNetworkId] = useState<number>(1)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        setSession(approval.session)
        setData(approval.data)
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    const sign = async () => {
        let wallet: Wallet = await Keyring.getActiveWalletKeys()
        let signstr = Wasm.signMessage({message: data?.text || "", privateKey: wallet.priKey})
        Notification.resolveApproval(signstr)
    }

    useEffect(() => {
        getApproval()
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
                    {data?.text}
                </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" onClick={ reject } >
                    Reject
                </Button>
                <Button block size="large" color="primary" 
                    loading={btnLoading}
                    onClick={ sign }
                    loadingText={'Submitting'}
                    >
                    Sign
                </Button>
            </div>
        </article>
    )
}

export { Sign }