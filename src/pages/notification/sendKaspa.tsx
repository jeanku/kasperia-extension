import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, DotLoading } from 'antd-mobile'
import { useNavigate } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress, formatBalance, stringToUint8Array, isEmptyObject } from '@/utils/util'
import { Keyring } from '@/chrome/keyring'
import { Wallet } from '@/model/wallet'
import { Tx, Wasm, Kiwi, Rpc, Wallet as KiwiWallet } from '@kasplex/kiwi-web'

import { RootState } from '@/store';
import { useSelector } from "react-redux";
import { Notification } from '@/chrome/notification';
import BigNumber from 'bignumber.js';

import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'


interface SendParams {
    toAddress: string;
    amount: string;
    payload: string;
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

    const navigate = useNavigate();
    const { noticeError } = useNotice()

    const [params, setParams] = useState<SendParams>({
        toAddress: "",
        amount: "",
        payload: "",
    })

    const [estimateFee, setEstimateFee] = useState(0n)
    const [btnLoading, setBtnLoading] = useState(false)

    const [pendingTx, setPendingTx] = useState<Promise<Tx.PendingTransaction> | null>(null)
    const rpcClient = useSelector((state: RootState) => state.rpc.client);
    const createTx = async (param: SendParams) => {
        try {
            let wallet: Wallet = await Keyring.getActiveWalletKeys()
            const outputs = Tx.Output.createOutputs(param.toAddress, BigInt(param.amount))
            const fromAddress = new Wasm.PublicKey(wallet.pubKey).toAddress(Kiwi.network).toString();
            const { entries } = await Rpc.getInstance().client.getUtxosByAddresses([fromAddress])
            let data = {
                changeAddress: fromAddress,
                outputs: outputs,
                priorityFee: 0n,
                entries: entries,
                networkId: Kiwi.getNetworkID(),
                payload: isEmptyObject(params!.payload) ? undefined : stringToUint8Array(params!.payload)
            }
            let priKey = new Wasm.PrivateKey(wallet.priKey)
            await Tx.Transaction.createTransactions(data).then(r => {
                const { summary, transactions } = r.transaction
                setEstimateFee(summary.fees)
                let signtx = r.sign([priKey])
                setPendingTx(new Promise((resolve, reject) => {
                    resolve(signtx)
                }))
            })
        } catch (error) {
            noticeError(error)
        }
    }

    const getApproval = async () => {
        let approval: RequestParam = await Notification.getApproval()
        let param = approval.data
        param.amount = new BigNumber(param.amount).multipliedBy(new BigNumber(10).pow(8)).toFixed(0);
        isEmptyObject(params!.payload) && (param.payload = "")
        setParams(param)
        if (!KiwiWallet.validate(param.toAddress || "")) {
            noticeError("address invalid")
            return
        }

        if (BigInt(param.amount) <= BigInt("100000000")) {
            noticeError("trasfer amount at least 1 KAS")
            return
        }
        if (rpcClient && rpcClient.isConnected) {
            createTx(param)
        }
    }

    useEffect(() => {
        getApproval()
    }, [rpcClient]);

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            if (pendingTx) {
                let ptx = await pendingTx
                let resp = await ptx.submit()
                setBtnLoading(false)
                Notification.resolveApproval({txid: resp})
            }
        } catch (error) {
            noticeError(error);
            setBtnLoading(false)
        }
    }

    const reject = () => {
        Notification.rejectApproval()
    }

    return (
        <article className="page-box">
            <HeadNav title='Sign Transaction'></HeadNav>
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
                        {
                            <p>{estimateFee === 0n ? (
                                <DotLoading color='#74E6D8' />
                            ) : `${formatBalance(estimateFee.toString(), 8)} kas fee`}</p>
                        }
                    </div>
                </div>
                {params.payload ?
                    <>
                        <h6 className="sub-tit">Payload</h6>
                        <div className="text-area">
                            <textarea placeholder="Please enter the payload" disabled rows={3} value={params.payload} />
                        </div>
                    </>

                    : null
                }
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" onClick={() => reject()}>
                        Reject
                    </Button>
                    <Button block size="large" color="primary"
                            disabled={ pendingTx == null}
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