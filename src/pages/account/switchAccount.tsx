import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Mask, Radio, Button, Popover } from 'antd-mobile'
import { MoreOutline } from 'antd-mobile-icons'
import { SvgIcon } from '@/components/Icon/index'
import { Keyring } from '@/chrome/keyring'
import { AccountType } from '@/types/enum'
import { formatAddress } from '@/utils/util'
import { AccountSubListDisplay } from '@/model/account'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { dispatchRefreshPreference } from '@/dispatch/preference'
import RemoveInset from '@/assets/images/remove-img.png'
import { Action } from 'antd-mobile/es/components/popover'
import IconAdd from '@/assets/images/icon-add.png'


const SwitchAccount = () => {
    const navigate = useNavigate();
    const { noticeSuccess, noticeError } = useNotice();
    const [visibleMask, setVisibleMask] = useState(false)
    const [account, setAccount] = useState<AccountSubListDisplay | null>(null)
    const [dealSubAccount, setDealSubAccount] = useState<{ name: string, address:string, path: number} | undefined>(undefined);
    const [activeIndex, setActiveIndex] = useState<number>(0)

    const  getAccountList = async () => {
        let account = await Keyring.getAccountSubAccountsDisplay()
        setAccount(account)
        setActiveIndex(account.path)
    }

    const switchAccount = async (path: number) => {
        if (activeIndex == path || !account) return
        let curAccount = await Keyring.switchSubAccount(account!.id, path)
        setActiveIndex(path)
        dispatchRefreshPreference(curAccount).then(_ => {
            navigate(-1)
        })
    }

    useEffect(() => {
        getAccountList()
    }, []);

    const popoverAction = (key: string, path: number) => {
        switch (key) {
            case 'edit':
                navigate('/account/switch/update', { state : { account: account, path: path }})
                break;
            case 'privateKey':
                navigate('/export', {state: { id: account?.id,  path: path, type: "privateKey"}})
                break;
            case 'remove':
                setVisibleMask(true)
                let selected = account!.drive.find(d => d.path === path)
                setDealSubAccount(selected)
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
        return account?.type === AccountType.Mnemonic ? actions : actions.filter(a => a.key !== 'remove');
    };

    const removeConfirm = async () => {
        setVisibleMask(false)
        if (account!.drive.length <= 1) {
            noticeError("account can't deleted")
            return
        }
        let curAccount = await Keyring.removeSubAccount(account!.id, dealSubAccount!.path)
        setAccount(curAccount)
        setActiveIndex(curAccount.path)
        if (account!.path == dealSubAccount!.path) {
            let curAccount = await Keyring.getActiveAccountDisplay()
            await dispatchRefreshPreference(curAccount)
        }
        noticeSuccess("wallet deleted successfully")
    }

    return (
        <article className="page-box">
            <div className="nav-bar">
                <div className="nav-left" onClick={() => navigate(-1)}>
                    <SvgIcon iconName="IconArrowLeft" offsetStyle={{position: 'relative', top: '-6px'}} color="#D8D8D8" />
                </div>
                <div className="nav-right">
                    {
                        account?.type == AccountType.Mnemonic ? (
                            <img className="icon-add norem" src={IconAdd} alt="Add"
                                onClick={() => navigate("/account/switch/add", {state: {id: account.id}})}/>
                        ) : null
                    }
                </div>
            </div>
            <article className="content-main list-box pb50">
                <Radio.Group value={activeIndex}>
                    {
                        account?.drive.map((item, index) => {
                            return (
                                <div className="list-item-box" key={item.path}>
                                    <Radio value={item.path} onClick={() => switchAccount(item.path)}>
                                        <div className="list-item-left">
                                            <strong>{item.name}</strong>
                                            <span>{formatAddress(item.address, 8)}</span>
                                            {
                                                account?.type == AccountType.Mnemonic ? (
                                                    <span>{`m/44'/111111'/0'/0/${item.path}`}</span>
                                                ) : null
                                            }
                                        </div>
                                    </Radio>
                                    <Popover.Menu
                                        className="account-popover"
                                        actions={setAction()}
                                        mode='dark'
                                        trigger='click'
                                        onAction={node => popoverAction(node.key as string, item.path)}
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
                                <strong>{dealSubAccount ? dealSubAccount.name : ""}</strong>
                                <p>{dealSubAccount ? formatAddress(dealSubAccount.address) : ""}</p>
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

export {SwitchAccount}