import React, { useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Image, } from 'antd-mobile'
import { KnsAsset } from '@/model/evm';
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { Account } from '@/chrome/account'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import IconKNS from '@/assets/icons/icon-kns.jpg'
import IconKnsText from '@/assets/icons/icon-kns-text.png'
import AddressSelectPopup from '@/components/AddressSelectPopup'


const KnsTransfer = () => {

    const { state } = useLocation()
    const [submitDisabled, setSubmitDisabled] = useState(false)
    const navigate = useNavigate();
    const { noticeError } = useNotice()
    const [popupVisible, setPopupVisible] = useState(false)

    const [knsData] = useState<KnsAsset>(state?.knsAsset)
    const [address, setAddress] = useState('')
    const [btnLoading, setBtnLoading] = useState(false)

    const transfer = async () => {
        setSubmitDisabled(true)
        try {
            setBtnLoading(true)
            let txid = await Account.transferKns(knsData.assetId, address, knsData.isDomain)
            navigate('/krc20/sendResult', { state: { txid }})
        } catch (error) {
            noticeError(error);
            setBtnLoading(false)
        }
    }

    return (
        <article className="page-box">
            <HeadNav title={`Transfer`}></HeadNav>
            <div className="content-main send-kas-page">
                <div className="coin-item">
                    <Image src={knsData.isDomain ? IconKNS : IconKnsText}
                           placeholder={<SvgIcon iconName="PngCoinDef" size={44}/>}
                           width={44} height={44}
                           fallback={<SvgIcon iconName="PngCoinDef" size={44}/>}
                           style={{borderRadius: '50%', marginRight: '12px'}} lazy fit='cover'/>
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
                        }/>
                        <div className="recipient-inp-icon" onClick={() => {
                            setPopupVisible(true)
                        }}>
                            <SvgIcon size={24} iconName="IconUser"/>
                        </div>
                    </div>
                </div>

                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" loading={btnLoading} loadingText={'Submitting'}
                            disabled={submitDisabled} onClick={() => transfer()}>
                        Sign & Pay
                    </Button>
                </div>
            </div>
            <AddressSelectPopup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                onSelect={(res) => {
                    setAddress(res.address)
                }}
            />
        </article>
    )
}
export default KnsTransfer