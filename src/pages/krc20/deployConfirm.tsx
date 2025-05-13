import React, { useState } from "react"
import HeadNav from '../../components/HeadNav'
import { Wallet } from '@/model/wallet'
import { Keyring } from '@/chrome/keyring'
import { KRC20, Wasm } from '@kasplex/kiwi-web'
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from 'antd-mobile'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

const DeployConfirm = () => {

    const navigate = useNavigate()
    const { noticeError } = useNotice()
    const { state } = useLocation()
    const [ txData ] = useState<any>(state?.op)

    const signPay = async () => {
        try {
            let wallet: Wallet = await Keyring.getActiveWalletKeys()
            let resp = await KRC20.deploy(new Wasm.PrivateKey(wallet.priKey), txData, 0n)
            navigate('/krc20/deployResult', {state: {txid: resp!}})
        } catch (error) {
            noticeError(error)
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='KRC20 TX Confirm'></HeadNav>

            <div className="content-main tx-confirm-box">
                <h6 className="sub-tit mt15">Mint KRC20 Token</h6>
                <div className="tx-confirm-content">
                    <div className="tx-confirm-data">
                        {JSON.stringify(txData, null, 8)}
                    </div>
                </div>
            </div>

            <div className="btn-pos-two flexd-row post-bottom">
                <Button block size="large" onClick={() => navigate(-1)}>
                    Reject
                </Button>
                <Button block size="large" color="primary" onClick={() => signPay() }>
                    Sign & Pay
                </Button>
            </div>
        </article>
)
}
export { DeployConfirm }