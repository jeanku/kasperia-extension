import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchBar, DotLoading, List, Image, Button } from 'antd-mobile'

import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'

import { formatAddress, formatBalance, formatDate, formatHash, formatDecimal, formatBalanceFixed } from "@/utils/util"
import IconKNS from '@/assets/icons/icon-kns.jpg'
import IconKnsText from '@/assets/icons/icon-kns-text.jpg'
const KnsTransfer = () => {
    const [submitDisabled, setSubmitDisabled] = useState(false)

    const [address, setAddress] = useState('')
    const [knsData, setKnsData] = useState({
        "id": "14789",
        "assetId": "3435d7ad879bfa8443802388a1f5a66491cad63e513ce5d038d6aff6eea5f826i0",
        "mimeType": "",
        "asset": "yeren.kas",
        "owner": "kaspatest:qpul45k8lvgwdd50f2k8gku5lc5dqc3d2xnvxchkz4csylwy8dl9kwdseejfz",
        "creationBlockTime": "2025-12-24T08:57:00.962Z",
        "isDomain": true,
        "isVerifiedDomain": true,
        "status": "default",
        "transactionId": "3435d7ad879bfa8443802388a1f5a66491cad63e513ce5d038d6aff6eea5f826"
    })

    const transfer = () => {
        setSubmitDisabled(true)
    }

    return (
        <article className="page-box">
            <HeadNav title={`Transfer`}></HeadNav>
            <div className="content-main send-kas-page">
                <div className="coin-item">
                    <Image src={knsData.isDomain ? IconKNS : IconKnsText}
                        placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                        width={44} height={44}
                        fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                        style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
                    <div className="coin-item-info">
                        <div className="coin-item-name">
                            <span>{knsData.asset}</span>
                        </div>
                    </div>
                </div>
                <div className="recipient-box mt15">
                    <h6 className="sub-tit">From</h6>
                    <div className="coin-item">
                        <div className="coin-item-info">
                            <div className="coin-item-name">
                                <span className="break-word">{knsData.owner}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="recipient-box mt15">
                    <h6 className="sub-tit">To</h6>
                    <div className="recipient-inp-box">
                        <input type="text" placeholder="Address" value={address} onChange={
                            e => setAddress(e.target.value)
                        } />
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" disabled={submitDisabled} onClick={() => transfer()}>
                        Next
                    </Button>
                </div>
            </div>
        </article>
    )
}

export default KnsTransfer