import React, {useEffect, useState} from "react"
import HeadNav from '@/components/HeadNav'
import { Button } from 'antd-mobile'
import { formatAddress } from '@/utils/util'
import { ethers } from "ethers";
import '@/styles/transaction.scss'
import { EvmNetwork, ERC20Meta } from "@/model/evm";
import {Notification} from "@/chrome/notification";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {Account} from "@/chrome/account";
import { Keyring } from "@/chrome/keyring";
import {TransactionRequest} from "ethers/src.ts/providers/provider";
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard'

interface SendParams {
    tx: TransactionRequest;
    data: ERC20Meta;
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

    const { handleCopy } = useClipboard()

    const [btnLoading, setBtnLoading] = useState(false)

    const [params, setParams] = useState<TransactionRequest>({})

    const [network, setNetwork] = useState<EvmNetwork>()

    const [data, setData] = useState<ERC20Meta>()

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        let from = await Keyring.getActiveAddressForEvm()
        param.tx.from = from.address
        setParams({from, ...param.tx})
        setNetwork(param.network)
        if (param.data) {
            setData(param.data)
        }
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
            let hash = await Account.sendTransaction(params)
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

                {
                    data && (
                        <>
                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Method </span>
                                    <em>{ data.method }</em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Token</span>
                                    <em>{data.token.name}</em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Token Address</span>
                                    <em onClick={() => handleCopy(data.token.address)}>{formatAddress(data.token.address)} <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}}/></em>
                                </div>
                            </div>
                        </>
                    )
                }

                {
                    data && data.method == "approve" && (
                        <>
                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Approve To</span>
                                    <em onClick={() => handleCopy(data.token.address)}>{formatAddress(data.args.spender)} <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}}/></em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Approve Amount</span>
                                    <em>{ethers.formatUnits(data.args.amount.toString(), data.token.decimals)}</em>
                                </div>
                            </div>
                        </>
                    )
                }

                {
                    data && data.method == "transfer" && (
                        <>
                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Transfer To</span>
                                    <em>{formatAddress(data.args.to)}</em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Transfer Amount</span>
                                    <em>{ethers.formatUnits(data.args.amount.toString(), data.token.decimals)}</em>
                                </div>
                            </div>
                        </>
                    )
                }

                {
                    data && data.method == "transferFrom" && (
                        <>
                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>TransferFrom From</span>
                                    <em>{formatAddress(data.args.from)}</em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>TransferFrom To</span>
                                    <em>{formatAddress(data.args.to)}</em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>TransferFrom Amount</span>
                                    <em>{ethers.formatUnits(data.args.amount.toString(), data.token.decimals)}</em>
                                </div>
                            </div>
                        </>
                    )
                }

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

export {SendTransaction}