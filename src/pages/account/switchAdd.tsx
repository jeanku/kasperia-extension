import React, { useState } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Input } from 'antd-mobile'
import { Wallet as WalletModel } from '@/model/wallet'
import { Wallet } from '@kasplex/kiwi-web'
import { Keyring } from '@/chrome/keyring'
import { AccountType } from '@/types/enum'
import { dispatchPreferenceAddNewAccount } from '@/dispatch/preference'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { useNavigate, useLocation } from "react-router-dom";

const SwitchAdd = () => {

    const { noticeError } = useNotice();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [wallet] = useState<WalletModel>(state?.wallet || {})
    const [name, setName] = useState<string>('')

    const submit = async () => {
        if (wallet?.type == AccountType.PrivateKey) {
            noticeError("Account type invalid")
            return
        }
        let index = wallet.drive![wallet.drive!.length - 1].index + 1
        let walletHandle = Wallet.fromMnemonic(wallet.mnemonic, wallet.passphrase).newWallet(index)
        let data = {
            name: name,
            index: index,
            pubKey: walletHandle.toPublicKey().toString(),
            priKey: walletHandle.toPrivateKey().toString(),
        }
        await Keyring.addDriveAccount(wallet.id, data)
        dispatchPreferenceAddNewAccount().then(_ => {
            navigate(-1)
        })
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