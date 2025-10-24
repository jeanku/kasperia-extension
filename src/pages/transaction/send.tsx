import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { Space, Checkbox, Button, Image, Popup, Tabs } from 'antd-mobile'
import {ethers} from "ethers";

import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import NoDataDom from "@/components/NoDataDom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { SvgIcon } from '@/components/Icon/index'

import { formatAddress } from '@/utils/util'
import { Address as AddressHelper } from '@/utils/wallet/address'
import { AccountsSubListDisplay } from '@/model/account'
import { TokenList } from '@/model/krc20'
import { Address } from '@/model/contact'

import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { Account } from '@/chrome/account'

import '@/styles/transaction.scss'
import {NetworkTypeHelper} from "@/utils/wallet/consensus";
import {useSelector} from "react-redux";
import {RootState} from "@/store";

const Send = () => {
    const navigate = useNavigate();

    const { state } = useLocation()
    const { noticeError } = useNotice()
    const [ token ] = useState<TokenList>(state?.token)
    const { preference } = useSelector((state: RootState) => state.preference);

    const [address, setAddress] = useState("")
    const [amount, setAmount] = useState<string>('')
    const [popupVisible, setPopupVisible] = useState(false)

    const [payloadChecked, setPayloadChecked] = useState(false)
    const [payload, setPayload] = useState('')

    const [contactTabValue, setContactTabValue] = useState<string>("")

    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)
    const [kasTips, setKasTips] = useState<string>('')

    const submitDisabled = useMemo(() => {
        if (!amount || !AddressHelper.validate(address) || Number(amount) < 0) {
            return true
        }
        return ethers.parseUnits(amount, Number(token.dec)) > BigInt(token.balance)
    }, [amount, address]);

    const sendSubmit = () => {
        if (parseFloat(amount) < 1) {
            noticeError("The transfer amount should be great than 1 KAS.")
            return
        }
        let addr = AddressHelper.fromString(address)
        if (NetworkTypeHelper.toAddressPrefix(preference.network.networkType) !== addr.prefix) {
            return noticeError("Payment output address does not match supplied network type")
        }
        navigate('/tx/sign', { state: { submitTx: {
            address: address,
            amount: ethers.parseUnits(amount, 8),
            payload: payloadChecked ? payload : undefined,
        }}})
    }

    useEffect(() => {
        switchContactTab("Contacts")
    }, [])

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

    const estimateFee = async () => {
        const fee = await Account.estimateFee(address, token.balance, payload) || 10000n
        const max = Number(token.balance) - Number(fee)
        setAmount(ethers.formatUnits(max, 8))
    }

    return (
        <article className="page-box">
            <HeadNav title={`Send  ${token.tick}`}></HeadNav>
            <div className="content-main send-kas-page">
                <div className="coin-item">
                    <Image src={`https://krc20-assets.kas.fyi/icons/${token.tick}.jpg`}
                        placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                        width={44} height={44}
                        fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                        style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />
                    <div className="coin-item-info">
                        <div className="coin-item-name">
                            <span>{token.tick}</span>
                            <span>{ethers.formatUnits(token.balance, token.dec)}</span>
                        </div>
                        <div className="coin-item-price">
                            <em>Kaspa</em>
                            <em></em>
                        </div>
                    </div>
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
                        <span>{ethers.formatUnits(token.balance, token.dec)} {token.tick}</span>
                        <strong onClick={() => estimateFee()}>MAX</strong>
                    </h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(token.dec)}
                            max={Number(ethers.formatUnits(token.balance, token.dec))}
                            allowNegative={true}
                            placeholder="amount"
                        />
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
                <div className="btn-pos-two flexd-row post-bottom">
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