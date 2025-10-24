import React, {useEffect, useState} from "react"
import { Button, Input } from 'antd-mobile'
import { Keyring } from '@/chrome/keyring'
import { AccountSubListDisplay } from '@/model/account'
import HeadNav from '@/components/HeadNav'
import { useNavigate, useLocation } from "react-router-dom";
import {Dispatch} from "redux";
import store from "@/store";
import {setCurrentAccount} from "@/store/preferenceSlice";

const SwitchUpdate = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch = store.dispatch;
    const { state } = useLocation();
    const [path] = useState<number>(state!.path)
    const [account] = useState<AccountSubListDisplay>(state!.account)
    const [title, setTitle] = useState<string>('')
    const [name, setName] = useState<string>('')

    useEffect(() => {
        let subAccount = account.drive.find(r => r.path == path)
        setTitle(subAccount?.name || "")
    }, []);

    const submit = async () => {
        await Keyring.setSubAccountName(account.id, path, name)
        if (account.path == path) {
            dispatch(setCurrentAccount(await Keyring.getActiveAccountDisplay()));
        }
        navigate(-1)
    }

    return (
        <article className="page-box">
            <HeadNav title={ title }></HeadNav>
            <div className="content-main page-edit-box">
                <Input
                    className="kiwi-input"
                    placeholder="Account name"
                    value={name}
                    maxLength={20}
                    clearable
                    onChange={val => setName(val)}
                />
                <Button block className="kiwi-button mt30" size="large" color="primary" disabled={name.trim() === ''}
                        onClick={() => submit()}>
                    Update
                </Button>
            </div>
        </article>
    )
}
export {SwitchUpdate}