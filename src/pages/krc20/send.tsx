import { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Image, } from 'antd-mobile'
import { ethers } from "ethers";

import HeadNav from '@/components/HeadNav'
import NumberInput from '@/components/NumberInput';
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import AddressSelectPopup from '@/components/AddressSelectPopup'

import { formatBalance } from '@/utils/util'
import { Address as AddressHelper } from '@/utils/wallet/address'
import { TokenList } from '@/model/krc20'

import '@/styles/transaction.scss'
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { NetworkTypeHelper } from "@/utils/wallet/consensus";

const Send = () => {
    const navigate = useNavigate();

    const { state } = useLocation()
    const { noticeError } = useNotice()
    const [ token ] = useState<TokenList>(state?.token)
    const { preference } = useSelector((state: RootState) => state.preference);

    const [address, setAddress] = useState("")
    const [amount, setAmount] = useState<string>("")
    const [popupVisible, setPopupVisible] = useState(false)

    const [kasTips, setKasTips] = useState<string>('')

    const submitDisabled = useMemo(() => {
        if (!amount || !AddressHelper.validate(address) || Number(amount) < 0) {
            return true
        }
        return ethers.parseUnits(amount, Number(token.dec)) > BigInt(token.balance)
    }, [amount, address]);

    const sendSubmit = () => {
        let addr = AddressHelper.fromString(address)
        if (NetworkTypeHelper.toAddressPrefix(preference.network.networkType) !== addr.prefix) {
            return noticeError("Payment output address does not match supplied network type")
        }
        navigate('/krc20/sendSign', { state: { submitTx: {
            address: address,
            amount: ethers.parseUnits(amount, Number(token.dec)),
            token
        }}})
    }

    return (
        <article className="page-box">
            <HeadNav title={`Send  ${token.name}`}></HeadNav>
            <div className="content-main send-kas-page">
                <div className="coin-item">
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
                        <span>{formatBalance(token.balance, token.dec)} {token.tick}</span>
                        <strong onClick={() => setAmount(ethers.formatUnits(token.balance, Number(token.dec)))}>MAX</strong>
                    </h6>
                    <div className="input-box">
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(token.dec)}
                            max={Number(formatBalance(token.balance, token.dec))}
                            allowNegative={true}
                            placeholder="amount"
                        />
                    </div>
                </div>

                <div className="tip-error warning">
                    <p>{ kasTips }</p>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" disabled={submitDisabled} onClick={() => sendSubmit()}>
                        Next
                    </Button>
                </div>
            </div>
            <AddressSelectPopup
                visible={popupVisible}
                isKaspa={ true }
                onClose={() => setPopupVisible(false)}
                onSelect={(res) => {
                    setAddress(res.address)
                }}
            />
        </article>
    )
}
export { Send }