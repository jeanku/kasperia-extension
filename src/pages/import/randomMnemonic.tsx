import React, { useEffect, useState } from 'react';
import { Radio, Space, Checkbox, Button, Input } from 'antd-mobile'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { Wallet as WalletModel } from '@/model/wallet'
import { Keyring } from '@/chrome/keyring'
import { AccountType } from '@/types/enum'
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { useClipboard } from '@/components/useClipboard'
import { dispatchPreferenceAddNewAccount, dispatchPreference } from "@/dispatch/preference"
import { useLocation, useNavigate } from "react-router-dom";

import { Mnemonic as KiwiMnemonic, Wallet, Kiwi, Wasm } from '@kasplex/kiwi-web'

const RandomMnemonic = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { noticeError } = useNotice();
    const { handleCopy } = useClipboard();

    const [mnemonic12Value, setMnemonic12Value] = useState<string[]>([]);
    const [mnemonic24Value, setMnemonic24Value] = useState<string[]>([]);

    const [mnemonicLength, setMnemonicLength] = useState(0)

    const [checked, setChecked] = useState(false)

    const [passphrase, setPassphrase] = useState(false)

    const [pwdValue, setPwdValue] = useState('')
    const [stepValue, setStepValue] = useState(1)
    const [btnLoading, setBtnLoading] = useState(false)

    const [isNew] = useState<string>(state?.new || "")

    const visablePassphrase = passphrase ? 'visable' : 'hidden'

    useEffect(() => {
        handleSwitch(12)
    }, []);

    const mnemonic = mnemonicLength === 12 ? mnemonic12Value : mnemonic24Value

    const randomMnemonic = (length: number) => {
        return KiwiMnemonic.random(length).split(" ")
    }

    const handleStepValue = (value: number) => {
        setStepValue(value)
    }

    const handleRenew = () => {
        const mnemonic12 = randomMnemonic(mnemonicLength)
        mnemonicLength === 12 ? setMnemonic12Value(mnemonic12) : setMnemonic24Value(mnemonic12)
    }

    const handleSwitch = (length: number) => {
        if (length === mnemonicLength) return
        setChecked(false)
        setMnemonicLength(length)
        if (length === 12) {
            if (mnemonic12Value.length === 0) {
                setMnemonic12Value(randomMnemonic(length))
            }
        } else {
            if (mnemonic24Value.length === 0) {
                setMnemonic24Value(randomMnemonic(length))
            }
        }
    }

    const showAddress = () => {
        if (mnemonicLength === 12) {
            if (mnemonic12Value.length === 0) {
                return ""
            }
            let wallet = Wallet.fromMnemonic(mnemonic12Value.join(" "), pwdValue)
            return wallet.toAddress(Kiwi.network).toString()
        } else {
            if (mnemonic24Value.length === 0) {
                return ""
            }
            let wallet = Wallet.fromMnemonic(mnemonic24Value.join(" "), pwdValue)
            return wallet.toAddress(Kiwi.network).toString()
        }
    }

    const goBack = () => {
        if (stepValue === 2) {
            return setStepValue(1)
        }
        navigate(-1)
    }

    const createAccount = async () => {
        try {
            let mnemonic = (mnemonicLength === 12 ? mnemonic12Value : mnemonic24Value).join(" ")
            let wallet = Wallet.fromMnemonic(mnemonic, pwdValue)
            let privateKey = wallet.toPrivateKey().toString()
            let _wallet: WalletModel = {
                id: "",
                mnemonic: mnemonic,
                name: "",
                priKey: privateKey.toString(),
                pubKey: wallet.toPublicKey().toString(),
                index: 0,
                active: true,
                passphrase: pwdValue,
                type: AccountType.Mnemonic,
                accountName: ""
            }
            setBtnLoading(true)
            await Keyring.addWallet(_wallet)
            if (isNew) {
                dispatchPreference().then(r => {
                    setBtnLoading(false)
                    navigate('/home')
                })
            } else {
                dispatchPreferenceAddNewAccount().then(r => {
                    setBtnLoading(false)
                    navigate('/home')
                })
            }
        } catch (error) {
            setBtnLoading(false)
            noticeError(error);
        }
    }

    const gridList = mnemonic.map((item, index) => {
        return (
            <div className="grid-item" key={index}>
                <div className="grid-item-div">
                    <em>{index + 1}.</em>
                    <span>{item}</span>
                </div>
            </div>
        )
    })

    return (
        <div className="page-box">
            <HeadNav title="Create a new HD Wallet" onBack={() => goBack()}></HeadNav>
            <article className="page-mnemonic">
                <div className="page-btn-tab">
                    <div className={`btn-tab-item ${stepValue === 1 ? 'active' : ''}`} onClick={() => setStepValue(1)}>Step 1</div>
                    <div className={`btn-tab-item ${stepValue === 2 ? 'active' : ''}`}>Step 2</div>
                </div>
                <div className={stepValue === 1 ? "visable" : "hidden"}>
                    <h6 className="page-sub-tit">Seed Phrase</h6>
                    <p className="page-sub-txt">This phrase is the ONLY way to recover your wallet.</p>
                    <p className="page-sub-txt">Do not share it with anyone!</p>
                    <div className="page-radio">
                        <Radio.Group
                            value={mnemonicLength}
                            defaultValue="12"
                            onChange={val => {
                                handleSwitch(Number(val))
                            }}
                        >
                            <Radio
                                value="12"
                                icon={() => (
                                    <SvgIcon 
                                    iconName={mnemonicLength === 12 ? 'IconRadioTrue' : 'IconRadioFalse'} 
                                    color={mnemonicLength === 12 ? '#74E6D8' : '#D8D8D8' } />
                                )}
                            >
                                12 words
                            </Radio>
                            <Radio
                                value="24"
                                icon={() => (
                                    <SvgIcon 
                                    iconName={mnemonicLength === 24 ? 'IconRadioTrue' : 'IconRadioFalse'}
                                    color={mnemonicLength === 24 ? '#74E6D8' : '#D8D8D8' }  />
                                )}
                            >
                                24 words
                            </Radio>
                        </Radio.Group>
                    </div>

                    <div className="page-btn page-btn-grey">
                        <div className="btn-icon" onClick={() => handleCopy(mnemonic.join(' '))}>
                            Copy <SvgIcon iconName="IconCopy" offsetStyle={{marginLeft: '5px', position: 'relative', top: '2px'}} />
                        </div>
                        <div className="btn-icon" onClick={handleRenew}>
                            Renew
                            <SvgIcon iconName="refresh" offsetStyle={{marginLeft: '5px'}} />
                        </div>
                    </div>
                    <div className="page-grid mb20">
                        {gridList}
                    </div>
                    <div className="page-check">
                        <Space direction='vertical' block>
                            <Checkbox block onChange={(val: boolean) => setChecked(val)} checked={checked}
                                icon={(checked) => (checked ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" /> :  <SvgIcon iconName="IconCheck" /> )}
                            >I saved my seed phrase</Checkbox>
                        </Space>
                    </div>
                    <div className="page-content mb20">
                        <Button block size="large" color="primary" disabled={!checked} onClick={() => handleStepValue(2)}>
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
                            <div className="sel-def-address" onClick={() => handleCopy(showAddress()) }>
                                <SvgIcon iconName="IconCopy" size={26} /> 
                                <span>{showAddress()}</span>
                            </div>
                        </div>
                        <div className="mnemonic-check check-span-pl0">
                            <Checkbox block onChange={(val: boolean) => {
                                if (!val) {
                                    setPwdValue("")
                                }
                                setPassphrase(val)
                            }}
                                icon={(passphrase) => (passphrase ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" /> :<SvgIcon iconName="IconCheck" /> )}
                            >Advanced option</Checkbox>
                        </div>
                        <div className={visablePassphrase}>
                            <h6 className="page-sub-tit">Passphrase（Optional）</h6>
                            <div className="mnemonic-input">
                                <Input
                                    placeholder='Passphrase'
                                    value={pwdValue}
                                    maxLength={200}
                                    onChange={val => {
                                        setPwdValue(val)
                                    }}
                                />
                                <p className="page-tip">
                                    Passphrase is as important as seedphrase. Do write it down.
                                </p>
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
export { RandomMnemonic }