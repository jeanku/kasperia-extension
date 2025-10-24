import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Button } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SubmitSendTx } from '@/model/transaction'
import { formatAddress, formatBalance } from '@/utils/util'
import { Account } from '@/chrome/account'
import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'

const SendSign = () => {

    const navigate = useNavigate();
    const { state } = useLocation()
    const { noticeError } = useNotice()
    const [submitTx, _] = useState<SubmitSendTx>(state?.submitTx)
    const [btnLoading, setBtnLoading] = useState(false)

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            let txid = await Account.transferKrc20(submitTx.token.tick, submitTx.token.ca, submitTx.amount.toString(), submitTx.address)
            navigate('/krc20/sendResult', { state: { submitTx, txid }})
        } catch (error) {
            noticeError(error);
            setBtnLoading(false)
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='Sign Transaction'></HeadNav>
            <div className="content-main sign-transactuon">
                <div className="sign-card">
                    <div className="sign-card-bg pt26">
                        <strong>Send to</strong>
                        <p className="color-white">{formatAddress(submitTx.address)}</p>
                    </div>
                    <img src={RoundLine} alt="round-line" />
                    <div className="sign-card-bg">
                        <strong>Spend amount</strong>
                        <h6>{formatBalance(submitTx.amount.toString(), submitTx.token.dec)} {submitTx.token.name}</h6>
                        <p></p>
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" onClick={() => navigate(-1)}>
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
export { SendSign }