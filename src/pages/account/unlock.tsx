import React, { useState, KeyboardEvent } from "react";
import { Button, Input, Mask } from "antd-mobile";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Keyring } from '@/chrome/keyring'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import CheckBoxItem from '@/components/CheckBoxItem'
import { dispatchPreference } from '@/dispatch/preference'
import RemoveInset from '@/assets/images/remove-img.png'

import logoImg from '@/assets/images/logo512.png';
const Unlock = () => {
    const { noticeError } = useNotice();
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('url') || '/home';

    const [visibleMask, setVisibleMask] = useState(false)
    const [checkClear, setCheckClear] = useState(false)
    const [checkBackups, setCheckBackups] = useState(false)
    const [checkReversible, setCheckReversible] = useState(false)

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        try {
            await Keyring.unLock(password);
            dispatchPreference().then( _ => {
                navigate(redirectUrl, { replace: true });
            })
        } catch (error) {
            noticeError(error);
        }
    };

    const logoOut = () => {
        if (!checkClear || !checkBackups || !checkReversible) return
        Keyring.clear().then(_=> {
            navigate("/")
        })
    }

    const cancel = () => {
        setVisibleMask(false)
        setCheckBackups(false)
        setCheckClear(false)
        setCheckReversible(false)
    }

    return (
        <div className="page-box">
            <div className="page-flex page-unlock">
                <div className="index-log mb20">
                    <img className="top2" src={logoImg} alt="logo"/>
                    <span> KASPERIA</span>
                </div>
                <div className="page-content mb30">
                    <div className="password">
                        <Input
                            className="input"
                            placeholder="Please enter your password"
                            value={password}
                            type={visible ? 'text' : 'password'}
                            onChange={(e) => setPassword(e)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="eye" onClick={() => setVisible(!visible)}>
                            {visible ? <SvgIcon iconName="IconEyeOpen"/> : <SvgIcon iconName="IconEyeClose"/>}
                        </div>
                    </div>
                    <Button
                        block
                        size="large"
                        color="primary"
                        disabled={!password}
                        onClick={handleSubmit}
                    >Unlock</Button>
                </div>

                <div className="page-forget">
                    <p className="cursor-pointer" onClick={() => {
                        setVisibleMask(true)
                    }}>Forget password?</p>
                </div>
            </div>

            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon 
                            className="remove-close" 
                            onClick={() => setVisibleMask(false)} 
                            iconName="IconClose"
                            color="#7F7F7F"/>
                        <div className="remove-nox-content">
                            <img src={RemoveInset} alt=""/>
                            <div className="remove-check">
                                <CheckBoxItem 
                                    text="By logout,all data stored locally will be erased" 
                                    checked={checkClear} 
                                    onChange={(val) => setCheckClear(val)} 
                                />
                                <CheckBoxItem 
                                    text="Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss" 
                                    checked={checkBackups} 
                                    onChange={(val) => setCheckBackups(val)} 
                                />
                                <CheckBoxItem 
                                    text="This action is not reversible" 
                                    checked={checkReversible} 
                                    onChange={(val) => setCheckReversible(val)} 
                                />
                            </div>
                        </div>
                        <div className="remove-btns">
                            <Button onClick={() => cancel()}>Cancel</Button>
                            <Button color='primary' disabled={!checkClear || !checkBackups || !checkReversible} onClick={() => logoOut()}>Reset Wallet</Button>
                        </div>
                    </div>
                </article>
            </Mask>
        </div>
    );
};

export {Unlock} ;
