import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Radio } from 'antd-mobile'
import { AddressListDisplay } from '@/model/account'
import { Notification } from '@/chrome/notification';
import { Keyring } from '@/chrome/keyring';
import { formatAddress } from "@/utils/util"
import { Permission } from '@/chrome/permission';

interface Session {
    origin: string;
    icon: string;
    name: string;
}

interface Props {
    params: {
        session: Session
    };
}

const Connect =  () => {
    const [session, setSession] = useState<Session | undefined>(undefined)
    const [accounts, setAccounts] = useState<AddressListDisplay[]>([])
    const [defaultAddress, setDefaultAddress] = useState<string>('')
    const [accountId, setAccountId] = useState<string>('')
    const [accountIndex, setAccountIndex] = useState<number>(0)

    const getApproval = async () => {
        let approval: Props = await Notification.getApproval()
        setSession(approval.params.session)
    }

    const changeAddress = (id: string, index: number, address: string) => {
        setDefaultAddress(address);
        setAccountIndex(index);
        setAccountId(id);
    }

    const getAccountList = async () => {
        let addresses: AddressListDisplay[] = await Keyring.getAccountListDisplay()
        addresses.map((item) => {
            item.drive!.map(r => {
                if(r.active) {
                    setDefaultAddress(r.address)
                }
            })
        })
        setAccounts(addresses)
    }

    const cancel = () => {
        Notification.rejectApproval()
    }

    const connect = async () => {
        Permission.addConnectedSite(session!.origin, session!.name, session!.icon)
        await Keyring.switchDriveAccount(accountId, accountIndex)
        Notification.resolveApproval()
    }

    useEffect(() => {
        getApproval()
        getAccountList()
    }, []);

    return (
        <article className="page-box">
            <HeadNav title='Kasperia Wallet'></HeadNav>
            <section className="content-main connect-box pb96">
                <div className='source-box'>
                    <img className="logo-img" src={session?.icon} alt="" />
                    <div className='source-txt'>
                        <strong>{session?.name}</strong>
                        <p>{session?.origin}</p>
                    </div>
                </div>
                <div className='contant-txt'>
                    <p className='txt-tit-1'>Connect with Kasperia Wallet</p>
                    <p className='txt-tit-2'>Select the account to use on this site</p>
                    <p className='txt-tit-tip'>Only connect with sites you trust</p>
                </div>
                <div className="list-box">
                    <Radio.Group value={defaultAddress}>
                        {
                            accounts.length > 0 && (
                                accounts.map((item: AddressListDisplay, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong className="list-tit-1">{item.name}</strong>
                                        {
                                            item.drive!.map((dr, childIndex) => (
                                                <div className="list-item-box" key={childIndex}>
                                                    <Radio value={dr.address} onChange={() => changeAddress(item.id, dr.index, dr.address)} >
                                                        <div className="list-item-left">
                                                            <strong>{dr.name}</strong>
                                                            <span>{formatAddress(dr.address)}</span>
                                                        </div>
                                                    </Radio>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            )
                        }
                    </Radio.Group>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" onClick={ cancel }>
                        Cancel
                    </Button>
                    <Button block size="large" color="primary" onClick={connect} disabled={!session}>
                        Connect
                    </Button>
                </div>
            </section>
        </article>
    )
}

export {Connect}