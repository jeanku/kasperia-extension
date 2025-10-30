import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from 'antd-mobile'

import HeadNav from '@/components/HeadNav'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import {Account} from "@/chrome/account";
import {Krc20DeployOptions} from "@/utils/wallet/krc20";

const DeployConfirm = () => {

    const navigate = useNavigate()
    const { noticeError } = useNotice()
    const { state } = useLocation()
    const [ data ] = useState<Krc20DeployOptions>(state?.data)

    const signPay = async () => {
        try {
            let txid: string = await Account.deployKrc20(data)
            navigate('/krc20/deployResult', {state: { txid }})
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
                        {JSON.stringify(data, null, 8)}
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