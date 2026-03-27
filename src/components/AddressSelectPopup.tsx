import React, { useEffect, useState } from 'react'
import { Popup, Tabs, Input, Button } from 'antd-mobile'
import { isAddress } from 'ethers'
import NoDataDom from '@/components/NoDataDom'
import { useNotice } from '@/components/NoticeBar/NoticeBar'
import { formatAddress } from '@/utils/util'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { AddressType } from '@/types/enum'

export type TabKey = 'Contacts' | 'Accounts' | 'AddAddress'

export interface AccountDrive {
    name: string
    address: string
}

export interface AccountGroup {
    name: string
    drive: AccountDrive[]
}

export interface AddressSelectResult {
    source: TabKey
    name: string
    address: string
    groupName?: string
}

interface Props {
    visible: boolean
    isKaspa: boolean
    isUpdata?: boolean
    showAdd?: boolean
    onClose: () => void
    onSave?: (address: string) => void
    onSelect: (res: AddressSelectResult) => void
}

const AddressSelectPopup: React.FC<Props> = ({
    visible,
    isKaspa,
    isUpdata = false,
    showAdd = false,
    onClose,
    onSelect,
    onSave,
}) => {
    const { noticeSuccess, noticeError } = useNotice();
    
    const [activeTab, setActiveTab] = useState<TabKey>('Contacts')
    const [contacts, setContacts] = useState<Address[] | null>(null)
    const [accounts, setAccounts] = useState<AccountGroup[] | null>(null)
    const [loading, setLoading] = useState(false)

    const [address, setAddress] = useState<string>('')

    const switchContactTab = async (key: TabKey) => {
        setActiveTab(key)
        if (key === 'Contacts' && (isUpdata || !contacts)) {
            setLoading(true)
            try {
                let addrType = isKaspa ? AddressType.KaspaAddress : AddressType.EvmAddress
                let list: Address[] = await Contact.get(addrType)
                setContacts(list || [])
            } finally {
                setLoading(false)
            }
        }

        if (key === 'Accounts' && (isUpdata || !accounts)) {
            setLoading(true)
            try {
                let addrType = isKaspa ? AddressType.KaspaAddress : AddressType.EvmAddress
                const list = await Keyring.getAccountsSubListDisplay(addrType)
                setAccounts(list || [])
            } finally {
                setLoading(false)
            }
        }
    }

    const saveAddress =() => {
        if(!address) {
            noticeError('Please input address')
            return
        }
        if(!isAddress(address)) {
            noticeError('Invalid address')
            return
        }
        onSave?.(address)
        onClose()
        setAddress('');
    }

    useEffect(() => {
        if (!visible) {
            if (isUpdata) {
                setContacts(null)
                setAccounts(null)
            }
            return
        }
        if (activeTab === 'Contacts' && !contacts) {
            switchContactTab('Contacts')
        }

        if (activeTab === 'Accounts' && !accounts) {
            switchContactTab('Accounts')
        }
        if(activeTab === 'AddAddress') {
            switchContactTab('AddAddress')
        }
    }, [visible, isUpdata])

    return (
        <Popup
            visible={visible}
            className="wallet-popup"
            bodyClassName="wallet-popup-body"
            onMaskClick={onClose}
            onClose={onClose}
            bodyStyle={{
                height: '46vh',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                overflowY: 'auto',
            }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={(key) => switchContactTab(key as TabKey)}
            >
                <Tabs.Tab title="Contacts" key="Contacts" />
                <Tabs.Tab title="My Account" key="Accounts" />
                { showAdd && <Tabs.Tab title="Add Address" key="AddAddress" /> }
            </Tabs>

            <div className="contact-list">
                {activeTab === 'Contacts' && (
                    contacts && contacts.length > 0 ? (
                        contacts.map((item) => (
                            <div className="contact-list-box" key={item.address}>
                                <div
                                    className="contact-list-item"
                                    onClick={() => {
                                        onSelect({
                                            source: 'Contacts',
                                            name: item.name,
                                            address: item.address,
                                        })
                                        onClose()
                                    }}
                                >
                                    <span>{item.name}</span>
                                    <em>{formatAddress(item.address, 8)}</em>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && <NoDataDom />
                    )
                )}

                {activeTab === 'Accounts' && (
                    accounts && accounts.length > 0 ? (
                        accounts.map((group) => (
                            <div className="contact-list-box mb20" key={group.name}>
                                <strong>{group.name}</strong>
                                {group.drive.map((dr) => (
                                    <div
                                        className="contact-list-item"
                                        key={dr.address}
                                        onClick={() => {
                                            onSelect({
                                                source: 'Accounts',
                                                name: dr.name,
                                                address: dr.address,
                                                groupName: group.name,
                                            })
                                            onClose()
                                        }}
                                    >
                                        <span>{dr.name}</span>
                                        <em>{formatAddress(dr.address, 8)}</em>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        !loading && <NoDataDom />
                    )
                )}
                {
                    activeTab === 'AddAddress' && (
                        <div className='contact-list-box mt35'>
                            <strong>Address</strong>
                            <Input
                                className="address-input"
                                placeholder="Enter address"
                                clearable
                                value={address}
                                onChange={(v) => setAddress(v)}
                            />
                            <Button block size="large" loadingText="Save..." color="primary"  onClick={() => saveAddress()} >
                                Save
                            </Button>
                        </div>
                    )
                }
            </div>
        </Popup>
    )
}

export default AddressSelectPopup
