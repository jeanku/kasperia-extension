import React, { useState, useCallback } from "react"
import HeadNav from '@/components/HeadNav'
import { Input, Button } from 'antd-mobile'
import { SvgIcon } from '@/components/Icon/index'
import { Keyring } from '@/chrome/keyring'
import { useNavigate } from "react-router-dom";
import { useNotice } from '@/components/NoticeBar/NoticeBar'
const ChangePwd = () => {
    const navigate = useNavigate();
    const { noticeSuccess, noticeError } = useNotice();
    const [currentPwd, setCurrentPwd] = useState<string>('')
    const [newPwd, setNewPwd] = useState<string>('')
    const [confirmPwd, setConfirmPwd] = useState<string>('')
    const [currentVisible, setCurrentVisible] = useState<boolean>(false);
    const [isNewVisible, setIsNewVisible] = useState<boolean>(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('')
    const errorTip = {
        length: 'Password must be at least 6 characters long',
        unlike: 'The new password does not match the confirmed password'
    }

    const submitDisabled = useCallback(() => {
        return currentPwd === '' || newPwd.trim() === '' || newPwd.length < 6;
    }, [currentPwd, newPwd]);
    const checkPwd = async (password: string) => {
        if(!password) return
        try {
            await Keyring.checkPassword(password)
        } catch (error) {
            noticeError('password invalid')
        }
    }
    const handleSubmit = async () => {
        if(newPwd !== confirmPwd ) {
            setErrorMsg(errorTip.unlike)
            return
        }
        if(newPwd.length < 6) {
            setErrorMsg(errorTip.length)
            return
        }
        setErrorMsg('')
        setIsLoading(true)
        try {
            await Keyring.checkPassword(currentPwd)
            Keyring.setNewPassword(confirmPwd)
            noticeSuccess('Password changed successfully')
            navigate('/setting/more',{ replace: true })
        } catch (error) {
            noticeError('password invalid')
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <article className="page-box">
            <HeadNav title='Change Password'></HeadNav>
            <div className="content-main change-pwd">
                <div className="input-box mb12">
                    <Input
                        placeholder='Current Password'
                        value={currentPwd}
                        onBlur={() => checkPwd(currentPwd)}
                        onChange={val => {
                            setCurrentPwd(val)
                        }}
                        type={currentVisible ? 'text' : 'password'}
                    />
                    <div className="eye" onClick={() => setCurrentVisible(!currentVisible)}>
                        {currentVisible ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                    </div>
                </div>
                <div className="input-box mb12">
                    <Input
                        placeholder='New Password'
                        value={newPwd}
                        onChange={val => {
                            setNewPwd(val)
                        }}
                        type={isNewVisible ? 'text' : 'password'}
                    />
                    <div className="eye" onClick={() => setIsNewVisible(!isNewVisible)}>
                        {isNewVisible ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                    </div>
                </div>
                <div className="input-box mb12">
                    <Input
                        placeholder='Confirm New Password'
                        value={confirmPwd}
                        onChange={val => {
                            setConfirmPwd(val)
                        }}
                        type={isConfirmVisible ? 'text' : 'password'}
                    />
                    <div className="eye" onClick={() => setIsConfirmVisible(!isConfirmVisible)}>
                        {isConfirmVisible ? <SvgIcon iconName="IconEyeOpen" /> : <SvgIcon iconName="IconEyeClose" />}
                    </div>
                </div>
                <div className="tip-error">
                    <p>{ errorMsg }</p>
                </div>
                <Button block size="large" loading={isLoading} loadingText="Change Password" color="primary" disabled={submitDisabled()} onClick={ handleSubmit}>
                    Change Password
                </Button>
            </div>
        </article>
    )
}

export default ChangePwd