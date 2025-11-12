import { useState, useEffect } from "react"
import { Button } from 'antd-mobile'
import { ethers } from "ethers";
import { useNavigate, useLocation } from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "@/store";

import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SubmitSendTx } from '@/model/transaction'
import { formatAddress, formatBalance } from '@/utils/util'
import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'
import {Account} from "@/chrome/account";

const Sign = () => {
    const navigate = useNavigate();
    const { state } = useLocation()
    const { preference } = useSelector((state: RootState) => state.preference);
    const { noticeError } = useNotice()
    const [submitTx, _] = useState<SubmitSendTx>(state?.submitTx)
    const [btnLoading, setBtnLoading] = useState(false)
    const [fee, setFee] = useState("")

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            let txid = await Account.transferKas(submitTx.address, submitTx.amount.toString(), submitTx.payload)
            navigate('/tx/result', { state: { submitTx, txid }})
        } catch (error) {
            noticeError(error);
            setBtnLoading(false)
        }
    }

    const getEstimateFee = async () => {
        let fee = await Account.estimateFee(preference.currentAccount?.address!, submitTx.address, submitTx.amount.toString(), submitTx.payload)
        if (fee) {
            console.log("getEstimateFee", fee, formatBalance(fee, 8))
            setFee(fee)
        }
    }

    useEffect(() => {
        getEstimateFee()
    }, [])

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
                        <h6>{ethers.formatUnits(submitTx.amount.toString(), 8)} KAS</h6>
                        <p>≈ {formatBalance(fee, 8)} transaction fee</p>
                    </div>
                </div>
                {submitTx.payload ?
                    <>
                        <h6 className="sub-tit">Payload</h6>
                        <div className="text-area">
                            <textarea placeholder="" disabled rows={3} value={submitTx.payload} />
                        </div>
                    </>
                    : null
                }
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
export { Sign }