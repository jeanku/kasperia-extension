import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Mask, Button, Popover } from 'antd-mobile'
import { Action } from 'antd-mobile/es/components/popover'
import HeadNav from '@/components/HeadNav'
import { Keyring } from "@/chrome/keyring"
import { Account } from "@/chrome/account"
import { AccountType } from "@/types/enum"
import { Preference } from "@/chrome/preference"
import { dispatchRefreshPreference } from "@/dispatch/preference"
import { setAccountsBalance, setCurrentAccount } from "@/store/preferenceSlice";
import { formatAddress, formatBalance } from "@/utils/util"
import { AccountDisplay } from "@/model/wallet"
import { isEqual } from 'lodash';
import { SvgIcon } from '@/components/Icon/index'
import store from '@/store';
import { Dispatch } from 'redux';

import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { useNotice } from '@/components/NoticeBar/NoticeBar'

import RemoveInset from '@/assets/images/remove-img.png'


const Index = () => {
    const navigate = useNavigate();
    const { noticeSuccess, noticeError } = useNotice();

    const [visibleMask, setVisibleMask] = useState(false)

    const [accountListData, setAccountListData] = useState<Array<AccountDisplay>>([])

    const [dealItemIndex, setDealItemIndex] = useState(0);

    const [accountKasBalance, setAccountKasBalance] = useState<Record<string, string>>({})

    const accountsBalanceCache= useSelector((state: RootState) => state.preference.preference?.accountsBalance || undefined);

    const setAccountsAndBalance = async () => {
        let accounts = await Account.accounts();
        setAccountListData(accounts)
        let addresses = accounts.map(account => account.address)
        const balance = await Account.accountsBalance(addresses);
        if (!isEqual(balance, accountsBalanceCache)) {
            Preference.setAccountsBalance(balance)
            setAccountKasBalance(balance)
            const dispatch: Dispatch = store.dispatch;
            dispatch(setAccountsBalance(balance))
        }
    };

    useEffect(() => {
        if (accountsBalanceCache != undefined) {
            setAccountKasBalance(accountsBalanceCache)
        }
        setAccountsAndBalance()
    }, []);

    const popoverAction = (key: string, index: number) => {
        switch (key) {
            case 'edit':
                navigate('/account/editName', { state : { account: accountListData[index] }})
                break;
            case 'seed':
                navigate('/export', {state: { id: accountListData[index].id, type: "mnemonic"}})
                break;
            case 'privateKey':
                navigate('/export', {state: { id: accountListData[index].id, type: "privateKey"}})
                break;
            case 'remove':
                setVisibleMask(true)
                setDealItemIndex(index)
                break;
            default:
                break;
        }
    }

    const setAccountActive = async (index: number) => {
        if (accountListData[index].active) {
            return navigate(-1)
        }
        let selectedAccount = accountListData[index]
        await Account.setActiveAccount(accountListData[index].id)
        setAccountListData(accountListData.map(r => {
            r.active = r.id == selectedAccount.id
            return r
        }))

        selectedAccount.balance = accountKasBalance[selectedAccount.address] || "0"

        const dispatch: Dispatch = store.dispatch;
        dispatch(setCurrentAccount(selectedAccount))
        navigate(-1)
    }

    const removeConfirm = async () => {
        setVisibleMask(false)
        if (accountListData.length === 1) {
            noticeError("current wallet can't deleted")
            return
        }
        let account = accountListData[dealItemIndex]
        await Keyring.removeWallet(account.id)
        let accounts = accountListData.filter(r => {
            return r.id !== account.id
        })
        if (account.active) {
            accounts[0].active = true
            await dispatchRefreshPreference({...accounts[0]})
        }
        setAccountListData(accounts)
        noticeSuccess("wallet deleted successfully")
    }
    const actions: Action[] = [
        { key: 'edit', icon: <SvgIcon size={22} iconName="IconEdit" color="#FFFFFF" />, text: 'Edit name' },
        { key: 'seed', icon: <SvgIcon size={22} iconName="IconKey" color="#FFFFFF" />, text: 'Show Seed Phrase' },
        { key: 'privateKey', icon: <SvgIcon size={22} iconName="IconKey" color="#FFFFFF" />, text: 'Export Private Key' },
        { key: 'remove', icon: <SvgIcon size={22} iconName="IconDel" color="#FFFFFF" />, text: 'Remove wallet' },
    ];

    const setAction = (key: AccountType) => {
        return key === AccountType.Mnemonic ? actions.filter(a => a.key !== 'privateKey') : actions.filter(a => a.key !== 'seed');
    };

    return (
        <article className="page-box">
            <HeadNav url="/account/createWallet" title='Switch Wallet' rightType="add" onBack={() => navigate('/home')}></HeadNav>
            <div className="page-account">
                {accountListData.map((item, index) => (
                    <div key={item.name} className={item.active ? 'active account-item' : 'account-item'}>
                        <div className="account-item-left" onClick={() => setAccountActive(index)}>
                            <div className="account-item-name">
                                <span>{item.name}</span>
                                <em> {formatBalance(accountKasBalance[item.address] || "", 8)}</em>
                            </div>
                            <p className="one-line">{formatAddress(item.address, 8)}</p>
                        </div>
                        <Popover.Menu
                            className="account-popover"
                            actions={setAction(item.type)}
                            mode='dark'
                            trigger='click'
                            onAction={node => popoverAction(node.key as string, index)}
                        >
                            <div className="account-item-right">
                                <SvgIcon key={'svg-setting'} iconName="IconSetting" />
                            </div>
                        </Popover.Menu>
                    </div>
                ))}
            </div>
            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon className="remove-close" onClick={() => setVisibleMask(false)} iconName="IconClose" color="#7F7F7F" />
                        <div className="remove-nox-content">
                            <img src={RemoveInset} alt="" />
                            <div className="remove-address">
                                <strong>{accountListData[dealItemIndex] ? accountListData[dealItemIndex].name : ""}</strong>
                                <p>{accountListData[dealItemIndex] ? formatAddress(accountListData[dealItemIndex].address) : ""}</p>
                            </div>
                            <p className="remove-tip">Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss</p>
                            <p className="remove-tip-strong">This action is not reversible</p>
                        </div>
                        <div className="remove-btns">
                            <Button onClick={() => setVisibleMask(false)}>Cancel</Button>
                            <Button color='primary' onClick={() => removeConfirm()}>Remove</Button>
                        </div>
                    </div>
                </article>
            </Mask>
        </article>
    )
}

export { CreatePwd } from "./createPwd"
export { CreateWallet } from "./createWallet"
export { EditName } from "./editName"
export { Receive } from "./receive"
export { Unlock } from "./unlock"
export { Switch } from "./switch"
export { SwitchAdd } from "./switchAdd"
export { SwitchUpdate } from "./switchUpdate"
export { Index }