import React, { useState } from "react"
import { Button, Input } from 'antd-mobile'
import { Keyring } from '@/chrome/keyring'
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import { dispatchPreferenceAddNewAccount } from '@/dispatch/preference'
import { useNavigate, useLocation } from "react-router-dom";

const SwitchUpdate = () => {

    const navigate = useNavigate();
    const { state } = useLocation();

    const [id] = useState<string>(state!.id)
    const [isActive] = useState<string>(state!.isActive)
    const [account] = useState<{ name: string, index: number, address: string }>(state!.account)
    const [name, setName] = useState<string>('')

    const submit = async () => {
        await Keyring.setAccountName(id, account.index, name)
        if (isActive) {
            return dispatchPreferenceAddNewAccount().then(_ => {
                navigate(-1)
            })
        }
        navigate(-1)
    }

    return (
        <article className="page-box">
            <HeadNav title={account.name}></HeadNav>
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