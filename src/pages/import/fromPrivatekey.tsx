import React from "react"
import { useNavigate } from "react-router-dom";
import HeadNav from '@/components/HeadNav'
import { Button, Input } from 'antd-mobile'
import { Wallet as WalletModel } from '@/model/wallet'
import { Keyring } from '@/chrome/keyring'
import { Kiwi, Wallet } from '@kasplex/kiwi-web'
import { AccountType } from '@/types/enum'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useClipboard } from '@/components/useClipboard'
import { dispatchPreferenceAddNewAccount } from "@/dispatch/preference"

const FromPrivatekey = () => {
    const { noticeError } = useNotice();
    const { handleCopy } = useClipboard();
    const navigate = useNavigate();

    const [privateKey, setPrivateKey] = React.useState('')
    const [stepValue, setStepValue] = React.useState(1)
    const [address, setAddress] = React.useState('')
    const [btnLoading, setBtnLoading] = React.useState(false)

    const submitDisabledKey = () => {
        try {
            if (privateKey === "") {
                return true
            }
            let wallet = Wallet.fromPrivateKey(privateKey)
            let _address = wallet.toAddress(Kiwi.network).toString()
            if (address !== _address) {
                setAddress(_address)
            }
            return false
        } catch (error) {
            console.error("error", error)
        }
        return true
    }

    const createAccount = async () => {
        try {
            let wallet = Wallet.fromPrivateKey(privateKey)
            let _wallet: WalletModel = {
                id: "",
                mnemonic: "",
                name: "",
                priKey: wallet.toPrivateKey().toString(),
                pubKey: wallet.toPublicKey().toString(),
                index: 0,
                active: true,
                type: AccountType.PrivateKey,
                accountName: ""
            }
            setBtnLoading(true)
            await Keyring.addWallet(_wallet)
            dispatchPreferenceAddNewAccount().then(r => {
                setBtnLoading(false)
                navigate('/home')
            })
        } catch (error) {
            let content = error instanceof Error ? error.message : 'system error.';
            noticeError(content);
            setBtnLoading(false)
        }
    }

    return (
        <div className="page-box">
            <HeadNav title='Create Single Wallet'></HeadNav>
            <article className="page-mnemonic">
                <div className="page-btn-tab">
                    <div className={`btn-tab-item ${stepValue === 1 ? 'active' : ''}`} onClick={() => setStepValue(1)}>Step 1</div>
                    <div className={`btn-tab-item ${stepValue === 2 ? 'active' : ''}`}>Step 2</div>
                </div>
                <div className={stepValue === 1 ? "visable" : "hidden"}>
                    <article className="mnemonic-export">
                        <h6 className="page-sub-tit">Private key</h6>
                        <div className="page-input">
                            <Input
                                placeholder='HEX private key'
                                value={privateKey}
                                clearable
                                onChange={val=> setPrivateKey(val)}
                            />
                        </div>
                    </article>
                    <div className="mnemonic-btn-pos">
                        <Button block size="large" color="primary" disabled={submitDisabledKey()} onClick={() => setStepValue(2)}>
                            Continue
                        </Button>
                    </div>
                </div>
                <div className={stepValue === 2 ? "visable" : "hidden"}>
                    <article className="mnemonic-step2">
                        <h6 className="page-sub-tit">Address type</h6>
                        <div className="page-sel-def">
                            <div className="sel-def-txt">
                                <span>Default</span>
                                <SvgIcon iconName="IconRight" color='#FFFFFF' /> 
                            </div>
                            <div className="sel-def-address" onClick={() => handleCopy(address) }>
                                <SvgIcon iconName="IconCopy" size={26} color='#FFFFFF' /> 
                                <span>{address}</span>
                            </div>
                        </div>
                        <div className="mnemonic-btn-pos">
                            <Button block size="large" loading={btnLoading} loadingText={'Continue'} color="primary" onClick={() => createAccount()}>
                                Continue
                            </Button>
                        </div>
                    </article>

                </div>
            </article>
        </div>
    )
}
export { FromPrivatekey }