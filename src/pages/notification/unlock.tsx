import React, { useState, KeyboardEvent, useEffect } from "react";
import { Button, Input } from "antd-mobile";
import { Keyring } from '@/chrome/keyring'
import { SvgIcon } from '@/components/Icon/index'
import { useNavigate } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import { Notification } from '@/chrome/notification';

import logoImg from '@/assets/images/logo512.png';
const Unlock = () => {
    const { noticeError } = useNotice();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        console.log("Unlock 123456789012345678901234567890")
    }, []);

    const handleSubmit = async () => {
        try {
            await Keyring.unLock(password);
            Notification.resolveApproval()
        } catch (error) {
            let content = error instanceof Error ? error.message : 'password error.';
            noticeError(content);
        }
    };

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
            </div>
        </div>
    );
};

export {Unlock} ;
