import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { AccountDisplay } from "@/model/wallet"
import { Button, Input } from 'antd-mobile'
import { Keyring } from '@/chrome/keyring';
import { useNavigate, useLocation } from "react-router-dom";
import {Dispatch} from "redux";
import store from "@/store";
import {setCurrentAccount} from "@/store/preferenceSlice";

const EditName = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch = store.dispatch;
    const state = useLocation();
    const [name, setName] = useState('')
    const [account] = useState<AccountDisplay>(state!.state.account)

    const submitDisable = () => {
        return name.trim() === ''
    }

    const submitName = () => {
        Keyring.setAccountName(account.id, name).then(_ => {
            if (account.active) {
                dispatch(setCurrentAccount({ ...account, name}))
            }
            navigate(-1)
        })
    }

    return (
        <article className="page-box">
            <HeadNav title="Edit name"></HeadNav>
            <div className="content-main page-edit-box">
                <Input
                    className="kiwi-input"
                    placeholder={account.name}
                    value={name}
                    maxLength={20}
                    clearable
                    onChange={val => setName(val)}
                />
                <Button block className="kiwi-button mt30" size="large" color="primary" disabled={submitDisable()} onClick={() => submitName()}>
                    Change wallet name
                </Button>
            </div>
        </article>
    )
}
export { EditName }