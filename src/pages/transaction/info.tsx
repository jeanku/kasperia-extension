import React, { useState } from "react"
import HeadNav from '../../components/HeadNav'
import { KaspaExplorerUrl } from '../../types/enum'
import { Kiwi } from '@kasplex/kiwi-web'
import { hexToString } from '@/utils/util'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useClipboard } from '@/components/useClipboard'
import { formatBalance, formatDate, formatAddress, formatHash } from '../../utils/util'
import { Transaction } from '../../model/kaspa'
import { SendOutline } from 'antd-mobile-icons'
import { SvgIcon } from '@/components/Icon/index'

import '../../styles/account.scss'
import { useLocation } from 'react-router-dom'

const Info = () => {

    const { state } = useLocation()
    const { handleCopy } = useClipboard()
    const { noticeSuccess, noticeError } = useNotice()
    const [tx, _] = useState<Transaction | null>(state?.tx)

    const openKasplexTx = (tx: string) => {
        if(!tx) return
        const networkName = Kiwi.network === 0 ? 'Mainnet' : 'Testnet';
        window.open(`${KaspaExplorerUrl[networkName]}${tx}`);
    }

    return (
        <article className="page-box">
            <HeadNav title="Kas op information"></HeadNav>
            <div className="page-content assets-details">
                <div className="history-token-item">
                    <span>Network</span>
                    <em>{Kiwi.network === 0 ? 'Mainnet' : 'Testnet'}</em>
                </div>
                <div className="history-token-item">
                    <span>TX ID</span>
                    <em onClick={() => openKasplexTx(tx?.transaction_id || "")}
                        className="history-href">{formatHash(tx?.transaction_id || "", 10, 8)} <SendOutline className="ml5"/></em>
                </div>
                <div className="history-token-item">
                    <span>TX Hash</span>
                    <em className="cursor-pointer" onClick={() => handleCopy(tx?.hash || "")}>{formatHash(tx?.hash || "")}
                    <SvgIcon size={26} iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}}/></em>
                </div>
                <div className="history-token-item">
                    <span>Accept Hash</span>
                    <em className="cursor-pointer" onClick={() => handleCopy(tx?.accepting_block_hash || "")}>{formatHash(tx?.accepting_block_hash || "")}
                        <SvgIcon size={26} offsetStyle={{marginLeft: '5px', marginRight: '-12px'}} iconName="IconCopy"/></em>
                </div>
                <div className="history-token-item">
                    <span>Mass</span>
                    <em>{tx?.mass || ""}</em>
                </div>
                {
                    tx?.payload ? 
                    <div className="payload-text mb12">
                        <span>Payload</span>
                        <textarea placeholder="Please enter the payload" disabled rows={3} value={hexToString(tx?.payload || "")}/>
                    </div> : null
                }
                <div className="history-token-item">
                    <span>TX Amount</span>
                    <em>{formatBalance((tx?.amount || 0 - (tx?.fee || 0)).toString() || "", 8)} Kas</em>
                </div>
                <div className="history-token-item">
                    <span>Accept</span>
                    <em>{tx?.is_accepted ? "Success" : "Failed"}</em>
                </div>
                <div className="history-token-item">
                    <span>Block Time</span>
                    <em>{formatDate(tx?.block_time?.toString() || "")}</em>
                </div>
                <div className="history-token-item">
                    <span>Accept Time</span>
                    <em>{formatDate(tx?.accepting_block_time?.toString() || "")}</em>
                </div>
                <div className="history-token-item">
                    <span>TX Fee</span>
                    <em>{formatBalance(tx?.fee?.toString() || "", 8) || "-"} Kas</em>
                </div>
            </div>
        </article>
    )
}
export {Info}