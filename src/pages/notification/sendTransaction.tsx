import React, {useEffect, useState} from "react"
import HeadNav from '@/components/HeadNav'
import { Button } from 'antd-mobile'
import { formatAddress } from '@/utils/util'

import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'
import { EvmNetwork } from "@/model/evm";
import {Notification} from "@/chrome/notification";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {Token} from "@/chrome/token";
import { Keyring } from "@/chrome/keyring";
import {TransactionRequest} from "ethers/src.ts/providers/provider";
import {Account} from "@/chrome/account";

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
    const [btnLoading, setBtnLoading] = useState(false)

    const [params, setParams] = useState<TransactionRequest>({})

    const [network, setNetwork] = useState<EvmNetwork>()

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        let from = await Keyring.getActiveAddressForEvm()
        param.tx.from = from.address
        setParams({from, ...param.tx})
        setNetwork(param.network)
    }

    useEffect(() => {
        getApproval()
    }, []);

    const reject = () => {
        Notification.rejectApproval()
    }

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            let hash = await Token.sendTransaction(params)
            Notification.resolveApproval(hash)
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
                        <em>{network?.name || ""}</em>
                    </div>
                </div>

                <div className="tx-confirm-box">
                    <h6 className="sub-tit mt15">Sign Message</h6>
                    <div className="tx-confirm-content">
                        <div className="tx-confirm-data">
                            {JSON.stringify(params, null, 8)}
                        </div>
                    </div>
                </div>

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

export { SendTransaction }