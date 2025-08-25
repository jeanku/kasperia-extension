import { produce } from "immer";
import React, { useState } from 'react';
import { Radio, Checkbox, Button, Input } from 'antd-mobile'
import { useLocation, useNavigate } from "react-router-dom";

import { Common } from '@/chrome/common'
import { Account } from '@/chrome/account'
import { dispatchRefreshPreference } from "@/dispatch/preference"

import HeadNav from '@/components/HeadNav'
import { SvgIcon } from '@/components/Icon/index'
import { useClipboard } from '@/components/useClipboard'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

const FromMnemonic = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { noticeError } = useNotice();
    const { handleCopy } = useClipboard();

    const [mnemonicValue, setMnemonicValue] = React.useState<string[]>(new Array(12).fill(""));

    const [mnemonicLength, setMnemonicLength] = React.useState(12)

    const [passphrase, setPassphrase] = React.useState(false)
    const [address, setAddress] = React.useState<string>("")

    const [mnemonicValid, setMnemonicValid] = React.useState(false)
    const [btnLoading, setBtnLoading] = useState(false)

    const [pwdValue, setPwdValue] = React.useState('')
    const [stepValue, setStepValue] = React.useState(1)

    const visablePassphrase = passphrase ? 'visable' : 'hidden'

    const updateMnemonicAtIndex = (index: number, newValue: string) => {
        setMnemonicValue(prev => {
            const newState = produce(prev, draft => {
                draft[index] = newValue;
            });
            let filter = newState.filter((item) => item != "")
            if (filter.length == mnemonicLength) {
                Common.addressFromMnemonic(newState.join(" "), "").then((address) => {
                    if (address) {
                        setMnemonicValid(address != "")
                        setAddress(address)
                    } else {
                        setMnemonicValid(false)
                        setAddress("")
                    }
                })
            }
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

    const goBack = () => {
        if (stepValue === 2) {
            return setStepValue(1)
        }
        navigate(-1)
    }

    const createAccount = async () => {
        try {
            setBtnLoading(true)
            let mnemonic = mnemonicValue.join(" ")

            let account = await Account.addAccountFromMnemonic(mnemonic, pwdValue)
            dispatchRefreshPreference(account).then(r => {
                navigate('/home')
            })
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

    const changePwdValue = async (val: string) => {
        setPwdValue(val)
        let address = await Common.addressFromMnemonic(mnemonicValue.join(" "), val)
        setAddress(address)
    }

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
                        <Button block size="large" color="primary" disabled={ !mnemonicValid } onClick={ () => setStepValue(2) }>
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
                                <span>{ address }</span>
                            </div>
                        </div>
                        <div className="mnemonic-check check-span-pl0">
                            <Checkbox block onChange={(val: boolean) => {
                                if (!val) {
                                    changePwdValue("")
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
                                        changePwdValue(val)
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