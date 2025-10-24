import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Input } from 'antd-mobile'
import { Keyring } from '@/chrome/keyring'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useNavigate, useLocation } from "react-router-dom";
import { setCurrentAccount } from "@/store/preferenceSlice";
import {Dispatch} from "redux";
import store from "@/store";

const SwitchAdd = () => {
    const dispatch: Dispatch = store.dispatch;
    const navigate = useNavigate();
    const { state } = useLocation();
    const [id] = useState<string>(state?.id || "")
    const [name, setName] = useState<string>('')

    const submit = async () => {
        dispatch(setCurrentAccount(await Keyring.addSubAccount(id, name)));
        navigate(-1)
    }

    return (
        <article className="page-box">
            <HeadNav title="New account"></HeadNav>
            <div className="content-main page-edit-box">
                <Input
                    className="kiwi-input"
                    placeholder="Account name"
                    value={name}
                    maxLength={20}
                    clearable
                    onChange={val => setName(val)}
                />
                <Button block className="kiwi-button mt30" size="large" color="primary" disabled={name.trim() === ''} onClick={() => submit()}>
                    Create an Account
                </Button>
            </div>
        </article>
    )
}
export { SwitchAdd }