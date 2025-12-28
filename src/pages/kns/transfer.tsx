import React, { useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Image, Popup, Tabs } from 'antd-mobile'
import { KnsAsset } from '@/model/evm';
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { Account } from '@/chrome/account'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress } from "@/utils/util"
import IconKNS from '@/assets/icons/icon-kns.jpg'
import IconKnsText from '@/assets/icons/icon-kns-text.png'
import { Address } from '@/model/contact'
import { AccountsSubListDisplay } from '@/model/account'
import { Contact } from '@/chrome/contact'
import { Keyring } from '@/chrome/keyring'
import NoDataDom from "@/components/NoDataDom";

const KnsTransfer = () => {

    const { state } = useLocation()
    const [submitDisabled, setSubmitDisabled] = useState(false)
    const navigate = useNavigate();
    const { noticeError } = useNotice()
    const [popupVisible, setPopupVisible] = useState(false)
    const [contactTabValue, setContactTabValue] = useState<string>("")
    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)


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

    const switchContactTab = async (key: string) => {
        if (key === contactTabValue) return
        setContactTabValue(key)
        switch (key) {
            case "Contacts":
                if (!contactValue) {
                    let contacts: Address[] = await Contact.get()
                    setContactValue(contacts)
                }
                break
            case "Accounts":
                if (!accountsValue) {
                    let accounts = await Keyring.getAccountsSubListDisplay()
                    setAccountsValue(accounts);
                }
                break;
            default:
                break;
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

            <Popup
                visible={popupVisible}
                className="wallet-popup"
                bodyClassName="wallet-popup-body"
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
                onClose={() => {
                    setPopupVisible(false)
                }}
                bodyStyle={{ height: '46vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll' }}
            >
                <Tabs activeKey={contactTabValue} onChange={key => {
                    switchContactTab(key)
                }}>
                    <Tabs.Tab title="Contacts" key="Contacts" />
                    <Tabs.Tab title="My Account" key="Accounts" />
                </Tabs>

                <div className="contact-list">
                    {
                        contactTabValue == "Contacts" ? (
                            contactValue && contactValue.length > 0 ? (
                                contactValue.map((item: Address, index) => (
                                    <div className="contact-list-box" key={index}>
                                        <div className="contact-list-item" key={address} onClick={() => {
                                            setAddress(item.address)
                                            setPopupVisible(false)
                                        }}>
                                            <span>{item.name}</span>
                                            <em>{formatAddress(item.address, 8)}</em>
                                        </div>
                                    </div>
                                ))
                            ) : <NoDataDom />
                        ) : null
                    }

                    {
                        contactTabValue == "Accounts" ? (
                            accountsValue && accountsValue.length > 0 ? (
                                accountsValue.map((item, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr) => (
                                                <div className="contact-list-item" key={dr.address} onClick={() => {
                                                    setAddress(dr.address)
                                                    setPopupVisible(false)
                                                }}>
                                                    <span>{dr.name}</span>
                                                    <em>{formatAddress(dr.address, 8)}</em>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            ) :  <NoDataDom />
                        ) : null
                    }
                </div>
            </Popup>
        </article>
    )
}
export default KnsTransfer