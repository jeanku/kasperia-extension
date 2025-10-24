import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, DotLoading } from 'antd-mobile'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress, formatBalance } from '@/utils/util'
import { Notification } from '@/chrome/notification';

import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'
import {Address} from "@/utils/wallet/address";
import {Account} from "@/chrome/account";


interface SendOptions {
    payload: string | undefined;
}

interface SendParams {
    toAddress: string;
    amount: string;
    options: SendOptions;
}

interface Session {
    origin: string;
    icon: string;
    name: string;
}

interface RequestParam {
    data: SendParams
    session: Session
}

const SendKaspa = () => {

    const { noticeError } = useNotice()
    const [params, setParams] = useState<SendParams>({
        toAddress: "",
        amount: "",
        options: {
            payload: undefined
        },
    })

    const [btnLoading, setBtnLoading] = useState(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        setParams(param)
        if (!Address.validate(param.toAddress || "")) {
            return noticeError("address invalid")
        }

        if (BigInt(param.amount) <= BigInt("100000000")) {
            noticeError("trasfer amount at least 1 KAS")
            return
        }
    }

    useEffect(() => {
        getApproval()
    }, []);

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            let txid = await Account.transferKas(params.toAddress, params.amount, params.options?.payload)
            Notification.resolveApproval({txid: txid})
        } catch (error) {
            noticeError(error);
        }
        setBtnLoading(false)
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    return (
        <article className="page-box">
            <HeadNav title='Sign Transaction' showLeft={false}></HeadNav>
            <div className="content-main sign-transactuon pb96">
                <div className="sign-card">
                    <div className="sign-card-bg pt26">
                        <strong>Send to</strong>
                        <p className="color-white">{formatAddress(params.toAddress)}</p>
                    </div>
                    <img src={RoundLine} alt="round-line" />
                    <div className="sign-card-bg">
                        <strong>Spend amount</strong>
                        <h6>{formatBalance(params.amount, 8)} KAS</h6>
                        <p></p>
                    </div>
                </div>
                {params.options?.payload ?
                    <>
                        <h6 className="sub-tit">Payload</h6>
                        <div className="text-area">
                            <textarea placeholder="Please enter the payload" disabled rows={3} value={params.options.payload} />
                        </div>
                    </>
                    : null
                }
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" onClick={() => reject()}>
                        Reject
                    </Button>
                    <Button block size="large" color="primary"
                            loading={btnLoading}
                            loadingText={'Submitting'}
                            onClick={() => submitTransaction()}>
                        Sign & Pay
                    </Button>
                </div>
            </div>
        </article>
    )
}
export { SendKaspa }