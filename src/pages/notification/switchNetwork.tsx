import React, { useState, useEffect } from "react"
import { Button } from 'antd-mobile'
import { Network } from '@/model/account';
import { Session } from '@/types/type';
import { Notification } from '@/chrome/notification'
import { Preference } from '@/chrome/preference'
import { SvgIcon } from '@/components/Icon/index'
import {NetworkType} from "@/utils/wallet/consensus";
import { capitalizeFirstLetter } from '@/utils/util'

interface networkData {
    networkType: NetworkType,
    targetNetworkType: NetworkType,
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
        let fromNetwork: Network | undefined
        let toNetwork: Network | undefined
        for (const network of networks) {
            if (network.networkType == approval.data.networkType) {
                fromNetwork = network
            }
            if (network.networkType == approval.data.targetNetworkType) {
                toNetwork = network
            }
        }
        setFromNetwork(fromNetwork)
        setToNetwork(toNetwork)
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
                        <strong className="one-line">{session?.name}</strong>
                        <p className="one-line">{session?.origin}</p>
                    </div>
                </div>
            </section>
            <div className="content-main pb50">
                <h6 className="title-tip">Allow this site to switch the network?</h6>
                {/* <div className="switch-network">
                    <span>{ capitalizeFirstLetter(fromNetwork?.networkType!) }</span>
                    <SvgIcon iconName="IconArrowRightTheme" color="#74E6D8" />
                    <span>{ capitalizeFirstLetter(toNetwork?.networkType!) }</span>
                </div> */}
                <div className="sn">
                <div className="sn-panel" role="group" aria-label="Switch network">
                    <div className="sn-card sn-from">
                    <span className="sn-badge">From</span>
                    <div className="sn-name">{capitalizeFirstLetter(fromNetwork?.networkType!)}</div>
                    </div>

                    <div className="sn-arrow" aria-hidden="true">
                    <SvgIcon iconName="IconArrowRightTheme" />
                    </div>

                    <div className="sn-card sn-to">
                    <span className="sn-badge sn-badge--accent">To</span>
                    <div className="sn-name">{capitalizeFirstLetter(toNetwork?.networkType!)}</div>
                    </div>
                </div>
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