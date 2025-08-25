import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Mask, Radio, Button, Popover } from 'antd-mobile'
import { MoreOutline } from 'antd-mobile-icons'
import { SvgIcon } from '@/components/Icon/index'
import { Keyring } from '@/chrome/keyring'
import { AccountType } from '@/types/enum'
import { formatAddress } from '@/utils/util'
import { AccountWithSubDisplay } from '@/model/wallet'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { dispatchPreferenceAddNewAccount } from '@/dispatch/preference'

import RemoveInset from '@/assets/images/remove-img.png'
import { Action } from 'antd-mobile/es/components/popover'
import IconAdd from '@/assets/images/icon-add.png'

const Switch = () => {

    const navigate = useNavigate();
    const { noticeSuccess, noticeError } = useNotice();

    const [visibleMask, setVisibleMask] = useState(false)
    const [dealItemIndex, setDealItemIndex] = useState(0);
    const [currentWallet, setCurrentWallet] = useState<AccountWithSubDisplay | null>(null)

    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [accountList, setAccountList] = useState<Array<{
        name: string,
        index: number,
        address: string
    }>>([])

    const  getAccountList = async () => {
        let wallet: AccountWithSubDisplay = await Keyring.getActiveAccountWithSubAccounts()
        setAccountList(wallet.drive)
        setActiveIndex(wallet.path)
        setCurrentWallet(wallet)
    }

    const switchAccount = async (index: number) => {
        if (currentWallet?.type == AccountType.PrivateKey) return
        let selectAccount = accountList[index]
        await Keyring.switchDriveAccount(currentWallet!.id, selectAccount.index)
        setActiveIndex(selectAccount.index)
        dispatchPreferenceAddNewAccount().then(_ => {
            navigate(-1)
        })
    }

    useEffect(() => {
        getAccountList()
    }, []);

    const popoverAction = (key: string, index: number) => {
        switch (key) {
            case 'edit':
                navigate('/account/switch/update', { state : { id: currentWallet?.id,  account: accountList[index] ,isActive: accountList[index].index == activeIndex }})
                break;
            case 'privateKey':
                navigate('/export', {state: { id: currentWallet?.id,  index: accountList[index].index, type: "privateKey"}})
                break;
            case 'remove':
                setVisibleMask(true)
                setDealItemIndex(index)
                break;
            default:
                break;
        }
    }
    const actions: Action[] = [
        { key: 'edit', icon: <SvgIcon size={22} iconName="IconEdit" color="#FFFFFF" />, text: 'Edit name' },
        { key: 'privateKey', icon: <SvgIcon size={22} iconName="IconKey" color="#FFFFFF" />, text: 'Export Private Key' },
        { key: 'remove', icon: <SvgIcon size={22} iconName="IconDel" color="#FFFFFF" />, text: 'Remove wallet' },
    ];

    const setAction = () => {
        return currentWallet?.type === AccountType.Mnemonic ? actions : actions.filter(a => a.key !== 'remove');
    };

    const removeConfirm = async () => {
        setVisibleMask(false)
        if (accountList.length <= 1) {
            noticeError("account can't deleted")
            return
        }
        let removeAccount = accountList[dealItemIndex]
        await Keyring.removeAccount(currentWallet!.id, removeAccount.index)

        let accounts = accountList.filter(r => {
            return r.index !== removeAccount.index
        })
        setAccountList(accounts)
        if (removeAccount.index == currentWallet!.path) {
            let newIndex = accountList[0].index == removeAccount.index ? accountList[1].index : accountList[0].index
            currentWallet!.path = newIndex
            setActiveIndex(newIndex)
            await dispatchPreferenceAddNewAccount()
        }
        noticeSuccess("wallet deleted successfully")
    }

    return (
        <article className="page-box">
            <div className="nav-bar">
                <div className="nav-left" onClick={() => navigate(-1)}>
                    <SvgIcon iconName="IconArrowLeft" offsetStyle={{position: 'relative', top: '-6px'}} color="#D8D8D8" />
                </div>

                <strong className="nav-bar-title">{currentWallet?.name}</strong>
                <div className="nav-right">
                    {
                        currentWallet?.type == AccountType.Mnemonic ? (
                            <img className="icon-add norem" src={IconAdd} alt="Add"
                                onClick={() => navigate("/account/switch/add", {state: {id: currentWallet.id}})}/>
                        ) : null
                    }
                </div>
            </div>
            <article className="content-main list-box pb50">
                <Radio.Group value={activeIndex}>
                    {
                        accountList.map((item, index) => {
                            return (
                                <div className="list-item-box" key={item.index}>
                                    <Radio value={item.index} onClick={() => switchAccount(index)}>
                                        <div className="list-item-left">
                                            <strong>{item.name}</strong>
                                            <span>{formatAddress(item.address, 8)}</span>
                                            {
                                                currentWallet?.type == AccountType.Mnemonic ? (
                                                    <span>{`m/44'/111111'/0'/0/${item.index}`}</span>
                                                ) : null
                                            }
                                        </div>
                                    </Radio>
                                    <Popover.Menu
                                        className="account-popover"
                                        actions={setAction()}
                                        mode='dark'
                                        trigger='click'
                                        onAction={node => popoverAction(node.key as string, index)}
                                    >
                                        <MoreOutline fontSize={24}/>
                                    </Popover.Menu>
                                </div>
                            )
                        })
                    }
                </Radio.Group>
            </article>
            <Mask visible={visibleMask} onMaskClick={() => setVisibleMask(false)}>
                <article className="remove-box">
                    <div className="remove-bg">
                        <SvgIcon className="remove-close" onClick={() => setVisibleMask(false)} iconName="IconClose" color="#7F7F7F" />
                        <div className="remove-nox-content">
                            <img src={RemoveInset} alt="" />
                            <div className="remove-address">
                                <strong>{accountList[dealItemIndex] ? accountList[dealItemIndex].name : ""}</strong>
                                <p>{accountList[dealItemIndex] ? formatAddress(accountList[dealItemIndex].address) : ""}</p>
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

export { Switch }