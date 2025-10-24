import React, { useState, useEffect } from "react"
import { Notification } from '@/chrome/notification'
import { Account } from '@/chrome/account'
import { formatAddress, formatSignMessage } from '@/utils/util'
import { Button, Divider } from 'antd-mobile'

interface Session {
    origin: string;
    icon: string;
    name: string;
}

interface SignData {
    message: string,
    address: string,
}

interface RequestParam {
    data: SignData
    session: Session
}

const SignMessage = () => {
    const [session, setSession] = useState<Session | undefined>(undefined)
    const [data, setData] = useState<SignData | undefined>(undefined)
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
        if (!data?.message) {
            return
        }
        let signature = await Account.signMessage(formatSignMessage(data?.message))
        Notification.resolveApproval(signature)
    }

    useEffect(() => {
        getApproval()
    }, [])

    return (
        <article className="page-box">
            <section className="source-top">
                <div className='source-box'>
                    <img className="logo-img" src={session?.icon} alt="" />
                    <div className='source-txt'>
                        <strong className="one-line">{session?.name}</strong>
                        <p>{session?.origin}</p>
                    </div>
                </div>
            </section>
            <div className="assets-details pb96 pt20import">
                <h6 className="title-tip mb20">Signature request</h6>
                <p className="title-desc">Only sign this message if you fully understand the content and trust the requesting site.</p>
                <div className="mt15">
                    <div className="history-token-item">
                        <span>Address</span>
                        <em>{formatAddress(data?.address)}</em>
                    </div>
                </div>
                <Divider
                    style={{
                        color: '#74e6d8',
                        borderColor: '#666',
                        borderStyle: 'dashed',
                    }}
                >Sign Message</Divider>
                <div className="sign-info">
                    {data?.message}
                </div>
            </div>
            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" onClick={reject} >
                    Reject
                </Button>
                <Button block size="large" color="primary"
                    loading={btnLoading}
                    onClick={sign}
                    loadingText={'Submitting'}
                >
                    Sign
                </Button>
            </div>
        </article>
    )
}

export { SignMessage }