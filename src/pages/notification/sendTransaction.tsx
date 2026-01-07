import React, { useEffect, useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Mask } from 'antd-mobile'
import { formatAddress } from '@/utils/util'
import { ethers } from "ethers";
import '@/styles/transaction.scss'
import { EvmNetwork, ERC20Meta, ERC20ApproveMeta } from "@/model/evm";
import { Notification } from "@/chrome/notification";
import { useNotice } from "@/components/NoticeBar/NoticeBar";
import { Account } from "@/chrome/account";
import { Keyring } from "@/chrome/keyring";
import { TransactionRequest } from "ethers/src.ts/providers/provider";
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard'
import NumberInput from '@/components/NumberInput';

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

    const [approveAmount, setApproveAmount] = useState<number | ''>('')
    const [visibleMask, setVisibleMask] = useState<boolean>(false)

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        let from = await Keyring.getActiveAddressForEvm()
        param.tx.from = from.address
        setParams({ from, ...param.tx })
        setNetwork(param.network)
        if (param.data) {
            setData(param.data)
        }
    }

    useEffect(() => {
        getApproval()
    }, []);

    useEffect(() => {
        if (!data || !data.args?.amount) return;
        resetNonce()
    }, [data]);

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

    const submitApproveAmount = async (nonce?: number) => {
        if (!approveAmount) {
            return
        }
        if (approveAmount > Number(data!.token.balance)) {
            noticeError(`The amount is too large, max ${data!.token.balance}`)
            return
        }
        setVisibleMask(false)

        let newAmount = ethers.parseUnits(approveAmount.toString(), data!.token.decimals)
        if (newAmount > ethers.MaxUint256) {
            newAmount = ethers.MaxUint256
        }

        data!.args.amount = newAmount.toString()
        setData(data)

        const iface = new ethers.Interface([
            "function approve(address spender, uint256 amount)",
        ]);

        let approveData = data as ERC20ApproveMeta
        params.data = iface.encodeFunctionData("approve", [
            approveData!.args.spender,
            newAmount,
        ]);
        setParams(params)
    }

    const resetNonce = async () => {
        let orgAmount = ethers.formatUnits(data!.args.amount, data!.token.decimals)
        setApproveAmount(Number(orgAmount))
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
                                    <em>{data.method}</em>
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
                                    <em onClick={() => handleCopy(data.token.address)}>{formatAddress(data.token.address)} <SvgIcon iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
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
                                    <em onClick={() => handleCopy(data.token.address)}>{formatAddress(data.args.spender)} <SvgIcon iconName="IconCopy" offsetStyle={{ marginLeft: '5px', marginRight: '-12px' }} /></em>
                                </div>
                            </div>

                            <div className="history-box">
                                <div className="history-token-item">
                                    <span>Approve Amount</span>
                                    <em>{ethers.formatUnits(data.args.amount, data.token.decimals)} <SvgIcon iconName="IconEdit" className="cursor-pointer"
                                        onClick={() => setVisibleMask(true)}
                                        size={20} /></em>
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
                                    <em>{ethers.formatUnits(data.args.amount, data.token.decimals)}</em>
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

            {
                data && data.method == "approve" && (
                    <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                        <article className="remove-box">
                            <div className="remove-bg">
                                <SvgIcon className="remove-close" onClick={() => setVisibleMask(false)} iconName="IconClose"
                                    color="#7F7F7F" />
                                <div className="remove-nox-content">
                                    <section className="dialog-content">
                                        <p className="remove-tip-strong">Approve amount</p>
                                        <div className="amount-box mt15">
                                            <h6 className="sub-tit">
                                                <span>Edit nonce</span>
                                                <strong onClick={() => resetNonce()}>Reset</strong>
                                            </h6>
                                            <div className="input-box mask-input-box">
                                                <NumberInput
                                                    value={approveAmount}
                                                    onChange={setApproveAmount}
                                                    decimalPlaces={0}
                                                    placeholder="amount"
                                                />
                                            </div>
                                            <span className="span-amount">Balance: {data.token.balance || "0"}</span>
                                        </div>
                                    </section>
                                </div>
                                <div className="remove-btns">
                                    <Button size="middle" onClick={() => setVisibleMask(false)}>Cancel</Button>
                                    <Button color='primary' size="middle" onClick={() => submitApproveAmount()}>Save</Button>
                                </div>
                            </div>
                        </article>
                    </Mask>
                )
            }
        </article>


    )
}

export { SendTransaction }