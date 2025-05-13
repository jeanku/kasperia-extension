import React, { useState } from 'react';
import { Radio, Checkbox, Button, Input } from 'antd-mobile'
import HeadNav from '@/components/HeadNav'
import { Wallet as WalletModel } from '@/model/wallet'
import { AccountType } from '@/types/enum'
import { produce } from "immer";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useClipboard } from '@/components/useClipboard'
import { Keyring } from '@/chrome/keyring'
import { dispatchPreferenceAddNewAccount, dispatchPreference } from "@/dispatch/preference"
import { useLocation, useNavigate } from "react-router-dom";

import { Mnemonic, Wallet, Kiwi } from '@kasplex/kiwi-web'
import { SvgIcon } from '@/components/Icon/index'

const FromMnemonic = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { noticeSuccess, noticeError } = useNotice();
    const { handleCopy } = useClipboard();

    const [mnemonicValue, setMnemonicValue] = React.useState<string[]>(new Array(12).fill(""));

    const [mnemonicLength, setMnemonicLength] = React.useState(12)

    const [passphrase, setPassphrase] = React.useState(false)

    const [mnemonicValid, setMnemonicValid] = React.useState(false)
    const [btnLoading, setBtnLoading] = useState(false)

    const [pwdValue, setPwdValue] = React.useState('')
    const [stepValue, setStepValue] = React.useState(1)

    const visablePassphrase = passphrase ? 'visable' : 'hidden'
    const [isNew] = useState<string>(state?.new || "")

    const updateMnemonicAtIndex = (index: number, newValue: string) => {
        setMnemonicValue(prev => {
            const newState = produce(prev, draft => {
                draft[index] = newValue;
            });
            setMnemonicValid(Mnemonic.validate(newState.join(" ")))
            return newState;
        });
    };

    const handleSwitch = (length: number) => {
        if (length !== mnemonicLength) {
            setMnemonicLength(length)
            setMnemonicValid(false)
            setMnemonicValue(new Array(length).fill(""))
        }
    }

    const showAddress = () => {
        if (!mnemonicValid) {
            return ""
        }
        let wallet = Wallet.fromMnemonic(mnemonicValue.join(" "), pwdValue)
        return wallet.toAddress(Kiwi.network).toString()
    }

    const goBack = () => {
        if (stepValue === 2) {
            return setStepValue(1)
        }
        navigate(-1)
    }

    const createAccount = async () => {
        try {
            let mnemonic = mnemonicValue.join(" ")
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
                type: AccountType.Mnemonic,
                passphrase: pwdValue,
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

    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
        startIndex: number
    ) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').trim();
        const words = pastedText.split(/\s+/); // 按任意空白符分割

        for (let i = 0; i < words.length; i++) {
            const targetIndex = startIndex + i;
            if (targetIndex >= mnemonicLength) break; // 确保不超出 12 个单词
            updateMnemonicAtIndex(targetIndex, words[i])
        }
    };

    const gridList = mnemonicValue.map((item, index) => (
        <div className="grid-item" key={index}>
            <div className="grid-item-div">
                <em>{index + 1}.</em>
                <Input
                    placeholder=''
                    value={mnemonicValue[index] || ""}
                    onPaste={(e) => handlePaste(e, index)}
                    onChange={(e) => updateMnemonicAtIndex(index, e)}
                />
                <span></span>
            </div>
        </div>
    ));

    return (
        <div className="page-box">
            <HeadNav title="Create a new HD Wallet" onBack={() => goBack()}></HeadNav>
            {/* <div className="nav-bar">
                <div className="nav-left" onClick={() => goBack()}>
                    <img className="arrow-left" src={arrowLeftImg} alt="" onClick={() => setStepValue(1)} />
                </div>
                <strong className="nav-bar-title">Create a new HD Wallet</strong>
                <div></div>
            </div> */}
            <article className="page-mnemonic page-from-seed">
                <div className="page-btn-tab">
                    <div className={`btn-tab-item ${stepValue === 1 ? 'active' : ''}`} onClick={() => setStepValue(1)}>Step 1</div>
                    <div className={`btn-tab-item ${stepValue === 2 ? 'active' : ''}`}>Step 2</div>
                </div>
                <div className={stepValue === 1 ? "visable" : "hidden"}>
                    <h6 className="page-sub-tit">Seed Phrase</h6>
                    <p className="page-sub-txt">This phrase is the ONLY way to recover your wallet.</p>
                    <p className="page-sub-txt">Do not share it with anyone!</p>
                    <div className="page-radio mb20">
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

                    <div className="page-grid mb40">
                        {gridList}
                    </div>
                    <div className="page-content  mb20">
                        <Button block size="large" color="primary" disabled={mnemonicValid === false} onClick={() => setStepValue(2)}>
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
                                <SvgIcon iconName="IconCopy" size={26} color='#FFFFFF' /> 
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
                                icon={(checked) => (checked ? <SvgIcon iconName="IconCheckSelect" color="#74E6D8" /> : <SvgIcon iconName="IconCheck" />)}
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
                        <div className="mnemonic-btn-pos mb20">
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
export { FromMnemonic }