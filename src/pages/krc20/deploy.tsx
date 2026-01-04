import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { Button  } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import AddressSelectPopup from '@/components/AddressSelectPopup'

import { AccountsSubListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'

import { formatNumber, isValidTickString } from '@/utils/util'
import { Address as AddressHelper } from '@/utils/wallet/address';
import {NetworkTypeHelper} from "@/utils/wallet/consensus";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import {Buffer} from 'buffer'
globalThis.Buffer = Buffer;

const Deploy = () => {
    const { state } = useLocation()
    const { noticeError } = useNotice()
    const navigate = useNavigate();
    const { preference } = useSelector((state: RootState) => state.preference);

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
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)

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
                throw Error(tickError)
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

            if (preAddress.trim() != "") {
                if (!AddressHelper.validate(preAddress.trim())) {
                    throw Error("Address invalid")
                }
                let addr = AddressHelper.fromString(preAddress.trim())
                if (NetworkTypeHelper.toAddressPrefix(preference.network.networkType) !== addr.prefix) {
                    throw Error("address does not match supplied network type")
                }
            }

            if (decimal.trim() != "" && isNaN(Number(decimal.trim()))) {
                throw Error("decimal invalid")
            }

            let _decimal = BigInt(decimal.trim() || "8")
            max = max * (10n ** _decimal)
            lim = lim * (10n ** _decimal)
            let pre = preAmount.trim() == "" ? "" : (BigInt(preAmount.trim()) * (10n ** _decimal)).toString()
            const krc20data = {
                tick: tick.trim(),
                max: max.toString(),
                lim: lim.toString(),
                to: preAddress.trim(),
                dec: Number(_decimal),
                pre: pre.trim(),
            }
            navigate('/krc20/deployConfirm', {state: {data: krc20data}})
        } catch (error) {
            noticeError(`${(error as Error).message}`)
        }
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
                    let contacts = await Keyring.getAccountsSubListDisplay()
                    setAccountsValue(contacts);
                }
                break;
            default:
                break;
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='KRC20 Deploy'></HeadNav>
            <div className="content-main mint-box pb96">
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
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" disabled={btnDisabled()} color="primary" onClick={() => submit()}>
                        Next
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
export { Deploy }