import React, { useState, ReactElement, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "antd-mobile";
import { Keyring } from '@/chrome/keyring'
import { SvgIcon } from '@/components/Icon/index'
import { useNotice } from '@/components/NoticeBar/NoticeBar'

const CreatePwd: React.FC  = () => {
    const [searchParams] = useSearchParams();
    const { noticeError } = useNotice();
    const sourcePath = searchParams.get('target')

    const [visible, setVisible] = useState(false)
    const [visibleConfirm, setVisibleConfirm] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [pwdTip, setPwdTip] = useState<ReactElement | null>(null)
    const navigate = useNavigate();
    const submitDisabled = useMemo(() => !password || !confirmPwd || password != confirmPwd, [password, confirmPwd]);
    
    const handleSubmit = async () => {
        if (password.length < 6) {
            return noticeError("Your password must contain at least 6 characters.")
        }
        Keyring.boot(password)
        navigate(`${sourcePath}`, {state: {isNew: true}});
    }

    return (
        <div className="page-box">
            { pwdTip }
            <div className="page-flex page-login">
                <div className="page-title mb30">
                    <h6>Create a password</h6>
                    <p>You will use this to unlock your wallet</p>
                </div>
                <div className="page-content">
                <div className="password">
                    <Input
                        className="input"
                        placeholder='Please input a password'
                        value={password}
                        type={visible ? 'text' : 'password'}
                        maxLength={200}
                        minLength={6}
                        onChange={val => {
                            setPassword(val)
                        }}
                    />
                    <div className="eye" onClick={() => setVisible(!visible)}>
                        {visible ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                    </div>
                </div>
                <div className="password">
                    <Input
                        className="input"
                        value={confirmPwd}
                        placeholder='Confirm password again'
                        type={visibleConfirm ? 'text' : 'password'}
                        maxLength={200}
                        minLength={6}
                        onChange={val => {
                            setConfirmPwd(val)
                        }}
                    />
                    <div className="eye" onClick={() => setVisibleConfirm(!visibleConfirm)}>
                        {visibleConfirm ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                    </div>
                </div>
                <Button block size="large" color="primary" disabled={submitDisabled} onClick={ handleSubmit }>
                    Continue
                </Button>
            </div>
            </div>
        </div>
    )
}
export { CreatePwd }