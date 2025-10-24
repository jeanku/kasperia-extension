import React, { useState, useEffect } from "react"
import { Button } from 'antd-mobile'
import { Session } from '@/types/type';
import { Notification } from '@/chrome/notification'
import { Evm } from '@/chrome/evm'
import { SvgIcon } from '@/components/Icon/index'
import {EvmNetwork} from "@/model/evm";
import { capitalizeFirstLetter } from '@/utils/util'

interface networkData {
    chainId: string,
    targetChainId: string,
}

interface RequestParam {
    data: networkData
    session: Session
}

const SwitchChain: React.FC = () => {
    const [fromNetwork, setFromNetwork] = useState<EvmNetwork | undefined>(undefined)
    const [toNetwork, setToNetwork] = useState<EvmNetwork | undefined>(undefined)

    const [session, setSession] = useState<Session | undefined>(undefined)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        setSession(approval.session)
        let chains = await Evm.getNetworks()
        let fromChain: EvmNetwork | undefined
        let toChain: EvmNetwork | undefined
        for (const chain of chains) {
            if (chain.chainId == approval.data.chainId) {
                fromChain = chain
            }
            if (chain.chainId == approval.data.targetChainId) {
                toChain = chain
            }
        }
        setFromNetwork(fromChain)
        setToNetwork(toChain)
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    useEffect(() => {
        getApproval()
    }, [])

    const submit = async () => {
        if (toNetwork) {
            await Evm.setSelectedNetwork(toNetwork.chainId)
        }
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
            </section>
            <div className="content-main pb50">
                <h6 className="title-tip">Allow this site to switch the network?</h6>
                {/* <div className="switch-network">
                    <span>{ capitalizeFirstLetter(fromNetwork?.name!) }</span>
                    <SvgIcon iconName="IconArrowRightTheme" color="#74E6D8" />
                    <span>{ capitalizeFirstLetter(toNetwork?.name!) }</span>
                </div> */}
                <div className="sn">
                <div className="sn-panel" role="group" aria-label="Switch network">
                    <div className="sn-card sn-from">
                    <span className="sn-badge">From</span>
                    <div className="sn-name">{capitalizeFirstLetter(fromNetwork?.name!)}</div>
                    </div>

                    <div className="sn-arrow" aria-hidden="true">
                    <SvgIcon iconName="IconArrowRightTheme" />
                    </div>

                    <div className="sn-card sn-to">
                    <span className="sn-badge sn-badge--accent">To</span>
                    <div className="sn-name">{capitalizeFirstLetter(toNetwork?.name!)}</div>
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
export { SwitchChain }