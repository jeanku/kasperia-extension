import { useState } from "react"
import { SendOutline } from 'antd-mobile-icons'
import { useLocation } from 'react-router-dom'
import {useSelector} from "react-redux";

import HeadNav from '@/components/HeadNav'
import { useClipboard } from '@/components/useClipboard'
import { SvgIcon } from '@/components/Icon/index'

import { KaspaExplorerUrl } from '@/types/enum'
import { TokenList, Oplist as OplistModel } from '@/model/krc20';
import { formatBalance, formatDate, formatAddress, formatHash } from '@/utils/util'

import '@/styles/account.scss'
import {RootState} from "@/store";
import {NetworkType} from "@/utils/wallet/consensus";

const OpInfo = () => {
    const { state } = useLocation()
    const { preference } = useSelector((state: RootState) => state.preference);


    const { handleCopy } = useClipboard()
    const [opinfo] = useState<OplistModel | null>(state?.opinfo)
    const [token] = useState<TokenList>(state?.token)

    const openKasplexTx = (txid: string) => {
        if(!txid) return
        const networkName = preference.network.networkType === NetworkType.Mainnet ? 'Mainnet' : 'Testnet';
        window.open(`${KaspaExplorerUrl[networkName]}${txid}`);
    }

    return (
        <article className="page-box">
            <HeadNav title="Krc20 op information"></HeadNav>
            <div className="page-content assets-details">
                <div className="history-token-item">
                    <span>Tick</span>
                    <em>{opinfo?.tick || opinfo?.name || token?.ca}</em>
                </div>
                <div className="history-token-item">
                    <span>OP Type</span>
                    <em>{opinfo?.op}</em>
                </div>
                {
                    token && token.dec ? 
                    <div className="history-token-item">
                        <span>OP Decimal</span>
                        <em>{token.dec}</em>
                    </div> : null
                }
                
                <div className="history-token-item">
                    <span>Amount</span>
                    <em>{formatBalance(opinfo?.amt || "", opinfo?.dec || (token && token.dec) || '8' ) || '-'} </em>
                </div>
                <div className="history-token-item">
                    <span>From</span>
                    <em className="cursor-pointer" onClick={() => handleCopy(opinfo?.from || "")}>{formatAddress(opinfo?.from || "", 6)}<SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px',marginRight: '-12px'}} /></em>
                </div>
                <div className="history-token-item">
                    <span>To</span>
                    <em className="cursor-pointer" onClick={() => handleCopy(opinfo?.to || "")}>{formatAddress(opinfo?.to || "", 6)}<SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', marginRight: '-12px'}} /></em>
                </div>
                <div className="history-token-item">
                    <span>OP Score</span>
                    <em>{opinfo?.opScore || ""}</em>
                </div>
                <div className="history-token-item">
                    <span>Reveal Fee</span>
                    <em>{formatBalance(opinfo?.feeRev || "", 8)} Kas</em>
                </div>
                <div className="history-token-item">
                    <span>TX State</span>
                    <em>{opinfo?.txAccept === "1" ? "Confirmed" : "Failed"}</em>
                </div>
                <div className="history-token-item">
                    <span>OP State</span>
                    <em>{opinfo?.opAccept === "1" ? "Accepted" : "Failed"}</em>
                </div>
                <div className="history-token-item">
                    <span>OP Error</span>
                    <em>{opinfo?.opError || "-"}</em>
                </div>
                <div className="history-token-item">
                    <span>OP Create at</span>
                    <em>{formatDate(opinfo?.mtsAdd || "")}</em>
                </div>

                <div className="history-token-item">
                    <span>Reveal TX</span>
                    <em onClick={() => openKasplexTx(opinfo?.hashRev || "")}
                        className="history-href">{formatHash(opinfo?.hashRev || "", 10, 8)} <SendOutline className="ml5" /></em>
                </div>
            </div>
        </article>
    )
}

export { OpInfo }