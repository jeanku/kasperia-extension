import React, { useState, useMemo, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Space, Checkbox, Button, Image, Popup, Tabs } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useNavigate } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatBalance, formatAddress, checkAddressPrefix, toTokenUnits } from '@/utils/util'
import { Kiwi, Wallet, Wasm } from '@kasplex/kiwi-web'
import { Big } from 'big.js';
import { AddressBook } from '@/model/transaction'
import { TokenList } from '@/model/krc20'
import { Address } from '@/model/contact'
import NumberInput from '@/components/NumberInput';
import NoDataDom from "@/components/NoDataDom";
import { KaspaEnum } from '@/types/enum'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { useLocation } from 'react-router-dom'

import '@/styles/transaction.scss'

const Send = () => {
    const navigate = useNavigate();

    const { state } = useLocation()
    const { noticeError } = useNotice()
    const [ token ] = useState<TokenList>(state?.token)

    const [address, setAddress] = useState("")
    const [amount, setAmount] = useState<number | ''>('')
    const [popupVisible, setPopupVisible] = useState(false)

    const [payloadChecked, setPayloadChecked] = useState(false)
    const [payload, setPayload] = useState('')

    const [contactTabValue, setContactTabValue] = useState<string>("")

    const [contactValue, setContactValue] = useState<AddressBook[] | null>(null)
    const [contactAccountValue, setContactAccountValue] = useState<AddressBook[] | null>(null)
    const [kasTips, setKasTips] = useState<string>('')

    const submitDisabled = useMemo(() => {
        if (!amount) {
            return true
        }
        if (!Wallet.validate(address)) return true
        if (Number(amount) < 0) return true
        const amountBig = Big(Number(amount) * 10 ** Number(token.dec));
        const balance = Big(token.balance);
        if (amountBig.gt(balance)) return true;
        return false
    }, [amount, address]);

    const sendSubmit = () => {
        if (token.name.toUpperCase() == KaspaEnum.KAS && Big(amount!).lt(Big(1))) {
            noticeError("The transfer amount should be great than 1 KAS.")
            return
        }

        if (!checkAddressPrefix(address, Kiwi.network)) {
            noticeError("Payment output address does not match supplied network type")
        } else {
            navigate('/tx/sign', { state: { submitTx: {
                address: address,
                amount: toTokenUnits(amount, token.dec),
                payload: payloadChecked ? payload : undefined,
                token
            }}})

        }
    }

    useEffect(() => {
        switchContactTab("Contacts")
    }, [])

    useEffect(() => {
        if (amount && token.tick === 'KAS') {
            const amountBig = Big(Number(amount) * 10 ** Number(token.dec));
            const balance = Big(token.balance);
            if (amountBig.gte(balance)) {
                setKasTips('KAS transfer requires deduction of handling fees')
                return
            }
        } 
        setKasTips('')
    }, [amount, token.tick])

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
                if (!contactAccountValue) {
                    let contacts: AddressBook[] = await Keyring.getAccountBook()
                    contacts = contacts.map((item) => {
                        item.drive = item.drive!.map(r => {
                            r.address = new Wasm.PublicKey(r.pubKey).toAddress(Kiwi.network).toString()
                            return r
                        })
                        return item
                    })
                    setContactAccountValue(contacts);
                }
                break;
            default:
                break;
        }
    }

    return (
        <article className="page-box">
            <HeadNav title={`Send  ${token.name}`}></HeadNav>
            <div className="content-main send-kas-page">
                <div className="coin-item" onClick={() => navigate('/tx/chooseToken')}>
                    <Image src={`https://krc20-assets.kas.fyi/icons/${token.tick}.jpg`}
                        placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                        width={44} height={44}
                        fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                        style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
                    <div className="coin-item-info">
                        <div className="coin-item-name">
                            <span>{token.name}</span>
                            <span>{formatBalance(token.balance, token.dec)}</span>
                        </div>
                        <div className="coin-item-price">
                            <em>{token.name.toLowerCase() == "kas" ? "Kaspa" : "Krc20"}</em>
                            <em></em>
                        </div>
                    </div>
                    <SvgIcon size={26} iconName="arrowRight" />
                </div>
                <div className="recipient-box mt15">
                    <h6 className="sub-tit">Recipient</h6>
                    <div className="recipient-inp-box">
                        <input type="text" placeholder="Address" value={address} onChange={
                            e => setAddress(e.target.value)
                        } />
                        <div className="recipient-inp-icon" onClick={() => {
                            setPopupVisible(true)
                        }}>
                            <SvgIcon size={24} iconName="IconUser" />
                        </div>
                    </div>
                </div>
                <div className="amount-box mt15 mb12">
                    <h6 className="sub-tit">
                        Transfer amount
                        <span>{formatBalance(token.balance, token.dec)} {token.tick}</span>
                    </h6>
                    <div className="input-box">
                        <NumberInput
                            value={amount}
                            onChange={(e) => setAmount(Number(e))}
                            decimalPlaces={Number(token.dec)}
                            max={Number(formatBalance(token.balance, token.dec))}
                            allowNegative={true}
                            placeholder="admount"
                        />
                        <div className="input-box-icon">
                            <span></span>
                            <strong onClick={() => setAmount(Number(formatBalance(token.balance, token.dec)))}>MAX</strong>
                        </div>
                    </div>
                </div>

                <div className="page-check check-span-pl0">
                    <Space direction='vertical' block>
                        <Checkbox block onChange={(val: boolean) => setPayloadChecked(val)}
                            icon={(payloadChecked) => (payloadChecked ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" /> : <SvgIcon iconName="IconCheck" />)}
                        >payload</Checkbox>
                    </Space>
                </div>
                {payloadChecked ? <div className="text-area">
                    <textarea placeholder="Please enter the payload" rows={3} value={payload}
                        onChange={(e) => setPayload(e.target.value)} />
                </div> : null}
                <div className="tip-error warning">
                    <p>{ kasTips }</p>
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" color="primary" disabled={submitDisabled} onClick={() => sendSubmit()}>
                        Next
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
                                contactValue.map((item: AddressBook, index) => (
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
                            contactAccountValue && contactAccountValue.length > 0 ? (
                                contactAccountValue.map((item: AddressBook, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr, index) => (
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
export { Send }