import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, DotLoading } from 'antd-mobile'
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress, formatBalance, stringToUint8Array } from '@/utils/util'
import { Keyring } from '@/chrome/keyring'
import { Wallet } from '@/model/wallet'
import {  Tx, Wasm, Kiwi, Rpc } from '@kasplex/kiwi-web'

import { RootState } from '@/store';
import { useSelector } from "react-redux";

import RoundLine from '@/assets/icons/round-line.svg'
import '@/styles/transaction.scss'

const SendKaspa = () => {

    const navigate = useNavigate();
    const { state } = useLocation()
    const { noticeError } = useNotice()
    const [searchParams] = useSearchParams();

    const address = searchParams.get("address") || ""
    const payload = searchParams.get("payload") || ""
    const amount = searchParams.get("amount") || "0"

    const [estimateFee, setEstimateFee] = useState(0n)
    const [btnLoading, setBtnLoading] = useState(false)

    const [pendingTx, setPendingTx] = useState<Promise<Tx.PendingTransaction> | null>(null)
    const rpcClient = useSelector((state: RootState) => state.rpc.client);

    const createTx = async () => {
        try {
            let wallet: Wallet = await Keyring.getActiveWalletKeys()
            const outputs = Tx.Output.createOutputs(address, BigInt(amount))
            const fromAddress = new Wasm.PublicKey(wallet.pubKey).toAddress(Kiwi.network).toString();
            const { entries } = await Rpc.getInstance().client.getUtxosByAddresses([fromAddress])
            let data = {
                changeAddress: fromAddress,
                outputs: outputs,
                priorityFee: 0n,
                entries: entries,
                networkId: Kiwi.getNetworkID(),
                payload: payload == "" ? undefined : stringToUint8Array(payload)
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
            if (pendingTx) {
                let ptx = await pendingTx
                let resp = await ptx.submit()
                setBtnLoading(false)
                navigate('/tx/result', { state: { submitTx: {
                    address, payload, amount,
                    token: {
                        balance: "",
                        dec: "8",
                        locked: "0",
                        name: "KAS"
                    },
                }, txid: resp! }})
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
                        <p className="color-white">{formatAddress(address)}</p>
                    </div>
                    <img src={RoundLine} alt="round-line" />
                    <div className="sign-card-bg">
                        <strong>Spend amount</strong>
                        <h6>{formatBalance(amount, 8)} KAS</h6>
                        {
                            <p>{estimateFee === 0n ? (
                                <DotLoading color='#74E6D8' />
                            ) : `${formatBalance(estimateFee.toString(), 8)} kas fee`}</p>
                        }
                    </div>
                </div>
                {payload !== "" ?
                    <>
                        <h6 className="sub-tit">Payload</h6>
                        <div className="text-area">
                            <textarea placeholder="Please enter the payload" disabled rows={3} value={payload} />
                        </div>
                    </>

                    : null
                }
                <div className="btn-pos-two">
                    <Button block size="large" color="primary"
                            disabled={ pendingTx == null}
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
export { SendKaspa }