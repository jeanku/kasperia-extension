import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchBar, DotLoading, List, Image, Button } from 'antd-mobile'

import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard';
import HeadNav from '@/components/HeadNav'

import { formatAddress } from '@/utils/util'

import IconKNS from '@/assets/icons/icon-kns.jpg'
import IconKnsText from '@/assets/icons/icon-kns-text.jpg'

const KnsAsset = () => {
    const { state } = useLocation()
    const navigate = useNavigate();
    const { handleCopy } = useClipboard();

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
        navigate('/kns/transfer', {
            state: {
                asset: knsData.asset
            }
        })
    }

    return (
        <article className="page-box">
            <HeadNav title={'KNS Asset'}></HeadNav>
            <div className="page-content assets-details">
                <Image
                    src={knsData.isDomain ? IconKNS : IconKnsText}
                    width={54}
                    height={54}
                    lazy={true}
                    placeholder={<SvgIcon iconName="PngCoinDef" size={54} />}
                    fallback={<SvgIcon iconName="PngCoinDef" size={54} />}
                    className="assets-logo"
                    fit='cover'
                    alt='kns'
                    style={{ borderRadius: '50%' }}
                />
                <div className="home-account mb30">
                    <section className="continer-box">
                        <div className="account-info">
                            <p className="cursor-pointer" onClick={() => handleCopy(knsData?.asset || "")} ><em className="one-line">{formatAddress(knsData?.asset, 6)}</em><SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px' }} /></p>
                            <p className="cursor-pointer" onClick={() => handleCopy(knsData?.owner || "")} ><em className="one-line">{formatAddress(knsData?.owner, 6)}</em><SvgIcon iconName="IconCopy" color="#7F7F7F" offsetStyle={{ marginLeft: '5px' }} /></p>
                        </div>
                    </section>
                </div>
                <div className="assets-info">
                    <div className="history-box">
                        <div className="history-token-item">
                            <span>Inscription Number</span>
                            <em>#{knsData.id}</em>
                        </div>
                        <div className="history-token-item">
                            <span>Asset ID</span>
                            <em>{ formatAddress(knsData.assetId) }</em>
                        </div>
                        <div className="history-token-item">
                            <span>Owner</span>
                            <em>{ formatAddress(knsData.owner) }</em>
                        </div>
                        <div className="history-token-item">
                            <span>Status</span>
                            <em>{knsData.status}</em>
                        </div>
                        <div className="history-token-item">
                            <span>Timestamp</span>
                            <em>{knsData.creationBlockTime}</em>
                        </div>
                    </div>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button className="mb12" block color="primary" onClick={() => transfer()}>
                    Transfer
                </Button>
                </div>
            </div>
        </article>
    )

}

export default KnsAsset