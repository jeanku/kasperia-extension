import React, {useEffect, useState} from 'react'
import { useNavigate } from "react-router-dom";
import {Button, Mask, SpinLoading} from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useLocation } from 'react-router-dom'
import { formatAddress } from '@/utils/util'

import IconSuccess from '@/assets/images/icon-success.png'
import '@/styles/transaction.scss'
import {EvmNetwork, EvmTokenList} from "@/model/evm";
import {AccountEvm} from "@/chrome/accountEvm";
import {useNotice} from "@/components/NoticeBar/NoticeBar";
import {TransactionRequest} from "ethers/src.ts/providers/provider";

const SendResult = () => {
    const navigate = useNavigate();
    const { state } = useLocation()
    const { noticeError } = useNotice()

    const [hash, setHash ] = useState<string>("")
    const [network ] = useState<EvmNetwork>(state?.network)
    const [tx] = useState<TransactionRequest>(state?.tx)
    const [token] = useState<EvmTokenList>(state?.token)
    const [loading, setLoading] = useState(true)
    const [sendTo] = useState<{
        address: string,
        amount: string,
    }>(state?.sendTo)

    const openTxExplorer = () => {
        if(!hash || !network.explorer) return
        window.open(`${network.explorer}/tx/${hash}`);
    }

    const sendTx = async () => {
        try {
            let hash = await AccountEvm.sendTransaction(tx)
            setHash(hash)
        } catch (error) {
            noticeError(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        sendTx()
    }, [])

    return (
        <article className="page-box">
            <Mask visible={loading}>
                <SpinLoading className='loading-fixed' style={{ '--size': '32px' }} color='primary'  />
            </Mask>

            <div className="content-main send-result">
                <div className='send-result-txt'>
                    <img className='result-img' src={IconSuccess} alt="success" />
                    <h6>Sent</h6>
                    <p className='send-result-p'>{sendTo.amount} {token.symbol} was successfully sent to</p>
                    <p className='send-result-p'>{formatAddress(sendTo.address, 12)}</p>
                    <p className='send-result-share' onClick={() => openTxExplorer()}><SvgIcon color="#74E6D8" offsetStyle={{marginRight: '6px'}} iconName="IconShare" />View transaction</p>
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" onClick={() => navigate('/home')}>
                        Done
                    </Button>
                </div>
            </div>
        </article>
    )
}

export default SendResult