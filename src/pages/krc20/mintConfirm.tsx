import React, { useState, useEffect } from "react"
import HeadNav from '../../components/HeadNav'
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from 'antd-mobile'
import { useSelector } from "react-redux";
import { RootState } from '../../store';
import { formatAddress } from '../../utils/util';

const MintConfirm = () => {

    const navigate = useNavigate();
    const { preference} = useSelector((state: RootState) => state.preference);
    const [address, setAddress] = useState<string>('')

    const { state } = useLocation()

    const [tick] = useState<string>(state?.tick)
    const [times] = useState<string>(state?.times)
    const [useUtxo] = useState<boolean>(state?.useUtxo)

    const txData = { "p": "krc-20", "op": "mint", "tick": tick }

    useEffect(() => {
        setAddress(preference!.currentAccount!.address)
    }, [preference])

    const signPay = async () => {
        navigate('/krc20/mintResult', {state : { tick, times, useUtxo }})
    }

    return (
        <article className="page-box">
            <HeadNav title='KRC20 TX Confirm'></HeadNav>
            <div className="content-main assets-details  tx-confirm-box">
                <h6 className="sub-tit mt15">Mint KRC20 Token</h6>
                <div className="tx-confirm-content">
                    <div className="tx-confirm-data">
                        {JSON.stringify(txData, null, 8)}
                    </div>
                </div>
                <div className="history-token-item mt30">
                    <span>Mint Times</span>
                    <em>{times}</em>
                </div>
                <div className="history-token-item">
                    <span>Mint Address</span>
                    <em>{formatAddress(address)}</em>
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
export { MintConfirm }