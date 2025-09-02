import React, { useState, useEffect, useCallback } from "react"
import HeadNav from '../../components/HeadNav'
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Popup, Tabs  } from 'antd-mobile'
import { KasplexApi, Kiwi, Wasm, Wallet, Utils, Enum } from '@kasplex/kiwi-web'
import { formatAddress } from '@/utils/util'
import { formatNumber, isValidTickString, checkAddressPrefix } from '@/utils/util'
import { SvgIcon } from '@/components/Icon'
import { AddressListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import NoDataDom from "@/components/NoDataDom";
import NumberInput from '@/components/NumberInput';

const Deploy = () => {
    const { state } = useLocation()
    const { noticeError } = useNotice()
    const navigate = useNavigate();

    const [address, setAddress] = useState("")
    const [tick, setTick] = useState<string>(state?.tick || '')
    const [maxSupply, setMaxSupply] = useState<string>(state?.maxSupply || '100000000')
    const [limit, setLimit] = useState<string>(state?.limit || '1000')
    const [preAmount, setPreAmount] = useState<string>(state?.amountPer || '')
    const [preAddress, setPreAddress] = useState("")
    const [popupVisible, setPopupVisible] = useState(false)
    const [decimal, setDecimal] = useState<string>(state?.decimal || '')

    const [contactTabValue, setContactTabValue] = useState<string>("Recent")
    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [contactAccountValue, setContactAccountValue] = useState<AddressListDisplay[] | null>(null)

    const btnDisabled = () => {
        return !tick || !maxSupply || !limit
    }

    const getTickError = useCallback(() => {
        const tickLen = tick.trim().length;
        return (tickLen < 4 || tickLen > 6)  ? 'Ticker should be 4 to 6 letters.'  : '';
    }, [tick]);

    const submit = async () => {
        try {
            const tickError = getTickError()
            if(tickError) {
                noticeError(tickError)
                return
            }
            if (!isValidTickString(tick)) {
                throw Error("The ticker consists of 4 to 6 letters.")
            }
            if (isNaN(Number(maxSupply.trim()))) {
                throw Error("MaxSupply invalid.")
            }
            let max = BigInt(maxSupply.trim())
            if (isNaN(Number(limit.trim()))) {
                throw Error("Limit invalid.")
            }
            let lim = BigInt(limit.trim())
            if (lim > max) {
                throw Error("Limit cannot be greater than max.")
            }

            if (preAmount.trim() != "" && isNaN(Number(preAmount.trim()))) {
                throw Error("PreAmount invalid.")
            }

            if (preAmount.trim() != "" && BigInt(preAmount.trim()) > max) {
                throw Error("PreAmount cannot be greater than max.")
            }

            if (preAddress.trim() != "" && !Wallet.validate(preAddress.trim())) {
                throw Error("Address invalid")
            }

            if (preAddress.trim() != "" && !checkAddressPrefix(preAddress.trim(), Kiwi.network)) {
                throw Error("address does not match supplied network type")
            }

            if (decimal.trim() != "" && isNaN(Number(decimal.trim()))) {
                throw Error("decimal invalid")
            }

            let _decimal = BigInt(decimal.trim() || "8")
            max = max * (10n ** _decimal)
            lim = lim * (10n ** _decimal)
            let pre = preAmount.trim() == "" ? "" : (BigInt(preAmount.trim()) * (10n ** _decimal)).toString()
            const krc20data = Utils.createKrc20Data({
                p: "krc-20",
                op: Enum.OP.Deploy,
                tick: tick.trim(),
                max: max.toString(),
                lim: lim.toString(),
                to: preAddress.trim(),
                dec: _decimal.toString(),
                pre: pre.trim(),
            })

            try {
                let resp: any = await KasplexApi.getToken(tick)
                if (resp.result && resp.result[0]) {
                    if (resp.result[0].state != "unused") {
                        noticeError("tick name exist")
                        return
                    }
                }
            } catch (error) {
                noticeError(error)
                return
            }

            navigate('/krc20/deployConfirm', {state: {op: krc20data}})
        } catch (error) {
            noticeError(`${(error as Error).message}`)
        }

        console.log('submit')
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
                if (!contactAccountValue) {
                    let contacts: AddressListDisplay[] = await Keyring.getAccountListDisplay()
                    setContactAccountValue(contacts);
                }
                break;
            default:
                break;
        }
    }

    const getContactListByTab = () => {
        switch (contactTabValue) {
            case "Contacts":
                return contactValue;
            case "Accounts":
                return contactAccountValue;
            default:
                return [];
        }
    };

    const contactList = getContactListByTab() || [];
    
    return (
        <article className="page-box">
            <HeadNav title='KRC20 Deploy'></HeadNav>
            <div className="content-main mint-box">
                <div className="input-box-fix mb12">
                    <h6 className="sub-tit">Ticker</h6>
                    <div className="input-box">
                        <input type="text" placeholder="tick" value={tick} maxLength={10} onChange={(e) => setTick(e.target.value)}/>
                    </div>
                </div>
                <div className="input-box-fix mb12">
                    <h6 className="sub-tit">Max Supply: {formatNumber(maxSupply)}</h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(maxSupply)}
                            onChange={(e) => setMaxSupply(e ? e.toString() : '')}
                            decimalPlaces={0}
                            allowNegative={false}
                            placeholder="max supply"
                        />
                    </div>
                </div>
                <div className="input-box-fix mb12">
                    <h6 className="sub-tit">Amount per mint: {formatNumber(limit)}</h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(limit)}
                            onChange={(e) => setLimit(e ? e.toString() : '')}
                            decimalPlaces={0}
                            allowNegative={false}
                            placeholder="lim"
                        />
                    </div>
                </div>
                <div className="input-box-fix mb12">
                    <h6 className="sub-tit">Pre-allocation amount (Optional): {formatNumber(preAmount)}</h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(preAmount)}
                            onChange={(e) => setPreAmount(e ? e.toString() : '')}
                            decimalPlaces={0}
                            allowNegative={false}
                            placeholder="pre-allocation amount"
                        />
                    </div>
                </div>

                <div className="recipient-box mt15">
                    <h6 className="sub-tit">Pre-allocation address (Optional):</h6>
                    <div className="recipient-inp-box">
                        <input type="text" placeholder="Address" value={preAddress} onChange={e => setPreAddress(e.target.value)}/>
                        <div className="recipient-inp-icon" onClick={() => {
                            setPopupVisible(true)
                        }}>
                            <SvgIcon size={24} iconName="IconUser"/>
                        </div>
                    </div>
                </div>

                <div className="input-box-fix mt15 mb12">
                    <h6 className="sub-tit">Decimal (Optional): </h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(decimal)}
                            onChange={(e) => setDecimal(e ? e.toString() : '')}
                            decimalPlaces={0}
                            allowNegative={false}
                            placeholder="tick decimal"
                        />
                    </div>
                </div>
                <div className="mint-tip">
                    <p>1000 KAS will be paid according to the protocol and 0.3 KAS as a transaction fee. Any unused fee
                        will be refunded to your account.</p>
                </div>
                <div className="btn-pos-two">
                    <Button block size="large" disabled={btnDisabled()} color="primary" onClick={() => submit()}>
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
                    <Tabs.Tab title="Contacts" key="Contacts"/>
                    <Tabs.Tab title="My Account" key="Accounts"/>
                </Tabs>

                <div className="contact-list">
                    <div className="contact-list-box">
                    {
                        contactTabValue == "Contacts" ? (
                            contactValue && contactValue.length > 0 ? (
                                contactValue.map((item: Address, index) => (
                                    <div className="contact-list-box" key={index}>
                                        <div className="contact-list-item" key={address} onClick={() => {
                                            setPreAddress(item.address)
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
                                contactAccountValue.map((item: AddressListDisplay, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr, index) => (
                                                <div className="contact-list-item" key={dr.address} onClick={() => {
                                                    setPreAddress(dr.address)
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
                </div>
            </Popup>
        </article>
    )
}
export { Deploy }