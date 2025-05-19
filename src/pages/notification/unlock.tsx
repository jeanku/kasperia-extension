import React, { useState, KeyboardEvent } from "react";
import { Button, Input } from "antd-mobile";
import { Keyring } from '@/chrome/keyring'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'


import logoImg from '@/assets/images/logo512.png';
const Unlock = () => {
    const { noticeError } = useNotice();
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        try {
            await Keyring.unLock(password);
            window.close();
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
