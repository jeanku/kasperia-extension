import React, {useState} from 'react'
import {useLocation, useNavigate} from "react-router-dom";
import {Button} from 'antd-mobile'
import {SvgIcon} from '@/components/Icon/index'
import {formatAddress} from '@/utils/util'

import IconSuccess from '@/assets/images/icon-success.png'
import '@/styles/transaction.scss'
import {EvmNetwork} from "@/model/evm";

const SendResult = () => {
    const navigate = useNavigate();
    const {state} = useLocation()

    const [hash, setHash] = useState<string>(state?.hash)
    const [network] = useState<EvmNetwork>(state?.evmNetwork)
    const [sendTo] = useState<{
        address: string,
        amount: string,
    }>(state?.sendTo)

    const openTxExplorer = () => {
        if (!hash || !network.explorer) return
        window.open(`${network.explorer}/tx/${hash}`);
    }

    return (
        <article className="page-box">
            <div className="content-main send-result">
                <div className='send-result-txt'>
                    <img className='result-img' src={IconSuccess} alt="success"/>
                    <h6>Sent</h6>
                    <p className='send-result-p'>{sendTo.amount} {network.symbol} was successfully sent to target
                        address</p>
                    <p className='send-result-p'>{formatAddress(sendTo.address, 12)}</p>
                    <p className='send-result-share' onClick={() => openTxExplorer()}><SvgIcon color="#74E6D8"
                                                                                               offsetStyle={{marginRight: '6px'}}
                                                                                               iconName="IconShare"/>View
                        transaction</p>
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