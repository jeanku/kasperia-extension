import React, { useState, useEffect } from "react"
import HeadNav from '@/components/HeadNav'
import { Button, Radio } from 'antd-mobile'
import { AddressBook } from '@/model/transaction'
import { Notification } from '@/chrome/notification';
import { Kiwi, Wasm, initialize } from '@kasplex/kiwi-web'
import { Keyring } from '@/chrome/keyring';
import { formatAddress } from "@/utils/util"
import { Network } from '@/model/account'
import { Preference } from '@/chrome/preference';
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
    const [accounts, setAccounts] = useState<AddressBook[]>([])
    const [defaultAddress, setDefaultAddress] = useState<string>('')

    const initRpc = async () => {
        try {
            await initialize("./kaspa_bg.wasm");
            let network: Network = await Preference.getNetwork()
            Kiwi.setNetwork(network.networkId)
        } catch (error) {
            console.error('Error initializing Kiwi:', error);
        }
    }

    const getApproval = async () => {
        let approval: Props = await Notification.getApproval()
        setSession(approval.params.session)
    }

    const changeAddress = (address: string) => {
        setDefaultAddress(address);
    }

    const getAccountList = async () => {
        // await initRpc()
        let contacts: AddressBook[] = await Keyring.getAccountBook()
        let defAddress = ''
        contacts = contacts.map((item) => {
            item.drive = item.drive!.map(r => {
                r.address = new Wasm.PublicKey(r.pubKey).toAddress(Kiwi.network).toString()
                if(!defAddress) {
                    defAddress = r.address
                    setDefaultAddress(defAddress)
                }
                return r
            })
            return item
        })
        setAccounts(contacts)
    }

    const cancel = () => {
        Notification.rejectApproval()
    }

    const connect = () => {
        Permission.addConnectedSite(session!.origin, session!.name, session!.icon)
        Notification.resolveApproval()
    }

    useEffect(() => {
        getApproval()
        getAccountList()
    }, []);

    return (
        <article className="page-box">
            <HeadNav title='Kasware Wallet'></HeadNav>
            <section className="content-main connect-box pb96">
                <div className='source-box'>
                    <img className="logo-img" src={session?.icon} alt="" />
                    <div className='source-txt'>
                        <strong>{session?.name}</strong>
                        <p>{session?.origin}</p>
                    </div>
                </div>
                <div className='contant-txt'>
                    <p className='txt-tit-1'>Connect with Kasware Wallet</p>
                    <p className='txt-tit-2'>Select the account to use on this site</p>
                    <p className='txt-tit-tip'>Only connect with sites you trust</p>
                </div>
                <div className="list-box">
                    <Radio.Group value={defaultAddress}>
                        {
                            accounts.length > 0 && (
                                accounts.map((item: AddressBook, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong className="list-tit-1">{item.name}</strong>
                                        {
                                            item.drive!.map((dr, childIndex) => (
                                                <div className="list-item-box" key={childIndex}>
                                                    <Radio value={dr.address} onChange={() => changeAddress(dr.address)} >
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