import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, DotLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SubmitSendTx } from '@/model/transaction'
import { formatAddress, formatBalance, stringToUint8Array } from '@/utils/util'
import { Keyring } from '@/chrome/keyring'
import { Wallet } from '@/model/wallet'
import { KaspaEnum } from '@/types/enum'
import { KRC20, Tx, Utils, Enum, Wasm, Kiwi, Rpc } from '@kasplex/kiwi-web'

import { RootState } from '@/store';
import { useSelector } from "react-redux";

import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'

const Sign = () => {

    const navigate = useNavigate();
    const { state } = useLocation()
    const { noticeSuccess, noticeError } = useNotice()
    const [submitTx, _] = useState<SubmitSendTx>(state?.submitTx)
    const [estimateFee, setEstimateFee] = useState(0n)
    const [btnLoading, setBtnLoading] = useState(false)

    const [pendingTx, setPendingTx] = useState<Promise<Tx.PendingTransaction> | null>(null)
    const rpcClient = useSelector((state: RootState) => state.rpc.client);

    const createTx = async () => {
        if (submitTx.token.name != KaspaEnum.KAS) return
        try {
            let wallet: Wallet = await Keyring.getActiveWalletKeys()
            const outputs = Tx.Output.createOutputs(submitTx.address, BigInt(submitTx.amount))
            const fromAddress = new Wasm.PublicKey(wallet.pubKey).toAddress(Kiwi.network).toString();
            const { entries } = await Rpc.getInstance().client.getUtxosByAddresses([fromAddress])
            let data = {
                changeAddress: fromAddress,
                outputs: outputs,
                priorityFee: 0n,
                entries: entries,
                networkId: Kiwi.getNetworkID(),
                payload: submitTx.payload == "" ? undefined : stringToUint8Array(submitTx.payload)
            }
            let priKey = new Wasm.PrivateKey(wallet.priKey)
            await Tx.Transaction.createTransactions(data).then(r => {
                const { summary, transactions } = r.transaction
                setEstimateFee(summary.fees)
                let signtx = r.sign([priKey])
                setPendingTx(new Promise((resolve, reject) => {
                    resolve(signtx);
                }))
            })
        } catch (error) {
            noticeError(error)
        }
    }

    useEffect(() => {
        createTx()
    }, [rpcClient]);

    const submitTransaction = async () => {
        try {
            setBtnLoading(true)
            if (pendingTx && submitTx.token.name == KaspaEnum.KAS) {
                let ptx = await pendingTx
                let resp = await ptx.submit()
                setBtnLoading(false)
                navigate('/tx/result', { state: { submitTx, txid: resp! }})
            } else {
                let wallet: Wallet = await Keyring.getActiveWalletKeys()
                let payload = submitTx.payload == "" ? undefined : stringToUint8Array(submitTx.payload)
                let krc20data = Utils.createKrc20Data({
                    p: "krc-20",
                    op: Enum.OP.Transfer,
                    to: submitTx.address,
                    amt: submitTx.amount.toString(),
                })
                if (submitTx.token.ca) {
                    krc20data.ca = submitTx.token.ca
                } else {
                    krc20data.tick = submitTx.token.tick
                }
                console.log("krc20data", krc20data)
                let prikey = new Wasm.PrivateKey(wallet.priKey)
                let resp = await KRC20.transfer(prikey, krc20data, 0n, payload)
                navigate('/tx/result', { state: { submitTx, txid: resp!  }})
            }
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
                        {
                            submitTx.token.name === KaspaEnum.KAS ? (
                                <p>{estimateFee === 0n ? (
                                    <DotLoading color='#74E6D8' />
                                ) : `${formatBalance(estimateFee.toString(), 8)} kas fee`}</p>
                            ) : (
                                <p></p>
                            )
                        }
                    </div>
                </div>
                {submitTx.payload !== "" ?
                    <>
                        <h6 className="sub-tit">Payload</h6>
                        <div className="text-area">
                            <textarea placeholder="Please enter the payload" disabled rows={3} value={submitTx.payload} />
                        </div>
                    </>
                    
                    : null
                }
                <div className="btn-pos-two">
                    <Button block size="large" color="primary" 
                        disabled={ submitTx.token.name === KaspaEnum.KAS && pendingTx == null}
                        loading={btnLoading}
                        loadingText={'Submitting'}
                        onClick={() => submitTransaction()}>
                        Sign & Pay
                    </Button>
                    <Button block size="large" onClick={() => navigate(-1)}>
                        Reject
                    </Button>
                </div>
            </div>
        </article>
    )
}
export { Sign }