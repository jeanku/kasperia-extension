import React, { useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { Image, Button } from 'antd-mobile'

import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard';
import HeadNav from '@/components/HeadNav'
import { KnsAsset } from '@/model/evm';

import { formatAddress } from '@/utils/util'

import IconKNS from '@/assets/icons/icon-kns.jpg'
import IconKnsText from '@/assets/icons/icon-kns-text.png'
import IconKnsSel from '@/assets/icons/icon-kns-sel.svg'

const KnsAssetPage = () => {
    const { state } = useLocation()
    const navigate = useNavigate();
    const { handleCopy } = useClipboard();

    const [knsData] = useState<KnsAsset>(state?.knsAsset)

    const transfer = () => {
        navigate('/kns/transfer', {
            state: {
                knsAsset: knsData
            }
        })
    }

    return (
        <article className="page-box">
            <HeadNav title={'KNS Asset'}></HeadNav>
            <div className="page-content assets-details">
                <div className="kns-sel-box">
                {
                    knsData.isVerifiedDomain &&  <img src={IconKnsSel } alt="" className="check-icon-sm" />
                }
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
                </div>
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

export default KnsAssetPage