import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { Button, Popup, SearchBar, Tabs } from 'antd-mobile'
import { DownOutline } from 'antd-mobile-icons'
import { useLocation } from 'react-router-dom'


import { useSelector } from "react-redux";
import { SvgIcon } from '@/components/Icon/index'
import HeadNav from '@/components/HeadNav'
import NoDataDom from "@/components/NoDataDom";
import NumberInput from '@/components/NumberInput';
import TokenImg from "@/components/TokenImg";
import { useClipboard } from '@/components/useClipboard';
import store, { RootState } from '@/store';

import { formatAddress } from '@/utils/util'

import { AccountsSubListDisplay } from '@/model/account'
import { Address } from '@/model/contact'
import { Keyring } from '@/chrome/keyring'
import { Contact } from '@/chrome/contact'
import { Account } from '@/chrome/account'
import { Evm } from '@/chrome/evm'
import {EvmTokenList, EvmNetwork} from "@/model/evm";
import { ethers } from "ethers";

interface TokenItem {
    name?: string;
    address: string
    token?: string;
    balance: number;
    chainId?: string;
    amount?: number;
    desc?: number;
}

interface SwitchItem {
    address: string,
    token: string,
    balance: string,
    amount: string,
    desc: number,
    isKaspa: boolean,
    network: string
}

type PopupType = "FORM"  | "TO" | ""

const Bridge = () => {
    const { state } = useLocation()
    const navigate = useNavigate();

    const { preference } = useSelector((state: RootState) => state.preference);
    const [network] = useState<EvmNetwork>(state?.network)


    const { handleCopy } = useClipboard();

    const [swapLoading, setSwapLoading] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false)
    const [amount, setAmount] = useState<number | string>('')
    const [toAmount, setToAmount] = useState<number | string>('')
    const [contactTabValue, setContactTabValue] = useState<string>("")

    const [accountsValue, setAccountsValue] = useState<AccountsSubListDisplay[] | null>(null)
    const [contactValue, setContactValue] = useState<Address[] | null>(null)
    const [address, setAddress] = useState("")

    // const [selectType, setSelectType] = useState<PopupType>('FORM')
    
    // const [bridgeData, setBridgeData] = useState({
    //     from: {
    //         address: preference.currentAccount?.address,
    //         token: "KAS",
    //         balance: preference.currentAccount?.balance || "0",
    //         amount: 0,
    //         desc: 8,
    //         isKaspa: true
    //     },
    //     to: {
    //         address: preference.currentAccount?.ethAddress,
    //         token: 'KAS',
    //         balance: 3333,
    //         amount: 3333,
    //         desc: 4,
    //         isKaspa: false,
    //         network: network
    //     },
    // })

    const [fromData, setFromData] = useState<SwitchItem>({
        address: preference.currentAccount?.address!,
        token: "KAS",
        balance: ethers.formatUnits(preference.currentAccount?.balance || "0", 8),
        amount: "0",
        desc: 8,
        isKaspa: true,
        network: preference.network.networkType.toString()
    })

    const [toData, setToData] = useState<SwitchItem>({
        address: preference.currentAccount?.ethAddress!,
        token: 'KAS',
        balance: "0",
        amount: "0",
        desc: 18,
        isKaspa: false,
        network: ""
    })

    const syncBalance = async () =>  {
        getBalance(fromData.address).then(r => {
            if (fromData.balance != r) {
                fromData.balance = r
            }
            setFromData(fromData)
        })
        if (!network) {
            let _network = await Evm.getSelectedNetwork()
            if (!_network) return
            toData.network = _network.name
            toData.desc = _network.decimals
            toData.token = _network.symbol
            setToData(toData)
        }
    }

    const getBalance = async (data: any) =>  {
        if (data.isKaspa) {
            return await Account.getBalance(data.from.address)
        } else {
            return await Account.getEvmBalanceFormatEther(fromData.address)
        }
    }

    const setMax = () => {
        fromData.amount = fromData.balance
        setFromData(fromData)
    }

    useEffect(() => {
        syncBalance()
    }, [])

    const [bridgeData, setBridgeData] = useState({
        from: {
            address: 'kaspatest:qp48ut63r78w5umx6tpk4vu6s4ftv79x2uf56arar3acqs368mxd65sfdeqjl',
            token: 'KAS',
            balance: 100000,
            amount: 100000,
            desc: 4,
        },
        to: {
            address: '0x779Fa38D50db477CDF79C3AF52EDEf8612c3f48a',
            token: 'IGRA',
            balance: 3333,
            amount: 3333,
            desc: 4,
        },
    })
    
    const submitDisabled = useMemo(() => {
        return !bridgeData.from.amount || !bridgeData.to.address || !amount || !toAmount
    }, [bridgeData, amount, toAmount])

    useEffect(() => {
        switchContactTab("Contacts")
    }, [])

    const switchContactTab = async (key: string) => {
        if (key === contactTabValue) return
        setContactTabValue(key)
        switch (key) {
            case "Contacts":
                if (!contactValue) {
                    let contacts: Address[] = await Contact.get()
                    setContactValue(contacts)
                }
                break
            case "Accounts":
                if (!accountsValue) {
                    let accounts = await Keyring.getAccountsSubListDisplay()
                    setAccountsValue(accounts);
                }
                break;
            default:
                break;
        }
    }

    const showPopup = (type:PopupType, item: TokenItem) => {
        if(item.token === "KAS") return
        // setSelectType(type)
        // setTokenVisible(true)
    }
    const hidePopup = () => {
        // setSelectType("")
        // setTokenVisible(false)
    }

    const switchInfo = () => {
        let temp = fromData
        setFromData(toData)
        setToData(temp)
    }

    const swapSubmit = () => {
        if (swapLoading) return
        setSwapLoading(true)
    }

    return (
        <div className="page-box">
            <HeadNav title='Bridge' rightType="history" url="/bridge/bridgeHistory" onBack={() => navigate('/home')}></HeadNav>
            <div className="content-main page-bridge">
                <div className='card-box'>
                    <div className='card-title flex-row cb as'>
                        <span>From</span>
                        <p className="cursor-pointer" onClick={() => setPopupVisible(true)}>
                            <em className="one-line">{formatAddress(fromData.address, 6)}</em>
                            <SvgIcon iconName="IconParase" color="#7F7F7F" size={18} offsetStyle={{ marginLeft: '5px' }} />
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={Number(amount)}
                            onChange={(e) => setAmount(e.toString())}
                            decimalPlaces={Number(fromData.desc)}
                            max={Number(fromData.balance)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className='flex-row cb ac'>
                            <div className='sub-tit mr10 mb0import'>
                                <strong className='strong' onClick={() => setMax()}>MAX</strong>
                            </div>
                            <div className="input-select flex-row cb ac">
                                <TokenImg url={fromData.token!} className={ 'visable-top-img'} name={fromData.token} width={20} height={20} marginRight={3} />
                                <span>{fromData.token}</span>
                            </div>
                        </div>
                    </div>
                    <h6 className="sub-tit mb0import mt15">
                        <span>total: {fromData.balance} Kas</span>
                        <span>{ fromData.network }</span>
                    </h6>
                </div>
                <div className='bridge-divider flex-row cc ac'>
                    <div className='bridge-icon' onClick={() => switchInfo()}>
                        <SvgIcon iconName="IconConvert" size={22} color="#D8D8D8" />
                    </div>
                </div>
                <div className='card-box'>
                    <div className='card-title flex-row cb as'>
                        <span>To</span>
                        <p className="cursor-pointer" onClick={() => setPopupVisible(true)}>
                            <em className="one-line">{formatAddress(toData.address, 6)}</em>
                            <SvgIcon iconName="IconParase" color="#7F7F7F" size={18} offsetStyle={{ marginLeft: '5px' }} />
                        </p>
                    </div>
                    <div className='flex-row cb ac mb12 mt20'>
                        <NumberInput
                            value={Number(toAmount)}
                            onChange={(e) => setToAmount(e.toString())}
                            decimalPlaces={Number(toData.desc)}
                            allowNegative={true}
                            placeholder="0"
                            style={{ fontSize: '14px', color: 'white', flex: 2 }}
                        />
                        <div className="input-select flex-row cb ac" >
                            <TokenImg url={toData.token!} className={ 'visable-top-img'} name={toData.token} width={20} height={20} marginRight={3} />
                            <span>{toData.token}</span>
                        </div>
                    </div>
                    <h6 className="sub-tit mb0import mt15">
                        <span>{ toData.network }</span>
                    </h6>
                </div>
                <div className="btn-pos-two flexd-row post-bottom">
                    <Button block size="large" color="primary" loading={swapLoading} disabled={submitDisabled} onClick={() => swapSubmit()}>
                        Bridge
                    </Button>
                </div>
            </div>
            <Popup
                visible={popupVisible}
                className="wallet-popup"
                bodyClassName="wallet-popup-body"
                onMaskClick={() => {
                    setPopupVisible(false)
                }}
                onClose={() => {
                    setPopupVisible(false)
                }}
                bodyStyle={{
                    height: '46vh', borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', overflowY: 'scroll'
                }}
            >
                <Tabs activeKey={contactTabValue} onChange={key => {
                    switchContactTab(key)
                }}>
                    <Tabs.Tab title="Contacts" key="Contacts" />
                    <Tabs.Tab title="My Account" key="Accounts" />
                </Tabs>

                <div className="contact-list">
                    {
                        contactTabValue === "Contacts" ? (
                            contactValue && contactValue.length > 0 ? (
                                contactValue.map((item: Address, index) => (
                                    <div className="contact-list-box" key={index}>
                                        <div className="contact-list-item" key={address} onClick={() => {
                                            setAddress(item.address)
                                            setPopupVisible(false)
                                        }}>
                                            <span>{item.name}</span>
                                            <em>{formatAddress(item.address, 8)}</em>
                                        </div>
                                    </div>
                                ))
                            ) : <NoDataDom />
                        ) : null
                    }
                    {
                        contactTabValue === "Accounts" ? (
                            accountsValue && accountsValue.length > 0 ? (
                                accountsValue.map((item, index) => (
                                    <div className="contact-list-box mb20" key={index}>
                                        <strong>{item.name}</strong>
                                        {
                                            item.drive!.map((dr) => (
                                                <div className="contact-list-item" key={dr.address} onClick={() => {
                                                    setAddress(dr.address)
                                                    setPopupVisible(false)
                                                }}>
                                                    <span>{dr.name}</span>
                                                    <em>{formatAddress(dr.address, 8)}</em>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            ) : <NoDataDom />
                        ) : null
                    }
                </div>
            </Popup>
        </div>
    )
}

export default Bridge;