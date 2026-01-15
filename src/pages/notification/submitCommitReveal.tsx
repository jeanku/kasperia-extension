import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button } from 'antd-mobile'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress } from '@/utils/util'
import { Notification } from '@/chrome/notification';
import { SubmitSetting, SubmitBuilderOptions } from '@/model/account'
import '@/styles/transaction.scss'
import {Address} from "@/utils/wallet/address";
import { ethers } from "ethers";
import {Account} from "@/chrome/account";


interface SendParams {
    reveal: SubmitSetting;
    options: SubmitBuilderOptions;
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

const SubmitCommitReveal = () => {
    const { noticeError } = useNotice()
    const [params, setParams] = useState<SendParams | undefined>(undefined)
    const [btnLoading, setBtnLoading] = useState(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        setParams(param)
        check(param)
    }

    useEffect(() => {
        getApproval()
    }, []);

    const submitTransaction = async () => {
        try {
            check(params)
            setBtnLoading(true)
            let resp = await Account.submitCommitReveal(params!.reveal, params!.options)
            Notification.resolveApproval(resp)
        } catch (error) {
            noticeError(error);
        }
        setBtnLoading(false)
    }

    const check = async (param: SendParams| undefined) => {
        if (!param) {
            return noticeError("invalid param")
        }
        for (const output of param?.reveal.outputs) {
            if (!Address.validate(output.address || "")) {
                return noticeError("address invalid")
            }
        }
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    return (
        <article className="page-box">
            <HeadNav title='Sign Commit & Reveal' showLeft={false}></HeadNav>
            <div className="content-main sign-transactuon assets-details pb96">
                <div className="history-box">
                        <div className="history-token-item">
                            <span>Type</span>
                            <em>Commit & Reveal</em>
                        </div>
                    </div>

                {params?.reveal.outputs.map((output, _) => (
                    <>
                        <div className="history-box">
                            <div className="history-token-item">
                                <span>Send to</span>
                                <em>{formatAddress(output.address)}</em>
                            </div>
                        </div>

                        <div className="history-box">
                            <div className="history-token-item">
                                <span>Send amount</span>
                                <em>{ethers.formatUnits(Number(output.amount), 8)} KAS</em>
                            </div>
                        </div>
                    </>
                ))}

                <div className="history-box">
                    <div className="history-token-item">
                        <span>Protocol</span>
                        <em>{params?.options.protocol}</em>
                    </div>
                </div>

                {params?.reveal?.priorityFee ?
                    <div className="history-box">
                        <div className="history-token-item">
                            <span>Transaction fee</span>
                            <em>{ethers.formatUnits(Number(params?.reveal?.priorityFee), 8)} KAS</em>
                        </div>
                    </div> : null
                }

                {params?.options.action ?
                    <>
                        <div className="tx-confirm-box">
                            <h6 className="sub-tit mt15">Inscription</h6>
                            <div className="tx-confirm-content">
                                <div className="tx-confirm-data">
                                    {typeof params.options.action === 'string' ? params.options.action : JSON.stringify(params.options.action, null, 8)}
                                </div>
                            </div>
                        </div>
                    </> : null
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
export {
    SubmitCommitReveal
}