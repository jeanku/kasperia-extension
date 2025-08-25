import React from "react"
import { useNavigate } from "react-router-dom";
import { Button, Input } from 'antd-mobile'

import { Common } from '@/chrome/common'
import { Account } from '@/chrome/account'
import { dispatchRefreshPreference } from "@/dispatch/preference"

import HeadNav from '@/components/HeadNav'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useClipboard } from '@/components/useClipboard'

const FromPrivatekey = () => {
    const { noticeError } = useNotice();
    const { handleCopy } = useClipboard();
    const navigate = useNavigate();

    const [privateKey, setPrivateKey] = React.useState('')
    const [stepValue, setStepValue] = React.useState(1)
    const [address, setAddress] = React.useState('')
    const [btnLoading, setBtnLoading] = React.useState(false)

    const checkPrivateKey = async () => {
        try {
            let addr = await Common.addressFromPrivateKey(privateKey)
            setAddress(addr);
            setStepValue(2)
        } catch (error) {
            noticeError(error)
        }
    }

    const createAccount = async () => {
        try {
            setBtnLoading(true)
            let account = await Account.addAccountFromPrivateKey(privateKey)
            dispatchRefreshPreference(account).then(r => {
                navigate('/home')
            })
        } catch (error) {
            noticeError(error);
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
                        <Button block size="large" color="primary" disabled={ !privateKey } onClick={ checkPrivateKey }>
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