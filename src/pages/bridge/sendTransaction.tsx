import React, {useEffect, useState} from "react"
import HeadNav from '@/components/HeadNav'
import { Button } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";

import '@/styles/transaction.scss'
import { EvmNetwork } from "@/model/evm";
import {Notification} from "@/chrome/notification";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {Account} from "@/chrome/account";
import {TransactionRequest} from "ethers/src.ts/providers/provider";

interface SendParams {
    tx: TransactionRequest;
    network: EvmNetwork | undefined;
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

const SendTransaction = () => {
    const { noticeError } = useNotice()
    const { state } = useLocation()
    const navigate = useNavigate();

    const [btnLoading, setBtnLoading] = useState(false)

    const [unSignedTx] = useState<TransactionRequest>(state?.unSignedTx)

    const [evmNetwork, setEvmNetwork] = useState<EvmNetwork>(state?.evmNetwork)

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            let hash = await Account.sendTransaction(unSignedTx)
            // na
        } catch (error) {
            noticeError(error);
        }
        setBtnLoading(false)
    }

    return (
        <article className="page-box">
            <HeadNav title='Sign Transaction' showLeft={false}></HeadNav>
            <div className="content-main sign-transactuon assets-details pb96">

                <div className="history-box">
                    <div className="history-token-item">
                        <span>Network </span>
                        <em>{evmNetwork?.name || ""}</em>
                    </div>
                </div>

                <div className="tx-confirm-box">
                    <h6 className="sub-tit mt15">Sign Message</h6>
                    <div className="tx-confirm-content">
                        <div className="tx-confirm-data">
                            {JSON.stringify(unSignedTx, null, 8)}
                        </div>
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

export default SendTransaction