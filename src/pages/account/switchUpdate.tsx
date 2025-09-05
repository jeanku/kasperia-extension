import React, { useState } from "react"
import { Button, Input } from 'antd-mobile'
import { Keyring } from '@/chrome/keyring'
import { AccountSubListDisplay } from '@/model/account'
import HeadNav from '@/components/HeadNav'
import { dispatchRefreshPreference } from '@/dispatch/preference'
import { useNavigate, useLocation } from "react-router-dom";

const SwitchUpdate = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [path] = useState<number>(state!.path)
    const [account] = useState<AccountSubListDisplay>(state!.account)
    const [name, setName] = useState<string>('')

    const submit = async () => {
        await Keyring.setSubAccountName(account.id, path, name)
        if (account.path == path) {
            let curAccount = await Keyring.getActiveAccountDisplay()
            return dispatchRefreshPreference(curAccount).then(_ => {
                navigate(-1)
            })
        }
        navigate(-1)
    }

    return (
        <article className="page-box">
            <HeadNav title={account.drive[path].name || ""}></HeadNav>
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