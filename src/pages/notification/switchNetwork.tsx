import React, { useState, useEffect } from "react"
import { Button } from 'antd-mobile'
import { Network } from '@/model/account';
import { Session } from '@/types/type';
import { Notification } from '@/chrome/notification'
import { Preference } from '@/chrome/preference'
import { Kiwi } from '@kasplex/kiwi-web'
import { SvgIcon } from '@/components/Icon/index'

interface networkData {
    networkId: number,
    targetNetworkId: number,
}

interface RequestParam {
    data: networkData
    session: Session
}

const SwitchNetwork: React.FC = () => {
    const [fromNetwork, setFromNetwork] = useState<Network | undefined>(undefined)
    const [toNetwork, setToNetwork] = useState<Network | undefined>(undefined)

    const [session, setSession] = useState<Session | undefined>(undefined)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        setSession(approval.session)

        let networks = await Preference.getNetworkConfig()
        console.log("networks", networks)
        setFromNetwork(networks[approval.data.networkId])
        setToNetwork(networks[approval.data.targetNetworkId])
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    useEffect(() => {
        getApproval()
    }, [])

    const submit = async () => {
        await Preference.setNetwork(toNetwork!)
        Notification.resolveApproval()
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
                    <span>{ fromNetwork?.name }</span>
                    <SvgIcon iconName="arrowRight" />
                    <span>{ toNetwork?.name }</span>
                </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block className="fs16" size="large" onClick = { reject }>
                    Cancel
                </Button>
                <Button block size="large" className="fs16" color="primary" 
                    loading={btnLoading}
                    onClick={ submit }
                    loadingText={'Submitting'}
                    >
                    Switch Network
                </Button>
            </div>
        </article>
    )
}
export { SwitchNetwork }