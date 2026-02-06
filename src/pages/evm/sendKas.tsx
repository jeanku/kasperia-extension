import { useState, useMemo, useEffect, useCallback } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Image } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { useNavigate } from "react-router-dom";
import {formatBalanceFixed} from '@/utils/util'
import {ethers} from "ethers";
import { AccountsSubListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import NumberInput from '@/components/NumberInput';
import AddressSelectPopup from '@/components/AddressSelectPopup'
import { AddressType } from '@/types/enum'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { useLocation } from 'react-router-dom'
import '@/styles/transaction.scss'
import {EvmTokenList, EvmNetwork} from "@/model/evm";


const SendKas = () => {
    const navigate = useNavigate();
    const { state } = useLocation()

    const [token] = useState<EvmTokenList>(state?.token)
    const [network] = useState<EvmNetwork>(state?.network)

    const [address, setAddress] = useState("")
    const [amount, setAmount] = useState<number | ''>('')
    const [popupVisible, setPopupVisible] = useState(false)
    const [contactTabValue, setContactTabValue] = useState<string>("")
    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)

    const submitDisabled = useMemo(() => {
        return !amount || !ethers.isAddress(address) || amount > Number(token.balance || "0" || amount < 0)
    }, [amount, address]);

    const sendSubmit = () => {
        navigate('/evm/sendCommit', { state: { token: token, network: network, sendTo: {address, amount: amount.toString()}}})
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
                    let contacts: Address[] = await Contact.get(AddressType.EvmAddress)
                    setContactValue(contacts)
                }
                break
            case "Accounts":
                if (!accountsValue) {
                    let accounts = await Keyring.getAccountsSubListDisplay(AddressType.EvmAddress)
                    setAccountsValue(accounts);
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
                <div className="coin-item">
                    <Image src={`https://krc20-assets.kas.fyi/icons/${token.symbol}.jpg`}
                        placeholder={<SvgIcon iconName="PngCoinDef" size={44} />}
                        width={44} height={44}
                        fallback={<SvgIcon iconName="PngCoinDef" size={44} />}
                        style={{ borderRadius: '50%', marginRight: '12px' }} lazy fit='cover' />

                    <div className="coin-item-info">
                        <div className="coin-item-name">
                            <span>{token.name}</span>
                            <span>{ formatBalanceFixed(token.balance) }</span>
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
                        <span>{formatBalanceFixed(token.balance)} {token.symbol}</span>
                        <strong onClick={() => setAmount(Number(token.balance))}>MAX</strong>
                    </h6>
                    <div className="input-box">
                        <NumberInput
                            value={amount}
                            onChange={(e) => setAmount(Number(e))}
                            decimalPlaces={Number(8)}
                            max={Number(token.balance)}
                            placeholder="amount"
                        />
                    </div>
                </div>

                <div className="btn-pos-two">
                    <Button block size="large" color="primary" disabled={submitDisabled} onClick={() => sendSubmit()}>
                        Next
                    </Button>
                </div>
            </div>
            <AddressSelectPopup
                visible={popupVisible}
                isKaspa={ false }
                onClose={() => setPopupVisible(false)}
                onSelect={(res: any) => {
                    setAddress(res.address)
                }}
            />
        </article>
    )
}

export default SendKas